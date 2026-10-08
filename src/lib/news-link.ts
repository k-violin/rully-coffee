const MAX_HTML_BYTES = 1_000_000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const BROWSER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export type NewsLinkPreview = {
  title: string;
  sourceName: string | null;
  writtenAt: string | null;
  imageDataUrl: string | null;
  imageType: string | null;
};

type HtmlPreview = {
  title: string;
  sourceName: string | null;
  writtenAt: string | null;
  imageUrls: string[];
};

function fail(message: string): never {
  throw new Error(message);
}

function decodeEntities(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => safePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num: string) => safePoint(Number(num)));
}

function safePoint(code: number) {
  if (!Number.isInteger(code) || code < 0 || code > 0x10ffff) return "";
  return String.fromCodePoint(code);
}

function cleanText(value: string | null) {
  if (!value) return null;
  const text = decodeEntities(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text || null;
}

function isPrivateAddress(host: string) {
  const parts = host.split(".");
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part))) return false;
  const nums = parts.map((part) => Number(part));
  if (nums.some((num) => num > 255)) return true;
  const a = nums[0] ?? 0;
  const b = nums[1] ?? 0;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

function assertPublicUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    fail("링크는 http 또는 https로 시작하는 웹 주소만 사용할 수 있습니다.");
  }
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (url.protocol !== "http:" && url.protocol !== "https:") fail("링크는 http 또는 https로 시작하는 웹 주소만 사용할 수 있습니다.");
  if (url.username || url.password) fail("링크에서 기사 정보를 가져올 수 없습니다.");
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    fail("링크에서 기사 정보를 가져올 수 없습니다.");
  }
  if (host.includes(":") || /^\d+$/.test(host) || isPrivateAddress(host)) fail("링크에서 기사 정보를 가져올 수 없습니다.");
  if (!host.includes(".")) fail("링크는 http 또는 https로 시작하는 웹 주소만 사용할 수 있습니다.");
  return url;
}

function attrMap(tag: string) {
  const attrs: Record<string, string> = {};
  const pattern = /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
  for (const match of tag.matchAll(pattern)) {
    const name = match[1]?.toLowerCase();
    const value = match[2] ?? match[3] ?? match[4];
    if (name && value !== undefined) attrs[name] = value;
  }
  return attrs;
}

function metaValues(html: string) {
  const values = new Map<string, string[]>();
  for (const match of html.matchAll(/<meta\s[^>]*>/gi)) {
    const tag = match[0];
    if (!tag) continue;
    const attrs = attrMap(tag);
    const key = (attrs["property"] ?? attrs["name"] ?? "").toLowerCase();
    const content = cleanText(attrs["content"] ?? null);
    if (!key || !content) continue;
    const list = values.get(key) ?? [];
    list.push(content);
    values.set(key, list);
  }
  return values;
}

function firstMeta(values: Map<string, string[]>, keys: string[]) {
  for (const key of keys) {
    const found = values.get(key)?.find((item) => item.trim());
    if (found) return found;
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function recordText(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "string" ? cleanText(value) : null;
}

function jsonNodes(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap((item) => jsonNodes(item));
  const record = asRecord(value);
  if (!record) return [];
  const graph = record["@graph"];
  if (Array.isArray(graph)) return [record, ...graph.flatMap((item) => jsonNodes(item))];
  return [record];
}

function imageUrlsFrom(value: unknown, pageUrl: string) {
  const urls: string[] = [];
  const visit = (item: unknown) => {
    if (typeof item === "string") {
      const absolute = absoluteUrl(item, pageUrl);
      if (absolute) urls.push(absolute);
      return;
    }
    const record = asRecord(item);
    if (!record) return;
    visit(record["url"]);
    visit(record["contentUrl"]);
  };
  if (Array.isArray(value)) value.forEach(visit);
  else visit(value);
  return urls;
}

function absoluteUrl(value: string, pageUrl: string) {
  try {
    const url = new URL(value, pageUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.href;
  } catch {
    return null;
  }
}

function readJsonLd(html: string, pageUrl: string) {
  let title: string | null = null;
  let sourceName: string | null = null;
  let writtenAt: string | null = null;
  const imageUrls: string[] = [];
  for (const match of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    try {
      for (const node of jsonNodes(JSON.parse(raw))) {
        const typeValue = node["@type"];
        const types = (Array.isArray(typeValue) ? typeValue : [typeValue]).filter((item): item is string => typeof item === "string");
        const article = types.some((type) => type === "NewsArticle" || type === "Article" || type === "BlogPosting");
        title ??= recordText(node, "headline") ?? (article ? recordText(node, "name") : null);
        writtenAt ??= publishedDate(recordText(node, "datePublished"));
        const publisher = asRecord(node["publisher"]);
        const author = asRecord(node["author"]);
        sourceName ??= (publisher ? recordText(publisher, "name") : null) ?? (author ? recordText(author, "name") : null);
        if (article || node["headline"]) imageUrls.push(...imageUrlsFrom(node["image"], pageUrl));
      }
    } catch {
      continue;
    }
  }
  return { title, sourceName, writtenAt, imageUrls };
}

function seoulDay(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function publishedDate(value: string | null) {
  const text = cleanText(value);
  if (!text) return null;
  const match = text.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  const year = match?.[1];
  const month = match?.[2]?.padStart(2, "0");
  const day = match?.[3]?.padStart(2, "0");
  if (!year || !month || !day) return null;
  if (/[tT]/.test(text) || /[zZ]$/.test(text) || /[+-]\d{2}:?\d{2}$/.test(text)) {
    const parsed = new Date(text);
    if (!Number.isNaN(parsed.getTime())) {
      const formatted = seoulDay(parsed);
      if (/^\d{4}-\d{2}-\d{2}$/.test(formatted)) return formatted;
    }
  }
  const iso = `${year}-${month}-${day}`;
  const check = new Date(`${iso}T00:00:00+09:00`);
  if (Number.isNaN(check.getTime())) return null;
  return seoulDay(check) === iso ? iso : null;
}

const genericSites = new Set(["네이버 뉴스", "네이버뉴스", "다음 뉴스", "다음뉴스", "구글 뉴스", "Google News"]);

function outletName(siteName: string | null, author: string | null) {
  const site = siteName && !/^https?:\/\//i.test(siteName) ? siteName : null;
  const byline = author && !/^https?:\/\//i.test(author) ? author : null;
  if (site && !genericSites.has(site)) return site;
  return byline ?? site;
}

function withoutOutlet(title: string, sourceName: string | null) {
  if (!sourceName) return title;
  const escaped = sourceName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const stripped = title.replace(new RegExp(`\\s*[|\\-–—:]\\s*${escaped}\\s*$`), "").trim();
  return stripped || title;
}

export function previewFromHtml(html: string, pageUrl: string): HtmlPreview {
  const source = html.replace(/<!--[\s\S]*?-->/g, "");
  const meta = metaValues(source);
  const linked = readJsonLd(source, pageUrl);
  const titleTag = cleanText(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(source)?.[1] ?? null);
  const rawTitle = cleanText(firstMeta(meta, ["og:title", "twitter:title"])) ?? linked.title ?? titleTag;
  if (!rawTitle) fail("기사에서 제목을 찾지 못했습니다. 제목을 직접 입력해 주세요.");
  const sourceName = outletName(firstMeta(meta, ["og:site_name"]) ?? linked.sourceName, firstMeta(meta, ["article:author", "og:article:author"]));
  const title = withoutOutlet(rawTitle, sourceName);
  const writtenAt = publishedDate(firstMeta(meta, ["article:published_time", "og:published_time", "article:published"])) ?? linked.writtenAt;
  const imageUrls = [
    ...["og:image", "og:image:url", "og:image:secure_url", "twitter:image"].flatMap((key) => meta.get(key) ?? []),
    ...linked.imageUrls,
  ].flatMap((item) => {
    const absolute = absoluteUrl(item, pageUrl);
    return absolute ? [absolute] : [];
  });
  return {
    title: title.slice(0, 300),
    sourceName: sourceName && !/^https?:\/\//i.test(sourceName) ? sourceName.slice(0, 80) : null,
    writtenAt,
    imageUrls: [...new Set(imageUrls)].slice(0, 3),
  };
}

function decodeHtml(bytes: Uint8Array, contentType: string) {
  const ascii = new TextDecoder("utf-8").decode(bytes.slice(0, 4096));
  const charset = (/charset=["']?([\w.-]+)/i.exec(contentType)?.[1] ?? /charset=["']?([\w.-]+)/i.exec(ascii)?.[1] ?? "utf-8").toLowerCase();
  const label = charset === "ks_c_5601-1987" || charset === "cp949" || charset === "euc-kr" ? "euc-kr" : charset === "utf8" ? "utf-8" : charset;
  try {
    return new TextDecoder(label).decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

async function readLimited(response: Response, max: number) {
  const declared = Number(response.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > max) fail("링크에서 기사 정보를 가져오지 못했습니다. 직접 입력해 주세요.");
  const reader = response.body?.getReader();
  if (!reader) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > max) fail("링크에서 기사 정보를 가져오지 못했습니다. 직접 입력해 주세요.");
    return bytes;
  }
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > max) {
      await reader.cancel();
      fail("링크에서 기사 정보를 가져오지 못했습니다. 직접 입력해 주세요.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

async function fetchPublic(start: string, accept: string, maxBytes: number, referer?: string) {
  let current = assertPublicUrl(start).href;
  for (let hop = 0; hop < 5; hop += 1) {
    const headers = new Headers({
      accept,
      "accept-language": "ko-KR,ko;q=0.9",
      "user-agent": BROWSER_AGENT,
    });
    if (referer) headers.set("referer", referer);
    let response: Response;
    try {
      response = await fetch(current, { redirect: "manual", signal: AbortSignal.timeout(8000), headers });
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("링크")) throw error;
      fail("링크에서 기사 정보를 가져오지 못했습니다. 직접 입력해 주세요.");
    }
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) fail("링크에서 기사 정보를 가져오지 못했습니다. 직접 입력해 주세요.");
      current = assertPublicUrl(new URL(location, current).href).href;
      continue;
    }
    if (!response.ok) fail("링크에서 기사 정보를 가져오지 못했습니다. 직접 입력해 주세요.");
    return { bytes: await readLimited(response, maxBytes), contentType: response.headers.get("content-type") ?? "", finalUrl: current };
  }
  fail("링크에서 기사 정보를 가져오지 못했습니다. 직접 입력해 주세요.");
}

function imageKind(bytes: Uint8Array) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

async function fetchImage(imageUrl: string, pageUrl: string) {
  try {
    assertPublicUrl(imageUrl);
    const loaded = await fetchPublic(imageUrl, "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8", MAX_IMAGE_BYTES, pageUrl);
    const mime = imageKind(loaded.bytes);
    if (!mime || loaded.bytes.byteLength === 0) return null;
    return { dataUrl: `data:${mime};base64,${Buffer.from(loaded.bytes).toString("base64")}`, type: mime };
  } catch {
    return null;
  }
}

export async function readNewsLink(link: string): Promise<NewsLinkPreview> {
  const page = assertPublicUrl(link.trim());
  const loaded = await fetchPublic(page.href, "text/html,application/xhtml+xml", MAX_HTML_BYTES);
  const preview = previewFromHtml(decodeHtml(loaded.bytes, loaded.contentType), loaded.finalUrl);
  let imageDataUrl: string | null = null;
  let imageType: string | null = null;
  for (const imageUrl of preview.imageUrls) {
    const image = await fetchImage(imageUrl, loaded.finalUrl);
    if (!image) continue;
    imageDataUrl = image.dataUrl;
    imageType = image.type;
    break;
  }
  return {
    title: preview.title,
    sourceName: preview.sourceName,
    writtenAt: preview.writtenAt,
    imageDataUrl,
    imageType,
  };
}

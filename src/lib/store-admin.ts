import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { readAdminSession } from "@/lib/admin-auth";
import type { StoreRecord } from "@/lib/public-stores";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const imageTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type SaveImage = {
  url: string | null;
  dataUrl: string | null;
  type: string | null;
};

type SaveInput = {
  id: string | null;
  title: string;
  content: string;
  writtenAt: string | null;
  authorName: string | null;
  isPinned: boolean;
  isVisible: boolean;
  images: SaveImage[];
};

function fail(error: string) {
  return { ok: false as const, error };
}

function messageOf(error: unknown) {
  const text = error instanceof Error ? error.message : "";
  if (
    text.startsWith("매장") ||
    text.startsWith("대표") ||
    text.startsWith("작성") ||
    text.startsWith("이미지") ||
    text.startsWith("사진")
  ) {
    return text;
  }
  if (text.includes("forbidden")) return "권한이 없습니다.";
  if (text.includes("stores_title_not_blank") || text.includes("stores_content_not_blank") || text.includes("stores_image_url_not_blank") || text.includes("stores_image_urls_not_empty")) {
    return "매장명, 매장 소개, 사진은 비워 둘 수 없습니다.";
  }
  if (text.includes("not found")) return "매장을 찾지 못했습니다.";
  return "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

function isNewSupabaseApiKey(value: string) {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined);
    if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

function serverDb() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const gate = process.env["STORE_ADMIN_GATE"];
  const prefix = process.env["STORE_IMAGE_PREFIX"];
  if (!url || !key || !gate || !prefix) throw new Error("매장 저장 설정이 없습니다.");
  const db = createClient(url, key, {
    global: { fetch: createSupabaseFetch(key) },
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
  return { db, url: url.replace(/\/$/, ""), gate, prefix };
}

function asStore(data: unknown): StoreRecord | null {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object" || !("id" in row)) return null;
  return row as StoreRecord;
}

function asStores(data: unknown): StoreRecord[] {
  return Array.isArray(data) ? (data as StoreRecord[]) : [];
}

function requiredText(value: string, emptyMessage: string) {
  const text = value.trim();
  if (!text) throw new Error(emptyMessage);
  return text;
}

function optionalText(value: string | null) {
  const text = value?.trim() ?? "";
  return text ? text : null;
}

function optionalDate(value: string | null) {
  const text = value?.trim() ?? "";
  if (!text) return null;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) throw new Error("작성일 형식을 확인해 주세요.");
  return date.toISOString();
}

function imageBytes(dataUrl: string, type: string) {
  const mime = type === "image/jpg" ? "image/jpeg" : type;
  const ext = imageTypes[mime];
  if (!ext) throw new Error("이미지는 JPG, PNG, WEBP 파일만 올릴 수 있습니다.");
  const raw = dataUrl.includes(",") ? (dataUrl.split(",")[1] ?? "") : dataUrl;
  if (!raw || raw.length > 8_000_000) throw new Error("이미지는 5MB 이하만 올릴 수 있습니다.");
  const bytes = Buffer.from(raw, "base64");
  if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES) throw new Error("이미지는 5MB 이하만 올릴 수 있습니다.");
  return { bytes, mime, ext };
}

async function uploadImage(dataUrl: string, type: string) {
  const { db, url, prefix } = serverDb();
  const { bytes, mime, ext } = imageBytes(dataUrl, type);
  const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
  const { error } = await db.storage.from("store-images").upload(path, bytes, { contentType: mime, upsert: false });
  if (error) throw new Error("이미지를 저장하지 못했습니다.");
  return `${url}/storage/v1/object/public/store-images/${path}`;
}

function existingImageUrl(url: string | null) {
  const text = url?.trim() ?? "";
  if (!text) return null;
  const base = process.env["SUPABASE_URL"]?.replace(/\/$/, "");
  if (!base || !text.startsWith(`${base}/storage/v1/object/public/store-images/`)) {
    throw new Error("사진을 다시 선택해 주세요.");
  }
  return text;
}

async function collectImageUrls(images: SaveImage[]) {
  if (!Array.isArray(images) || images.length === 0) throw new Error("사진을 한 장 이상 선택해 주세요.");
  if (images.length > 12) throw new Error("사진은 12장까지 올릴 수 있습니다.");
  const urls: string[] = [];
  for (const image of images) {
    if (image?.dataUrl) urls.push(await uploadImage(image.dataUrl, image.type ?? ""));
    else {
      const existing = existingImageUrl(image?.url ?? null);
      if (!existing) throw new Error("사진을 다시 선택해 주세요.");
      urls.push(existing);
    }
  }
  return urls;
}

export const listAdminStores = createServerFn({ method: "GET" }).handler(async () => {
  try {
    if (!(await readAdminSession())) return fail("로그인이 필요합니다.");
    const { db, gate } = serverDb();
    const { data, error } = await db.rpc("admin_list_stores", { gate });
    if (error) throw error;
    return { ok: true as const, stores: asStores(data) };
  } catch (error) {
    return fail(messageOf(error));
  }
});

export const saveAdminStore = createServerFn({ method: "POST" })
  .validator((data: SaveInput) => data)
  .handler(async ({ data }) => {
    try {
      if (!(await readAdminSession())) return fail("로그인이 필요합니다.");
      const title = requiredText(data.title ?? "", "매장명을 입력해 주세요.");
      const content = requiredText(data.content ?? "", "매장 소개를 입력해 주세요.");
      const writtenAt = optionalDate(data.writtenAt);
      const authorName = optionalText(data.authorName);
      const imageUrls = await collectImageUrls(data.images ?? []);
      const { db, gate } = serverDb();
      const { data: saved, error } = await db.rpc("admin_save_store", {
        gate,
        store_id: data.id,
        store_title: title,
        store_content: content,
        store_image_urls: imageUrls,
        store_written_at: writtenAt,
        store_author_name: authorName,
        store_is_pinned: data.isPinned === true,
        store_is_visible: data.isVisible === true,
      });
      if (error) throw error;
      const store = asStore(saved);
      if (!store) throw new Error("매장을 저장하지 못했습니다.");
      return { ok: true as const, store };
    } catch (error) {
      return fail(messageOf(error));
    }
  });

export const setAdminStoreFlags = createServerFn({ method: "POST" })
  .validator((data: { id: string; isPinned: boolean; isVisible: boolean }) => data)
  .handler(async ({ data }) => {
    try {
      if (!(await readAdminSession())) return fail("로그인이 필요합니다.");
      if (!data.id) return fail("매장을 찾지 못했습니다.");
      const { db, gate } = serverDb();
      const { data: saved, error } = await db.rpc("admin_set_store_flags", {
        gate,
        store_id: data.id,
        store_is_pinned: data.isPinned === true,
        store_is_visible: data.isVisible === true,
      });
      if (error) throw error;
      const store = asStore(saved);
      if (!store) throw new Error("매장을 찾지 못했습니다.");
      return { ok: true as const, store };
    } catch (error) {
      return fail(messageOf(error));
    }
  });

export const deleteAdminStore = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    try {
      if (!(await readAdminSession())) return fail("로그인이 필요합니다.");
      if (!data.id) return fail("매장을 찾지 못했습니다.");
      const { db, gate } = serverDb();
      const { error } = await db.rpc("admin_delete_store", { gate, store_id: data.id });
      if (error) throw error;
      return { ok: true as const };
    } catch (error) {
      return fail(messageOf(error));
    }
  });

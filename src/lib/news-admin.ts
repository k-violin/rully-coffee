import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { readAdminSession } from "@/lib/admin-auth";
import { openDesignatedAdmin } from "@/lib/designated-admin";
import { readNewsLink } from "@/lib/news-link";
import type { PublicNews } from "@/lib/public-news";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const imageTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type SaveInput = {
  id: string | null;
  title: string;
  sourceName: string;
  linkUrl: string;
  writtenAt: string;
  isPinned: boolean;
  isVisible: boolean;
  imageUrl: string | null;
  imageBase64: string | null;
  imageType: string | null;
};

function fail(error: string) {
  return { ok: false as const, error };
}

function messageOf(error: unknown) {
  const text = error instanceof Error ? error.message : "";
  const markers = ["제목", "출처", "링크", "작성일", "이미지", "소식", "기사", "관리자", "로그인"];
  for (const marker of markers) {
    if (text.startsWith(marker)) return text;
  }
  if (text.includes("news_title_not_blank") || text.includes("news_source_not_blank") || text.includes("news_image_not_blank")) {
    return "제목, 출처, 대표 이미지는 비워 둘 수 없습니다.";
  }
  if (text.includes("news_link_http") || text.includes("news_link_not_blank")) return "http 또는 https로 시작하는 웹 주소를 입력해 주세요.";
  if (text.includes("not found") || text.includes("0 rows")) return "소식을 찾지 못했습니다.";
  return "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

function asNews(data: unknown): PublicNews | null {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object" || !("id" in row)) return null;
  return row as PublicNews;
}

function requiredText(value: string, emptyMessage: string) {
  const text = value.trim();
  if (!text) throw new Error(emptyMessage);
  return text;
}

export function isWebLink(value: string) {
  try {
    const url = new URL(value.trim());
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
  } catch {
    return false;
  }
}

export const previewNewsLink = createServerFn({ method: "POST" })
  .validator((data: { linkUrl: string }) => data)
  .handler(async ({ data }) => {
    try {
      if (!(await readAdminSession())) return fail("로그인이 필요합니다.");
      return { ok: true as const, ...(await readNewsLink(data.linkUrl ?? "")) };
    } catch (error) {
      return fail(messageOf(error));
    }
  });

function requiredDate(value: string) {
  const text = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error("작성일을 선택해 주세요.");
  const parsed = new Date(`${text}T00:00:00+09:00`);
  if (Number.isNaN(parsed.getTime())) throw new Error("작성일을 선택해 주세요.");
  return text;
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

function imagePath(imageUrl: string, origin: string) {
  const marker = `${origin}/storage/v1/object/public/news-images/`;
  if (!imageUrl.startsWith(marker)) return null;
  return decodeURIComponent(imageUrl.slice(marker.length));
}

async function uploadImage(db: SupabaseClient, origin: string, dataUrl: string, type: string) {
  const { bytes, mime, ext } = imageBytes(dataUrl, type);
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await db.storage.from("news-images").upload(path, bytes, { contentType: mime, upsert: false });
  if (error) throw new Error("이미지를 저장하지 못했습니다.");
  return { path, url: `${origin}/storage/v1/object/public/news-images/${path}` };
}

async function removeIfUnused(db: SupabaseClient, origin: string, imageUrl: string) {
  const path = imagePath(imageUrl, origin);
  if (!path) return;
  const { data, error } = await db.from("news").select("id").eq("image_url", imageUrl);
  if (error || (data ?? []).length > 0) return;
  await db.storage.from("news-images").remove([path]);
}

const newsOrder = { pinned: false, written: false, created: false, id: true } as const;

async function listNews(db: SupabaseClient) {
  const { data, error } = await db
    .from("news")
    .select("id, title, source_name, link_url, image_url, written_at, is_pinned, is_visible, created_at, updated_at")
    .order("is_pinned", { ascending: newsOrder.pinned })
    .order("written_at", { ascending: newsOrder.written })
    .order("created_at", { ascending: newsOrder.created })
    .order("id", { ascending: newsOrder.id });
  if (error) throw error;
  return (data ?? []) as PublicNews[];
}

export const listAdminNews = createServerFn({ method: "GET" }).handler(async () => {
  try {
    if (!(await readAdminSession())) return fail("로그인이 필요합니다.");
    const { db } = await openDesignatedAdmin();
    return { ok: true as const, news: await listNews(db) };
  } catch (error) {
    return fail(messageOf(error));
  }
});

export const saveAdminNews = createServerFn({ method: "POST" })
  .validator((data: SaveInput) => data)
  .handler(async ({ data }) => {
    let uploadedPath: string | null = null;
    let db: SupabaseClient | null = null;
    try {
      if (!(await readAdminSession())) return fail("로그인이 필요합니다.");
      const title = requiredText(data.title ?? "", "제목을 입력해 주세요.");
      const sourceName = requiredText(data.sourceName ?? "", "출처를 입력해 주세요.");
      const linkUrl = requiredText(data.linkUrl ?? "", "링크를 입력해 주세요.");
      if (!isWebLink(linkUrl)) throw new Error("http 또는 https로 시작하는 웹 주소를 입력해 주세요.");
      const writtenAt = requiredDate(data.writtenAt ?? "");
      const opened = await openDesignatedAdmin();
      db = opened.db;
      let previousUrl: string | null = null;
      if (data.id) {
        const existing = await db.from("news").select("image_url").eq("id", data.id).maybeSingle();
        if (existing.error) throw existing.error;
        if (!existing.data) throw new Error("소식을 찾지 못했습니다.");
        previousUrl = existing.data.image_url;
      }
      let imageUrl = data.imageUrl?.trim() ?? "";
      if (data.imageBase64) {
        const uploaded = await uploadImage(db, opened.origin, data.imageBase64, data.imageType ?? "");
        uploadedPath = uploaded.path;
        imageUrl = uploaded.url;
      } else if (!imagePath(imageUrl, opened.origin)) {
        throw new Error("대표 이미지를 선택해 주세요.");
      }
      const payload = {
        title,
        source_name: sourceName,
        link_url: linkUrl,
        image_url: imageUrl,
        written_at: writtenAt,
        is_pinned: data.isPinned === true,
        is_visible: data.isVisible === true,
      };
      const saved = data.id
        ? await db.from("news").update(payload).eq("id", data.id).select("id, title, source_name, link_url, image_url, written_at, is_pinned, is_visible, created_at, updated_at").single()
        : await db.from("news").insert(payload).select("id, title, source_name, link_url, image_url, written_at, is_pinned, is_visible, created_at, updated_at").single();
      if (saved.error || !saved.data) {
        if (uploadedPath) await db.storage.from("news-images").remove([uploadedPath]);
        throw saved.error ?? new Error("소식을 저장하지 못했습니다.");
      }
      if (previousUrl && previousUrl !== imageUrl) await removeIfUnused(db, opened.origin, previousUrl);
      return { ok: true as const, news: saved.data as PublicNews };
    } catch (error) {
      if (uploadedPath && db) await db.storage.from("news-images").remove([uploadedPath]);
      return fail(messageOf(error));
    }
  });

export const setAdminNewsFlags = createServerFn({ method: "POST" })
  .validator((data: { id: string; isPinned: boolean; isVisible: boolean }) => data)
  .handler(async ({ data }) => {
    try {
      if (!(await readAdminSession())) return fail("로그인이 필요합니다.");
      if (!data.id) return fail("소식을 찾지 못했습니다.");
      const { db } = await openDesignatedAdmin();
      const { data: saved, error } = await db
        .from("news")
        .update({ is_pinned: data.isPinned === true, is_visible: data.isVisible === true })
        .eq("id", data.id)
        .select("id, title, source_name, link_url, image_url, written_at, is_pinned, is_visible, created_at, updated_at")
        .single();
      if (error || !saved) throw error ?? new Error("소식을 찾지 못했습니다.");
      return { ok: true as const, news: saved as PublicNews };
    } catch (error) {
      return fail(messageOf(error));
    }
  });

export const deleteAdminNews = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    try {
      if (!(await readAdminSession())) return fail("로그인이 필요합니다.");
      if (!data.id) return fail("소식을 찾지 못했습니다.");
      const { db, origin } = await openDesignatedAdmin();
      const existing = await db.from("news").select("image_url").eq("id", data.id).maybeSingle();
      if (existing.error) throw existing.error;
      const removed = await db.from("news").delete().eq("id", data.id);
      if (removed.error) throw removed.error;
      if (existing.data?.image_url) await removeIfUnused(db, origin, existing.data.image_url);
      return { ok: true as const };
    } catch (error) {
      return fail(messageOf(error));
    }
  });

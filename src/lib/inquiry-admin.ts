import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { readAdminSession } from "@/lib/admin-auth";

export type InquiryStatus = "대기" | "접수완료";

export type FranchiseInquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  desired_region: string | null;
  inquiry_type: string;
  message: string | null;
  privacy_consent: boolean;
  status: InquiryStatus;
  admin_memo: string | null;
  created_at: string;
  updated_at: string;
};

function fail(error: string) {
  return { ok: false as const, error };
}

function messageOf(error: unknown) {
  const text = error instanceof Error ? error.message : "";
  const markers = ["이름을", "이메일을", "연락처를", "창업희망지역", "문의사항은", "상담 상태", "상담 신청", "메모는", "신청을"];
  for (const marker of markers) {
    const index = text.indexOf(marker);
    if (index >= 0) return (text.slice(index).split("\n")[0] ?? "").replace(/^ERROR:\s*/, "");
  }
  if (text.includes("forbidden")) return "권한이 없습니다.";
  if (text.includes("not found")) return "신청을 찾지 못했습니다.";
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
  if (!url || !key || !gate) throw new Error("상담 신청 설정을 확인해 주세요.");
  const db = createClient(url, key, {
    global: { fetch: createSupabaseFetch(key) },
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
  return { db, gate };
}

function asInquiry(data: unknown): FranchiseInquiry | null {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object" || !("id" in row)) return null;
  return row as FranchiseInquiry;
}

function asInquiries(data: unknown): FranchiseInquiry[] {
  return Array.isArray(data) ? (data as FranchiseInquiry[]) : [];
}

export const listAdminInquiries = createServerFn({ method: "GET" }).handler(async () => {
  try {
    if (!(await readAdminSession())) return fail("로그인이 필요합니다.");
    const { db, gate } = serverDb();
    const { data, error } = await db.rpc("admin_list_franchise_inquiries", { gate });
    if (error) throw error;
    return { ok: true as const, inquiries: asInquiries(data) };
  } catch (error) {
    return fail(messageOf(error));
  }
});

export const updateAdminInquiry = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: InquiryStatus; memo: string }) => data)
  .handler(async ({ data }) => {
    try {
      if (!(await readAdminSession())) return fail("로그인이 필요합니다.");
      if (!data.id) return fail("신청을 찾지 못했습니다.");
      if (data.status !== "대기" && data.status !== "접수완료") return fail("상담 상태를 확인해 주세요.");
      const { db, gate } = serverDb();
      const { data: saved, error } = await db.rpc("admin_update_franchise_inquiry", {
        gate,
        inquiry_id: data.id,
        inquiry_status: data.status,
        inquiry_memo: data.memo,
      });
      if (error) throw error;
      const inquiry = asInquiry(saved);
      if (!inquiry) throw new Error("신청을 찾지 못했습니다.");
      return { ok: true as const, inquiry };
    } catch (error) {
      return fail(messageOf(error));
    }
  });

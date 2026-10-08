import { createServerOnlyFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type DesignatedAdmin = {
  db: SupabaseClient;
  origin: string;
};

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

export const openDesignatedAdmin = createServerOnlyFn(async (): Promise<DesignatedAdmin> => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const email = process.env["NEWS_ADMIN_EMAIL"];
  const password = process.env["NEWS_ADMIN_PASSWORD"];
  if (!url || !key || !email || !password) throw new Error("관리자 저장 설정이 없습니다.");
  const db = createClient(url, key, {
    global: { fetch: createSupabaseFetch(key) },
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
  const signed = await db.auth.signInWithPassword({ email, password });
  if (signed.error) throw new Error("관리자 권한을 확인하지 못했습니다.");
  return { db, origin: url.replace(/\/$/, "") };
});

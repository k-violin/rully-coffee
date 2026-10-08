import { supabase } from "@/integrations/supabase/client";

export type StoreRecord = {
  id: string;
  title: string;
  content: string;
  image_url: string;
  image_urls: string[];
  written_at: string | null;
  author_name: string | null;
  is_pinned: boolean;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};

export async function listVisibleStores(): Promise<StoreRecord[]> {
  const { data, error } = await supabase
    .from("stores")
    .select("id, title, content, image_url, image_urls, written_at, author_name, is_pinned, is_visible, created_at, updated_at")
    .eq("is_visible", true)
    .order("is_pinned", { ascending: false })
    .order("written_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export function storePhotos(store: Pick<StoreRecord, "image_url" | "image_urls">) {
  const urls = (store.image_urls ?? []).map((url) => url.trim()).filter(Boolean);
  return urls.length > 0 ? urls : [store.image_url];
}

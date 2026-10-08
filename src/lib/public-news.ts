import { supabase } from "@/integrations/supabase/client";

export type PublicNews = {
  id: string;
  title: string;
  source_name: string;
  link_url: string;
  image_url: string;
  written_at: string;
  is_pinned: boolean;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};

export async function listVisibleNews(): Promise<PublicNews[]> {
  const { data, error } = await supabase
    .from("news")
    .select("id, title, source_name, link_url, image_url, written_at, is_pinned, is_visible, created_at, updated_at")
    .eq("is_visible", true)
    .order("is_pinned", { ascending: false })
    .order("written_at", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export function formatNewsDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;
  return `${year}.${month}.${day}`;
}

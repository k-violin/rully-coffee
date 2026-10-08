import { formatNewsDate, type PublicNews } from "@/lib/public-news";

function GalleryCard({ item }: { item: PublicNews }) {
  return (
    <a
      href={item.link_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block aspect-[16/10] overflow-hidden bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <img src={item.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <span className="absolute inset-0 bg-black/45 opacity-100 transition-opacity duration-300 md:bg-black/50 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100" />
      <span className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
        <span className="text-base font-bold leading-snug md:text-lg">{item.title}</span>
        <span className="mt-2 text-sm font-medium">{item.source_name}</span>
        <span className="mt-1 text-xs">{formatNewsDate(item.written_at)}</span>
      </span>
    </a>
  );
}

export function NewsBoard({ items, error = false, limit }: { items: PublicNews[]; error?: boolean; limit?: number }) {
  if (error) {
    return <div className="border bg-background px-4 py-16 text-center text-sm text-muted-foreground">소식을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</div>;
  }
  const visible = limit ? items.slice(0, limit) : items;
  if (visible.length === 0) {
    return <div className="border bg-background px-4 py-16 text-center text-sm text-muted-foreground">등록된 소식이 없습니다.</div>;
  }
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((item) => (
        <li key={item.id}>
          <GalleryCard item={item} />
        </li>
      ))}
    </ul>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageIntro, EmptyState } from "@/components/site/Layout";
import { ImageSlot } from "@/components/site/ImageSlot";
import { Input } from "@/components/ui/input";
import { listVisibleStores } from "@/lib/public-stores";

export const Route = createFileRoute("/stores/")({
  loader: () => listVisibleStores(),
  head: () => ({
    meta: [
      { title: "매장안내 | 룰리커피" },
      { name: "description", content: "룰리커피 매장을 찾아보세요." },
      { property: "og:title", content: "매장안내 | 룰리커피" },
      { property: "og:description", content: "가까운 룰리커피 매장을 찾아보세요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Stores,
});

function Stores() {
  const stores = Route.useLoaderData();
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const keyword = q.trim();
    if (!keyword) return stores;
    return stores.filter((store) => store.title.includes(keyword) || store.content.includes(keyword));
  }, [stores, q]);
  return (
    <>
      <PageIntro image="/매장안내.png?v=2" />
      <section className="container-site py-10">
        <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-end">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input aria-label="매장 검색" placeholder="매장명 검색" value={q} onChange={(e) => setQ(e.target.value)} className="h-11 pl-9" />
          </div>
        </div>
        {list.length === 0 ? (
          <div className="mt-10"><EmptyState title={stores.length === 0 ? "등록된 매장이 없습니다." : "조건에 맞는 매장이 없습니다."} /></div>
        ) : (
          <ul className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((store) => (
              <li key={store.id}>
                <Link to="/stores/$slug" params={{ slug: store.id }} className="group block">
                  <div className="aspect-[4/3] overflow-hidden">
                    <ImageSlot src={store.image_url} alt={`룰리커피 ${store.title}`} className="transition-transform duration-500 group-hover:scale-[1.02]" />
                  </div>
                  <h2 className="mt-4 text-lg font-bold group-hover:text-primary">{store.title}</h2>
                  <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-muted-foreground">{store.content}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

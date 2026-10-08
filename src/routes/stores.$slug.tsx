import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { ImageSlot } from "@/components/site/ImageSlot";
import { Button } from "@/components/ui/button";
import { listVisibleStores, storePhotos } from "@/lib/public-stores";

export const Route = createFileRoute("/stores/$slug")({
  loader: async ({ params }) => {
    const stores = await listVisibleStores();
    const store = stores.find((item) => item.id === params.slug);
    if (!store) throw notFound();
    return { store, stores };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "매장을 찾을 수 없습니다 | 룰리커피" }, { name: "description", content: "요청한 룰리커피 매장 정보를 찾을 수 없습니다." }, { property: "og:title", content: "매장을 찾을 수 없습니다 | 룰리커피" }, { property: "og:description", content: "요청한 룰리커피 매장 정보를 찾을 수 없습니다." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.store.title} | 룰리커피 매장안내`;
    const d = loaderData.store.content.replace(/\s+/g, " ").slice(0, 120);
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
  },
  notFoundComponent: () => (
    <div className="container-site py-24 text-center">
      <p className="font-semibold">매장을 찾을 수 없습니다.</p>
      <Link to="/stores" className="mt-4 inline-block text-primary hover:underline">매장 목록으로</Link>
    </div>
  ),
  component: StoreDetail,
});

function formatWritten(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function StoreDetail() {
  const { store, stores } = Route.useLoaderData();
  const index = stores.findIndex((item) => item.id === store.id);
  const prev = index > 0 ? stores[index - 1] : null;
  const next = index >= 0 && index < stores.length - 1 ? stores[index + 1] : null;
  const written = formatWritten(store.written_at);
  const photos = storePhotos(store);
  return (
    <div className="container-site py-10 md:py-16">
      <Link to="/stores" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> 매장 목록</Link>
      <h1 className="mt-6 text-2xl font-bold">{store.title}</h1>
      {(written || store.author_name) && (
        <p className="mt-3 text-sm text-muted-foreground">
          {[written, store.author_name].filter(Boolean).join(" · ")}
        </p>
      )}
      <p className="mt-8 max-w-3xl whitespace-pre-line leading-relaxed">{store.content}</p>
      <ul className="mt-8 grid max-w-3xl gap-4">
        {photos.map((src, index) => (
          <li key={`${src}-${index}`} className="aspect-[4/3] overflow-hidden">
            <ImageSlot src={src} alt={`룰리커피 ${store.title} ${index + 1}`} />
          </li>
        ))}
      </ul>
      <div className="mt-14 border-t pt-8">
        <div className="flex items-center justify-between gap-4 text-sm">
          {prev ? (
            <Link to="/stores/$slug" params={{ slug: prev.id }} className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary">
              <ChevronLeft className="size-4" /> 이전글 {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to="/stores/$slug" params={{ slug: next.id }} className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary">
              다음글 {next.title} <ChevronRight className="size-4" />
            </Link>
          ) : (
            <span />
          )}
        </div>
        <div className="mt-8 text-center">
          <Button asChild>
            <Link to="/stores">매장 목록</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/site/Layout";
import { NewsBoard } from "@/components/site/NewsBoard";
import { listVisibleNews } from "@/lib/public-news";

export const Route = createFileRoute("/news")({
  loader: async () => {
    try {
      return { news: await listVisibleNews(), newsError: false as const };
    } catch {
      return { news: [], newsError: true as const };
    }
  },
  pendingComponent: () => (
    <section className="container-site py-12">
      <div className="border bg-background px-4 py-16 text-center text-sm text-muted-foreground">소식을 불러오는 중</div>
    </section>
  ),
  head: () => ({
    meta: [
      { title: "새로운 소식 | 룰리커피" },
      { name: "description", content: "룰리커피의 공지사항, 브랜드 소식, 신규 매장 소식." },
      { property: "og:title", content: "새로운 소식 | 룰리커피" },
      { property: "og:description", content: "룰리커피의 공지와 브랜드 소식을 확인하세요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const { news, newsError } = Route.useLoaderData();
  return (
    <>
      <PageIntro image="/소식2.png" />
      <section className="container-site py-12">
        <NewsBoard items={news} error={newsError} />
      </section>
    </>
  );
}

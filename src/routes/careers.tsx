import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, EmptyState } from "@/components/site/Layout";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "상시채용 | 룰리커피" },
      { name: "description", content: "룰리커피 채용 공고를 확인하고 지원하세요." },
      { property: "og:title", content: "상시채용 | 룰리커피" },
      { property: "og:description", content: "룰리커피와 함께 일할 분을 찾습니다." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <>
      <PageIntro />
      <section className="container-site py-12"><EmptyState title="현재 진행 중인 채용 공고가 없습니다." /></section>
    </>
  ),
});

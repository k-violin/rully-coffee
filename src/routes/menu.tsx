import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/site/Layout";
import { ConsultButton } from "@/components/site/consult";
import { siteConfig } from "@/lib/site-config";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "메뉴구성 | 룰리커피" },
      { name: "description", content: "룰리커피 가맹 매장의 메뉴구성을 안내합니다." },
      { property: "og:title", content: "메뉴구성 | 룰리커피" },
      { property: "og:description", content: "룰리커피 가맹 매장의 메뉴구성을 안내합니다." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Menu,
});

function Menu() {
  return (
    <>
      <PageIntro image="/메뉴구성.png?v=2" natural />
      <section className="section-y">
        <div className="container-site">
          <div className="mx-auto flex max-w-3xl flex-col gap-10">
            <img src="/오가닉.png" alt="오가닉" className="mx-auto w-full max-w-sm" />
            <div className="space-y-8 text-center text-base leading-relaxed">
              <p>
                <span className="text-brand">❝</span> 유기농은 단순한 약속이 아닙니다
                <br />
                매일 자연을 존중하며, 보다 나은 세상을 만들기 위한 우리의 신념입니다 <span className="text-brand">❞</span>
              </p>
              <p>
                <span className="text-brand">❝</span> 유기농의 새로운 시대를 공유합니다 <span className="text-brand">❞</span>
              </p>
            </div>
            {siteConfig.menuImages.map((src, i) => (
              <img key={src} src={src} alt={`룰리커피 메뉴 ${i + 1}`} className="w-full" />
            ))}
          </div>
          <div className="mt-14 border-t pt-10 text-center">
            <p className="h-section">궁금한 점이 있으시면 편하게 문의해 주세요.</p>
            <div className="mt-6 flex justify-center">
              <ConsultButton />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

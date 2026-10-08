import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageIntro, EmptyState } from "@/components/site/Layout";
import { ImageSlot } from "@/components/site/ImageSlot";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/art")({
  head: () => ({
    meta: [
      { title: "룰리아트 | 룰리커피 문화공간과 대관" },
      { name: "description", content: "룰리갤러리·룰리클래식 대관 안내, 공연 일정, 룰리버스킹." },
      { property: "og:title", content: "룰리아트 | 룰리커피" },
      { property: "og:description", content: "전시, 공연, 팝업을 위한 룰리커피의 문화공간." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Art,
});

const uses = ["개인·단체 전시", "사진·일러스트", "조각·오브제", "브랜드 팝업", "굿즈 판매", "제품 쇼케이스", "토크·강연", "워크숍", "소규모 공연", "상영회", "제품·콘텐츠 촬영", "기업 문화 행사"];
const tabs = ["예정 공연", "지난 공연", "룰리버스킹"] as const;

function Art() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("예정 공연");
  const a = siteConfig.art;
  return (
    <>
      <PageIntro />
      <section className="section-y">
        <div className="container-site">
          <h2 className="h-section">공간 안내</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {a.spaces.map((s) => (
              <article key={s.name}>
                <div className="aspect-[4/5] overflow-hidden"><ImageSlot alt={`${s.name} 내부`} /></div>
                <h3 className="mt-5 text-lg font-bold">{s.name}</h3>
                <p className="mt-1 text-muted-foreground">{s.store} · 전용 대관 면적 {s.area}</p>
              </article>
            ))}
          </div>
          <h3 className="mt-16 font-bold">이런 용도로 이용할 수 있어요</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {uses.map((u) => <li key={u} className="border px-3 py-1.5 text-sm">{u}</li>)}
          </ul>
        </div>
      </section>
      <section className="border-t bg-surface section-y">
        <div className="container-site grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="h-section">대관 요금 안내</h2>
            <table className="mt-8 w-full">
              <tbody>
                {a.rates.map(([k, v]) => (
                  <tr key={k} className="border-b"><td className="py-4">{k}</td><td className="py-4 text-right font-semibold">{v}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-sm text-muted-foreground">공간별 요금, 부가세 포함 여부, 이용 시간, 장비 및 추가 비용은 상담 시 안내해 드립니다.</p>
          </div>
          <div className="space-y-8">
            <div className="border-t pt-6">
              <h3 className="font-bold">대관 공연</h3>
              <p className="mt-2 text-muted-foreground">신청자가 공연을 기획·운영하고, 룰리커피는 공간을 제공합니다.</p>
            </div>
            <div className="border-t pt-6">
              <h3 className="font-bold">룰리버스킹</h3>
              <p className="mt-2 text-muted-foreground">룰리커피가 직접 제안하고 아티스트와 함께 만드는 협업 공연입니다.</p>
            </div>
            <p className="text-sm text-muted-foreground">대관 신청은 곧 온라인으로 접수할 수 있도록 준비 중입니다.</p>
          </div>
        </div>
      </section>
      <section className="section-y">
        <div className="container-site">
          <h2 className="h-section">공연 일정</h2>
          <div role="tablist" className="mt-8 flex gap-1 border-b">
            {tabs.map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("h-11 px-4 text-sm font-medium", tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground")}>
                {t}
              </button>
            ))}
          </div>
          <div className="mt-8"><EmptyState title={`등록된 ${tab} 정보가 없습니다.`} /></div>
        </div>
      </section>
    </>
  );
}

import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Cog, ExternalLink, ListChecks, Users } from "lucide-react";
import { CountUp } from "@/components/site/CountUp";
import { ConsultButton } from "@/components/site/consult";
import { HeroCarousel } from "@/components/site/HeroCarousel";
import { ProductCarousel } from "@/components/site/ProductCarousel";
import { EmptyState } from "@/components/site/Layout";
import { ImageSlot } from "@/components/site/ImageSlot";
import { NewsBoard } from "@/components/site/NewsBoard";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { listVisibleNews } from "@/lib/public-news";
import { listVisibleStores } from "@/lib/public-stores";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "룰리커피 | 좋은 커피를, 더 단순한 운영으로" },
      { name: "description", content: "유기농 원두, 자체 로스팅, 단순한 메뉴와 자동화 장비. 2014년 대구에서 시작한 룰리커피의 가맹 상담을 신청하세요." },
      { property: "og:title", content: "룰리커피 | 좋은 커피를, 더 단순한 운영으로" },
      { property: "og:description", content: "유기농 원두와 자체 로스팅, 소수 인원 운영 구조의 커피 프랜차이즈 룰리커피." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async () => {
    const stores = await listVisibleStores();
    try {
      return { stores, news: await listVisibleNews(), newsError: false as const };
    } catch {
      return { stores, news: [], newsError: true as const };
    }
  },
  component: Home,
});

import type { LucideIcon } from "lucide-react";

const strengthVideos = ["/coffee-pull.mp4", "/coffee-roast.mp4"];

function StrengthBackdrop() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % strengthVideos.length), 9000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {strengthVideos.map((src, index) => (
        <video
          key={src}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${index === active ? "opacity-100" : "opacity-0"}`}
          src={src}
          autoPlay
          muted
          loop
          playsInline
        />
      ))}
      <div className="absolute inset-0 bg-[#FBEFD9]/62" />
    </div>
  );
}

const strengths: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: ListChecks, title: "단순한 메뉴", desc: "꼭 필요한 메뉴만 운영해 재고와 교육 부담을 줄입니다." },
  { icon: Cog, title: "자동화 커피 장비", desc: "숙련도와 관계없이 일정한 품질의 커피를 제공합니다." },
  { icon: Users, title: "소수 인원 운영", desc: "적은 인원으로도 매장을 운영할 수 있도록 설계했습니다." },
];

function Home() {
  const { stores, news, newsError } = Route.useLoaderData();
  const b = siteConfig.brand;
  return (
    <div className="home-page">
      {/* Hero */}
      <section>
        <HeroCarousel>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/85">Since {b.founded} · Daegu</p>
          <h1 className="h-display mt-4 whitespace-pre-line text-white">{siteConfig.hero.headline}</h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">{siteConfig.hero.sub}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ConsultButton />
            <Button size="lg" variant="outline" className="border-white/70 bg-transparent text-white hover:bg-white/10 hover:text-white" asChild>
              <Link to="/franchise">가맹안내 보기</Link>
            </Button>
          </div>
        </HeroCarousel>
      </section>


      {/* Scale */}
      <section className="border-y">
        <dl className="grid grid-cols-2 md:grid-cols-4 md:divide-x">
          <div className="flex flex-col items-center justify-center border-t px-6 py-8 text-center md:border-t-0 md:py-12">
            <dt className="text-sm text-muted-foreground">업력</dt>
            <dd className="mt-2 text-2xl font-bold text-primary md:text-4xl">
              <CountUp from={b.founded} target={new Date().getFullYear()} />년
            </dd>
          </div>
          <div className="flex flex-col items-center justify-center border-l border-t px-6 py-8 text-center md:border-l-0 md:border-t-0 md:py-12">
            <dt className="text-sm text-muted-foreground">매장수</dt>
            <dd className="mt-2 text-2xl font-bold text-primary md:text-4xl">
              <CountUp from={1} target={b.totalStores} />호점<span className="text-brick">+</span>
            </dd>
          </div>
          {siteConfig.certifications.length > 0 && (
            <div className="flex flex-col items-center justify-center border-t px-6 py-8 text-center md:border-t-0 md:py-12">
              <dt className="text-sm text-muted-foreground">인증</dt>
              <dd className="mt-2 flex flex-col items-center gap-3">
                {siteConfig.certifications.map((c) => (
                  <span key={c.name} className="inline-flex items-center gap-1.5 whitespace-nowrap text-base font-bold text-primary md:text-lg">
                    {c.imageUrl ? (
                      <img src={c.imageUrl} alt="" className="h-8 w-8 shrink-0 object-contain sm:h-10 sm:w-10" />
                    ) : (
                      <BadgeCheck aria-hidden className="size-4 shrink-0 md:size-5" />
                    )}
                    {c.name}
                  </span>
                ))}
              </dd>
            </div>
          )}
          {siteConfig.supplyPartners.length > 0 && (
            <div className="flex flex-col items-center justify-center border-l border-t px-6 py-8 text-center md:border-l-0 md:border-t-0 md:py-12">
              <dt className="text-sm text-muted-foreground">원두 공급</dt>
              <dd className="mt-2 flex flex-col items-center gap-3">
                {siteConfig.supplyPartners.map((p) => (
                  <span key={p.name} className="flex flex-col items-center gap-1.5">
                    {p.imageUrl ? <img src={p.imageUrl} alt="" className="h-8 w-auto object-contain md:h-9" /> : null}
                    <span className="text-base font-bold text-primary md:text-lg">{p.name}</span>
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {/* Strengths */}
      <section className="relative isolate overflow-hidden section-y">
        <StrengthBackdrop />
        <div className="container-site relative">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Franchise</p>
            <h2 className="h-section mt-4">운영이 단순해야<br />오래 갑니다</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">룰리커피는 처음부터 적은 인원으로 운영할 수 있는 매장을 설계합니다.</p>
          </div>
          <div className="mt-14 grid gap-12 md:mt-20 md:grid-cols-3 md:gap-8">
            {strengths.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center">
                <div className="flex size-36 items-center justify-center rounded-full border bg-[#FBEFD9]/80 md:size-44">
                  <Icon aria-hidden strokeWidth={1.25} className="size-12 text-muted-foreground md:size-14" />
                </div>
                <h3 className="mt-8 text-xl font-bold">{title}</h3>
                <p className="mt-3 max-w-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-14 text-center">
            <Link to="/franchise" className="inline-flex items-center gap-2 font-semibold text-primary hover:underline">
              가맹안내 자세히 보기 <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>


      {/* Online store */}
      <section className="section-y">
        <div className="container-site">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Online Store</p>
              <h2 className="h-section mt-4 inline-flex items-center gap-2">
                온라인스토어 바로가기
                <ExternalLink aria-hidden className="size-[0.8em] text-primary" />
              </h2>
            </div>
          </div>
          <div className="mt-12">
            <ProductCarousel />
          </div>
        </div>
      </section>

      {/* New stores & news */}
      <section className="bg-surface section-y">
        <div className="container-site">
          <div>
            <div className="flex items-end justify-between">
              <h2 className="h-section">신규 매장</h2>
              <Link to="/stores" className="text-sm font-semibold text-primary hover:underline">전체보기</Link>
            </div>
            <div className="mt-6">
              {stores.length === 0 ? (
                <EmptyState title="곧 새로운 매장 소식을 전해드릴게요." />
              ) : (
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {stores.map((s) => (
                    <li key={s.id}>
                      <Link to="/stores/$slug" params={{ slug: s.id }} className="group block h-full border bg-background">
                        <div className="aspect-[4/3] overflow-hidden">
                          <ImageSlot src={s.image_url} alt="" className="transition-transform duration-500 group-hover:scale-[1.03]" />
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-bold group-hover:text-primary">{s.title}</h3>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="mt-14 border-t pt-14">
            <div className="flex items-end justify-between">
              <h2 className="h-section">새로운 소식</h2>
              <Link to="/news" className="text-sm font-semibold text-primary hover:underline">전체 보기</Link>
            </div>
            <div className="mt-6"><NewsBoard items={news} error={newsError} limit={5} /></div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="container-site flex flex-col items-start justify-between gap-8 py-16 md:flex-row md:items-center md:py-20">
          <div>
            <h2 className="h-section">룰리커피와 함께할 점주님을 기다립니다</h2>
            <p className="mt-3 opacity-80">상담 신청을 남겨주시면 담당자가 직접 연락드립니다.</p>
          </div>
          <ConsultButton variant="outline" className="border-primary-foreground/60 text-primary-foreground hover:border-primary-foreground hover:text-primary-foreground" />
        </div>
      </section>
    </div>
  );
}

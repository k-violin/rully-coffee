import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/lib/site-config";

export const Route = createFileRoute("/brand")({
  head: () => ({
    meta: [
      { title: "브랜드 소개 | 룰리커피" },
      { name: "description", content: "2014년 대구에서 시작한 룰리커피의 이야기, 유기농 원두와 자체 로스팅." },
      { property: "og:title", content: "브랜드 소개 | 룰리커피" },
      { property: "og:description", content: "유기농 원두를 직접 로스팅하는 룰리커피의 브랜드 이야기." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Brand,
});

const history: { year: string; items: { text: string; center?: boolean }[] }[] = [
  { year: "2014", items: [{ text: "자체 로스팅 공장 설립 및 온라인 판매 시작" }] },
  {
    year: "2019",
    items: [
      { text: "1호점 110평 대구 고모역 직영점 오픈" },
      { text: "코스트코코리아 정식 납품업체 등록" },
    ],
  },
  { year: "2021", items: [{ text: "2호점 300평 대구 가창점 직영점 오픈" }] },
  {
    year: "2023",
    items: [
      { text: "3호점 300평 경상 삼성현점 직영점 오픈" },
      { text: "미국 Loring사 대형 로스터 3대 보유", center: true },
      { text: "신축 공장 완공", center: true },
    ],
  },
  { year: "2024", items: [{ text: "아시아 유일 칙필에이 (Chic-Fil-A) 아시아 원두 납품 공식 업체 지정" }] },
  { year: "2025", items: [{ text: "오가닉 원두 인증협회 생산 인증 통과" }] },
  { year: "2026", items: [{ text: "글로벌 가맹 사업 시작" }] },
];

function Brand() {
  return (
    <>
      <section className="border-b">
        <img src="/고모점.jpg?v=2" alt="룰리커피 고모점" className="aspect-[16/9] w-full object-cover md:aspect-[2/1]" />
      </section>
      <section className="section-y">
        <article className="container-site mx-auto max-w-2xl space-y-8 text-center text-base leading-relaxed">
          <p>
            룰리커피는 2014년, 대구의 작은 로스팅 공장에서 시작되었습니다. 화려한 마케팅이 아닌 ‘커피의 실력’만으로 온라인에서 먼저 검증받으며, 코스트코를 비롯한 다양한 유통 채널로 확장해왔습니다.
          </p>
          <p>
            그리고 2019년, 풍경이 좋은 기찻길 옆 고모역에서 110평 규모의 첫 직영 매장을 열며 본격적인 오프라인 사업을 시작했습니다.
          </p>
          <p>
            우리는 매장을 빠르게 늘리기보다, 맛과 품질을 더욱 단단히 쌓아가는 길을 선택했습니다.
          </p>
          <p>
            그 축적의 시간은 2호점과 3호점의 대형 직영 매장 오픈, 그리고 신축 공장 완공이라는 결과로 이어졌습니다.
          </p>
          <p>
            이제 룰리는 오랜 시간 다져온 제조 역량과 직영 매장 운영 시스템을 기반으로 새로운 카페 룰리오가닉을 선보입니다.
          </p>
          {siteConfig.supplyClaim && <p className="text-muted-foreground">{siteConfig.supplyClaim}</p>}
        </article>
      </section>
      <section className="bg-surface section-y">
        <div className="container-site">
          <h2 className="text-center text-4xl font-bold text-brand">History</h2>
          <ol className="mt-14 space-y-10">
            {history.map((group) => (
              <li key={group.year} className="mx-auto w-fit max-w-full">
                <p className="text-center text-lg font-bold">{group.year}</p>
                <ul className="mt-3 w-full space-y-1 text-base leading-relaxed">
                  {group.items.map((item) => (
                    <li key={item.text} className={item.center ? "text-center" : undefined}>
                      · {item.text}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="section-y">
        <div className="container-site mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold text-brand">로스터리</h2>
          <article className="mt-14 space-y-8 text-base leading-relaxed">
            <p>
              룰리커피 로스터리 & 프로덕션 센터는 원두를 필요로 하는 비즈니스 파트너를 위해 설립된 전문 생산 시설입니다.
            </p>
            <p>
              본 시설은 로스팅을 중심으로 콜드브루, 드립백 등 다양한 커피 제품을 자체 생산하며, 특히 콜드브루 생산에 특화된 전용 라인을 자체 개발하여 대량 생산 환경에서도 균일한 품질과 풍미를 안정적으로 구현하고 있습니다.
            </p>
            <p>
              룰리커피는 원두와 콜드브루 두 영역에서 명확한 강점을 구축하고 있으며, 이를 위해 로스터리 업계에서 ‘하이엔드 머신’으로 불리는 미국 Loring사의 대형 로스팅 머신을 3대 보유·운용(국내유일)하고 있습니다. 이를 통해 높은 에너지 효율과 정밀한 열 제어 기반의 일관된 로스팅 품질을 유지합니다.
            </p>
            <p>
              또한 전 세계 하이엔드 커피 로스터리 수준의 장비 인프라를 기반으로 전문 바리스타 및 엔지니어를 양성하며, 제품 개발부터 생산까지 전 과정의 완성도를 지속적으로 고도화하고 있습니다.
            </p>
            <p>
              룰리커피는 코스트코(Costco), Chick-fil-A 등 다양한 글로벌 채널을 통해 고객과의 접점을 확장하고 있으며, 대량 공급 환경에서도 브랜드의 기준과 품질을 일관되게 유지하고 있습니다.
            </p>
            <p>
              본 센터는 농림축산식품부 기준의 유기농 인증과 HACCP(해썹) 인증을 획득한 위생적이고 체계적인 제조 설비를 갖추고 있으며, 엄격한 품질 관리 시스템을 통해 소비자가 안심하고 즐길 수 있는 고품질 커피를 생산합니다.
            </p>
            <p>이곳은 단순한 생산 시설이 아닌, 룰리커피의 품질 철학과 기술력이 집약된 핵심 인프라입니다.</p>
          </article>
          <ul className="mt-14 flex flex-nowrap items-center justify-center gap-4 sm:gap-8">
            {[
              { src: "/유기농.png", alt: "유기농 인증" },
              { src: "/해썹.png", alt: "해썹(HACCP) 인증" },
              { src: "/칙필레.png", alt: "칙필레 원두 공급" },
              { src: "/코스트코.png", alt: "코스트코 정식 납품" },
            ].map((mark) => (
              <li key={mark.src}>
                <img src={mark.src} alt={mark.alt} className="h-12 w-auto object-contain sm:h-16" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

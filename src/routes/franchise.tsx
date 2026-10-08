import { createFileRoute } from "@tanstack/react-router";
import { ConsultButton } from "@/components/site/consult";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { siteConfig } from "@/lib/site-config";

export const Route = createFileRoute("/franchise")({
  head: () => ({
    meta: [
      { title: "가맹안내 | 룰리커피" },
      { name: "description", content: "룰리커피 운영 구조, 매장 모델별 창업 비용, 실적 기반 수익 예시, 오픈 절차와 자주 묻는 질문." },
      { property: "og:title", content: "가맹안내 | 룰리커피" },
      { property: "og:description", content: "10·20·30평 매장 모델과 창업 비용, 오픈 절차를 안내합니다." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Franchise,
});

const faq = [
  ["매장 규모는 어떻게 선택할 수 있나요?", "10평 테이크아웃형, 약 20석의 20평 좌석형, 약 40석의 30평 좌석형 세 가지 모델이 있습니다. 상권과 점포 조건에 맞춰 상담을 통해 결정합니다."],
  ["아이스크림 기계는 필수인가요?", "아니요. 아이스크림 기계는 선택 사항입니다."],
  ["푸드는 매장에서 직접 만드나요?", "본사에서 바게트, 케이크, 수프 등을 공급하며 매장에서는 데워서 제공합니다."],
  ["상담은 어떻게 진행되나요?", "홈페이지에서 가맹상담을 신청하시면 담당자가 연락드려 상담을 진행합니다."],
  ["오픈 준비는 어떻게 지원하나요?", "점포 개발부터 인테리어, 매뉴얼 교육, 초도입고, 오픈 이후 정기 점검까지 본사가 함께합니다."],
];

function CompanyMark({ children }: { children: string }) {
  return (
    <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-[#6f6f6f] text-[13px] font-semibold whitespace-nowrap text-white">
      {children}
    </span>
  );
}

function CompareRow({
  title,
  leftLabel,
  rightLabel,
  left,
  right,
  versus,
}: {
  title: string;
  leftLabel: string;
  rightLabel: string;
  left: React.ReactNode;
  right: React.ReactNode;
  versus: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-center text-2xl font-medium text-neutral-600 md:text-3xl">{title}</h2>
      <div className="mx-auto mt-12 flex max-w-5xl flex-col items-center gap-6 md:grid md:grid-cols-[1fr_5.5rem_1fr] md:justify-items-center md:gap-x-2 md:gap-y-8">
        <p className="text-neutral-500 md:col-start-1 md:row-start-1">{leftLabel}</p>
        <div className="md:col-start-1 md:row-start-2">{left}</div>
        <div className="text-center text-neutral-400 md:col-start-2 md:row-start-2">{versus}</div>
        <p className="text-neutral-500 md:col-start-3 md:row-start-1">{rightLabel}</p>
        <div className="md:col-start-3 md:row-start-2">{right}</div>
      </div>
    </div>
  );
}

const circle = "flex aspect-square w-[min(20rem,100%)] flex-col rounded-full sm:w-80";

const sliceTones = {
  green: { fill: "#179A48", text: "text-white" },
  dark: { fill: "#5c5c5c", text: "text-white" },
  mid: { fill: "#9a9a9a", text: "text-neutral-800" },
  light: { fill: "#c8c8c8", text: "text-neutral-700" },
  pale: { fill: "#e4e7ea", text: "text-neutral-600" },
} as const;

const profitCharts = [
  {
    title: "예상수익구조 월2,500만",
    center: "월 2,500만",
    notes: ["점주참여도에 따라 인건비 비중이 높아질 수 있습니다.", "테이크아웃 전문 매장, 테이크아웃 용기 사용비율 ↑"],
    slices: [
      { name: "순이익", pct: 35, amount: "875만원", tone: "green" },
      { name: "재료값", pct: 35, amount: "875만원", tone: "dark" },
      { name: "인건비", pct: 16, amount: "400만원", tone: "mid" },
      { name: "월세", pct: 8, amount: "200만원", tone: "light" },
      { name: "기타 공과/수수료", pct: 6, amount: "150만원", tone: "pale" },
    ],
  },
  {
    title: "예상수익구조 월3,500만",
    center: "월 3,500만",
    notes: ["점주참여도에 따라 인건비 비중이 높아질 수 있습니다.", "테이크아웃 용기 사용비율 ↓"],
    slices: [
      { name: "순이익", pct: 35, amount: "1,225만원", tone: "green" },
      { name: "재료값", pct: 33, amount: "1,155만원", tone: "dark" },
      { name: "인건비", pct: 16, amount: "560만원", tone: "mid" },
      { name: "월세", pct: 10, amount: "350만원", tone: "light" },
      { name: "기타 공과/수수료", pct: 6, amount: "210만원", tone: "pale" },
    ],
  },
  {
    title: "예상수익구조 월4,500만",
    center: "월 4,500만",
    notes: ["점주참여도에 따라 인건비 비중이 높아질 수 있습니다.", "테이크아웃 용기 사용비율 ↓"],
    slices: [
      { name: "순이익", pct: 35, amount: "1,575만원", tone: "green" },
      { name: "재료값", pct: 31, amount: "1,395만원", tone: "dark" },
      { name: "인건비", pct: 16, amount: "720만원", tone: "mid" },
      { name: "월세", pct: 12, amount: "540만원", tone: "light" },
      { name: "기타 공과/수수료", pct: 6, amount: "270만원", tone: "pale" },
    ],
  },
] as const;

function ProfitChart({ chart }: { chart: (typeof profitCharts)[number] }) {
  let cursor = 0;
  const stops = chart.slices
    .map((slice) => {
      const start = cursor;
      cursor += slice.pct;
      return `${sliceTones[slice.tone].fill} ${start}% ${cursor}%`;
    })
    .join(", ");
  let start = 0;
  const labels = chart.slices.map((slice) => {
    const mid = start + slice.pct / 2;
    start += slice.pct;
    const angle = (mid / 100) * Math.PI * 2 - Math.PI / 2;
    const radius = 36;
    return {
      ...slice,
      left: 50 + Math.cos(angle) * radius,
      top: 50 + Math.sin(angle) * radius,
    };
  });

  return (
    <figure>
      <figcaption className="text-center text-2xl font-medium text-neutral-600 md:text-3xl">{chart.title}</figcaption>
      <div className="relative mx-auto mt-10 aspect-square w-[min(22rem,100%)] sm:w-96">
        <div className="size-full rounded-full" style={{ background: `conic-gradient(${stops})` }} />
        <div className="absolute inset-[27%] flex flex-col items-center justify-center rounded-full bg-surface text-center">
          <p className="text-lg font-medium text-neutral-700">{chart.center}</p>
          <p className="text-sm text-neutral-500">기준</p>
        </div>
        {labels.map((slice) => (
          <p
            key={slice.name}
            className={`absolute w-24 -translate-x-1/2 -translate-y-1/2 text-center text-[12px] leading-tight ${sliceTones[slice.tone].text}`}
            style={{ left: `${slice.left}%`, top: `${slice.top}%` }}
          >
            {slice.name}
            <br />
            <span className="text-sm font-bold">{slice.pct}%</span>
            <br />({slice.amount})
          </p>
        ))}
      </div>
      <ul className="mx-auto mt-8 max-w-md space-y-1 text-center text-sm text-neutral-500">
        {chart.notes.map((note) => (
          <li key={note}>* {note}</li>
        ))}
      </ul>
    </figure>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th scope="col" className="whitespace-nowrap border-b px-4 py-3 text-left text-sm font-semibold text-muted-foreground">{children}</th>;
}
function Td({ children, strong }: { children: React.ReactNode; strong?: boolean }) {
  return <td className={`whitespace-nowrap border-b px-4 py-4 ${strong ? "font-semibold" : ""}`}>{children}</td>;
}

function Franchise() {
  const f = siteConfig.franchise;
  const c = f.campaign;
  const showCampaign = c.active && c.start && c.end;
  return (
    <>
      <section className="border-b">
        <img src="/모집.GIF" alt="룰리커피 가맹 모집" className="w-full" />
      </section>

      {showCampaign && (
        <section className="border-b bg-surface">
          <div className="container-site py-8">
            <p className="eyebrow">Campaign · {c.start} – {c.end}</p>
            <p className="mt-2 text-lg font-bold">{c.title}</p>
            <p className="mt-1 text-muted-foreground">가맹비 {c.franchiseFee} · 교육비 {c.trainingFee} 면제 / 조건: {c.condition}</p>
          </div>
        </section>
      )}

      <section className="section-y">
        <article className="container-site mx-auto max-w-2xl text-center text-base leading-relaxed">
          <div className="space-y-8">
            <p>
              <span className="text-brand">❝</span>
              룰리는 가격 경쟁을 하지 않습니다
              <span className="text-brand">❞</span>
            </p>
            <p>
              <span className="text-brand">❝</span> 오가닉으로 차별화하고,
              <br />
              전자동머신으로 빠르게,
              <br />
              정예메뉴로 손쉽게 운영합니다 <span className="text-brand">❞</span>
            </p>
          </div>
          <h2 className="mt-14 text-2xl font-bold md:text-3xl">룰리의 프랜차이즈</h2>
          <div className="mt-10 space-y-8">
            <p>
              지난 수년간
              <br />
              룰리는 가맹사업을 거절해왔습니다.
            </p>
            <p>
              좋은 커피를 많이 판매하는 것보다
              <br />
              좋은 커피의 기준을 지키는 것이 더 중요했기 때문입니다.
            </p>
            <p>
              그런 룰리가 가맹사업을 시작하게 된 결정적인 계기는
              <br />
              오가닉 인증공장이 되면서부터였습니다.
            </p>
            <p>
              값비싼 오가닉 원두를 사용하면서도
              <br />
              시장에서 경쟁할 수 있는 가격으로 제공할 수 있다면?
            </p>
            <p>그때부터 이야기가 달라진다고 생각했습니다.</p>
            <p>‘오가닉 커피의 대중화’</p>
            <p>
              이것이 가능하다면
              <br />
              가맹점주들은 각자의 지역에서
              <br />
              독보적인 오가닉 커피 시장을 만들어갈 수 있다는 확신이었습니다.
            </p>
            <p>
              그 확신을 바탕으로 시작한 룰리의 가맹사업은
              <br />
              이제 여러 매장을 통해 실제로 검증되고 있습니다.
            </p>
            <p>
              오가닉 원두, 오가닉 우유, 오가닉 베이커리.
              <br />
              그리고 룰리만의 로스팅과 공급 시스템.
            </p>
            <p>
              같은 기준을 지키는 매장들이 하나씩 늘어나면서
              <br />
              새로운 오가닉 커피 시장, 룰세권을 만들어가고 있습니다.
            </p>
            <p>
              오랫동안 지켜온 룰리의 기준이
              <br />
              이제 새로운 시장의 기준으로 확장되고 있습니다.
            </p>
          </div>
          <ConsultButton className="mt-12">가맹 상담 신청하기</ConsultButton>
          <div className="mt-20">
            <h2 className="text-2xl font-bold md:text-3xl">룰리의 3대강점</h2>
            <ol className="mt-12 space-y-14">
              <li>
                <h3 className="font-bold">1. 저가들과 경쟁하지말고, 오가닉으로 선점하세요.</h3>
                <p className="mt-5">
                  가격경쟁이 치열한 저가커피와 경쟁하지말고
                  <br />
                  룰리만의 고유가격으로 마진을 늘리세요.
                  <br />
                  또한 오가닉이라는 고유영역을 선점하세요.
                </p>
              </li>
              <li>
                <h3 className="font-bold">2. 소수의 메뉴와 전자동머신으로 빠르고 쉽게</h3>
                <p className="mt-5">
                  누구나 손쉽게 창업할 수 있으며,
                  <br />
                  누구나 손쉽게 가르칠 수 있으며,
                  <br />
                  누구나 손쉽게 알바할 수 있습니다.
                </p>
              </li>
              <li>
                <h3 className="font-bold">3. 두려워할 것은 월세가 아니고 인건비입니다.</h3>
                <p className="mt-5">
                  창업을 준비할 때 대부분 가장 먼저 걱정하는 것은 월세입니다.
                  <br />
                  하지만 수익의 가장 큰 변동폭을 만드는 것은 오히려 인건비입니다.
                  <br />
                  일 매출 100만원 수준의 매장도 2명이면 충분합니다.
                  <br />
                  룰리는 적은 인원으로도 운영될 수 있도록 설계된 브랜드입니다.
                </p>
              </li>
            </ol>
          </div>
        </article>
      </section>

      <section className="bg-surface section-y">
        <div className="container-site space-y-28">
          <CompareRow
            title="저가커피시장에서의 룰리"
            leftLabel="저가커피시장은 치킨게임 중"
            rightLabel="새로운 오가닉 카테고리존"
            versus={<span className="tracking-[0.2em]">VS</span>}
            left={
              <div className={`${circle} items-center justify-between bg-[#d4d4d4] px-5 py-8 text-center text-[13px] text-neutral-700`}>
                <div>
                  <CompanyMark>A사</CompanyMark>
                  <p className="mt-1.5">달강정 팔아요~</p>
                </div>
                <div className="flex w-full justify-between px-1">
                  <div>
                    <CompanyMark>B사</CompanyMark>
                    <p className="mt-1.5">떡볶이 팔아요~</p>
                  </div>
                  <div>
                    <CompanyMark>C사</CompanyMark>
                    <p className="mt-1.5">1,800원에 1+1</p>
                  </div>
                </div>
              </div>
            }
            right={
              <div className={`${circle} items-center justify-center bg-[#179A48] px-8 text-center text-sm text-white`}>
                <img src="/로고.png" alt="룰리커피" className="h-20 w-auto" />
                <ul className="mt-1 w-40">
                  {["오가닉 커피", "오가닉 아이스크림", "오가닉 바게트"].map((item) => (
                    <li key={item} className="border-b border-white/90 py-1">
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 font-medium tracking-wide">정체성 유지</p>
              </div>
            }
          />
          <CompareRow
            title="고가커피시장에서의 룰리"
            leftLabel="높은 가격"
            rightLabel="합리적 가격"
            versus={
              <p className="text-sm whitespace-nowrap">
                <span>4,700</span> <span className="tracking-[0.15em]">VS</span> <span className="font-bold text-[#179A48]">2,900</span>
              </p>
            }
            left={
              <div className={`${circle} items-center justify-between bg-[#d4d4d4] px-4 py-8 text-center text-[13px] text-neutral-700`}>
                <div>
                  <CompanyMark>A사</CompanyMark>
                  <p className="mt-1.5 leading-snug">
                    아메리카노
                    <br />
                    ₩4,500
                  </p>
                </div>
                <div className="flex w-full justify-between px-1">
                  <div>
                    <CompanyMark>B사</CompanyMark>
                    <p className="mt-1.5 leading-snug">
                      아메리카노
                      <br />
                      ₩4,700
                    </p>
                  </div>
                  <div>
                    <CompanyMark>C사</CompanyMark>
                    <p className="mt-1.5 leading-snug">
                      아메리카노
                      <br />
                      ₩4,900
                    </p>
                  </div>
                </div>
              </div>
            }
            right={
              <div className={`${circle} items-center justify-center bg-[#179A48] text-center text-white`}>
                <img src="/로고.png" alt="룰리커피" className="h-20 w-auto" />
                <p className="mt-2 text-sm">아메리카노</p>
                <p className="mt-1 text-3xl font-bold tracking-tight">₩2,900</p>
                <p className="mt-4 text-sm">✦ 오가닉 밸류</p>
              </div>
            }
          />
          {profitCharts.map((chart) => (
            <ProfitChart key={chart.title} chart={chart} />
          ))}
        </div>
      </section>

      {/* Models & cost */}
      <section className="border-t bg-surface section-y">
        <div className="container-site">
          <h2 className="h-section">매장 모델과 창업 비용</h2>
          <p className="mt-3 text-muted-foreground">{f.vatNote} · {f.royalty}</p>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead><tr><Th>모델</Th><Th>좌석</Th><Th>예상 창업 비용</Th></tr></thead>
              <tbody>
                {f.models.map((m) => (
                  <tr key={m.name}><Td strong>{m.name}</Td><Td>{m.seats ?? "테이크아웃 중심"}</Td><Td strong>{m.cost}</Td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="mt-14 text-lg font-bold">10평 기준 기본 비용 구성</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px]">
              <tbody>
                {f.breakdown10.map(([k, v]) => <tr key={k}><Td>{k}</Td><Td>{v}</Td></tr>)}
                <tr><Td strong>합계</Td><Td strong>{f.breakdown10Total}</Td></tr>
              </tbody>
            </table>
          </div>
          <ul className="mt-6 space-y-1 text-sm text-muted-foreground">
            <li>· 아이스크림 기계 등 선택 장비는 별도입니다.</li>
            <li>· 점포 상태에 따른 추가 공사(철거, 전기 증설, 설비 등)는 현장 확인 후 별도 산정됩니다.</li>
            <li>· 표준 가맹비 {c.franchiseFee}, 교육비 {c.trainingFee}</li>
          </ul>
        </div>
      </section>

      {/* Performance */}
      <section className="section-y">
        <div className="container-site">
          <p className="eyebrow">실적 기반 수익 예시</p>
          <h2 className="h-section mt-3">실제 매장 운영 예시</h2>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead><tr><Th>월 매출</Th><Th>월 순수익</Th><Th>수익률</Th><Th>재료비</Th><Th>인건비</Th><Th>임대료</Th><Th>기타</Th></tr></thead>
              <tbody>
                {f.performance.rows.map((r) => (
                  <tr key={r.sales}><Td strong>{r.sales}</Td><Td strong>{r.net}</Td><Td>{r.margin}</Td><Td>{r.ingredients}</Td><Td>{r.labor}</Td><Td>{r.rent}</Td><Td>{r.other}</Td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            {f.performance.referenceStore && <>기준 매장: {f.performance.referenceStore} · </>}
            {f.performance.period && <>기간: {f.performance.period} · </>}
            실제 매장의 보고 수치를 바탕으로 한 예시이며, 상권·규모·운영 방식에 따라 결과는 달라질 수 있습니다. 수익을 보장하지 않습니다.
          </p>
        </div>
      </section>

      {/* Process */}
      <section className="border-t bg-surface section-y">
        <div className="container-site">
          <h2 className="text-center text-3xl font-bold text-brand">개설절차</h2>
          <ol className="mx-auto mt-10 max-w-3xl">
            {f.process.map((step, i) => (
              <li key={step.step}>
                <div className="grid grid-cols-2 border border-neutral-400 bg-background text-center">
                  <div className="border-r border-neutral-400 px-4 py-4">
                    <p className="text-sm">{step.step}</p>
                    <p className="font-bold">{step.name}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center px-4 py-4">
                    <p>{step.detail}</p>
                    {step.note && <p className="mt-0.5 text-sm text-neutral-500">{step.note}</p>}
                  </div>
                </div>
                {i < f.process.length - 1 && (
                  <div className="flex justify-center py-1.5 text-brand" aria-hidden>
                    <svg viewBox="0 0 12 8" className="h-3 w-4 fill-current">
                      <path d="M0 0h12L6 8z" />
                    </svg>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-y">
        <div className="container-site max-w-3xl">
          <h2 className="h-section">자주 묻는 질문</h2>
          <Accordion type="single" collapsible className="mt-8 border-t">
            {faq.map(([q, a], i) => (
              <AccordionItem key={q} value={`q${i}`}>
                <AccordionTrigger className="py-5 text-left text-base font-semibold">{q}</AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-14 text-center">
            <p className="text-lg font-bold">더 궁금한 점이 있으신가요?</p>
            <ConsultButton className="mt-5" />
          </div>
        </div>
      </section>
    </>
  );
}

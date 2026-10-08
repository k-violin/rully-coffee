// Central owner-editable content. `null` = owner has not provided it yet;
// the UI hides or shows a neutral empty state instead of inventing values.
// Phase 2 moves these values into admin-managed storage.

export const siteConfig = {
  brand: { nameKo: "룰리커피", wordmark: "rully coffee", logoUrl: "/로고.png", founded: 2014, directStores: 3, franchiseStores: 25, totalStores: 25 },
  // Owner-confirmed claims (2026-10): certifications and bean supply partners.
  // imageUrl = official mark/logo; null shows a neutral icon + text instead.
  certifications: [
    { name: "유기농 인증", imageUrl: "/유기농.png" as string | null },
    { name: "해썹(HACCP) 인증", imageUrl: "/해썹.png" as string | null },
  ],
  supplyPartners: [
    { name: "코스트코 정식 납품", imageUrl: "/코스트코.png" as string | null },
    { name: "칙필레 원두 공급", imageUrl: "/칙필레.png" as string | null },
  ],
  hero: {
    headline: "좋은 커피를,\n더 단순한 운영으로.",
    sub: "2014년 대구에서 시작한 룰리커피는 유기농 원두와 자체 로스팅, 단순한 운영 구조로 전국에 매장을 열어가고 있습니다.",
  },
  naverStoreUrl: "https://smartstore.naver.com/rullycoffee/",
  // Menu board images for the 메뉴구성 page, in display order.
  menuImages: ["/메뉴1.png", "/메뉴2.png"],
  // Supply history wording awaiting owner confirmation; hidden while null.
  supplyClaim: null as string | null,
  company: {
    name: "룰리커피",
    ceo: null as string | null,
    bizNumber: null as string | null,
    address: null as string | null,
    phone: null as string | null,
    email: null as string | null,
  },
  privacy: {
    purpose: "가맹 상담 진행 및 결과 안내",
    fields: "이름, 이메일, 연락처, 창업희망지역, 문의내용",
    retention: "상담 종료 후 1년간 보관 후 파기",
    effectiveDate: null as string | null,
  },
  terms: {
    effectiveDate: null as string | null,
  },
  franchise: {
    vatNote: "VAT 별도",
    royalty: "월 고정 로열티 15만원",
    models: [
      { name: "10평 테이크아웃형", seats: null as string | null, cost: "6,650만원부터" },
      { name: "20평 좌석형", seats: "약 20석", cost: "9,350만원부터" },
      { name: "30평 좌석형", seats: "약 40석", cost: "1억 1,550만원부터" },
    ],
    breakdown10: [
      ["커피 장비", "1,880만원"],
      ["기타 장비", "1,970만원"],
      ["인테리어", "1,500만원"],
      ["간판", "400만원"],
      ["카운터·쇼케이스", "700만원"],
      ["공사 감리", "200만원"],
    ] as [string, string][],
    breakdown10Total: "6,650만원",
    campaign: {
      active: false, // owner must confirm dates and conditions before activation
      title: "가맹비·교육비 6개월 면제 캠페인",
      franchiseFee: "500만원",
      trainingFee: "200만원",
      condition: "지방자치단체에 100만원 이상 기부 시 가맹비 면제",
      start: null as string | null,
      end: null as string | null,
    },
    performance: {
      referenceStore: null as string | null,
      period: null as string | null,
      rows: [
        { sales: "2,500만원", net: "875만원", margin: "35%", ingredients: "35%", labor: "16%", rent: "8%", other: "6%" },
        { sales: "3,500만원", net: "1,225만원", margin: "35%", ingredients: "33%", labor: "16%", rent: "10%", other: "6%" },
        { sales: "4,500만원", net: "1,575만원", margin: "35%", ingredients: "31%", labor: "16%", rent: "12%", other: "6%" },
      ],
    },
    process: [
      { step: "STEP 1.", name: "홈페이지 접수", detail: "본사 미팅", note: "*정보공개서,계약서 제공" },
      { step: "STEP 2.", name: "점포 개발", detail: "상권분석,투자범위 확정", note: null },
      { step: "STEP 3.", name: "계약 체결", detail: "점포계약, 가맹계약", note: null },
      { step: "STEP 4.", name: "도면 확정", detail: "인테리어 공사", note: "* 약 4주간" },
      { step: "STEP 5.", name: "메뉴얼 교육", detail: "운영교육, 현장실습", note: null },
      { step: "STEP 6.", name: "초도입고", detail: "오픈 2-5일 전까지", note: null },
      { step: "STEP 7.", name: "매장 오픈", detail: "S/V 오픈 지원", note: null },
      { step: "STEP 8.", name: "정기 점검", detail: "S/V 점검 지도", note: null },
    ],
  },
  art: {
    spaces: [
      { name: "1호관 룰리갤러리", store: "고모점", area: "25평" },
      { name: "2호관 룰리갤러리", store: "가창점", area: "25평" },
      { name: "3호관 룰리클래식", store: "삼성현점", area: "45평" },
    ],
    rates: [
      ["1일", "50만원"],
      ["주말 3일 (금–일)", "100만원"],
      ["1주 (7일)", "200만원"],
      ["장기 (2–4주)", "협의"],
    ] as [string, string][],
  },
};

export type NewsItem = {
  title: string;
  href: string;
  date: string | null;
  imageUrl: string;
};

// Newest first. Each card is a photo; the title appears on hover and the card links to `href`.
export const newsItems: NewsItem[] = [];

export type Store = {
  slug: string;
  name: string;
  type: "direct" | "franchise";
  region: string | null;
  area: string | null;
  address: string | null;
  hours: string | null;
  phone: string | null;
  imageUrls: string[];
  isNew: boolean;
};

// Admin-managed list. Add photos to imageUrls; each row of the detail page fills with them.
// An empty imageUrls list keeps the placeholder until photos are uploaded.
// 홈과 매장안내에는 쓰지 않는다. 노출 매장은 Supabase stores 테이블에서 불러온다.
export const stores: Store[] = [
  { slug: "gomo", name: "고모점", type: "direct", region: "대구", area: "약 110평", address: null, hours: null, phone: null, imageUrls: ["/고모점.jpg?v=2"], isNew: false },
  { slug: "gachang", name: "가창점", type: "direct", region: "대구", area: "약 300평", address: null, hours: null, phone: null, imageUrls: ["/가창점.jpg"], isNew: false },
  { slug: "samseonghyeon", name: "삼성현점", type: "direct", region: null, area: "약 300평", address: null, hours: null, phone: null, imageUrls: ["/경산점.png"], isNew: false },
];

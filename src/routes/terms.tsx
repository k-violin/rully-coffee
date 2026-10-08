import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { PageIntro } from "@/components/site/Layout";
import { siteConfig } from "@/lib/site-config";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "이용약관 | 룰리커피" },
      { name: "description", content: "룰리커피 홈페이지 이용약관 — 서비스 이용 조건, 이용자 의무, 면책 및 분쟁 해결 안내." },
      { property: "og:title", content: "이용약관 | 룰리커피" },
      { property: "og:description", content: "룰리커피 홈페이지 이용약관 — 서비스 이용 조건, 이용자 의무, 면책 및 분쟁 해결 안내." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => {
    const t = siteConfig.terms;
    return (
      <>
        <PageIntro />
        <section className="container-site max-w-3xl space-y-12 py-14 md:py-20 text-[15px] leading-relaxed">
          <div>
            <h2 className="h-section text-xl">제1조 (목적)</h2>
            <p className="mt-4 text-muted-foreground">
              본 약관은 룰리커피(이하 "회사")가 운영하는 홈페이지에서 제공하는 브랜드 소개, 가맹 안내, 매장 및 메뉴 안내, 가맹 상담 신청, 대관 안내 등 서비스(이하 "서비스")를 이용함에 있어 회사와 이용자의 권리·의무 및 책임사항을 정하는 것을 목적으로 합니다.
            </p>
          </div>
          <div>
            <h2 className="h-section text-xl">제2조 (정의)</h2>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              <li>1. "홈페이지"란 회사가 서비스를 제공하기 위해 운영하는 웹사이트를 말합니다.</li>
              <li>2. "이용자"란 홈페이지에 접속하여 서비스를 이용하는 모든 자를 말합니다.</li>
              <li>3. "가맹 상담 신청"이란 이용자가 홈페이지의 신청 양식에 정보를 입력하여 가맹 관련 상담을 요청하는 행위를 말합니다.</li>
            </ul>
          </div>
          <div>
            <h2 className="h-section text-xl">제3조 (약관의 게시 및 변경)</h2>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              <li>1. 본 약관은 홈페이지에 게시하여 공지합니다.</li>
              <li>2. 회사는 필요한 경우 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 홈페이지를 통해 공지합니다.{t.effectiveDate ? ` (시행일: ${t.effectiveDate})` : ""}</li>
            </ul>
          </div>
          <div>
            <h2 className="h-section text-xl">제4조 (서비스의 제공 및 변경)</h2>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              <li>1. 회사는 홈페이지를 통해 브랜드·가맹·매장·메뉴 소개, 가맹 상담 신청, 온라인스토어 연결, 대관 안내 등의 서비스를 제공합니다.</li>
              <li>2. 홈페이지에 표시된 가맹 비용, 매장 정보 등은 사업 상황에 따라 달라질 수 있으며, 정확한 내용은 상담을 통해 안내됩니다.</li>
              <li>3. 온라인 상품의 실제 구매·결제는 온라인스토어가 운영되는 플랫폼에서 이루어지며, 해당 거래에는 그 플랫폼의 이용약관이 적용될 수 있습니다.</li>
            </ul>
          </div>
          <div>
            <h2 className="h-section text-xl">제5조 (개인정보 보호)</h2>
            <p className="mt-4 text-muted-foreground">
              이용자의 개인정보는 <Link to="/privacy" className="text-primary underline underline-offset-4 hover:opacity-80">개인정보처리방침</Link>에 따라 보호됩니다. 본 약관에 명시되지 않은 개인정보 관련 사항은 개인정보처리방침을 따릅니다.
            </p>
          </div>
          <div>
            <h2 className="h-section text-xl">제6조 (이용자의 의무)</h2>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              <li>1. 이용자는 상담 신청 시 본인의 정확한 정보를 입력하여야 하며, 허위 정보로 인한 불이익은 이용자의 책임입니다.</li>
              <li>2. 이용자는 홈페이지의 정상적 운영을 방해하는 행위, 타인의 명예를 훼손하는 행위, 저작권 등 타인의 권리를 침해하는 행위를 하여서는 안 됩니다.</li>
              <li>3. 홈페이지에 게시된 내용(이미지, 문구 등)을 회사의 사전 동의 없이 영리 목적으로 복제·전송·배포할 수 없습니다.</li>
            </ul>
          </div>
          <div>
            <h2 className="h-section text-xl">제7조 (저작권)</h2>
            <p className="mt-4 text-muted-foreground">홈페이지에 게시된 콘텐츠의 저작권은 회사에 귀속됩니다. 이용자는 서비스 이용 목적 범위 안에서만 이를 이용할 수 있습니다.</p>
          </div>
          <div>
            <h2 className="h-section text-xl">제8조 (면책)</h2>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              <li>1. 회사는 천재지변, 시스템 장애 등 불가항력적 사유로 서비스를 제공할 수 없는 경우 이에 대한 책임을 지지 않습니다.</li>
              <li>2. 이용자가 홈페이지에 게시된 정보를 신뢰하여 행한 거래·투자 등 본인의 선택으로 인한 손해에 대하여 회사는 책임을 지지 않습니다.</li>
            </ul>
          </div>
          <div>
            <h2 className="h-section text-xl">제9조 (준거법 및 분쟁 해결)</h2>
            <p className="mt-4 text-muted-foreground">
              본 약관은 대한민국 법령에 따라 해석되며, 홈페이지 이용과 관련하여 회사와 이용자 간에 발생한 분쟁은 원만하게 협의하여 해결함을 원칙으로 하고, 협의가 이루어지지 않는 경우 민사소송법에 따른 관할 법원에 제기합니다.
            </p>
          </div>
        </section>
      </>
    );
  },
});

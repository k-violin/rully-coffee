import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/site/Layout";
import { siteConfig } from "@/lib/site-config";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "개인정보처리방침 | 룰리커피" },
      { name: "description", content: "룰리커피 홈페이지의 개인정보 수집·이용, 보유기간, 이용자 권리 등 개인정보처리방침 안내." },
      { property: "og:title", content: "개인정보처리방침 | 룰리커피" },
      { property: "og:description", content: "룰리커피 홈페이지의 개인정보 수집·이용, 보유기간, 이용자 권리 등 개인정보처리방침 안내." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => {
    const p = siteConfig.privacy;
    const c = siteConfig.company;
    const orDash = (v: string | null) => (v && v.length > 0 ? v : "미등록");
    return (
      <>
        <PageIntro />
        <section className="container-site max-w-3xl space-y-12 py-14 md:py-20 text-[15px] leading-relaxed">
          <div>
            <h2 className="h-section text-xl">1. 개인정보의 처리 목적</h2>
            <p className="mt-4 text-muted-foreground">회사는 다음의 목적을 위해서만 이용자의 개인정보를 처리합니다.</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>· 가맹 상담 신청의 접수, 상담 진행 및 결과 안내</li>
              <li>· 문의 내용에 대한 회신 및 상담 기록의 관리</li>
            </ul>
          </div>
          <div>
            <h2 className="h-section text-xl">2. 수집하는 개인정보 항목 및 수집 방법</h2>
            <dl className="mt-4 border-t">
              <div className="grid grid-cols-[7rem_1fr] border-b py-4"><dt className="text-muted-foreground">수집 항목</dt><dd>{p.fields}</dd></div>
              <div className="grid grid-cols-[7rem_1fr] border-b py-4"><dt className="text-muted-foreground">수집 방법</dt><dd>홈페이지 가맹 상담 신청 양식</dd></div>
            </dl>
            <p className="mt-4 text-muted-foreground">서비스 이용 과정에서 생성되는 접속 로그, 이용 기록 등이 자동으로 수집될 수 있습니다.</p>
          </div>
          <div>
            <h2 className="h-section text-xl">3. 개인정보의 처리 및 보유기간</h2>
            <p className="mt-4 text-muted-foreground">{p.retention}</p>
            <p className="mt-3 text-muted-foreground">관련 법령에 따라 보존할 필요가 있는 경우에는 해당 법령에서 정한 기간 동안 보관합니다.</p>
          </div>
          <div>
            <h2 className="h-section text-xl">4. 개인정보의 제3자 제공</h2>
            <p className="mt-4 text-muted-foreground">회사는 이용자의 동의가 있거나 법령에 근거가 있는 경우를 제외하고는 개인정보를 제3자에게 제공하지 않습니다.</p>
          </div>
          <div>
            <h2 className="h-section text-xl">5. 개인정보 처리업무의 위탁</h2>
            <p className="mt-4 text-muted-foreground">회사는 개인정보 처리업무를 외부에 위탁하지 않습니다. 위탁이 필요하게 되는 경우 위탁 내용과 수탁자를 홈페이지를 통해 사전에 고지하겠습니다.</p>
          </div>
          <div>
            <h2 className="h-section text-xl">6. 이용자의 권리와 행사 방법</h2>
            <p className="mt-4 text-muted-foreground">
              이용자는 언제든지 자신의 개인정보에 대해 열람, 정정·삭제, 처리정지를 요구할 수 있습니다. 다만 요청 시 본인 확인이 필요할 수 있습니다.
              권리 행사는 아래의 개인정보 보호책임자에게 서면, 전화, 이메일 중 편한 방법으로 요청하시면 지체 없이 처리하겠습니다.
            </p>
          </div>
          <div>
            <h2 className="h-section text-xl">7. 개인정보의 파기 절차 및 방법</h2>
            <p className="mt-4 text-muted-foreground">
              보유기간 경과, 처리 목적 달성 등 개인정보가 불필요하게 된 경우 지체 없이 파기합니다. 전자적 파일 형태의 정보는 복구할 수 없는 기술적 방법으로 삭제하고, 종이 문서는 분쇄 또는 소각합니다.
            </p>
          </div>
          <div>
            <h2 className="h-section text-xl">8. 개인정보의 안전성 확보 조치</h2>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              <li>· 개인정보의 암호화 및 안전한 전송 환경 유지</li>
              <li>· 개인정보 접근 권한의 최소화와 접근 통제</li>
              <li>· 개인정보를 취급하는 직원에 대한 교육 및 관리</li>
            </ul>
          </div>
          <div>
            <h2 className="h-section text-xl">9. 개인정보 보호책임자</h2>
            <dl className="mt-4 border-t">
              <div className="grid grid-cols-[7rem_1fr] border-b py-4"><dt className="text-muted-foreground">상호</dt><dd>{c.name}</dd></div>
              <div className="grid grid-cols-[7rem_1fr] border-b py-4"><dt className="text-muted-foreground">대표자</dt><dd>{orDash(c.ceo)}</dd></div>
              <div className="grid grid-cols-[7rem_1fr] border-b py-4"><dt className="text-muted-foreground">전화</dt><dd>{orDash(c.phone)}</dd></div>
              <div className="grid grid-cols-[7rem_1fr] border-b py-4"><dt className="text-muted-foreground">이메일</dt><dd>{orDash(c.email)}</dd></div>
            </dl>
            <p className="mt-4 text-muted-foreground">
              개인정보 보호책임자는 개인정보 처리와 관련한 이용자의 불만 처리 및 피해 구제 등을 담당합니다. 대표자 및 연락처는 등록되는 대로 표시됩니다.
            </p>
          </div>
          <div>
            <h2 className="h-section text-xl">10. 개인정보처리방침의 변경</h2>
            <p className="mt-4 text-muted-foreground">
              본 방침을 변경하는 경우 홈페이지를 통해 공지하며, 변경된 방침은 공지한 날부터 적용됩니다.
              {p.effectiveDate ? ` (시행일: ${p.effectiveDate})` : ""}
            </p>
          </div>
        </section>
      </>
    );
  },
});

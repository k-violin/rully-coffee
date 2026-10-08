import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listAdminInquiries, updateAdminInquiry, type FranchiseInquiry, type InquiryStatus } from "@/lib/inquiry-admin";

type Filter = "all" | InquiryStatus;
type Notice = { ok: boolean; text: string };

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "대기", label: "대기" },
  { id: "접수완료", label: "접수완료" },
];

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function InquiryManager() {
  const [inquiries, setInquiries] = useState<FranchiseInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [selected, setSelected] = useState<FranchiseInquiry | null>(null);

  useEffect(() => {
    listAdminInquiries()
      .then((result) => {
        if (!result.ok) {
          setNotice({ ok: false, text: result.error });
          return;
        }
        setInquiries(result.inquiries);
      })
      .catch(() => setNotice({ ok: false, text: "신청 목록을 불러오지 못했습니다." }))
      .finally(() => setLoading(false));
  }, []);

  const keyword = query.trim();
  const shown = inquiries.filter((item) => {
    if (filter !== "all" && item.status !== filter) return false;
    if (!keyword) return true;
    return item.name.includes(keyword) || item.phone.includes(keyword) || item.email.includes(keyword);
  });

  if (selected) {
    return (
      <InquiryDetail
        inquiry={selected}
        onCancel={() => setSelected(null)}
        onSaved={(inquiry) => {
          setInquiries((current) => current.map((item) => (item.id === inquiry.id ? inquiry : item)));
          setSelected(null);
          setNotice({ ok: true, text: "상담 상태를 저장했습니다." });
        }}
      />
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold">가맹상담신청 관리</h2>
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2" role="group" aria-label="상태 필터">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
              className={`border px-3 py-2 text-sm font-semibold ${filter === item.id ? "border-primary bg-primary text-white" : "bg-white hover:border-primary"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <Input
          aria-label="신청 검색"
          placeholder="이름, 연락처, 이메일 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 bg-white md:max-w-xs"
        />
      </div>
      {notice && (
        <p className={`mt-4 text-sm ${notice.ok ? "text-primary" : "text-destructive"}`} role="status">
          {notice.text}
        </p>
      )}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" aria-label="신청 목록 불러오는 중" />
        </div>
      ) : shown.length === 0 ? (
        <div className="mt-8 border border-dashed px-4 py-14 text-center text-sm text-muted-foreground">
          {inquiries.length === 0 ? "등록된 신청이 없습니다." : "조건에 맞는 신청이 없습니다."}
        </div>
      ) : (
        <ul className="mt-6 divide-y border">
          {shown.map((item) => (
            <li key={item.id} className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="min-w-0">
                <p className="truncate font-bold">{item.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.phone} · {item.email}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatWhen(item.created_at)} · {item.desired_region || "지역 미입력"} · {item.status}
                </p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => { setNotice(null); setSelected(item); }}>
                확인
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function InquiryDetail({
  inquiry,
  onCancel,
  onSaved,
}: {
  inquiry: FranchiseInquiry;
  onCancel: () => void;
  onSaved: (inquiry: FranchiseInquiry) => void;
}) {
  const [status, setStatus] = useState<InquiryStatus>(inquiry.status);
  const [memo, setMemo] = useState(inquiry.admin_memo ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await updateAdminInquiry({ data: { id: inquiry.id, status, memo } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSaved(result.inquiry);
    } catch {
      setError("상담 상태를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <h2 className="text-xl font-bold">상담 신청</h2>
      <dl className="mt-6 space-y-3 text-sm">
        <div><dt className="text-muted-foreground">이름</dt><dd className="mt-1 font-semibold">{inquiry.name}</dd></div>
        <div><dt className="text-muted-foreground">이메일</dt><dd className="mt-1">{inquiry.email}</dd></div>
        <div><dt className="text-muted-foreground">연락처</dt><dd className="mt-1">{inquiry.phone}</dd></div>
        <div><dt className="text-muted-foreground">희망지역</dt><dd className="mt-1">{inquiry.desired_region || "—"}</dd></div>
        <div><dt className="text-muted-foreground">상담 유형</dt><dd className="mt-1">{inquiry.inquiry_type}</dd></div>
        <div><dt className="text-muted-foreground">신청일</dt><dd className="mt-1">{formatWhen(inquiry.created_at)}</dd></div>
        <div>
          <dt className="text-muted-foreground">문의내용</dt>
          <dd className="mt-1 whitespace-pre-line">{inquiry.message || "—"}</dd>
        </div>
      </dl>
      <div className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="inquiry-status">상담 상태</Label>
          <select
            id="inquiry-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as InquiryStatus)}
            className="h-11 w-full rounded-md border border-input bg-white px-3 text-sm"
          >
            <option value="대기">대기</option>
            <option value="접수완료">접수완료</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="inquiry-memo">메모</Label>
          <Textarea id="inquiry-memo" value={memo} onChange={(e) => setMemo(e.target.value)} className="min-h-32 bg-white" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={busy}>
            {busy && <Loader2 className="animate-spin" aria-hidden />}
            저장
          </Button>
          <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>
            취소
          </Button>
        </div>
      </div>
    </form>
  );
}

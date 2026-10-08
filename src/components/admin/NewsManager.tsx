import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteAdminNews, isWebLink, listAdminNews, previewNewsLink, saveAdminNews, setAdminNewsFlags } from "@/lib/news-admin";
import { formatNewsDate, type PublicNews } from "@/lib/public-news";

type Filter = "all" | "visible" | "hidden";
type Notice = { ok: boolean; text: string };
type Draft = {
  id: string | null;
  title: string;
  sourceName: string;
  linkUrl: string;
  writtenAt: string;
  isPinned: boolean;
  isVisible: boolean;
  imageUrl: string | null;
  file: { dataUrl: string; type: string } | null;
};

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "visible", label: "노출" },
  { id: "hidden", label: "숨김" },
];

const imageTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

function seoulToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "numeric" }).format(new Date());
}

function emptyDraft(): Draft {
  return {
    id: null,
    title: "",
    sourceName: "",
    linkUrl: "",
    writtenAt: seoulToday(),
    isPinned: false,
    isVisible: false,
    imageUrl: null,
    file: null,
  };
}

function draftFrom(item: PublicNews): Draft {
  return {
    id: item.id,
    title: item.title,
    sourceName: item.source_name,
    linkUrl: item.link_url,
    writtenAt: item.written_at.slice(0, 10),
    isPinned: item.is_pinned,
    isVisible: item.is_visible,
    imageUrl: item.image_url,
    file: null,
  };
}

function fileType(file: File) {
  const type = file.type.toLowerCase();
  if (imageTypes.has(type)) return type === "image/jpg" ? "image/jpeg" : type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return null;
}

function byNewsOrder(a: PublicNews, b: PublicNews) {
  if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
  if (a.written_at !== b.written_at) return b.written_at.localeCompare(a.written_at);
  if (a.created_at !== b.created_at) return b.created_at.localeCompare(a.created_at);
  return a.id.localeCompare(b.id);
}

export function NewsManager() {
  const [news, setNews] = useState<PublicNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    listAdminNews()
      .then((result) => {
        if (!result.ok) {
          setNotice({ ok: false, text: result.error });
          return;
        }
        setNews(result.news);
      })
      .catch(() => setNotice({ ok: false, text: "소식 목록을 불러오지 못했습니다." }))
      .finally(() => setLoading(false));
  }, []);

  const keyword = query.trim();
  const shown = news.filter((item) => {
    if (filter === "visible" && !item.is_visible) return false;
    if (filter === "hidden" && item.is_visible) return false;
    if (!keyword) return true;
    return item.title.includes(keyword) || item.source_name.includes(keyword);
  });

  async function toggle(item: PublicNews, patch: { isPinned?: boolean; isVisible?: boolean }) {
    if (busyId) return;
    setBusyId(item.id);
    setNotice(null);
    try {
      const result = await setAdminNewsFlags({
        data: { id: item.id, isPinned: patch.isPinned ?? item.is_pinned, isVisible: patch.isVisible ?? item.is_visible },
      });
      if (!result.ok) {
        setNotice({ ok: false, text: result.error });
        return;
      }
      setNews((current) => current.map((row) => (row.id === result.news.id ? result.news : row)).sort(byNewsOrder));
      setNotice({ ok: true, text: patch.isPinned !== undefined ? "상단 고정 상태를 바꿨습니다." : "노출 상태를 바꿨습니다." });
    } catch {
      setNotice({ ok: false, text: "상태를 바꾸지 못했습니다. 잠시 후 다시 시도해 주세요." });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(item: PublicNews) {
    if (busyId) return;
    if (!window.confirm(`「${item.title}」 소식을 삭제할까요? 삭제하면 되돌릴 수 없습니다.`)) return;
    setBusyId(item.id);
    setNotice(null);
    try {
      const result = await deleteAdminNews({ data: { id: item.id } });
      if (!result.ok) {
        setNotice({ ok: false, text: result.error });
        return;
      }
      setNews((current) => current.filter((row) => row.id !== item.id));
      setNotice({ ok: true, text: "소식을 삭제했습니다." });
    } catch {
      setNotice({ ok: false, text: "소식을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요." });
    } finally {
      setBusyId(null);
    }
  }

  if (draft) {
    return (
      <NewsForm
        draft={draft}
        onCancel={() => setDraft(null)}
        onSaved={(item, created) => {
          setNews((current) => [...current.filter((row) => row.id !== item.id), item].sort(byNewsOrder));
          setDraft(null);
          setNotice({ ok: true, text: created ? "소식을 등록했습니다." : "소식을 수정했습니다." });
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold">새로운소식 관리</h2>
        <Button type="button" onClick={() => { setNotice(null); setDraft(emptyDraft()); }}>소식 등록</Button>
      </div>
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2" role="group" aria-label="노출 필터">
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
        <Input aria-label="소식 검색" placeholder="제목, 출처 검색" value={query} onChange={(e) => setQuery(e.target.value)} className="h-11 bg-white md:max-w-xs" />
      </div>
      {notice && <p className={`mt-4 text-sm ${notice.ok ? "text-primary" : "text-destructive"}`} role="status">{notice.text}</p>}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" aria-label="소식 목록 불러오는 중" /></div>
      ) : shown.length === 0 ? (
        <div className="mt-8 border border-dashed px-4 py-14 text-center text-sm text-muted-foreground">
          {news.length === 0 ? "등록된 소식이 없습니다." : "조건에 맞는 소식이 없습니다."}
        </div>
      ) : (
        <ul className="mt-6 divide-y border">
          {shown.map((item) => (
            <li key={item.id} className="grid gap-4 p-4 md:grid-cols-[5.5rem_minmax(0,1fr)_auto] md:items-center">
              <img src={item.image_url} alt="" className="aspect-[4/3] w-full object-cover md:w-[5.5rem]" />
              <div className="min-w-0">
                <p className="truncate font-bold">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.source_name} · {formatNewsDate(item.written_at)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant={item.is_pinned ? "default" : "outline"} disabled={busyId === item.id} aria-pressed={item.is_pinned} onClick={() => toggle(item, { isPinned: !item.is_pinned })}>
                  {item.is_pinned ? "고정됨" : "고정"}
                </Button>
                <Button type="button" size="sm" variant={item.is_visible ? "default" : "outline"} disabled={busyId === item.id} aria-pressed={item.is_visible} onClick={() => toggle(item, { isVisible: !item.is_visible })}>
                  {item.is_visible ? "노출" : "숨김"}
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={busyId === item.id} onClick={() => { setNotice(null); setDraft(draftFrom(item)); }}>수정</Button>
                <Button type="button" size="sm" variant="destructive" disabled={busyId === item.id} onClick={() => remove(item)}>삭제</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NewsForm({ draft, onCancel, onSaved }: { draft: Draft; onCancel: () => void; onSaved: (item: PublicNews, created: boolean) => void }) {
  const [form, setForm] = useState(draft);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [pulling, setPulling] = useState(false);
  const saving = useRef(false);
  const pullSeq = useRef(0);
  const skipBlur = useRef(false);
  const preview = form.file?.dataUrl ?? form.imageUrl;

  async function pullFromLink(source: Draft): Promise<Draft | null> {
    const link = source.linkUrl.trim();
    if (!isWebLink(link)) {
      setNote("");
      setError("http 또는 https로 시작하는 웹 주소를 입력해 주세요.");
      return null;
    }
    const seq = ++pullSeq.current;
    setPulling(true);
    setError("");
    setNote("");
    try {
      const result = await previewNewsLink({ data: { linkUrl: link } });
      if (seq !== pullSeq.current) return null;
      if (!result.ok) {
        setError(result.error);
        return null;
      }
      const file = result.imageDataUrl && result.imageType ? { dataUrl: result.imageDataUrl, type: result.imageType } : null;
      const next: Draft = {
        ...source,
        linkUrl: link,
        title: result.title,
        sourceName: result.sourceName ?? source.sourceName,
        writtenAt: result.writtenAt ?? source.writtenAt,
        file: file ?? source.file,
      };
      setForm((current) => current.linkUrl.trim() === link ? {
        ...current,
        title: result.title,
        sourceName: result.sourceName ?? current.sourceName,
        writtenAt: result.writtenAt ?? current.writtenAt,
        file: file ?? current.file,
      } : current);
      setNote(file
        ? "기사에서 제목과 사진을 가져왔습니다. 출처와 작성일을 확인한 뒤 저장해 주세요."
        : "제목은 가져왔습니다. 이 기사에서는 사진을 받지 못했습니다. 대표 이미지를 직접 올려 주세요.");
      return next;
    } catch {
      if (seq === pullSeq.current) setError("링크에서 제목과 사진을 가져오지 못했습니다. 직접 입력해 주세요.");
      return null;
    } finally {
      if (seq === pullSeq.current) setPulling(false);
    }
  }

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function chooseImage(file: File | undefined) {
    if (!file) return;
    const type = fileType(file);
    if (!type) {
      setError("이미지는 JPG, PNG, WEBP 파일만 올릴 수 있습니다.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("이미지는 5MB 이하만 올릴 수 있습니다.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setError("");
      update("file", { dataUrl: String(reader.result), type });
    };
    reader.onerror = () => setError("이미지를 읽지 못했습니다.");
    reader.readAsDataURL(file);
  }

  function checkLink() {
    if (!isWebLink(form.linkUrl)) {
      setError("http 또는 https로 시작하는 웹 주소를 입력해 주세요.");
      return;
    }
    setError("");
    window.open(form.linkUrl.trim(), "_blank", "noopener,noreferrer");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError("");
    try {
      let current = form;
      if (isWebLink(form.linkUrl) && (!form.title.trim() || (!form.file && !form.imageUrl))) {
        const pulled = await pullFromLink(form);
        if (!pulled) return;
        current = pulled;
      }
      if (!current.title.trim()) {
        setError("제목을 입력해 주세요.");
        return;
      }
      if (!current.sourceName.trim()) {
        setError("출처를 입력해 주세요.");
        return;
      }
      if (!isWebLink(current.linkUrl)) {
        setError("http 또는 https로 시작하는 웹 주소를 입력해 주세요.");
        return;
      }
      if (!current.writtenAt) {
        setError("작성일을 선택해 주세요.");
        return;
      }
      if (!current.file && !current.imageUrl) {
        setError("대표 이미지를 선택해 주세요.");
        return;
      }
      const result = await saveAdminNews({
        data: {
          id: current.id,
          title: current.title,
          sourceName: current.sourceName,
          linkUrl: current.linkUrl,
          writtenAt: current.writtenAt,
          isPinned: current.isPinned,
          isVisible: current.isVisible,
          imageUrl: current.imageUrl,
          imageBase64: current.file?.dataUrl ?? null,
          imageType: current.file?.type ?? null,
        },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSaved(result.news, current.id === null);
    } catch {
      setError("소식을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <h2 className="text-xl font-bold">{form.id ? "소식 수정" : "소식 등록"}</h2>
      <div className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="news-link">링크</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="news-link"
              type="url"
              value={form.linkUrl}
              onChange={(e) => update("linkUrl", e.target.value)}
              onBlur={() => {
                if (skipBlur.current) {
                  skipBlur.current = false;
                  return;
                }
                if (!form.title.trim() && isWebLink(form.linkUrl)) void pullFromLink(form);
              }}
              placeholder="https://"
              className="h-11 bg-white sm:flex-1"
              required
            />
            <div className="flex gap-2">
              <Button type="button" variant="outline" disabled={busy || pulling} onMouseDown={() => { skipBlur.current = true; }} onClick={() => void pullFromLink(form)}>
                {pulling && <Loader2 className="animate-spin" aria-hidden />}
                제목·사진 가져오기
              </Button>
              <Button type="button" variant="outline" onClick={checkLink}>링크 확인</Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">뉴스 주소를 입력하면 기사 제목과 사진을 가져옵니다. 가져온 뒤에 고쳐도 됩니다.</p>
          {note && <p className="text-sm text-primary" role="status">{note}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="news-title">제목</Label>
          <Input id="news-title" value={form.title} onChange={(e) => update("title", e.target.value)} className="h-11 bg-white" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="news-source">출처</Label>
          <Input id="news-source" value={form.sourceName} onChange={(e) => update("sourceName", e.target.value)} placeholder="언론사, 기관, 공식 채널" className="h-11 bg-white" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="news-image">대표 이미지</Label>
          <Input id="news-image" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={(e) => chooseImage(e.target.files?.[0])} className="h-11 bg-white" />
          {preview && <img src={preview} alt="대표 이미지 미리보기" className="mt-3 aspect-[16/10] w-full max-w-sm object-cover" />}
        </div>
        <div className="space-y-2">
          <Label htmlFor="news-written">작성일</Label>
          <Input id="news-written" type="date" value={form.writtenAt} onChange={(e) => update("writtenAt", e.target.value)} className="h-11 bg-white" required />
        </div>
        <div className="flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isPinned} onChange={(e) => update("isPinned", e.target.checked)} className="size-4 accent-primary" />
            상단 고정
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isVisible} onChange={(e) => update("isVisible", e.target.checked)} className="size-4 accent-primary" />
            홈페이지 노출
          </label>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={busy}>{busy && <Loader2 className="animate-spin" aria-hidden />}저장</Button>
          <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>취소</Button>
        </div>
      </div>
    </form>
  );
}

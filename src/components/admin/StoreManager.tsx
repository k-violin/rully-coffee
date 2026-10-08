import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteAdminStore, listAdminStores, saveAdminStore, setAdminStoreFlags } from "@/lib/store-admin";
import { storePhotos, type StoreRecord } from "@/lib/public-stores";

type Filter = "all" | "visible" | "hidden";
type Notice = { ok: boolean; text: string };
type DraftImage = {
  key: string;
  url: string | null;
  file: { dataUrl: string; type: string } | null;
};

type Draft = {
  id: string | null;
  title: string;
  content: string;
  writtenAt: string;
  authorName: string;
  isPinned: boolean;
  isVisible: boolean;
  images: DraftImage[];
};

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "visible", label: "노출" },
  { id: "hidden", label: "숨김" },
];

const imageTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

function emptyDraft(): Draft {
  return {
    id: null,
    title: "",
    content: "",
    writtenAt: "",
    authorName: "",
    isPinned: false,
    isVisible: false,
    images: [],
  };
}

function draftFrom(store: StoreRecord): Draft {
  return {
    id: store.id,
    title: store.title,
    content: store.content,
    writtenAt: toDatetimeLocal(store.written_at),
    authorName: store.author_name ?? "",
    isPinned: store.is_pinned,
    isVisible: store.is_visible,
    images: storePhotos(store).map((url) => ({ key: crypto.randomUUID(), url, file: null })),
  };
}

function toDatetimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatWritten(value: string | null) {
  if (!value) return "—";
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

function fileType(file: File) {
  const type = file.type.toLowerCase();
  if (imageTypes.has(type)) return type === "image/jpg" ? "image/jpeg" : type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return null;
}

export function StoreManager() {
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function reload() {
    const result = await listAdminStores();
    if (!result.ok) {
      setNotice({ ok: false, text: result.error });
      return;
    }
    setStores(result.stores);
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  const shown = stores.filter((store) => {
    if (filter === "visible" && !store.is_visible) return false;
    if (filter === "hidden" && store.is_visible) return false;
    const keyword = query.trim();
    return !keyword || store.title.includes(keyword);
  });

  async function toggle(store: StoreRecord, patch: { isPinned?: boolean; isVisible?: boolean }) {
    if (busyId) return;
    setBusyId(store.id);
    setNotice(null);
    const isPinned = patch.isPinned ?? store.is_pinned;
    const isVisible = patch.isVisible ?? store.is_visible;
    try {
      const result = await setAdminStoreFlags({ data: { id: store.id, isPinned, isVisible } });
      if (!result.ok) {
        setNotice({ ok: false, text: result.error });
        return;
      }
      setStores((current) => current.map((item) => (item.id === result.store.id ? result.store : item)));
      setNotice({
        ok: true,
        text: patch.isPinned !== undefined ? "상단 고정 상태를 바꿨습니다." : "노출 상태를 바꿨습니다.",
      });
    } catch {
      setNotice({ ok: false, text: "상태를 바꾸지 못했습니다. 잠시 후 다시 시도해 주세요." });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(store: StoreRecord) {
    if (busyId) return;
    if (!window.confirm(`「${store.title}」 매장을 삭제할까요? 삭제하면 되돌릴 수 없습니다.`)) return;
    setBusyId(store.id);
    setNotice(null);
    try {
      const result = await deleteAdminStore({ data: { id: store.id } });
      if (!result.ok) {
        setNotice({ ok: false, text: result.error });
        return;
      }
      setStores((current) => current.filter((item) => item.id !== store.id));
      setNotice({ ok: true, text: "매장을 삭제했습니다." });
    } catch {
      setNotice({ ok: false, text: "매장을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요." });
    } finally {
      setBusyId(null);
    }
  }

  if (draft) {
    return (
      <StoreForm
        draft={draft}
        onCancel={() => setDraft(null)}
        onSaved={(store, created) => {
          setStores((current) => {
            const next = current.filter((item) => item.id !== store.id);
            return [...next, store].sort(byStoreOrder);
          });
          setDraft(null);
          setNotice({ ok: true, text: created ? "매장을 등록했습니다." : "매장을 수정했습니다." });
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold">매장안내 관리</h2>
        <Button type="button" onClick={() => { setNotice(null); setDraft(emptyDraft()); }}>
          매장 등록
        </Button>
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
        <Input
          aria-label="매장명 검색"
          placeholder="매장명 검색"
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
          <Loader2 className="animate-spin text-primary" aria-label="매장 목록 불러오는 중" />
        </div>
      ) : shown.length === 0 ? (
        <div className="mt-8 border border-dashed px-4 py-14 text-center text-sm text-muted-foreground">
          {stores.length === 0 ? "등록된 매장이 없습니다." : "조건에 맞는 매장이 없습니다."}
        </div>
      ) : (
        <ul className="mt-6 divide-y border">
          {shown.map((store) => (
            <li key={store.id} className="grid gap-4 p-4 md:grid-cols-[5.5rem_minmax(0,1fr)_auto] md:items-center">
              <img src={store.image_url} alt="" className="aspect-[4/3] w-full object-cover md:w-[5.5rem]" />
              <div className="min-w-0">
                <p className="truncate font-bold">{store.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatWritten(store.written_at)} · {store.author_name?.trim() || "—"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={store.is_pinned ? "default" : "outline"}
                  disabled={busyId === store.id}
                  aria-pressed={store.is_pinned}
                  onClick={() => toggle(store, { isPinned: !store.is_pinned })}
                >
                  {store.is_pinned ? "고정됨" : "고정"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={store.is_visible ? "default" : "outline"}
                  disabled={busyId === store.id}
                  aria-pressed={store.is_visible}
                  onClick={() => toggle(store, { isVisible: !store.is_visible })}
                >
                  {store.is_visible ? "노출" : "숨김"}
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={busyId === store.id} onClick={() => { setNotice(null); setDraft(draftFrom(store)); }}>
                  수정
                </Button>
                <Button type="button" size="sm" variant="destructive" disabled={busyId === store.id} onClick={() => remove(store)}>
                  삭제
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function byStoreOrder(a: StoreRecord, b: StoreRecord) {
  if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
  const writtenA = a.written_at ? new Date(a.written_at).getTime() : Number.NEGATIVE_INFINITY;
  const writtenB = b.written_at ? new Date(b.written_at).getTime() : Number.NEGATIVE_INFINITY;
  if (writtenA !== writtenB) return writtenB - writtenA;
  return b.created_at.localeCompare(a.created_at);
}

function StoreForm({
  draft,
  onCancel,
  onSaved,
}: {
  draft: Draft;
  onCancel: () => void;
  onSaved: (store: StoreRecord, created: boolean) => void;
}) {
  const [form, setForm] = useState(draft);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function readImage(file: File) {
    return new Promise<DraftImage>((resolve, reject) => {
      const type = fileType(file);
      if (!type) {
        reject(new Error("이미지는 JPG, PNG, WEBP 파일만 올릴 수 있습니다."));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error("이미지는 5MB 이하만 올릴 수 있습니다."));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve({ key: crypto.randomUUID(), url: null, file: { dataUrl: String(reader.result), type } });
      reader.onerror = () => reject(new Error("이미지를 읽지 못했습니다."));
      reader.readAsDataURL(file);
    });
  }

  async function chooseImages(list: FileList | null, input: HTMLInputElement) {
    const files = Array.from(list ?? []);
    input.value = "";
    if (files.length === 0) return;
    try {
      const next = await Promise.all(files.map(readImage));
      setForm((current) => {
        if (current.images.length + next.length > 12) {
          setError("사진은 12장까지 올릴 수 있습니다.");
          return current;
        }
        setError("");
        return { ...current, images: [...current.images, ...next] };
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "이미지를 읽지 못했습니다.");
    }
  }

  function removeImage(key: string) {
    setForm((current) => ({ ...current, images: current.images.filter((image) => image.key !== key) }));
  }

  function moveImage(key: string, direction: -1 | 1) {
    setForm((current) => {
      const index = current.images.findIndex((image) => image.key === key);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.images.length) return current;
      const images = [...current.images];
      const [item] = images.splice(index, 1);
      if (!item) return current;
      images.splice(target, 0, item);
      return { ...current, images };
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving.current) return;
    if (!form.title.trim()) {
      setError("매장명을 입력해 주세요.");
      return;
    }
    if (!form.content.trim()) {
      setError("매장 소개를 입력해 주세요.");
      return;
    }
    if (form.images.length === 0) {
      setError("사진을 한 장 이상 선택해 주세요.");
      return;
    }
    saving.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await saveAdminStore({
        data: {
          id: form.id,
          title: form.title,
          content: form.content,
          writtenAt: form.writtenAt || null,
          authorName: form.authorName,
          isPinned: form.isPinned,
          isVisible: form.isVisible,
          images: form.images.map((image) => ({
            url: image.url,
            dataUrl: image.file?.dataUrl ?? null,
            type: image.file?.type ?? null,
          })),
        },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSaved(result.store, form.id === null);
    } catch {
      setError("매장을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <h2 className="text-xl font-bold">{form.id ? "매장 수정" : "매장 등록"}</h2>
      <div className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="store-title">매장명</Label>
          <Input id="store-title" value={form.title} onChange={(e) => update("title", e.target.value)} className="h-11 bg-white" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="store-content">매장 소개</Label>
          <Textarea id="store-content" value={form.content} onChange={(e) => update("content", e.target.value)} className="min-h-40 bg-white" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="store-image">사진</Label>
          <p className="text-sm text-muted-foreground">여러 장을 선택할 수 있습니다. 첫 번째 사진이 목록에 표시됩니다.</p>
          <Input
            id="store-image"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            onChange={(e) => chooseImages(e.target.files, e.currentTarget)}
            className="h-11 bg-white"
          />
          {form.images.length > 0 && (
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {form.images.map((image, index) => {
                const src = image.file?.dataUrl ?? image.url;
                return (
                  <li key={image.key} className="space-y-2">
                    {src && <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />}
                    <div className="flex flex-wrap gap-1">
                      <Button type="button" size="sm" variant="outline" disabled={busy || index === 0} onClick={() => moveImage(image.key, -1)}>앞으로</Button>
                      <Button type="button" size="sm" variant="outline" disabled={busy || index === form.images.length - 1} onClick={() => moveImage(image.key, 1)}>뒤로</Button>
                      <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => removeImage(image.key)}>삭제</Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="store-written">작성일</Label>
            <Input id="store-written" type="datetime-local" value={form.writtenAt} onChange={(e) => update("writtenAt", e.target.value)} className="h-11 bg-white" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="store-author">작성자</Label>
            <Input id="store-author" value={form.authorName} onChange={(e) => update("authorName", e.target.value)} className="h-11 bg-white" />
          </div>
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

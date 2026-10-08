import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InquiryManager } from "@/components/admin/InquiryManager";
import { NewsManager } from "@/components/admin/NewsManager";
import { StoreManager } from "@/components/admin/StoreManager";
import { adminLogin, adminLogout, getAdminSession } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "관리자 | 룰리커피" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const sections = [
  {
    id: "consult",
    label: "가맹상담신청 관리",
  },
  {
    id: "stores",
    label: "매장안내 관리",
  },
  {
    id: "news",
    label: "새로운소식 관리",
  },
] as const;

type SectionId = (typeof sections)[number]["id"];

function AdminPage() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    getAdminSession()
      .then((session) => setAuthed(session.ok))
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <section className="container-site flex min-h-[70vh] items-center justify-center py-16">
        <Loader2 className="animate-spin text-primary" aria-label="확인 중" />
      </section>
    );
  }

  if (!authed) return <LoginForm onSuccess={() => setAuthed(true)} />;
  return <Dashboard onLogout={() => setAuthed(false)} />;
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!id.trim() || !password) {
      setError("아이디와 비밀번호를 입력해 주세요.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await adminLogin({ data: { id, password } });
      if (!result.ok) {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
        return;
      }
    } catch {
      setError("로그인 확인 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    } finally {
      setBusy(false);
    }
    setPassword("");
    onSuccess();
  }

  return (
    <section className="container-site flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm border bg-white px-8 py-10">
        <h1 className="text-center text-2xl font-bold">관리자</h1>
        <form className="mt-8 space-y-5" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="admin-id">아이디</Label>
            <Input
              id="admin-id"
              name="username"
              autoComplete="username"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="h-11 bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">비밀번호</Label>
            <Input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 bg-white"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="animate-spin" aria-hidden />}
            로그인
          </Button>
        </form>
      </div>
    </section>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [section, setSection] = useState<SectionId>("consult");
  const [busy, setBusy] = useState(false);

  async function logout() {
    if (busy) return;
    setBusy(true);
    await adminLogout();
    setBusy(false);
    onLogout();
  }

  return (
    <section className="container-site py-12 md:py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="h-section mt-2">관리자</h1>
        </div>
        <Button type="button" variant="outline" onClick={logout} disabled={busy}>
          로그아웃
        </Button>
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[16rem_1fr]">
        <nav aria-label="관리 메뉴">
          <ul className="flex gap-2 lg:flex-col">
            {sections.map((item) => (
              <li key={item.id} className="flex-1 lg:flex-none">
                <button
                  type="button"
                  aria-current={section === item.id ? "page" : undefined}
                  onClick={() => setSection(item.id)}
                  className={`w-full border px-4 py-3 text-left text-sm font-semibold ${section === item.id ? "border-primary bg-primary text-white" : "bg-white hover:border-primary"}`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border bg-white px-6 py-8 md:px-10">
          {section === "consult" ? (
            <InquiryManager />
          ) : section === "stores" ? (
            <StoreManager />
          ) : (
            <NewsManager />
          )}
        </div>
      </div>
    </section>
  );
}

import { createContext, useContext, useState, type ReactNode } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { siteConfig } from "@/lib/site-config";

const Ctx = createContext<{ open: () => void }>({ open: () => {} });
export const useConsult = () => useContext(Ctx);

const schema = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요.").max(50, "이름은 50자 이내로 입력해 주세요."),
  email: z.string().trim().min(1, "이메일을 입력해 주세요.").email("이메일을 올바르게 입력해 주세요.").max(200, "이메일은 200자 이내로 입력해 주세요."),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9-+\s]{8,20}$/, "연락처를 올바르게 입력해 주세요. (예: 010-1234-5678)"),
  region: z.string().trim().min(1, "창업희망지역을 입력해 주세요.").max(100, "100자 이내로 입력해 주세요."),
  message: z.string().trim().max(2000, "문의사항은 2,000자 이내로 입력해 주세요."),
  consent: z.literal(true, { errorMap: () => ({ message: "개인정보 수집·이용에 동의해 주세요." }) }),
});

type Errors = Partial<Record<keyof z.infer<typeof schema> | "form", string>>;

export function ConsultProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [values, setValues] = useState({ name: "", email: "", phone: "", region: "", message: "", consent: false });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof values, v: string | boolean) => setValues((s) => ({ ...s, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const errs: Errors = {};
      for (const i of parsed.error.issues) errs[i.path[0] as keyof Errors] ??= i.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.rpc("submit_franchise_inquiry", {
      inquiry_name: parsed.data.name,
      inquiry_email: parsed.data.email,
      inquiry_phone: parsed.data.phone,
      inquiry_region: parsed.data.region,
      inquiry_message: parsed.data.message,
    });
    setBusy(false);
    if (error) {
      setErrors({ form: "접수 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요." });
      return;
    }
    setDone(true);
    setValues({ name: "", email: "", phone: "", region: "", message: "", consent: false });
  }

  function onOpenChange(o: boolean) {
    setOpen(o);
    if (!o) {
      setDone(false);
      setErrors({});
    }
  }

  const p = siteConfig.privacy;

  return (
    <Ctx.Provider value={{ open: () => setOpen(true) }}>
      {children}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] overflow-y-auto bg-background sm:max-w-lg">
          {done ? (
            <div className="py-8 text-center">
              <DialogTitle className="text-xl font-bold">접수가 완료되었습니다</DialogTitle>
              <DialogDescription className="mt-3 text-muted-foreground">
                남겨주신 연락처로 담당자가 연락드리겠습니다.
              </DialogDescription>
              <Button className="mt-8" onClick={() => onOpenChange(false)}>
                닫기
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <p className="eyebrow">Franchise</p>
                <DialogTitle className="text-xl font-bold">가맹상담 신청</DialogTitle>
                <DialogDescription>정보를 남겨주시면 담당자가 연락드립니다.</DialogDescription>
              </DialogHeader>
              <form onSubmit={submit} noValidate className="mt-2 space-y-4">
                <Field id="c-name" label="이름" required error={errors.name}>
                  <Input id="c-name" value={values.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" aria-invalid={!!errors.name} />
                </Field>
                <Field id="c-email" label="이메일" required error={errors.email}>
                  <Input id="c-email" type="email" value={values.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" aria-invalid={!!errors.email} />
                </Field>
                <Field id="c-phone" label="연락처" required error={errors.phone}>
                  <Input id="c-phone" type="tel" inputMode="tel" placeholder="010-0000-0000" value={values.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" aria-invalid={!!errors.phone} />
                </Field>
                <Field id="c-region" label="창업희망지역" required error={errors.region}>
                  <Input id="c-region" placeholder="예: 대구 수성구" value={values.region} onChange={(e) => set("region", e.target.value)} aria-invalid={!!errors.region} />
                </Field>
                <Field id="c-msg" label="기타 문의사항" error={errors.message}>
                  <Textarea id="c-msg" rows={4} value={values.message} onChange={(e) => set("message", e.target.value)} />
                </Field>
                <div className="rounded-sm border bg-card p-4 text-sm leading-relaxed text-muted-foreground">
                  <p className="font-semibold text-foreground">개인정보 수집·이용 안내</p>
                  <dl className="mt-2 grid grid-cols-[4.5rem_1fr] gap-y-1">
                    <dt>수집 목적</dt><dd>{p.purpose}</dd>
                    <dt>수집 항목</dt><dd>{p.fields}</dd>
                    <dt>보유 기간</dt><dd>{p.retention}</dd>
                  </dl>
                  <label className="mt-3 flex items-center gap-2 text-foreground">
                    <Checkbox checked={values.consent} onCheckedChange={(c) => set("consent", c === true)} aria-invalid={!!errors.consent} />
                    <span>개인정보 수집·이용에 동의합니다 (필수)</span>
                  </label>
                  {errors.consent && <p className="mt-1 text-destructive">{errors.consent}</p>}
                </div>
                {errors.form && <p role="alert" className="text-sm text-destructive">{errors.form}</p>}
                <Button type="submit" size="lg" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="animate-spin" />}
                  {busy ? "접수 중…" : "상담 신청하기"}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  );
}

function Field({ id, label, required, error, children }: { id: string; label: string; required?: boolean; error?: string | undefined; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label} {required && <span className="text-brick">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function ConsultButton({ children = "가맹상담 신청", size = "lg", variant = "default", className }: { children?: ReactNode; size?: "sm" | "lg" | "default"; variant?: "default" | "outline"; className?: string | undefined }) {
  const { open } = useConsult();
  return (
    <Button size={size} variant={variant} className={className} onClick={open}>
      {children}
    </Button>
  );
}

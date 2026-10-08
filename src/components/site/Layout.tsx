import { useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu, X, ExternalLink } from "lucide-react";
import { ConsultButton } from "./consult";
import { siteConfig } from "@/lib/site-config";
import pageIntroBg from "@/assets/dummy-interior.jpg";

type NavLeaf = { label: string; to?: string; href?: string | null };
type NavChild = { to: string; label: string };
type NavItem = NavLeaf | { label: string; children: NavChild[] };

const nav: NavItem[] = [
  { to: "/brand", label: "브랜드 소개" },
  {
    label: "가맹문의",
    children: [
      { to: "/franchise", label: "가맹안내" },
      { to: "/stores", label: "매장안내" },
      { to: "/menu", label: "메뉴구성" },
    ],
  },
  { label: "온라인스토어", href: siteConfig.naverStoreUrl },
  { to: "/news", label: "새로운 소식" },
];

const footerLinks: NavLeaf[] = nav.flatMap((n): NavLeaf[] => ("children" in n ? [...n.children] : [n]));

function Wordmark() {
  return (
    <Link to="/" className="inline-flex shrink-0 items-center" aria-label="룰리커피 홈으로">
      <img src="/logo-mark.png" alt="룰리커피" className="h-9 w-auto md:h-11" />
    </Link>
  );
}

function ExternalLeaf({ leaf, className }: { leaf: NavLeaf; className?: string }) {
  if (!leaf.href) {
    return <span className={`${className} cursor-default`}>{leaf.label}</span>;
  }
  return (
    <a href={leaf.href} target="_blank" rel="noopener noreferrer" className={className}>
      {leaf.label} <ExternalLink className="inline size-3.5" aria-hidden />
    </a>
  );
}

function DesktopSubmenu({ item, linkCls }: { item: Extract<NavItem, { children: NavChild[] }>; linkCls: string }) {
  const [openMenu, setOpenMenu] = useState(false);
  const holdClosed = useRef(false);
  const openMenuIfAllowed = () => {
    if (!holdClosed.current) setOpenMenu(true);
  };
  const closeMenu = () => {
    holdClosed.current = true;
    setOpenMenu(false);
  };
  const release = () => {
    holdClosed.current = false;
    setOpenMenu(false);
  };
  return (
    <div
      className="relative"
      onMouseEnter={openMenuIfAllowed}
      onMouseLeave={release}
      onFocus={openMenuIfAllowed}
      onBlur={(event) => {
        const menu = event.currentTarget;
        if (menu.contains(event.relatedTarget as Node | null)) return;
        setOpenMenu(false);
        requestAnimationFrame(() => {
          if (!menu.contains(document.activeElement)) holdClosed.current = false;
        });
      }}
    >
      <Link
        to={item.children[0]?.to ?? "/franchise"}
        className={`${linkCls} inline-flex items-center gap-1`}
        aria-haspopup="true"
        aria-expanded={openMenu}
        onClick={closeMenu}
      >
        {item.label}
        <ChevronDown aria-hidden className={`size-4 transition-transform ${openMenu ? "rotate-180" : ""}`} />
      </Link>
      <div
        className={`absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 transition-opacity ${openMenu ? "visible opacity-100" : "invisible opacity-0"}`}
      >
        <ul className="min-w-36 border bg-white py-2 shadow-sm">
          {item.children.map((c) => (
            <li key={c.to}>
              <Link
                to={c.to}
                onClick={closeMenu}
                className="block whitespace-nowrap px-5 py-2.5 text-[15px] text-foreground/80 transition-colors hover:bg-primary hover:text-white"
                activeProps={{ className: "text-primary font-semibold" }}
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [openSub, setOpenSub] = useState(false);
  const linkCls = "text-[15px] font-medium text-foreground/80 hover:text-primary transition-colors";
  return (
    <header className="sticky top-0 z-40 border-b bg-[#FBEFD9]">
      <div className="container-site flex h-16 items-center justify-between gap-6 md:h-20">
        <Wordmark />
        <nav className="hidden items-center gap-8 lg:flex" aria-label="주 메뉴">
          {nav.map((n) =>
            "children" in n ? (
              <DesktopSubmenu key={n.label} item={n} linkCls={linkCls} />
            ) : n.to ? (
              <Link key={n.label} to={n.to} className={linkCls} activeProps={{ className: "text-primary font-semibold" }}>
                {n.label}
              </Link>
            ) : (
              <ExternalLeaf key={n.label} leaf={n} className={linkCls} />
            ),
          )}
        </nav>
        <div className="flex items-center gap-2">
          <ConsultButton size="sm" className="hidden sm:inline-flex" />
          <button className="inline-flex size-11 items-center justify-center lg:hidden" aria-label={open ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t lg:hidden" aria-label="모바일 메뉴">
          <ul className="container-site py-3">
            {nav.map((n) =>
              "children" in n ? (
                <li key={n.label}>
                  <button
                    className="flex w-full items-center justify-between border-b py-4 text-base font-medium"
                    aria-expanded={openSub}
                    onClick={() => setOpenSub(!openSub)}
                  >
                    {n.label}
                    <ChevronDown aria-hidden className={`size-4 transition-transform ${openSub ? "rotate-180" : ""}`} />
                  </button>
                  {openSub && (
                    <ul>
                      {n.children.map((c) => (
                        <li key={c.to}>
                          <Link
                            to={c.to}
                            onClick={() => {
                              setOpenSub(false);
                              setOpen(false);
                            }}
                            className="block border-b py-3.5 pl-4 text-[15px] text-foreground/75 hover:text-primary"
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : n.to ? (
                <li key={n.label}>
                  <Link to={n.to} onClick={() => setOpen(false)} className="block border-b py-4 text-base font-medium">
                    {n.label}
                  </Link>
                </li>
              ) : (
                <li key={n.label} className="border-b py-4">
                  <ExternalLeaf leaf={n} className="text-base font-medium" />
                </li>
              ),
            )}
            <li className="py-4"><ConsultButton className="w-full" /></li>
          </ul>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  const c = siteConfig.company;
  const info = [
    ["대표", c.ceo],
    ["사업자등록번호", c.bizNumber],
    ["주소", c.address],
    ["전화", c.phone],
    ["이메일", c.email],
  ].filter(([, v]) => v);
  return (
    <footer className="border-t bg-[#FBEFD9]">
      <div className="container-site grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link to="/" className="inline-flex" aria-label="룰리커피 홈으로">
            <img src="/logo-mark.png" alt="룰리커피" className="h-12 w-auto" />
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">{c.name}</p>
          {info.length > 0 && (
            <dl className="mt-3 space-y-1 text-sm text-muted-foreground">
              {info.map(([k, v]) => (
                <div key={k} className="flex gap-2"><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          )}
        </div>
        <ul className="space-y-2 text-sm">
          {footerLinks.map((n) => (
            <li key={n.label}>
              {n.to ? (
                <Link to={n.to} className="text-foreground/75 hover:text-primary">{n.label}</Link>
              ) : (
                <ExternalLeaf leaf={n} className="text-foreground/75 hover:text-primary" />
              )}
            </li>
          ))}
        </ul>
        <ul className="space-y-2 text-sm">
          <li><Link to="/privacy" className="font-semibold text-foreground hover:text-primary">개인정보처리방침</Link></li>
          <li><Link to="/terms" className="text-foreground/75 hover:text-primary">이용약관</Link></li>
        </ul>
      </div>
      <div className="border-t">
        <p className="container-site py-5 text-xs text-muted-foreground">© {siteConfig.brand.founded}–{new Date().getFullYear()} Rully Coffee. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function PageIntro({ image = pageIntroBg, natural = false }: { image?: string; natural?: boolean }) {
  return (
    <section className="overflow-hidden border-b">
      <img src={image} alt="" className={natural ? "h-auto w-full" : "h-56 w-full object-cover md:h-80"} />
    </section>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="border-y py-16 text-center">
      <p className="font-semibold">{title}</p>
      {children && <p className="mt-2 text-sm text-muted-foreground">{children}</p>}
    </div>
  );
}

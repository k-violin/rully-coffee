import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  { src: "/메인4.png", alt: "붉은 벽돌 건물과 야외 좌석이 보이는 룰리커피 매장 전경" },
  { src: "/메인2.png", alt: "룰리커피 로고와 배송 차량이 있는 붉은 벽돌 건물" },
  { src: "/메인1.jpg", alt: "위에서 내려다본 룰리커피 야외 테라스" },
  { src: "/메인3.jpg", alt: "높은 층고와 넓은 좌석을 갖춘 룰리커피 실내" },
] as const;

export function HeroCarousel({ children }: { children?: ReactNode }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 4000);
    return () => window.clearInterval(timer);
  }, []);

  const move = (direction: number) => {
    setActive((current) => (current + direction + slides.length) % slides.length);
  };

  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-surface md:aspect-[16/9] lg:aspect-[21/9]">
      {slides.map((slide, index) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fetchPriority={index === 0 ? "high" : "auto"}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === active ? "opacity-100" : "pointer-events-none opacity-0"}`}
        />
      ))}

      {children && (
        <>
          <div className="absolute inset-0 bg-black/35" aria-hidden />
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center">
            <div className="container-site">
              <div className="pointer-events-auto max-w-xl">{children}</div>
            </div>
          </div>
        </>
      )}

      <div className="absolute inset-x-0 bottom-4 z-20 flex items-center justify-between px-4 md:bottom-6 md:px-8">
        <div className="flex gap-2" aria-label="메인 사진 선택">
          {slides.map((slide, index) => (
            <Button
              key={slide.src}
              type="button"
              variant="ghost"
              size="icon"
              className={`size-11 rounded-full border border-white/50 bg-black/30 text-white transition-colors hover:bg-black/50 ${index === active ? "" : "text-white/40"}`}
              aria-label={`${index + 1}번째 사진 보기`}
              aria-current={index === active ? "true" : undefined}
              onClick={() => setActive(index)}
            >
              <span className={`block size-2 rounded-full bg-current ${index === active ? "" : "text-white/40"}`} />
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="icon" className="rounded-full border border-white/50 bg-black/30 text-white hover:bg-black/50" aria-label="이전 사진" onClick={() => move(-1)}>
            <ChevronLeft aria-hidden />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="rounded-full border border-white/50 bg-black/30 text-white hover:bg-black/50" aria-label="다음 사진" onClick={() => move(1)}>
            <ChevronRight aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}

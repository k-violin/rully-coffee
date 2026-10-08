import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageSlot } from "@/components/site/ImageSlot";

const slides = [
  { alt: "나라별 원두가 담긴 룰리커피 드립백", src: "/드립백.GIF" },
  { alt: "룰리 콜드브루 커피 500ml", src: "/드립백1.GIF" },
  { alt: "룰리커피 원두 파우치", src: "/드립백2.GIF" },
] as const;

/** 온라인스토어 섹션용 제품 사진 캐러셀 (히어로와 같은 4초 자동 전환). */
export function ProductCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 4000);
    return () => window.clearInterval(timer);
  }, []);

  const move = (direction: number) => {
    setActive((current) => (current + direction + slides.length) % slides.length);
  };

  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-background md:aspect-[16/9] lg:aspect-[21/9]">
      {slides.map((slide, index) => (
        <div
          key={slide.alt}
          aria-hidden={index !== active}
          className={`absolute inset-0 transition-opacity duration-700 ${index === active ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <ImageSlot src={slide.src} alt={slide.alt} className="object-contain" />
        </div>
      ))}

      <div className="absolute inset-x-0 bottom-4 z-20 flex items-center justify-between px-4 md:bottom-6 md:px-8">
        <div className="flex gap-2" aria-label="제품 사진 선택">
          {slides.map((slide, index) => (
            <Button
              key={slide.alt}
              type="button"
              variant="ghost"
              size="icon"
              className={`size-11 rounded-full border border-border bg-background/90 text-primary transition-colors hover:bg-surface ${index === active ? "" : "text-primary/30"}`}
              aria-label={`${index + 1}번째 제품 사진 보기`}
              aria-current={index === active ? "true" : undefined}
              onClick={() => setActive(index)}
            >
              <span className="block size-2 rounded-full bg-current" />
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="icon" className="rounded-full border border-border bg-background/90 text-primary hover:bg-surface" aria-label="이전 사진" onClick={() => move(-1)}>
            <ChevronLeft aria-hidden />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="rounded-full border border-border bg-background/90 text-primary hover:bg-surface" aria-label="다음 사진" onClick={() => move(1)}>
            <ChevronRight aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}

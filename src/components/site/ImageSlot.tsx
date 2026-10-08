import { cn } from "@/lib/utils";
import dummyBeans from "@/assets/dummy-beans.jpg";
import dummyBag from "@/assets/dummy-bag.jpg";
import dummyInterior from "@/assets/dummy-interior.jpg";
import dummyMachine from "@/assets/dummy-machine.jpg";
import dummyLatte from "@/assets/dummy-latte.jpg";
import dummyStorefront from "@/assets/dummy-storefront.jpg";

// 사진 미제공 슬롯에 보여줄 더미 이미지. 실제 사진을 받으면 src로 교체된다.
const dummies = [dummyBeans, dummyBag, dummyInterior, dummyMachine, dummyLatte, dummyStorefront];

/** alt 문자열로 더미 이미지를 고정 선택 — 같은 슬롯은 항상 같은 더미를 보여준다. */
function pickDummy(alt: string): string {
  let hash = 0;
  for (let i = 0; i < alt.length; i += 1) hash = (hash * 31 + alt.charCodeAt(i)) >>> 0;
  return dummies[hash % dummies.length]!;
}

/** Calm image frame. Shows the photo when supplied, otherwise a dummy placeholder image. */
export function ImageSlot({ src, alt, className }: { src?: string | null; alt: string; className?: string | undefined }) {
  const resolved = src ?? pickDummy(alt);
  return <img src={resolved} alt={alt} loading="lazy" className={cn("h-full w-full object-cover", className)} />;
}

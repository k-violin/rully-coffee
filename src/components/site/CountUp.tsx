import { useEffect, useRef, useState } from "react";

// Counts one integer at a time once scrolled into view, so each step stays readable.
// Renders a plain number (no thousand separators) so years like 2014 stay intact.
export function CountUp({ from = 0, target, duration = 3600 }: { from?: number; target: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const [value, setValue] = useState(from);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer = 0;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();
        const steps = target - from;
        if (steps <= 0) {
          setValue(target);
          return;
        }
        const stepMs = Math.max(90, Math.round(duration / steps));
        let current = from;
        timer = window.setInterval(() => {
          current += 1;
          setValue(current);
          if (current >= target) window.clearInterval(timer);
        }, stepMs);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, [from, target, duration]);

  return <span ref={ref}>{value}</span>;
}

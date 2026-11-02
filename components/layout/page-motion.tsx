"use client";
import { useRef } from "react";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
gsap.registerPlugin(useGSAP);
export function PageMotion() {
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const previous = useRef(pathname);
  useGSAP(
    () => {
      const changed = previous.current !== pathname;
      previous.current = pathname;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (changed && !pathname.startsWith("/admin"))
          gsap.fromTo(
            "[data-transition-panel]",
            { scaleX: 1, transformOrigin: "right center" },
            { scaleX: 0, duration: 0.45, stagger: 0.06, ease: "power3.inOut" },
          );
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [pathname] },
  );
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      () => {
        function move(event: PointerEvent) {
          const target = (event.target as HTMLElement).closest<HTMLElement>(
            "a[data-magnetic],button[data-magnetic]",
          );
          if (!target) return;
          const r = target.getBoundingClientRect();
          gsap.to(target, {
            x: (event.clientX - r.left - r.width / 2) * 0.1,
            y: (event.clientY - r.top - r.height / 2) * 0.12,
            duration: 0.3,
            overwrite: true,
          });
        }
        function leave(event: PointerEvent) {
          const target = (event.target as HTMLElement).closest<HTMLElement>(
            "[data-magnetic]",
          );
          if (target)
            gsap.to(target, { x: 0, y: 0, duration: 0.3, overwrite: true });
        }
        document.addEventListener("pointermove", move);
        document.addEventListener("pointerout", leave);
        return () => {
          document.removeEventListener("pointermove", move);
          document.removeEventListener("pointerout", leave);
        };
      },
    );
    return () => mm.revert();
  }, []);
  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[80] flex flex-col"
    >
      <div
        data-transition-panel
        className="h-1/3 origin-right scale-x-0 bg-brand-blue"
      />
      <div
        data-transition-panel
        className="h-1/3 origin-right scale-x-0 bg-brand-orange"
      />
      <div
        data-transition-panel
        className="h-1/3 origin-right scale-x-0 bg-brand-blue-deep"
      />
    </div>
  );
}

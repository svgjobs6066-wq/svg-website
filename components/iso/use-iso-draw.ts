"use client";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(useGSAP, ScrollTrigger);

const DRAW_SECONDS = 1.4;

/**
 * Plots every isometric illustration inside `scope` like a pen on a
 * blueprint when it scrolls into view; accent faces fade in after the lines.
 *
 * Strokes use `vector-effect: non-scaling-stroke`, so dash lengths are in
 * screen pixels. DrawSVG measures in user units, so we measure ourselves:
 * path length × the SVG's on-screen scale.
 */
export function useIsoDraw(scope: React.RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<SVGSVGElement>("svg[data-iso]").forEach((svg) => {
          const scale = svg.getScreenCTM()?.a ?? 1;
          const outlines = gsap.utils
            .toArray<SVGGeometryElement>(
              svg.querySelectorAll("polygon, polyline"),
            )
            .filter((shape) => !shape.hasAttribute("stroke-dasharray"));
          const dims = svg.querySelectorAll("[stroke-dasharray]");
          const accents = svg.querySelectorAll('[fill="var(--iso-accent)"]');
          outlines.forEach((shape) => {
            const length = Math.ceil(shape.getTotalLength() * scale) + 2;
            gsap.set(shape, {
              strokeDasharray: `${length} ${length}`,
              strokeDashoffset: length,
            });
          });
          const timeline = gsap
            .timeline({
              scrollTrigger: { trigger: svg, start: "top 88%", once: true },
              onComplete: () =>
                gsap.set(outlines, {
                  clearProps: "strokeDasharray,strokeDashoffset",
                }),
            })
            .to(outlines, {
              strokeDashoffset: 0,
              duration: DRAW_SECONDS,
              stagger: { amount: DRAW_SECONDS * 0.6 },
              ease: "power2.inOut",
            });
          if (accents.length)
            timeline.from(
              accents,
              { fillOpacity: 0, duration: 0.4, ease: "power1.out" },
              "-=0.6",
            );
          if (dims.length)
            timeline.from(dims, { opacity: 0, duration: 0.5 }, "-=0.4");
        });
      });
      return () => mm.revert();
    },
    { scope },
  );
}

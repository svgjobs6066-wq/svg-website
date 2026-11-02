import { cn } from "@/lib/utils";
import type { Tone } from "./engine";
import { scenes, type SceneName } from "./scenes";

const paint: Record<Tone, React.SVGProps<SVGPolygonElement>> = {
  face: { fill: "var(--iso-fill)", stroke: "var(--iso-line)" },
  accent: { fill: "var(--iso-accent)", stroke: "var(--iso-line)" },
  solid: { fill: "var(--iso-line)", stroke: "var(--iso-line)" },
  line: { fill: "none", stroke: "var(--iso-line)" },
  dim: {
    fill: "none",
    stroke: "var(--iso-accent)",
    strokeDasharray: "3 4",
  },
};

/**
 * Isometric line illustration. Colours come from the `iso-on-*` utility on
 * this element or an ancestor; strokes stay a crisp hairline at any size.
 */
export function IsoArt({
  name,
  className,
  strokeWidth = 1.25,
}: {
  name: SceneName;
  className?: string;
  strokeWidth?: number;
}) {
  const scene = scenes[name];
  return (
    <svg
      data-iso={name}
      aria-hidden="true"
      focusable="false"
      viewBox={scene.viewBox}
      className={cn("block h-auto w-full overflow-visible", className)}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {scene.shapes.map(({ points, tone, closed }, i) =>
        closed ? (
          <polygon
            key={i}
            points={points}
            vectorEffect="non-scaling-stroke"
            {...paint[tone]}
          />
        ) : (
          <polyline
            key={i}
            points={points}
            vectorEffect="non-scaling-stroke"
            fill="none"
            stroke={paint[tone].stroke}
            strokeDasharray={paint[tone].strokeDasharray}
          />
        ),
      )}
    </svg>
  );
}

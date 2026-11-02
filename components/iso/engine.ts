/**
 * A tiny isometric line-art engine.
 *
 * World axes: +x runs to the lower right, +y to the lower left, +z up.
 * The viewer looks from (+1, +1, +1), so faces whose outward normal points
 * that way are visible. Shapes are emitted back-to-front (painter's order);
 * each face is filled with the panel colour so it hides the edges behind it,
 * which is what gives the drawings their clean blueprint look.
 */
export type Vec3 = readonly [number, number, number];
export type Vec2 = readonly [number, number];
export type Plane = "xy" | "xz" | "yz";
export type Axis = "x" | "y" | "z";
export type Tone = "face" | "accent" | "solid" | "line" | "dim";
export type Shape = { points: Vec2[]; tone: Tone; closed: boolean };
export type Scene = {
  viewBox: string;
  width: number;
  height: number;
  shapes: { points: string; tone: Tone; closed: boolean }[];
};

const COS30 = Math.cos(Math.PI / 6);
const VIEW: Vec3 = [1, 1, 1];

export const project = ([x, y, z]: Vec3): Vec2 => [
  (x - y) * COS30,
  (x + y) * 0.5 - z,
];

const projectAll = (points: Vec3[]) => points.map(project);

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const centroidDepth = (points: Vec3[]) =>
  points.reduce((sum, [x, y, z]) => sum + x + y + z, 0) / points.length;

const signedArea = (points: Vec2[]) =>
  points.reduce((sum, [x1, y1], i) => {
    const [x2, y2] = points[(i + 1) % points.length];
    return sum + x1 * y2 - x2 * y1;
  }, 0) / 2;

/** Place 2D plane coordinates (u, v) into 3D at an origin. */
export const onPlane = (plane: Plane, [ox, oy, oz]: Vec3, points: Vec2[]) =>
  points.map(([u, v]): Vec3 => {
    if (plane === "xy") return [ox + u, oy + v, oz];
    if (plane === "xz") return [ox + u, oy, oz + v];
    return [ox, oy + u, oz + v];
  });

const normalOnPlane = (plane: Plane, [u, v]: Vec2): Vec3 => {
  if (plane === "xy") return [u, v, 0];
  if (plane === "xz") return [u, 0, v];
  return [0, u, v];
};

const axisPlane: Record<Axis, Plane> = { x: "yz", y: "xz", z: "xy" };
const axisVector: Record<Axis, Vec3> = {
  x: [1, 0, 0],
  y: [0, 1, 0],
  z: [0, 0, 1],
};

const shift = (points: Vec3[], axis: Axis, by: number) => {
  const [dx, dy, dz] = axisVector[axis].map((n) => n * by);
  return points.map(([x, y, z]): Vec3 => [x + dx, y + dy, z + dz]);
};

// ---------------------------------------------------------------- 2D profiles

export const rect2 = (x: number, y: number, w: number, h: number): Vec2[] => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];

export const circle2 = (r: number, cx = 0, cy = 0, segments = 64): Vec2[] =>
  Array.from({ length: segments }, (_, i) => {
    const angle = (i / segments) * Math.PI * 2;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  });

export const arc2 = (
  r: number,
  from: number,
  to: number,
  cx = 0,
  cy = 0,
  segments = 24,
): Vec2[] =>
  Array.from({ length: segments + 1 }, (_, i) => {
    const angle = ((from + ((to - from) * i) / segments) * Math.PI) / 180;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  });

export const polygon2 = (r: number, sides: number, rotation = 0): Vec2[] =>
  Array.from({ length: sides }, (_, i) => {
    const angle = rotation + (i / sides) * Math.PI * 2;
    return [r * Math.cos(angle), r * Math.sin(angle)];
  });

export const gear2 = (outer: number, root: number, teeth: number): Vec2[] => {
  const step = (Math.PI * 2) / teeth;
  return Array.from({ length: teeth }).flatMap((_, i): Vec2[] => {
    const a = i * step;
    const at = (r: number, t: number): Vec2 => [
      r * Math.cos(a + t * step),
      r * Math.sin(a + t * step),
    ];
    return [at(root, 0), at(outer, 0.18), at(outer, 0.48), at(root, 0.66)];
  });
};

export const rotate2 = (points: Vec2[], degrees: number): Vec2[] => {
  const r = (degrees * Math.PI) / 180;
  return points.map(([x, y]) => [
    x * Math.cos(r) - y * Math.sin(r),
    x * Math.sin(r) + y * Math.cos(r),
  ]);
};

const counterClockwise = (points: Vec2[]) =>
  signedArea(points) < 0 ? [...points].reverse() : points;

// ---------------------------------------------------------------- primitives

const face = (points: Vec3[], tone: Tone = "face"): Shape => ({
  points: projectAll(points),
  tone,
  closed: true,
});

/** Axis-aligned box. Only the three faces turned to the viewer are drawn. */
export const box = (
  [x, y, z]: Vec3,
  [w, d, h]: Vec3,
  tones: { top?: Tone; left?: Tone; right?: Tone } = {},
): Shape[] => [
  face(
    [
      [x, y + d, z],
      [x + w, y + d, z],
      [x + w, y + d, z + h],
      [x, y + d, z + h],
    ],
    tones.left,
  ),
  face(
    [
      [x + w, y, z],
      [x + w, y + d, z],
      [x + w, y + d, z + h],
      [x + w, y, z + h],
    ],
    tones.right,
  ),
  face(
    [
      [x, y, z + h],
      [x + w, y, z + h],
      [x + w, y + d, z + h],
      [x, y + d, z + h],
    ],
    tones.top,
  ),
];

/** Any 2D profile extruded along an axis, with back-face culling. */
export const prism = (
  axis: Axis,
  origin: Vec3,
  profile: Vec2[],
  length: number,
  tones: { cap?: Tone; sides?: Tone } = {},
): Shape[] => {
  const plane = axisPlane[axis];
  const ring = counterClockwise(profile);
  const back = onPlane(plane, origin, ring);
  const front = shift(back, axis, length);
  const sides = ring
    .map((point, i) => {
      const next = ring[(i + 1) % ring.length];
      const normal = normalOnPlane(plane, [
        next[1] - point[1],
        point[0] - next[0],
      ]);
      const quad = [back[i], back[(i + 1) % ring.length]];
      return {
        visible: dot(normal, VIEW) > 1e-6,
        quad: [...quad, front[(i + 1) % ring.length], front[i]],
      };
    })
    .filter((side) => side.visible)
    .sort((a, b) => centroidDepth(a.quad) - centroidDepth(b.quad))
    .map((side) => face(side.quad, tones.sides));
  return [...sides, face(front, tones.cap)];
};

/** Smooth cylinder: silhouette hull plus the visible end cap. */
export const cylinder = (
  axis: Axis,
  origin: Vec3,
  radius: number,
  length: number,
  tones: { cap?: Tone; body?: Tone } = {},
): Shape[] => {
  const ring = onPlane(axisPlane[axis], origin, circle2(radius));
  const cap = shift(ring, axis, length);
  return [
    {
      points: convexHull([...projectAll(ring), ...projectAll(cap)]),
      tone: tones.body ?? "face",
      closed: true,
    },
    face(cap, tones.cap),
  ];
};

/** Flat outline drawn on a plane (panel seams, screens, slots). */
export const outline = (
  plane: Plane,
  origin: Vec3,
  points: Vec2[],
  tone: Tone = "line",
  closed = true,
): Shape => ({
  points: projectAll(onPlane(plane, origin, points)),
  tone,
  closed,
});

/** Straight 3D polyline, e.g. dimension lines. */
export const line = (points: Vec3[], tone: Tone = "line"): Shape => ({
  points: projectAll(points),
  tone,
  closed: false,
});

/** Dimension line with end ticks, offset from an edge on the ground plane. */
export const dimension = (from: Vec3, to: Vec3, tick: Vec3): Shape[] => [
  line([from, to], "dim"),
  line(
    [
      [from[0] - tick[0], from[1] - tick[1], from[2] - tick[2]],
      [from[0] + tick[0], from[1] + tick[1], from[2] + tick[2]],
    ],
    "dim",
  ),
  line(
    [
      [to[0] - tick[0], to[1] - tick[1], to[2] - tick[2]],
      [to[0] + tick[0], to[1] + tick[1], to[2] + tick[2]],
    ],
    "dim",
  ),
];

// ---------------------------------------------------------------- assembly

function convexHull(points: Vec2[]): Vec2[] {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Vec2, a: Vec2, b: Vec2) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const build = (list: Vec2[]) =>
    list.reduce<Vec2[]>((hull, point) => {
      while (
        hull.length >= 2 &&
        cross(hull[hull.length - 2], hull[hull.length - 1], point) <= 0
      )
        hull.pop();
      hull.push(point);
      return hull;
    }, []);
  const lower = build(sorted);
  const upper = build([...sorted].reverse());
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

const round = (n: number) => Math.round(n * 10) / 10;

/** Freeze a list of shapes into SVG-ready strings with a tight viewBox. */
export const compose = (shapes: Shape[], padding = 6): Scene => {
  const all = shapes.flatMap((shape) => shape.points);
  const xs = all.map(([x]) => x);
  const ys = all.map(([, y]) => y);
  const minX = Math.min(...xs) - padding;
  const minY = Math.min(...ys) - padding;
  const width = Math.max(...xs) - minX + padding;
  const height = Math.max(...ys) - minY + padding;
  return {
    viewBox: [minX, minY, width, height].map(round).join(" "),
    width: round(width),
    height: round(height),
    shapes: shapes.map(({ points, tone, closed }) => ({
      points: points.map(([x, y]) => `${round(x)},${round(y)}`).join(" "),
      tone,
      closed,
    })),
  };
};

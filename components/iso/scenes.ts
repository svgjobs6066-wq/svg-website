import {
  arc2,
  box,
  circle2,
  compose,
  cylinder,
  dimension,
  gear2,
  line,
  outline,
  polygon2,
  prism,
  rect2,
  rotate2,
  type Shape,
  type Vec2,
} from "./engine";

/** CNC turning centre: cabinet, bed, headstock, chuck, part, tool, tailstock. */
const lathe = (): Shape[] => [
  ...dimension([0, 128, 0], [300, 128, 0], [0, 6, 0]),
  ...dimension([376, 0, 0], [376, 0, 210], [6, 0, 0]),
  ...box([0, 0, 0], [300, 100, 80]),
  outline("xz", [0, 100, 0], rect2(14, 12, 84, 54)),
  outline("xz", [0, 100, 0], rect2(110, 12, 84, 54)),
  outline("xz", [0, 100, 0], rect2(206, 12, 80, 54)),
  outline("xz", [0, 100, 0], rect2(86, 34, 6, 12)),
  outline("xz", [0, 100, 0], rect2(182, 34, 6, 12)),
  ...box([10, 14, 80], [280, 78, 16]),
  ...box([10, 8, 96], [80, 86, 116]),
  outline("xz", [10, 94, 96], rect2(12, 18, 56, 4)),
  outline("xz", [10, 94, 96], rect2(12, 28, 56, 4)),
  outline("xz", [10, 94, 96], rect2(12, 38, 56, 4)),
  ...cylinder("x", [90, 52, 152], 36, 22),
  outline("yz", [112, 0, 0], circle2(14, 52, 152)),
  outline("yz", [112, 0, 0], rect2(49, 168, 6, 14)),
  outline("yz", [112, 0, 0], rect2(49, 122, 6, 14)),
  ...cylinder("x", [112, 52, 152], 13, 96),
  ...cylinder("x", [222, 52, 152], 8, 20),
  ...box([242, 20, 96], [44, 66, 70]),
  outline("yz", [286, 0, 0], circle2(17, 53, 128)),
  outline("yz", [286, 0, 0], circle2(4, 53, 128)),
  ...box([146, 62, 96], [70, 30, 14]),
  ...box([166, 70, 110], [28, 20, 34]),
  ...box([172, 62, 144], [14, 10, 7], { top: "accent", right: "accent" }),
  ...box([318, 4, 0], [42, 56, 210]),
  outline("xz", [318, 60, 0], rect2(7, 132, 28, 56)),
  outline("xz", [318, 60, 0], rect2(7, 112, 12, 10), "accent"),
  outline("xz", [318, 60, 0], rect2(23, 112, 12, 10)),
  ...prism("z", [32, -64, 252], gear2(42, 34, 12), 12),
  outline("xy", [32, -64, 264], circle2(13)),
  ...prism("z", [104, -40, 230], gear2(24, 18, 8), 10),
  ...cylinder("z", [104, -40, 240], 7, 6, { cap: "accent" }),
];

/** Rising steps: one block per qualification, the third one highlighted. */
const steps = (): Shape[] => [
  ...dimension([0, 92, 0], [216, 92, 0], [0, 6, 0]),
  ...Array.from({ length: 6 }).flatMap((_, i) =>
    box([i * 36, 0, 0], [36, 72, 26 + i * 26], {
      top: i === 2 ? "accent" : "face",
    }),
  ),
  ...cylinder("z", [198, 30, 156], 3, 60),
  ...prism("y", [201, 26, 190], rect2(0, 0, 34, 24), 4, { cap: "accent" }),
];

const apply = (): Shape[] => [
  ...box([0, 0, 0], [66, 88, 4]),
  ...[0, 1, 2, 3].map((row) =>
    outline(
      "xy",
      [0, 0, 4],
      [
        [12, 14 + row * 12],
        [row === 3 ? 34 : 54, 14 + row * 12],
      ],
      "line",
      false,
    ),
  ),
  ...box([10, 64, 4], [12, 12, 3], { top: "accent" }),
  outline(
    "xy",
    [0, 0, 4],
    [
      [30, 70],
      [54, 70],
    ],
    "line",
    false,
  ),
  ...cylinder("y", [80, 6, 6], 5, 74),
];

const call = (): Shape[] => [
  outline("xz", [21, 0, 10], arc2(18, 35, 145), "line", false),
  outline("xz", [21, 0, 10], arc2(30, 35, 145), "line", false),
  outline("xz", [21, 0, 10], arc2(42, 35, 145), "dim", false),
  ...box([0, 0, 0], [42, 80, 7]),
  outline("xy", [0, 0, 7], rect2(5, 9, 32, 56)),
  outline("xy", [0, 0, 7], circle2(4, 21, 72)),
  ...cylinder("z", [21, 36, 7], 7, 2, { cap: "accent" }),
];

const join = (): Shape[] => [
  ...box([0, 0, 0], [90, 62, 34]),
  outline("xz", [0, 62, 0], rect2(38, 0, 16, 22), "accent"),
  outline("xz", [0, 62, 0], rect2(10, 16, 18, 10)),
  outline("xz", [0, 62, 0], rect2(64, 16, 18, 10)),
  ...[0, 1, 2].flatMap((i) =>
    prism(
      "y",
      [i * 30, 0, 34],
      [
        [0, 0],
        [30, 0],
        [30, 18],
      ],
      62,
    ),
  ),
  ...cylinder("z", [78, 8, 46], 5, 34),
];

/** Department badges for job cards. */
const machining = (): Shape[] => [
  ...prism("z", [0, 0, 0], gear2(34, 26, 10), 12),
  ...cylinder("z", [0, 0, 12], 10, 4, { cap: "accent" }),
];

const iBeam: Vec2[] = [
  [-22, 0],
  [22, 0],
  [22, 8],
  [5, 8],
  [5, 38],
  [22, 38],
  [22, 46],
  [-22, 46],
  [-22, 38],
  [-5, 38],
  [-5, 8],
  [-22, 8],
];
const fabrication = (): Shape[] => [
  ...box([-14, -34, -6], [94, 70, 6]),
  ...prism("x", [0, 0, 0], iBeam, 66),
  ...box([58, 18, 0], [10, 10, 3], { top: "accent" }),
];

const assembly = (): Shape[] => [
  ...prism("z", [0, 0, 0], polygon2(28, 6, Math.PI / 6), 16),
  outline("xy", [0, 0, 16], circle2(13)),
  ...cylinder("z", [0, 0, 16], 10, 22),
  outline("xy", [0, 0, 38], polygon2(5, 6), "accent"),
];

const finishing = (): Shape[] => [
  ...box([0, 0, 0], [62, 62, 6]),
  ...box([0, 0, 14], [62, 62, 6]),
  ...box([0, 0, 28], [62, 62, 6], { top: "accent" }),
];

const office = (): Shape[] => [
  ...box([0, 0, 0], [66, 46, 4]),
  outline("xy", [0, 0, 4], rect2(8, 14, 50, 18)),
  outline("xy", [0, 0, 4], rect2(24, 36, 18, 6)),
  ...box([0, 0, 4], [66, 3, 44]),
  outline("xz", [0, 3, 4], rect2(5, 5, 56, 34)),
  outline("xz", [0, 3, 4], rect2(10, 26, 20, 8), "accent"),
];

/** Plant with sawtooth roof, office block and chimney (Careers hero). */
const plant = (): Shape[] => [
  ...dimension([0, 150, 0], [210, 150, 0], [0, 6, 0]),
  ...box([0, 0, 0], [210, 124, 64]),
  outline("xz", [0, 124, 0], rect2(26, 0, 40, 46), "accent"),
  outline("xz", [0, 124, 0], rect2(26, 23, 40, 0)),
  outline("xz", [0, 124, 0], rect2(90, 30, 96, 18)),
  ...[0, 1, 2, 3, 4].flatMap((i) =>
    prism(
      "y",
      [i * 42, 0, 64],
      [
        [0, 0],
        [42, 0],
        [42, 26],
      ],
      124,
    ),
  ),
  ...cylinder("z", [188, 14, 86], 8, 70),
  ...box([222, 34, 0], [76, 92, 104]),
  ...[0, 1, 2].flatMap((row) =>
    [0, 1, 2].map((col) =>
      outline("xz", [222, 126, 0], rect2(10 + col * 22, 16 + row * 28, 14, 18)),
    ),
  ),
  ...box([240, 52, 104], [30, 30, 12]),
];

const arrowProfile: Vec2[] = rotate2(
  [
    [-9, 0],
    [9, 0],
    [9, 46],
    [26, 46],
    [0, 76],
    [-26, 46],
    [-9, 46],
  ],
  -45,
);
const arrow = (): Shape[] => [
  ...box([-40, -10, -10], [110, 70, 6]),
  ...prism("y", [10, 0, 0], arrowProfile, 18, { cap: "accent" }),
];

const cubes = (): Shape[] => {
  const cells = [
    [0, 0],
    [1, 0],
    [0, 1],
    [2, 0],
    [1, 1],
    [0, 2],
    [2, 1],
    [1, 2],
  ];
  return [
    ...cells.flatMap(([x, y]) => box([x * 44, y * 44, 0], [44, 44, 44])),
    ...box([88, 88, 96], [44, 44, 44], { top: "accent" }),
    line(
      [
        [110, 110, 44],
        [110, 110, 92],
      ],
      "dim",
    ),
  ];
};

export const scenes = {
  lathe: compose(lathe(), 10),
  steps: compose(steps()),
  apply: compose(apply()),
  call: compose(call()),
  join: compose(join()),
  machining: compose(machining()),
  fabrication: compose(fabrication()),
  assembly: compose(assembly()),
  finishing: compose(finishing()),
  office: compose(office()),
  plant: compose(plant(), 10),
  arrow: compose(arrow()),
  cubes: compose(cubes()),
};
export type SceneName = keyof typeof scenes;

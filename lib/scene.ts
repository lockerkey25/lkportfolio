/**
 * Shared scene data. Layers that carry the same name in several Figma frames
 * (Rectangle 1/2/3, yu, back/Home) are modelled as one persistent element with
 * one keyframe per page, so the browser can tween between them: Figma's
 * "smart animate".
 */

export const FRAME_W = 1440;
export const FRAME_H = 1024;

export type SceneKey = "home" | "about" | "doodles" | "world" | "projects" | "mystery";

export function sceneOf(pathname: string): SceneKey {
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/doodles")) return "doodles";
  if (pathname.startsWith("/world")) return "world";
  if (pathname.startsWith("/projects")) return "projects";
  if (pathname.startsWith("/mystery")) return "mystery";
  return "home";
}

export const isWide = (s: SceneKey) => s === "world" || s === "projects";

/** Unrotated box: top-left corner, size, rotation (deg), opacity. */
export type Box = { x: number; y: number; w: number; h: number; r: number; o: number };

/**
 * Figma reports the bounding box of a rotated layer ("wrapper"). This turns
 * wrapper + inner size back into the unrotated box that CSS needs.
 */
export function fromWrapper(
  wx: number,
  wy: number,
  wW: number,
  wH: number,
  w: number,
  h: number,
  r = 0,
  o = 1,
): Box {
  return { x: wx + (wW - w) / 2, y: wy + (wH - h) / 2, w, h, r, o };
}

const lifted = (b: Box): Box => ({ ...b, y: b.y - 520 });

export type ArtId = "gift" | "eye" | "mp3";

export type Detail = {
  /** Where the artwork sits on screen while hovered (Desktop 5 / 7 / 8). */
  art: Box;
  bg: { src: string; x: number; y: number; w: number; h: number };
  text: { box: Box; lines: string[] };
  /** Optional different artwork used in the detail frame. */
  artSrc?: string;
  /** Detail artwork is multiplied over the background (Figma: mix-blend-multiply). */
  blend?: boolean;
};

export type Art = {
  id: ArtId;
  /** Figma layer name shared by Desktop 1, 2, 3 and 10. */
  name: string;
  src: string;
  alt: string;
  frames: Record<SceneKey, Box>;
  detail: Detail;
};

const home = {
  gift: fromWrapper(47, -108, 405.276, 316.096, 377, 276, 6.37),
  eye: fromWrapper(521, -129, 397.268, 304.404, 377, 276, -4.45),
  mp3: fromWrapper(987, -149, 423.74, 344.469, 377, 276, 11.29),
};
const about = {
  gift: fromWrapper(120, 34, 417.843, 335.154, 377, 276, 9.63),
  eye: fromWrapper(239, 16, 400.456, 309.023, 377, 276, 5.2),
  mp3: fromWrapper(178, -38, 397.268, 304.404, 377, 276, -4.45),
};
const world = {
  gift: fromWrapper(662, 382, 353, 358, 353, 358),
  // Gaps between the gallery boxes are wider than in the first wireframe (about 260 px, was 148).
  eye: fromWrapper(1275, 411, 347, 329, 347, 329),
  mp3: fromWrapper(1870, 411, 377.807, 338.837, 347, 303, 6.22),
};
const projects = {
  gift: fromWrapper(128, 609, 353, 358, 353, 358),
  eye: fromWrapper(1000, 736, 347, 329, 347, 329),
  // Not in Desktop 10 (it only exists off-screen there); parked up the tree until its place is designed.
  mp3: fromWrapper(830, -330, 378, 339, 347, 303, 6.22),
};

const frames = (k: ArtId): Record<SceneKey, Box> => ({
  home: home[k],
  about: about[k],
  doodles: lifted(home[k]),
  world: world[k],
  projects: projects[k],
  mystery: { ...world[k], o: 0 },
});

export const ARTWORKS: Art[] = [
  {
    id: "gift",
    name: "Rectangle 1",
    src: "/art/world-1.png",
    alt: "Doodle of a gift box",
    frames: frames("gift"),
    detail: {
      art: fromWrapper(114, 303, 353, 358, 353, 358),
      bg: { src: "/art/gift-bg.png", x: -44, y: 0, w: 1560, h: 1024 },
      text: {
        box: fromWrapper(528, 213, 415, 180, 415, 180),
        lines: ["gift", "projectile", "", "medium: game"],
      },
    },
  },
  {
    id: "eye",
    name: "Rectangle 2",
    src: "/art/world-2.png",
    alt: "Doodle of an eye",
    frames: frames("eye"),
    detail: {
      art: fromWrapper(545, 322, 351.285, 307.66, 313, 260, -9.41),
      artSrc: "/art/sky-eye.png",
      blend: true,
      bg: { src: "/art/sky-eye-bg.png", x: 84, y: 190, w: 1272, h: 834 },
      text: {
        box: fromWrapper(266, 128, 415, 433, 415, 433),
        lines: ["SKY EYE", "", "medium:", "idk, comic?"],
      },
    },
  },
  {
    id: "mp3",
    name: "Rectangle 3",
    src: "/art/world-3.png",
    alt: "Doodle of an mp3 player",
    frames: frames("mp3"),
    detail: {
      art: fromWrapper(968, 356, 365, 318, 365, 318),
      bg: { src: "/art/mp3.png", x: 615, y: 113, w: 743, h: 853 },
      text: {
        box: fromWrapper(921, 629, 461.21, 477.064, 415, 433, 6.48),
        lines: ["mp3’s", "adventure", "", "medium; game"],
      },
    },
  },
];

/** The "yu" character: same layer on Home and World. */
const yuHome: Box = { x: 143, y: 576, w: 350, h: 448, r: 0, o: 1 };
export const YU: Record<SceneKey, Box> = {
  home: yuHome,
  about: { ...yuHome, y: 700, o: 0 },
  doodles: { ...yuHome, y: 700, o: 0 },
  world: { x: 76, y: 611, w: 350, h: 448, r: 0, o: 1 },
  projects: { x: 76, y: 611, w: 350, h: 448, r: 0, o: 0 },
  mystery: { x: 76, y: 611, w: 350, h: 448, r: 0, o: 0 },
};

/**
 * The "?" card: a gray card at the end of the gallery (Desktop 3) that grows into the
 * full-screen gray panel of Desktop 9 ("some 3d space").
 */
export const CARD: Record<SceneKey, Box> = (() => {
  const gallery = fromWrapper(2508, 324, 276, 377, 377, 276, -90);
  const space = fromWrapper(-62, 0, 1567, 1092, 1092, 1567, -90);
  return {
    home: { ...gallery, o: 0 },
    about: { ...gallery, o: 0 },
    doodles: { ...gallery, o: 0 },
    world: gallery,
    projects: { ...gallery, o: 0 },
    mystery: space,
  };
})();

/** The round "Home" / "back" button: same layer on every page. */
export const DOT: Record<SceneKey, { x: number; y: number; s: number; href: string; label: string }> = {
  home: { x: 96, y: 265, s: 77, href: "/", label: "Home" },
  about: { x: 239, y: 456, s: 77, href: "/", label: "Back to home" },
  // Sits inside the ring of the first "o" of "doodles" (hole is ~30px, measured from the rendered heading).
  doodles: { x: 513, y: 210, s: 33, href: "/", label: "Back to home" },
  world: { x: 89, y: 81, s: 77, href: "/", label: "Back to home" },
  projects: { x: 89, y: 81, s: 77, href: "/world", label: "Back to the world gallery" },
  mystery: { x: 89, y: 81, s: 77, href: "/world", label: "Back to the world gallery" },
};

/* ------------------------------------------------------------------------------------------
 * Responsive layout
 *
 * The stage is always `H` design units tall and `W` units wide, and is scaled to fill the
 * window exactly, so nothing is ever cut off in the middle of the screen.
 *
 * - Landscape: the 1440x1024 Figma frame is centred (ox, oy) in a stage that is at least that big.
 *   Things that hang from the top or sit on the bottom edge are re-anchored to the screen edge.
 * - Portrait (phones, tablets held upright): the stage is 1024 units tall and about 470 to 770
 *   wide. Home, About, Doodles and Space use dedicated layouts; World and Projects keep the
 *   desktop scene and show a window of it that pans.
 * ---------------------------------------------------------------------------------------- */

export type Layout = {
  portrait: boolean;
  /** Stage size in design units. */
  W: number;
  H: number;
  /** Offset of the 1440x1024 frame inside the stage (always 0 in portrait). */
  ox: number;
  oy: number;
};

export const DEFAULT_LAYOUT: Layout = { portrait: false, W: FRAME_W, H: FRAME_H, ox: 0, oy: 0 };

/** Aspect ratios below this use the portrait layout. */
export const PORTRAIT_BELOW = 1.05;

export function layoutFor(vw: number, vh: number): Layout & { scale: number } {
  const portrait = vw / vh < PORTRAIT_BELOW;
  const scale = portrait ? vh / FRAME_H : Math.min(vw / FRAME_W, vh / FRAME_H);
  const W = vw / scale;
  const H = vh / scale;
  return {
    portrait,
    scale,
    W,
    H,
    ox: portrait ? 0 : (W - FRAME_W) / 2,
    oy: portrait ? 0 : (H - FRAME_H) / 2,
  };
}

/** Scenes whose artworks hang from the top edge of the screen. */
export const hangsFromTop = (s: SceneKey) => s === "home" || s === "about" || s === "doodles";

const ART_INDEX: Record<ArtId, number> = { gift: 0, eye: 1, mp3: 2 };

function portraitTop(id: ArtId, scene: "home" | "about", l: Layout): Box {
  const i = ART_INDEX[id];
  if (scene === "home") {
    const w = Math.min(190, l.W * 0.36);
    const h = w * 0.732;
    return {
      x: [l.W * 0.02, l.W / 2 - w / 2, l.W * 0.98 - w][i],
      y: [-50, -65, -45][i],
      w,
      h,
      r: [6.37, -4.45, 11.29][i],
      o: 1,
    };
  }
  const w = 190;
  const h = 139;
  const base = l.W / 2 - w / 2 + 40;
  return {
    x: [base - 30, base + 10, base - 10][i],
    y: [10, -10, -30][i],
    w,
    h,
    r: [9.63, 5.2, -4.45][i],
    o: 1,
  };
}

export function artBox(a: Art, scene: SceneKey, l: Layout): Box {
  if (l.portrait) {
    if (scene === "home" || scene === "about") return portraitTop(a.id, scene, l);
    if (scene === "doodles") return lifted(portraitTop(a.id, "home", l));
  }
  return a.frames[scene];
}

export function yuBox(scene: SceneKey, l: Layout): Box {
  if (!l.portrait) return YU[scene];
  if (scene === "home") return { x: 8, y: FRAME_H - 333, w: 260, h: 333, r: 0, o: 1 };
  if (scene === "world") return { x: 8, y: FRAME_H - 298 + 16, w: 233, h: 298, r: 0, o: 1 };
  return { x: 8, y: FRAME_H - 298, w: 233, h: 298, r: 0, o: 0 };
}

export function dotFor(scene: SceneKey, l: Layout) {
  const d = DOT[scene];
  if (!l.portrait) return d;
  return scene === "home"
    ? { ...d, x: 24, y: 216, s: 56 }
    : { ...d, x: 20, y: 20, s: 56 };
}

/** The "?" card; in the space scene it covers the whole screen. */
export function cardBox(scene: SceneKey, l: Layout): Box {
  if (scene !== "mystery") return CARD[scene];
  const x0 = -l.ox - 30;
  const y0 = -l.oy - 30;
  const vw = l.W + 60;
  const vh = l.H + 60;
  const cx = x0 + vw / 2;
  const cy = y0 + vh / 2;
  // The card is rotated -90deg, so its unrotated box is the visual box turned on its side.
  return { x: cx - vh / 2, y: cy - vw / 2, w: vh, h: vw, r: -90, o: 1 };
}

export type DetailLayout = Detail & {
  /** Background fills the whole stage (object-fit: cover). */
  cover: boolean;
  fontSize: number;
};

/**
 * Portrait detail frames reuse the Figma geometry of Desktop 5 / 7 / 8, so the artwork lands on
 * the background exactly as designed. Each detail is cropped to the region that matters (the
 * artwork, its background and the title), scaled by one factor and centred on the screen.
 */
const FOCUS: Record<ArtId, { x0: number; x1: number; y0: number; y1: number }> = {
  gift: { x0: 100, x1: 960, y0: 200, y1: 700 },
  eye: { x0: 250, x1: 910, y0: 120, y1: 640 },
  mp3: { x0: 600, x1: 1390, y0: 100, y1: 1110 },
};

export function detailFor(a: Art, l: Layout): DetailLayout {
  const cover = a.id === "gift" && !l.portrait;
  if (!l.portrait) {
    const bg = cover ? { ...a.detail.bg, x: -l.ox, y: -l.oy, w: l.W, h: l.H } : a.detail.bg;
    return { ...a.detail, bg, cover, fontSize: 64 };
  }

  const f = FOCUS[a.id];
  const k = Math.min(1, (l.W - 24) / (f.x1 - f.x0), (l.H - 120) / (f.y1 - f.y0));
  const cx = (f.x0 + f.x1) / 2;
  const cy = (f.y0 + f.y1) / 2;
  const tx = (x: number) => (x - cx) * k + l.W / 2;
  // The gift background is a full-bleed drawing that runs off the bottom of the screen
  // (Desktop 5), so it is pinned to the bottom edge instead of being centred.
  const ty = (y: number) => (a.id === "gift" ? (y - FRAME_H) * k + l.H : (y - cy) * k + l.H / 2);
  const box = (b: Box): Box => ({ ...b, x: tx(b.x), y: ty(b.y), w: b.w * k, h: b.h * k });
  const { bg, text } = a.detail;

  return {
    ...a.detail,
    cover: false,
    fontSize: 64 * k,
    art: box(a.detail.art),
    bg: { ...bg, x: tx(bg.x), y: ty(bg.y), w: bg.w * k, h: bg.h * k },
    text: { ...text, box: box(text.box) },
  };
}

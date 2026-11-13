"use client";

/* Plain <img> is used on purpose: these elements tween width/height. */
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  ARTWORKS,
  CARD,
  DEFAULT_LAYOUT,
  artBox,
  cardBox,
  detailFor,
  dotFor,
  hangsFromTop,
  isWide,
  layoutFor,
  sceneOf,
  yuBox,
  type ArtId,
  type Box,
  type Layout,
} from "@/lib/scene";

/**
 * Gallery parallax: each item pans at (depth x camera). Depth 1 moves with the camera,
 * larger values are nearer to the viewer. Projects uses a fraction of this (see DEPTH_Y).
 */
const ART_DEPTH: Record<ArtId, number> = { gift: 1, eye: 1.12, mp3: 1.25 };
const CARD_DEPTH = 1.35;
const WORLD_TEXT_DEPTH = 0.85;
/** Vertical share of the depth effect on the Projects tree (kept tiny). */
const DEPTH_Y = 0.6;
/** Projects scrolls up the tree. */
const MAX_CAM_Y = 560;
/** Far layers (tree, rail) move less than the artworks. */
const FAR = 0.6;
const FAR_Y = 0.9;
/** On narrow screens Projects also pans sideways so every vine and box can be reached. */
const VINES_CENTER_X = 705;
const MAX_CAM_X_PROJECTS = 700;
/**
 * Mouse parallax on World. The pointer position (-1..1) moves each layer by
 * amount x depth, in design units. Negative depth moves against the pointer (far away),
 * larger positive values are nearer. Only mouse pointers drive it.
 */
const POINTER_X = 16;
const POINTER_Y = 10;
const POINTER_EASE = 0.1;
const POINTER_DEPTH = {
  far: -0.8,
  text: 0.3,
  card: 1.8,
  yu: 2.2,
  art: { gift: 0.6, eye: 1, mp3: 1.4 } as Record<ArtId, number>,
};
const WHEEL_SPEED = 1.6;
const CAM_EASE = 0.28;
/** Pointer travel (px) before a press counts as a drag instead of a tap. */
const DRAG_SLOP = 8;
/** Hovering the hanging rectangles on Home reacts fast. */
const PEEK_TRANSITION = "transform 200ms cubic-bezier(0.2, 0.9, 0.3, 1)";

const tween = (props: string[]) => props.map((p) => `${p} var(--dur) var(--ease)`).join(", ");
const tweenLong = (props: string[]) => props.map((p) => `${p} var(--dur-long) var(--ease)`).join(", ");

function boxStyle(b: Box, extra?: CSSProperties): CSSProperties {
  return {
    position: "absolute",
    left: 0,
    top: 0,
    width: b.w,
    height: b.h,
    opacity: b.o,
    transform: `translate(${b.x}px, ${b.y}px) rotate(${b.r}deg)`,
    transition: tween(["transform", "width", "height", "opacity"]),
    ...extra,
  };
}

const ICON_BACK = "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z";
const ICON_HOME = "M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z";

type HoverState = { id: ArtId; scene: string; by: "mouse" | "touch" };
type Metrics = Layout & { scale: number };

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const scene = sceneOf(pathname);
  const wide = isWide(scene);

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const lay: Layout = metrics ?? DEFAULT_LAYOUT;
  const { ox, oy } = lay;

  // Hover is tied to the scene it started in, so it cannot outlive the World page.
  const [hoverState, setHover] = useState<HoverState | null>(null);
  const hoverId = hoverState && hoverState.scene === scene ? hoverState.id : null;
  /** World: show the Desktop 5/7/8 detail. Home: the artwork peeks down. */
  const hover = scene === "world" ? hoverId : null;
  const peek = scene === "home" ? hoverId : null;
  const hoverByTouch = hover !== null && hoverState?.by === "touch";
  const [hoverCam, setHoverCam] = useState(0);
  // Camera position when the "?" card was clicked: the space opens in place, no scroll reset.
  const [holdCam, setHoldCam] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const farRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const nearRef = useRef<HTMLDivElement>(null);
  // x, y: camera. tx, ty: camera target. px, py: eased pointer. rx, ry: raw pointer (-1..1).
  const cam = useRef({ x: 0, y: 0, tx: 0, ty: 0, px: 0, py: 0, rx: 0, ry: 0 });
  const live = useRef({ scene, hover, scale: 1, lay: DEFAULT_LAYOUT as Layout });
  const dragMoved = useRef(false);
  const openedAt = useRef(0);
  const kick = useRef<() => void>(() => {});
  const fastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [fastPeek, setFastPeek] = useState(false);

  useEffect(() => {
    live.current.scene = scene;
    live.current.hover = hover;
    live.current.lay = lay;
    // Each scene owns one camera axis; the other returns to rest.
    if (scene !== "world" && scene !== "mystery" && !(scene === "projects" && lay.portrait)) cam.current.tx = 0;
    if (scene === "projects" && lay.portrait) {
      const t = (VINES_CENTER_X - lay.W / 2) / FAR;
      cam.current.tx = Math.max(0, Math.min(MAX_CAM_X_PROJECTS, t));
    }
    if (scene !== "projects") cam.current.ty = 0;
    kick.current();
  }, [scene, hover, lay]);

  // Fill the window exactly, whatever its shape.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // Measure the element that is actually painted (100dvh follows the mobile browser bars),
    // so the scale and the visible area can never disagree.
    const measure = () => {
      const { width, height } = root.getBoundingClientRect();
      if (!width || !height) return;
      const m = layoutFor(width, height);
      live.current.scale = m.scale;
      setMetrics(m);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  // Camera: World pans sideways, Projects scrolls up the tree.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;

    const write = (walking: boolean) => {
      const { x, y, px, py } = cam.current;
      const ptr = (depth: number) => `${px * POINTER_X * depth}px,${py * POINTER_Y * depth}px`;
      const pxo = (depth: number) => px * POINTER_X * depth;
      const pyo = (depth: number) => py * POINTER_Y * depth;
      if (farRef.current) {
        farRef.current.style.transform = `translate3d(${-x * FAR + pxo(POINTER_DEPTH.far)}px,${y * FAR_Y + pyo(POINTER_DEPTH.far)}px,0)`;
      }
      if (midRef.current) {
        midRef.current.style.transform = `translate3d(${-x}px,${y}px,0)`;
        // Per-item depth: extra offset relative to the mid layer, plus the pointer offset.
        midRef.current.querySelectorAll<HTMLElement>("[data-depth]").forEach((el) => {
          const d = Number(el.dataset.depth) - 1;
          const pd = Number(el.dataset.pdepth ?? 0);
          el.style.transform = `translate3d(${-x * d + pxo(pd)}px,${y * d * DEPTH_Y + pyo(pd)}px,0)`;
        });
      }
      // "yu" is pinned to the screen; she only walks in place while the camera moves.
      if (nearRef.current) {
        nearRef.current.style.transform = `translate3d(${ptr(POINTER_DEPTH.yu)},0)`;
        nearRef.current.dataset.walking = walking ? "1" : "0";
      }
    };

    const step = () => {
      raf = 0;
      const c = cam.current;
      const k = reduced.matches ? 1 : CAM_EASE;
      c.x += (c.tx - c.x) * k;
      c.y += (c.ty - c.y) * k;
      if (Math.abs(c.tx - c.x) < 0.05) c.x = c.tx;
      if (Math.abs(c.ty - c.y) < 0.05) c.y = c.ty;
      const moving = c.x !== c.tx || c.y !== c.ty;

      // Mouse parallax: World only, and not while a detail is open or motion is reduced.
      const on = !reduced.matches && live.current.scene === "world" && !live.current.hover;
      const gx = on ? c.rx : 0;
      const gy = on ? c.ry : 0;
      c.px += (gx - c.px) * POINTER_EASE;
      c.py += (gy - c.py) * POINTER_EASE;
      if (Math.abs(gx - c.px) < 0.001) c.px = gx;
      if (Math.abs(gy - c.py) < 0.001) c.py = gy;
      const pointerMoving = c.px !== gx || c.py !== gy;

      write(moving);
      if (moving || pointerMoving) raf = requestAnimationFrame(step);
    };
    kick.current = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };

    /** dx: sideways travel. dy: upward travel on Projects. Design units. */
    const pan = (dx: number, dy: number) => {
      const { scene: sc, hover: hv, lay: l } = live.current;
      if (hv) return;
      const c = cam.current;
      if (sc === "world") {
        // Stops when the last box (the "?" card) is centred.
        const max = Math.max(0, (CARD.world.x + CARD.world.w / 2 - (l.W / 2 - l.ox)) / CARD_DEPTH);
        c.tx = Math.max(0, Math.min(max, c.tx + dx));
      } else if (sc === "projects") {
        c.ty = Math.max(0, Math.min(MAX_CAM_Y, c.ty + dy));
        if (l.portrait) c.tx = Math.max(0, Math.min(MAX_CAM_X_PROJECTS, c.tx + dx));
      } else return;
      kick.current();
    };

    const onWheel = (e: WheelEvent) => {
      const sc = live.current.scene;
      if (sc !== "world" && sc !== "projects") return;
      e.preventDefault();
      const k = WHEEL_SPEED / live.current.scale;
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      // On World the wheel pans sideways; on Projects, scrolling up climbs the tree.
      if (sc === "world") pan(d * k, 0);
      else pan(e.deltaX * k, -e.deltaY * k);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") pan(160, 0);
      if (e.key === "ArrowLeft") pan(-160, 0);
      if (e.key === "ArrowUp") pan(0, 160);
      if (e.key === "ArrowDown") pan(0, -160);
    };
    let drag: { x: number; y: number; sx: number; sy: number } | null = null;
    const onDown = (e: PointerEvent) => {
      dragMoved.current = false;
      if ((e.target as HTMLElement).closest("a,button")) return;
      drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY };
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > DRAG_SLOP) dragMoved.current = true;
      const s = live.current.scale;
      pan((drag.x - e.clientX) / s, (e.clientY - drag.y) / s);
      drag.x = e.clientX;
      drag.y = e.clientY;
    };
    const onUp = () => {
      drag = null;
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      cam.current.rx = (e.clientX / window.innerWidth) * 2 - 1;
      cam.current.ry = (e.clientY / window.innerHeight) * 2 - 1;
      if (live.current.scene === "world") kick.current();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("pointermove", onPointer);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const startHover = (id: ArtId, by: "mouse" | "touch", at: number) => {
    cam.current.tx = cam.current.x; // freeze the camera while the detail shows
    setHoverCam(cam.current.x);
    openedAt.current = at;
    setHover({ id, scene, by });
  };
  const endHover = () => setHover(null);

  // Home: the three rectangles react together, and quickly.
  const homePeekStart = (id: ArtId) => {
    if (fastTimer.current) clearTimeout(fastTimer.current);
    setFastPeek(true);
    setHover({ id, scene, by: "mouse" });
  };
  const homePeekEnd = () => {
    setHover(null);
    // Keep the fast transition until the release has played, then restore the normal one.
    if (fastTimer.current) clearTimeout(fastTimer.current);
    fastTimer.current = setTimeout(() => setFastPeek(false), 400);
  };

  const hovering = hover !== null;
  const dim: CSSProperties = {
    opacity: hovering ? 0 : 1,
    transition: tween(["opacity"]),
  };
  const dot = dotFor(scene, lay);
  const inTree = scene === "projects";
  const treeVisible = wide;
  // Hanging things stay on the top edge of the screen, the character stays on the bottom edge.
  const topShift = hangsFromTop(scene) ? -oy : 0;
  const yu = yuBox(scene, lay);
  const yuShifted: Box = { ...yu, y: yu.y + oy };
  const card = cardBox(scene, lay);

  return (
    <div
      ref={rootRef}
      className="fixed top-0 left-0 h-dvh w-full touch-none overflow-hidden bg-white select-none"
      data-layout={lay.portrait ? "portrait" : "landscape"}
      style={{ ["--stage-w" as string]: `${lay.W}px` }}
    >
      <div
        className="absolute top-0 left-0"
        style={{
          width: lay.W,
          height: lay.H,
          transformOrigin: "0 0",
          transform: metrics ? `scale(${metrics.scale})` : undefined,
          visibility: metrics ? "visible" : "hidden",
        }}
      >
        {/* Origin of the Figma frame inside the stage */}
        <div className="pointer-events-none absolute inset-0" style={{ transform: `translate(${ox}px, ${oy}px)` }}>
          {/* FAR: hanging tree (Desktop 10) and the rail (Desktop 3) */}
          <div ref={farRef} className="pointer-events-none absolute inset-0" style={dim}>
            <div
              className="absolute inset-0"
              style={{
                opacity: treeVisible ? 1 : 0,
                transform: `translateY(${inTree ? 0 : -1300}px)`,
                transition: tweenLong(["transform", "opacity"]),
              }}
            >
              <img
                alt=""
                src="/ui/vines.svg"
                className="absolute block max-w-none"
                style={{ left: 257, top: -203, width: 882, height: 1268 }}
              />
              {/* "other projects" card hangs from the vines */}
              <div className="absolute inset-0">
                <div
                  className="absolute flex items-center justify-center"
                  style={{ left: 251, top: -175, width: 620, height: 883 }}
                >
                  <img
                    alt=""
                    src="/ui/projects-card.svg"
                    className="block max-w-none"
                    style={{ width: 470, height: 806, transform: "rotate(-11.38deg)" }}
                  />
                </div>
                <p className="absolute m-0 text-[32px] leading-normal" style={{ left: 526, top: 512, width: 219 }}>
                  other projects
                </p>
              </div>
              <div
                className="absolute flex items-center justify-center"
                style={{ left: 859, top: -31, width: 309, height: 326 }}
              >
                <div
                  className="border-[3px] border-black bg-[#d9d9d9]"
                  style={{ width: 268, height: 288, transform: "rotate(9.04deg)" }}
                />
              </div>
            </div>

            <p
              className="absolute m-0 text-[24px] leading-normal"
              style={{
                left: 685,
                top: 76,
                width: 219,
                opacity: scene === "world" ? 1 : 0,
                transition: tween(["opacity"]),
              }}
            >
              try interacting with me →
            </p>

            {/* The rail is pulled down to the foot of the tree: its 4 cords (x 42, 241, 441, 642 in the
                rail image) land on the tree's 4 vines when the rail sits at x 367 (Figma: "rail", Desktop 10). */}
            <div
              className="absolute inset-0"
              style={{
                opacity: treeVisible ? 1 : 0,
                transform: inTree ? "translate(-585px, 1073px)" : "translate(0, 0)",
                transition: tweenLong(["transform", "opacity"]),
              }}
            >
              <button
                type="button"
                aria-label="Pull the rail to see projects"
                disabled={scene !== "world"}
                onClick={() => router.push("/projects")}
                className="pointer-events-auto absolute block translate-y-0 cursor-pointer border-0 bg-transparent p-0 transition-[translate] duration-300 ease-out hover:translate-y-12 focus-visible:translate-y-12 active:translate-y-16 disabled:pointer-events-none"
                style={{ left: 952, top: -92, width: 706, height: 254 }}
              >
                <img alt="" src="/art/rail.png" className="block size-full max-w-none" draggable={false} />
              </button>
            </div>
          </div>

          {/* Hover detail (Desktop 5 / 7 / 8): background art sits under the artwork */}
          {ARTWORKS.map((a) => {
            const d = detailFor(a, lay);
            // The background opens as a circle that starts on the gallery rectangle and
            // travels with it to the detail position.
            const g = a.frames.world;
            const from = {
              x: g.x + g.w / 2 - hoverCam * ART_DEPTH[a.id] - d.bg.x,
              y: g.y + g.h / 2 - d.bg.y,
            };
            const to = {
              x: d.art.x + d.art.w / 2 - d.bg.x,
              y: d.art.y + d.art.h / 2 - d.bg.y,
            };
            const at = hover === a.id ? to : from;
            return (
              <img
                key={a.id}
                alt=""
                src={d.bg.src}
                className="pointer-events-none absolute block max-w-none"
                style={{
                  left: d.bg.x,
                  top: d.bg.y,
                  width: d.bg.w,
                  height: d.bg.h,
                  objectFit: d.cover ? "cover" : "fill",
                  clipPath: `circle(${hover === a.id ? 3200 : 0}px at ${at.x}px ${at.y}px)`,
                  transition: "clip-path var(--dur-circle) cubic-bezier(0.45, 0, 0.25, 1)",
                }}
              />
            );
          })}

          {/* MID: artworks, page content */}
          <div ref={midRef} className="pointer-events-none absolute inset-0">
            {/* The "?" card: glows on hover, grows into the gray space of Desktop 9 on click */}
            <div data-depth={CARD_DEPTH} data-pdepth={POINTER_DEPTH.card} className="pointer-events-none absolute inset-0">
              <button
                type="button"
                aria-label="Open the mystery space"
                disabled={scene !== "world"}
                onClick={() => {
                  setHoldCam(cam.current.x);
                  router.push("/mystery");
                }}
                className="card-glow pointer-events-auto cursor-pointer border-[3px] border-black bg-[#d9d9d9] p-0 disabled:pointer-events-none"
                style={boxStyle(
                  {
                    ...card,
                    x: card.x + (scene === "mystery" ? holdCam * CARD_DEPTH : 0),
                    o: hovering ? 0 : card.o,
                  },
                  { transition: `${tween(["transform", "width", "height", "opacity"])}, box-shadow 250ms ease` },
                )}
              >
                <span
                  className="absolute inset-0 flex items-center justify-center text-[64px] leading-none"
                  style={{ transform: "rotate(90deg)", opacity: scene === "world" ? 1 : 0, transition: tween(["opacity"]) }}
                >
                  ?
                </span>
              </button>
            </div>

            {ARTWORKS.map((a) => {
              const isHover = hover === a.id;
              const d = detailFor(a, lay);
              const base = artBox(a, scene, lay);
              const frame: Box = isHover
                ? { ...d.art, x: d.art.x + hoverCam * ART_DEPTH[a.id] }
                : { ...base, y: base.y + topShift, o: hovering ? 0 : base.o };
              // Home: all three rectangles are tugged down together, like pulling hanging cards.
              if (peek !== null) {
                frame.y += 44;
                frame.r *= 0.5;
              }
              const photo = wide || isHover;
              return (
                <div
                  key={a.id}
                  data-depth={ART_DEPTH[a.id]}
                  data-pdepth={POINTER_DEPTH.art[a.id]}
                  className="pointer-events-none absolute inset-0"
                >
                  <div
                    data-name={a.name}
                    style={boxStyle(
                      frame,
                      scene === "home" && fastPeek
                        ? { transition: `${PEEK_TRANSITION}, opacity var(--dur) var(--ease)` }
                        : undefined,
                    )}
                  >
                    <div
                      className="absolute inset-0 border-[3px] border-black bg-[#d9d9d9]"
                      style={{ opacity: photo ? 0 : 1, transition: tween(["opacity"]) }}
                    />
                    <img
                      alt={a.alt}
                      src={a.src}
                      draggable={false}
                      className="absolute inset-0 block size-full max-w-none"
                      style={{
                        opacity: photo && !(isHover && a.detail.artSrc) ? 1 : 0,
                        transition: tween(["opacity"]),
                      }}
                    />
                    {a.detail.artSrc && (
                      <img
                        alt=""
                        src={a.detail.artSrc}
                        draggable={false}
                        className={`absolute inset-0 block size-full max-w-none ${isHover && a.detail.blend ? "handoff" : ""}`}
                        style={{ opacity: isHover ? 1 : 0, transition: tween(["opacity"]) }}
                      />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Home: the hanging rectangles are buttons. Click drops them into the World gallery. */}
            {scene === "home" &&
              ARTWORKS.map((a) => {
                const f = artBox(a, "home", lay);
                return (
                  <button
                    key={a.id}
                    type="button"
                    aria-label="Open the world gallery"
                    onPointerEnter={(e) => e.pointerType === "mouse" && homePeekStart(a.id)}
                    onPointerLeave={(e) => e.pointerType === "mouse" && homePeekEnd()}
                    onFocus={(e) => e.currentTarget.matches(":focus-visible") && homePeekStart(a.id)}
                    onBlur={homePeekEnd}
                    onClick={() => router.push("/world")}
                    className="pointer-events-auto absolute m-0 cursor-pointer border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-black"
                    style={{
                      left: 0,
                      top: 0,
                      width: f.w,
                      height: f.h + 50,
                      transform: `translate(${f.x}px, ${f.y + topShift}px) rotate(${f.r}deg)`,
                    }}
                  />
                );
              })}

            {/* Stable hover targets at the gallery positions, so the artwork can move away.
                Mouse: hover. Touch: tap to open, tap anywhere to close. */}
            {scene === "world" &&
              ARTWORKS.map((a) => {
                const f = a.frames.world;
                return (
                  <div
                    key={a.id}
                    data-depth={ART_DEPTH[a.id]}
                    data-pdepth={POINTER_DEPTH.art[a.id]}
                    className="pointer-events-none absolute inset-0"
                  >
                    <div
                      tabIndex={0}
                      role="button"
                      aria-label={`Show details: ${a.alt}`}
                      onPointerEnter={(e) => e.pointerType === "mouse" && startHover(a.id, "mouse", e.timeStamp)}
                      onPointerLeave={(e) => e.pointerType === "mouse" && endHover()}
                      onPointerUp={(e) => {
                        if (e.pointerType !== "mouse" && !dragMoved.current) startHover(a.id, "touch", e.timeStamp);
                      }}
                      onFocus={(e) => e.currentTarget.matches(":focus-visible") && startHover(a.id, "mouse", e.timeStamp)}
                      onBlur={endHover}
                      className="pointer-events-auto absolute outline-offset-4 focus-visible:outline-2 focus-visible:outline-black"
                      style={{
                        left: 0,
                        top: 0,
                        width: f.w,
                        height: f.h,
                        transform: `translate(${f.x}px, ${f.y}px) rotate(${f.r}deg)`,
                      }}
                    />
                  </div>
                );
              })}

            {/* Page text sits above the shared cards so it is never covered by them */}
            <div
              key={pathname}
              data-depth={scene === "world" ? WORLD_TEXT_DEPTH : 1}
              data-pdepth={scene === "world" ? POINTER_DEPTH.text : 0}
              className="page pointer-events-none absolute inset-0"
              style={{ ...dim, left: scene === "mystery" ? holdCam : 0 }}
            >
              {children}
            </div>
          </div>

          {/* Multiplied copy of the detail artwork. It lives outside the mid layer because a
              transformed parent would stop mix-blend-mode from reaching the background art. */}
          {ARTWORKS.filter((a) => a.detail.blend && a.detail.artSrc).map((a) => (
            <div
              key={a.id}
              className="pointer-events-none"
              style={boxStyle(
                { ...detailFor(a, lay).art, o: hover === a.id ? 1 : 0 },
                {
                  mixBlendMode: "multiply",
                  transition: `opacity 120ms linear ${hover === a.id ? 440 : 0}ms`,
                },
              )}
            >
              <img alt="" src={a.detail.artSrc} draggable={false} className="block size-full max-w-none" />
            </div>
          ))}

          {/* NEAR: character, pinned to the bottom edge of the screen */}
          <div ref={nearRef} className="pointer-events-none absolute inset-0" style={dim}>
            <div data-name="yu" style={boxStyle(yuShifted)}>
              <img
                alt="Illustration of the artist, seen from behind"
                src="/art/yu.png"
                draggable={false}
                className="yu-walk block size-full max-w-none"
              />
            </div>
          </div>

          {/* Hover titles */}
          {ARTWORKS.map((a) => {
            const d = detailFor(a, lay);
            const t = d.text.box;
            return (
              <div
                key={a.id}
                className="pointer-events-none absolute"
                style={{
                  left: 0,
                  top: 0,
                  width: t.w,
                  height: t.h,
                  transform: `translate(${t.x}px, ${t.y}px) rotate(${t.r}deg)`,
                  opacity: hover === a.id ? 1 : 0,
                  transition: `opacity 300ms ease ${hover === a.id ? 450 : 0}ms`,
                }}
              >
                <p className="m-0 leading-normal" style={{ fontSize: d.fontSize }}>
                  {d.text.lines.map((line, i) => (
                    <span key={i} className="block min-h-[1.2em]">
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            );
          })}

          {/* Home / back dot: one element that moves between pages */}
          <div
            data-name="back"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: dot.s,
              height: dot.s,
              transform: `translate(${dot.x}px, ${dot.y}px)`,
              opacity: hovering ? 0 : 1,
              pointerEvents: hovering ? "none" : "auto",
              transition: tween(["transform", "width", "height", "opacity"]),
            }}
          >
            <Link
              href={dot.href}
              aria-label={dot.label}
              className="relative block size-full rounded-full bg-black text-white transition-transform duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
            >
              {[
                { d: ICON_HOME, show: scene === "home" },
                { d: ICON_BACK, show: scene !== "home" },
              ].map(({ d, show }) => (
                <svg
                  key={d}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="absolute inset-0 m-auto"
                  style={{ width: "62%", height: "62%", opacity: show ? 1 : 0, transition: tween(["opacity"]) }}
                >
                  <path d={d} />
                </svg>
              ))}
            </Link>
          </div>
        </div>

        {/* Touch: tap anywhere to close the detail */}
        {hoverByTouch && (
          <div
            className="absolute inset-0"
            onClick={(e) => {
              // The tap that opened the detail also produces a click; ignore it.
              if (e.timeStamp - openedAt.current > 400) endHover();
            }}
            role="presentation"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}

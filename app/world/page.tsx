import { Layer } from "@/components/Layer";

export const metadata = { title: "World · LK Portfolio" };

const COPY = "These are the worlds my OC’s are situated in. Bunch of random thoughts bundled together.";

/**
 * World content. The gallery artworks, the "?" card, the rail, "yu" and the back dot live in
 * the Shell so they can animate between pages.
 */
export default function World() {
  return (
    <>
      <div className="landscape-only absolute inset-0">
        <Layer x={128} y={185} w={432} h={300}>
          <div className="w-[432px] leading-normal">
            <h1 className="text-[64px] font-normal">Description</h1>
            <p className="mt-[64px] text-[32px]">{COPY}</p>
          </div>
        </Layer>
      </div>
      <div
        className="portrait-only absolute leading-normal"
        style={{ left: 24, top: 120, width: "min(calc(var(--stage-w) - 48px), 420px)" }}
      >
        <h1 className="text-[44px] font-normal">Description</h1>
        <p className="mt-[20px] text-[26px]">{COPY}</p>
      </div>
      {/* The gallery starts off-screen on narrow windows; say so */}
      <p className="portrait-only absolute m-0 text-[28px] leading-normal" style={{ left: 24, top: 470 }}>
        swipe →
      </p>
    </>
  );
}

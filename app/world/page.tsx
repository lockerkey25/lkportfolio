import { Layer } from "@/components/Layer";

export const metadata = { title: "World · LK Portfolio" };

/**
 * World content. The gallery artworks, the "?" card, the rail, "yu" and the back dot
 * live in the Shell so they can animate between pages.
 */
export default function World() {
  return (
    <Layer x={128} y={185} w={432} h={300}>
      <div className="w-[432px] leading-normal">
        <h1 className="text-[64px] font-normal">Description</h1>
        <p className="mt-[64px] text-[32px]">
          These are the worlds my OC’s are situated in. Bunch of random thoughts bundled together.
        </p>
      </div>
    </Layer>
  );
}

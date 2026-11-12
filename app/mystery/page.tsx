import { Layer } from "@/components/Layer";

export const metadata = { title: "Space · LK Portfolio" };

/** Placeholder for the "some 3d space" scene (Desktop 9). The gray panel is drawn by the Shell. */
export default function Mystery() {
  return (
    <>
      <div className="landscape-only absolute inset-0">
        <Layer x={391} y={470} w={470} h={230}>
          <h1 className="w-[470px] text-[64px] leading-normal font-normal">some 3d space</h1>
        </Layer>
      </div>
      <h1
        className="portrait-only absolute left-1/2 m-0 w-[min(calc(var(--stage-w)-48px),420px)] -translate-x-1/2 text-center text-[48px] leading-normal font-normal"
        style={{ top: 460 }}
      >
        some 3d space
      </h1>
    </>
  );
}

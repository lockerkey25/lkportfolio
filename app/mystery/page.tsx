import { Layer } from "@/components/Layer";

export const metadata = { title: "Space · LK Portfolio" };

/** Placeholder for the "some 3d space" scene (Desktop 9). The gray panel is drawn by the Shell. */
export default function Mystery() {
  return (
    <Layer x={391} y={470} w={470} h={230}>
      <h1 className="w-[470px] text-[64px] leading-normal font-normal">some 3d space</h1>
    </Layer>
  );
}

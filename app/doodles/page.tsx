import { Layer } from "@/components/Layer";

export const metadata = { title: "Art and doodles · LK Portfolio" };

/** Doodles content. The back dot (sitting in the "o" of "doodles") lives in the Shell. */
export default function Doodles() {
  return (
    <>
      <Layer x={84} y={143} w={1022} h={150}>
        <h1 className="w-[1022px] text-[96px] leading-normal font-normal">Art and doodles!</h1>
      </Layer>

      <Layer x={84} y={326} w={811} h={570}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src="/ui/doodle-canvas.svg" className="block h-[570px] w-[811px] max-w-none" />
      </Layer>

      {/* Placeholder: will become an interactive drawing canvas */}
      <Layer x={1025} y={326} w={320} h={570}>
        <button type="button" className="relative block h-[570px] w-[320px] cursor-pointer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" src="/ui/doodle-button.svg" className="absolute inset-0 block size-full max-w-none" />
          <span className="absolute top-[120px] left-[104px] text-left text-[32px] leading-normal">
            Doodle
            <br />
            smth?
          </span>
        </button>
      </Layer>
    </>
  );
}

import Image from "next/image";
import { Layer } from "@/components/Layer";

export const metadata = { title: "About · LK Portfolio" };

/** About content. The three stacked cards and the back dot live in the Shell. */
export default function About() {
  return (
    <>
      <Layer x={225} y={397} w={756} h={572}>
        <Image src="/art/about-1.png" alt="Doodle of a speech bubble saying Hi" width={756} height={572} />
      </Layer>
      <Layer x={137} y={571} w={176} h={223}>
        <Image src="/art/about-2.png" alt="Doodle of an apple" width={176} height={223} />
      </Layer>
      <Layer x={313} y={738} w={179} h={180}>
        <Image src="/art/about-3.png" alt="Doodle of a cup" width={179} height={180} />
      </Layer>
      <Layer x={472} y={616} w={209} h={280}>
        <Image src="/art/about-4.png" alt="Doodle of an mp3 player" width={209} height={280} />
      </Layer>

      <Layer x={855} y={307} w={432} h={300}>
        <div className="w-[432px] leading-normal">
          <h1 className="text-[64px] font-normal">About</h1>
          <p className="mt-[64px] text-[32px]">Hallo! lockerkey25 here</p>
          <p className="mt-[96px] text-[32px]">contact</p>
        </div>
      </Layer>
    </>
  );
}

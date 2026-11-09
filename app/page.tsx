import Link from "next/link";
import { Layer } from "@/components/Layer";

function NavTab({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block h-[79px] w-[466px] bg-black pt-[19px] pl-[35px] text-[48px] leading-normal whitespace-nowrap text-white transition-transform duration-200 hover:-translate-x-3 focus-visible:-translate-x-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
    >
      {label}
    </Link>
  );
}

/** A hand-drawn connector line from the wireframe, rotated about its centre. */
function Line({
  src,
  x,
  y,
  w,
  h,
  rotate,
  length,
}: {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
  length: number;
}) {
  return (
    <Layer x={x} y={y} w={w} h={h} rotate={rotate}>
      <div className="relative h-0" style={{ width: length }}>
        <div className="absolute inset-[-3px_0_0_0]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" src={src} className="block size-full max-w-none" />
        </div>
      </div>
    </Layer>
  );
}

/** Home content. The hanging rectangles, the home dot and "yu" live in the Shell. */
export default function Home() {
  return (
    <>
      <Layer x={762} y={286} w={466} h={79}>
        <NavTab href="/about" label="About" />
      </Layer>
      <Layer x={755} y={512} w={471} h={120} rotate={-5.12}>
        <NavTab href="/doodles" label="Doodles :)" />
      </Layer>
      <Layer x={762} y={663} w={468} h={93} rotate={-1.74}>
        <NavTab href="/world" label="World" />
      </Layer>
      <Layer x={752} y={788} w={469} h={97} rotate={2.28}>
        <NavTab href="/projects" label="projects" />
      </Layer>

      <Layer x={740} y={710} w={35} h={126}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src="/ui/connector.svg" className="block h-[126px] w-[35px] max-w-none" />
      </Layer>

      <Line src="/ui/line-1.svg" x={1183} y={322} w={276} h={14} rotate={177.1} length={276.355} />
      <Line src="/ui/line-2.svg" x={807} y={439} w={652} h={17} rotate={-178.5} length={652.222} />
      <Line src="/ui/line-3.svg" x={1155} y={567} w={285} h={14} rotate={177.19} length={285.344} />
      <Line src="/ui/line-4.svg" x={1213} y={695} w={246} h={11} rotate={-177.44} length={246.246} />
      <Line src="/ui/line-5.svg" x={1155} y={838} w={304} h={0} rotate={180} length={304} />
    </>
  );
}

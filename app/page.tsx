import Link from "next/link";
import { Layer } from "@/components/Layer";

const TABS = [
  { href: "/about", label: "About", rotate: 0 },
  { href: "/doodles", label: "Doodles :)", rotate: -5.12 },
  { href: "/world", label: "World", rotate: -1.74 },
  { href: "/projects", label: "projects", rotate: 2.28 },
];

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

/**
 * A straight hand-placed line from the wireframe. It runs off the right edge of the screen,
 * so it is extended far past the frame and never ends in the middle of a wide window.
 */
function Line({
  x,
  y,
  w,
  h,
  rotate,
  length,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
  length: number;
}) {
  // Rotated past 90deg, the right-hand end of the line is the start of its local axis.
  const extendFromStart = Math.abs(rotate) > 90;
  return (
    <Layer x={x} y={y} w={w} h={h} rotate={rotate}>
      <div className="relative h-0" style={{ width: length }}>
        <div className="absolute top-[-3px] left-0 h-[3px] bg-black" style={{ width: length }} />
        <div
          className="absolute top-[-3px] h-[3px] bg-black"
          style={{ width: 4000, ...(extendFromStart ? { right: "100%" } : { left: "100%" }) }}
        />
      </div>
    </Layer>
  );
}

/** Home content. The hanging rectangles, the home dot and "yu" live in the Shell. */
export default function Home() {
  return (
    <>
      <div className="landscape-only absolute inset-0">
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

        <Line x={1183} y={322} w={276} h={14} rotate={177.1} length={276.355} />
        <Line x={807} y={439} w={652} h={17} rotate={-178.5} length={652.222} />
        <Line x={1155} y={567} w={285} h={14} rotate={177.19} length={285.344} />
        <Line x={1213} y={695} w={246} h={11} rotate={-177.44} length={246.246} />
        <Line x={1155} y={838} w={304} h={0} rotate={180} length={304} />
      </div>

      {/* Phones: the four tabs stack in one column */}
      <nav
        className="portrait-only absolute left-1/2 flex w-[min(calc(var(--stage-w)-56px),420px)] -translate-x-1/2 flex-col gap-[22px]"
        style={{ top: 292 }}
      >
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="block h-[72px] w-full bg-black pt-[14px] pl-[28px] text-[40px] leading-normal whitespace-nowrap text-white transition-transform duration-200 hover:-translate-x-2 focus-visible:-translate-x-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
            style={{ transform: `rotate(${t.rotate}deg)` }}
          >
            {t.label}
          </Link>
        ))}
      </nav>
    </>
  );
}

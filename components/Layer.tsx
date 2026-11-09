import type { ReactNode } from "react";

type LayerProps = {
  /** Wrapper box in design px (the rotated bounding box, as Figma reports it). */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Rotation in degrees, applied to the centred child. */
  rotate?: number;
  className?: string;
  children?: ReactNode;
};

/** Absolutely positioned slot in the 1440x1024 design frame. */
export function Layer({ x, y, w, h, rotate = 0, className = "", children }: LayerProps) {
  return (
    <div
      className={`absolute flex items-center justify-center ${className}`}
      style={{ left: x, top: y, width: w, height: h }}
    >
      <div className="flex-none" style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}>
        {children}
      </div>
    </div>
  );
}

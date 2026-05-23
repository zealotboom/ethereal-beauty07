"use client";

import { useEffect, useState } from "react";

export default function AnimatedCursor() {
  const [point, setPoint] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const move = (event: MouseEvent) => setPoint({ x: event.clientX, y: event.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
      className="pointer-events-none fixed z-50 hidden h-3 w-3 rounded-full bg-gold shadow-[0_0_24px_rgba(201,168,76,0.85)] transition-transform duration-300 md:block"
      style={{ transform: `translate3d(${point.x - 6}px, ${point.y - 6}px, 0)` }}
    />
  );
}

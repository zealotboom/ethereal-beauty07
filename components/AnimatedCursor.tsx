"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// tiny SVG whale that swims and wiggles
function WhaleIcon({ angle }: { angle: number }) {
  return (
    <svg
      width="36" height="22" viewBox="0 0 36 22" fill="none"
      style={{ transform: `rotate(${angle}deg)`, transition: "transform 0.15s ease" }}
    >
      {/* body */}
      <ellipse cx="16" cy="11" rx="13" ry="7" fill="#00b4d8" opacity="0.92"/>
      {/* tail fin */}
      <path d="M29 8 C34 4, 36 2, 35 11 C36 20, 34 18, 29 14 Z" fill="#0077b6" opacity="0.85"/>
      {/* belly */}
      <ellipse cx="15" cy="13" rx="8" ry="3.5" fill="#90e0ef" opacity="0.6"/>
      {/* eye */}
      <circle cx="8" cy="9" r="1.5" fill="#fff"/>
      <circle cx="8.5" cy="9" r="0.7" fill="#023e8a"/>
      {/* top fin */}
      <path d="M14 4 C16 0, 20 1, 20 4" fill="#0096c7" opacity="0.8"/>
      {/* smile */}
      <path d="M6 12 Q8 14 10 12" stroke="#fff" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
      {/* bubble */}
      <circle cx="4" cy="7" r="1" fill="#90e0ef" opacity="0.5"/>
      <circle cx="2" cy="5" r="0.6" fill="#90e0ef" opacity="0.3"/>
    </svg>
  );
}

export default function AnimatedCursor() {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const prevX  = useRef(-100);
  const [angle, setAngle] = useState(0);
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number }[]>([]);

  const springX = useSpring(mouseX, { stiffness: 120, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 18 });

  useEffect(() => {
    let bubbleId = 0;
    const move = (e: MouseEvent) => {
      const dx = e.clientX - prevX.current;
      // tilt whale based on direction
      setAngle(dx > 0 ? 8 : dx < 0 ? -8 : 0);
      prevX.current = e.clientX;
      mouseX.set(e.clientX - 18);
      mouseY.set(e.clientY - 11);

      // occasionally emit a bubble
      if (Math.random() < 0.08) {
        const id = bubbleId++;
        setBubbles((b) => [...b, { id, x: e.clientX, y: e.clientY }]);
        setTimeout(() => setBubbles((b) => b.filter((bub) => bub.id !== id)), 900);
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [mouseX, mouseY]);

  return (
    <>
      {/* whale cursor */}
      <motion.div
        className="pointer-events-none fixed z-[9999] hidden md:block"
        style={{ x: springX, y: springY }}
      >
        <WhaleIcon angle={angle} />
      </motion.div>

      {/* floating bubbles trail */}
      {bubbles.map((b) => (
        <motion.div
          key={b.id}
          className="pointer-events-none fixed z-[9998] h-2 w-2 rounded-full border border-[#00b4d8] bg-[rgba(0,180,216,0.3)]"
          initial={{ x: b.x - 4, y: b.y - 4, scale: 0.4, opacity: 0.8 }}
          animate={{ y: b.y - 40, scale: 1.2, opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

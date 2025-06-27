"use client";
import { useEffect } from "react";

export default function LenisScroll() {
  useEffect(() => {
    import("lenis").then(({ default: Lenis }) => {
      const lenis = new Lenis({
        lerp: 0.1,
        duration: 1.2,
      });
      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    });
  }, []);
  return null;
}

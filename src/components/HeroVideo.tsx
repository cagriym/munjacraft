"use client";
import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

export default function HeroVideo() {
  const videoWrapperRef = useRef<HTMLDivElement>(null);

  const scrollY = useMotionValue(0);
  useEffect(() => {
    const handleScroll = () => scrollY.set(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollY]);

  const scale = useTransform(scrollY, [0, 400], [1, 0.8]);

  const BAR_HEIGHT = 0;

  return (
    <div className="w-full h-screen relative">
      <div className="w-full h-full flex items-center justify-center relative">
        {/* Cinematic Bars */}
        <motion.div
          className="absolute left-0 top-0 w-full bg-black pointer-events-none z-10"
          initial={{ height: "50vh" }}
          animate={{ height: BAR_HEIGHT }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-0 bottom-0 w-full bg-black pointer-events-none z-10"
          initial={{ height: "50vh" }}
          animate={{ height: BAR_HEIGHT }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        {/* Video */}
        <motion.div
          ref={videoWrapperRef}
          className="w-full h-full flex items-center justify-center relative overflow-hidden"
          style={{ scale }}
        >
          <video
            src="/CraftRise.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>
    </div>
  );
}

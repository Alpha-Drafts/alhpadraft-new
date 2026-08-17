"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ParallaxFloatProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  delay?: number;
}

export function ParallaxFloat({
  children,
  className = "",
  speed = 20,
  delay = 0,
}: ParallaxFloatProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-speed / 2, speed / 2, -speed / 2],
        x: [-speed / 4, speed / 4, -speed / 4],
        rotate: [-1, 1, -1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

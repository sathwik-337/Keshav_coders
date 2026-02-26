"use client";

import { motion } from "framer-motion";

export default function Waveform({ active, color = "bg-white" }: { active: boolean; color?: string }) {
  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className={`w-1.5 rounded-full ${color}`}
          animate={{
            height: active ? [8, 24, 8] : 4,
            opacity: active ? 1 : 0.5,
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

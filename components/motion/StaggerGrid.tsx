"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function StaggerGrid({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div className={className} variants={container} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}

export function StaggerItem({ className, children, style }: { className?: string; children: ReactNode; style?: React.CSSProperties }) {
  return (
    <motion.div className={className} style={style} variants={item} whileHover={{ y: -3, transition: { duration: 0.15 } }}>
      {children}
    </motion.div>
  );
}

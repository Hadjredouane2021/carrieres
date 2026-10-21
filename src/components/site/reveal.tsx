"use client";

import { motion, useReducedMotion } from "framer-motion";

const tags = { div: motion.div, li: motion.li, p: motion.p, h1: motion.h1, h2: motion.h2 };

export function Reveal({
  as = "div",
  delay = 0,
  className,
  children,
}: {
  as?: keyof typeof tags;
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const Tag = tags[as];

  return (
    <Tag
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 1.2, delay: delay * 2, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}

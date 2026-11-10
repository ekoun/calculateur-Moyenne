import * as React from "react";
import { motion } from "motion/react";
import { MSLogo } from "./ms-logo";

/**
 * Simple full‑screen splash/loading indicator.  It just spins the
 * corporate logo until whatever is being awaited has finished.
 */
export function LoadingPage() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <motion.div
        className="flex items-center justify-center rounded-2xl border border-border bg-card/80 p-5 shadow-lg shadow-primary/10"
        animate={{
          rotate: 360,
          scale: [1, 1.06, 1],
          opacity: [0.85, 1, 0.9],
        }}
        transition={{
          rotate: { repeat: Infinity, duration: 2.2, ease: "linear" },
          scale: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <MSLogo className="h-20 w-20 drop-shadow-[0_10px_24px_rgba(168,85,247,0.18)]" />
      </motion.div>
    </div>
  );
}

import * as React from "react";
import { motion } from "motion/react";
import { MSLogo } from "./ms-logo";

/**
 * Simple full‑screen splash/loading indicator.  It just spins the
 * corporate logo until whatever is being awaited has finished.
 */
export function LoadingPage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-slate-950 z-50">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <MSLogo className="h-24 w-24" />
      </motion.div>
    </div>
  );
}

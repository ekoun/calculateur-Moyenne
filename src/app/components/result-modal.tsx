import { X, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  moyenne: number;
  type: "ECUE" | "UE" | "Semestre";
  statut?: string;
  totalCredits?: number;
  onSave?: () => void;
}

export function ResultModal({
  isOpen,
  onClose,
  moyenne,
  type,
  statut,
  totalCredits,
  onSave,
}: ResultModalProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  /* ── Escape key ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  /* ── Body scroll lock ── */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  /* ── Animated number counter ── */
  useEffect(() => {
    if (!isOpen) { setDisplayValue(0); return; }

    const startTs = performance.now();
    const duration = 1100;

    const tick = (now: number) => {
      const progress = Math.min((now - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplayValue(Number((eased * moyenne).toFixed(2)));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isOpen, moyenne]);

  /* ── Status config ── */
  const getStatutConfig = () => {
    if (type === "Semestre" && statut) {
      if (statut === "Admis") return { icon: CheckCircle2, color: "text-secondary", bg: "bg-secondary/10", label: statut };
      if (statut === "Rattrapage") return { icon: AlertCircle, color: "text-warning", bg: "bg-warning/10", label: statut };
      return { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: statut };
    }
    return moyenne >= 10
      ? { icon: CheckCircle2, color: "text-secondary", bg: "bg-secondary/10", label: "Validé" }
      : { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Non validé" };
  };

  const config = getStatutConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* Modal wrapper — bottom sheet on mobile, centered on sm+ */}
          <div className="fixed inset-0 z-[101] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
            <motion.div
              className="pointer-events-auto bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl overflow-hidden"
              initial={{ y: 72, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 72, opacity: 0, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
            >
              {/* Drag handle (mobile) */}
              <div className="sm:hidden flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-muted-foreground/25 rounded-full" />
              </div>

              {/* Close button */}
              <div className="flex justify-end px-5 pt-3 sm:pt-5 pb-0">
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="px-6 sm:px-8 pb-2 space-y-5">
                {/* Icon */}
                <motion.div
                  className="flex justify-center"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.12 }}
                >
                  <div className={`${config.bg} p-4 rounded-2xl`}>
                    <Icon className={`h-14 w-14 ${config.color}`} />
                  </div>
                </motion.div>

                {/* Title */}
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.18 }}
                >
                  <h2 className="text-xl font-bold text-foreground">Calcul terminé</h2>
                  <p className="text-sm text-muted-foreground mt-1">Résultat de la moyenne {type}</p>
                </motion.div>

                {/* Score */}
                <motion.div
                  className="bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 rounded-2xl p-5 border border-border text-center space-y-2"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.22 }}
                >
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Moyenne {type}
                  </p>
                  <div className="text-6xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent tabular-nums">
                    {displayValue.toFixed(2)}
                  </div>
                  <p className="text-muted-foreground text-sm">/ 20</p>
                  {totalCredits ? (
                    <p className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                      {totalCredits} crédits ECTS
                    </p>
                  ) : null}
                </motion.div>

                {/* Status badge */}
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 24, delay: 0.35 }}
                >
                  <div className={`${config.bg} ${config.color} px-8 py-3 rounded-xl font-bold text-base flex items-center gap-2`}>
                    <Icon className="h-4 w-4" />
                    {config.label}
                  </div>
                </motion.div>

                {statut === "Rattrapage" && (
                  <motion.div
                    className="bg-warning/5 border border-warning/20 rounded-xl p-3 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                  >
                    <p className="text-sm text-warning font-medium">Session de rattrapage requise</p>
                  </motion.div>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-border p-5 sm:p-6 space-y-2.5 mt-4">
                {onSave && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { onSave(); onClose(); }}
                    className="w-full flex items-center justify-center gap-2 h-12 px-6 bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground rounded-xl hover:shadow-lg hover:shadow-secondary/25 transition-shadow font-semibold"
                  >
                    Sauvegarder dans l'historique
                  </motion.button>
                )}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className="w-full h-12 px-6 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors font-semibold"
                >
                  Continuer
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

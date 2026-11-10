import { useState } from "react";
import { Plus, Trash2, Calculator } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResultModal } from "./result-modal";
import { fadeDown, scaleIn } from "./animations";

interface Devoir {
  id: string;
  note: number;
}

export function EcuePage() {
  const [devoirs, setDevoirs] = useState<Devoir[]>([{ id: "1", note: 0 }]);
  const [noteExamen, setNoteExamen] = useState<number>(0);
  const [moyenneEcue, setMoyenneEcue] = useState<number | null>(null);
  const [nomEcue, setNomEcue] = useState<string>("");
  const [showModal, setShowModal] = useState(false);

  const calculateMoyenne = () => {
    if (devoirs.length === 0 || devoirs.every((d) => d.note === 0)) {
      toast.error("Veuillez entrer au moins une note de devoir");
      return;
    }

    const sommeDevoirs = devoirs.reduce((sum, d) => sum + d.note, 0);
    const moyenneDevoirs = sommeDevoirs / devoirs.length;
    const moyenne = noteExamen > 0 ? moyenneDevoirs * 0.4 + noteExamen * 0.6 : moyenneDevoirs;

    setMoyenneEcue(Number(moyenne.toFixed(2)));
    setShowModal(true);
  };

  const addDevoir = () => {
    const newId = (Math.max(...devoirs.map((d) => parseInt(d.id)), 0) + 1).toString();
    setDevoirs([...devoirs, { id: newId, note: 0 }]);
  };

  const removeDevoir = (id: string) => {
    if (devoirs.length > 1) {
      setDevoirs(devoirs.filter((d) => d.id !== id));
    } else {
      toast.error("Vous devez avoir au moins un devoir");
    }
  };

  const updateDevoir = (id: string, note: number) => {
    setDevoirs(
      devoirs.map((d) =>
        d.id === id ? { ...d, note: Math.min(20, Math.max(0, note)) } : d
      )
    );
  };

  const saveToHistory = () => {
    if (moyenneEcue === null || !nomEcue.trim()) {
      toast.error("Veuillez calculer la moyenne et entrer un nom pour l'ECUE");
      return;
    }
    try {
      const history = JSON.parse(localStorage.getItem("ecueHistory") || "[]");
      history.push({
        id: Date.now().toString(),
        nom: nomEcue,
        moyenne: moyenneEcue,
        date: new Date().toISOString(),
        type: "ECUE",
        devoirs: devoirs.map((d) => d.note),
        examen: noteExamen,
      });
      localStorage.setItem("ecueHistory", JSON.stringify(history));
      toast.success("Calcul enregistré avec succès");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
    setNomEcue("");
    setDevoirs([{ id: "1", note: 0 }]);
    setNoteExamen(0);
    setMoyenneEcue(null);
  };

  const moyenneDevoirs =
    devoirs.reduce((sum, d) => sum + d.note, 0) / devoirs.length;

  return (
    <div className="max-w-5xl mx-auto pt-2 sm:pt-3 space-y-5 sm:space-y-6">
      {/* Header */}
      <motion.div
        variants={fadeDown}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          Calcul Moyenne ECUE
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Calculez automatiquement votre moyenne ECUE selon le système LMD
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-medium">
          <Calculator className="h-4 w-4 shrink-0" />
          <span>Formule : (Moy. devoirs × 0,4) + (Examen × 0,6)</span>
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -2, scale: 1.002 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">
          {/* Nom ECUE */}
          <div className="space-y-2">
            <label htmlFor="nomEcue" className="block text-sm font-semibold text-foreground">
              Nom de l'ECUE
            </label>
            <Input
              id="nomEcue"
              type="text"
              value={nomEcue}
              onChange={(e) => setNomEcue(e.target.value)}
              placeholder="Ex: Programmation Web Avancée"
              className="h-12 rounded-xl"
            />
          </div>

          {/* Devoirs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Notes de Devoirs
              </h3>
              <div className="px-3 py-1.5 bg-secondary/10 text-secondary rounded-lg text-sm font-semibold">
                Moy: {moyenneDevoirs.toFixed(2)}/20
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {devoirs.map((devoir, index) => (
                <motion.div
                  key={devoir.id}
                  layout
                  initial={{ opacity: 0, x: -12, y: 6 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: 12, y: -6, scale: 0.985 }}
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-2.5"
                >
                  <div className="shrink-0 w-24 sm:w-28 px-3 py-2.5 bg-muted rounded-lg text-center">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Devoir {index + 1}
                    </span>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={devoir.note || ""}
                    onChange={(e) =>
                      updateDevoir(devoir.id, parseFloat(e.target.value) || 0)
                    }
                    placeholder="/ 20"
                    className="flex-1 h-12 rounded-xl"
                  />
                  {devoirs.length > 1 && (
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDevoir(devoir.id)}
                        className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.div whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.99 }} transition={{ duration: 0.18 }}>
              <Button
                variant="outline"
                onClick={addDevoir}
                className="w-full h-12 border-dashed border-2 rounded-xl text-muted-foreground hover:text-secondary hover:border-secondary hover:bg-secondary/5 font-medium transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un devoir
              </Button>
            </motion.div>
          </div>

          {/* Examen */}
          <div className="space-y-2">
            <label htmlFor="noteExamen" className="block text-sm font-semibold text-foreground">
              Note d'Examen (facultative)
            </label>
            <Input
              id="noteExamen"
              type="number"
              min="0"
              max="20"
              step="0.5"
              value={noteExamen || ""}
              onChange={(e) => {
                const value = e.target.value;
                setNoteExamen(value === "" ? 0 : Math.min(20, Math.max(0, parseFloat(value) || 0)));
              }}
              placeholder="Laisser vide si la note n'est pas encore disponible"
              className="h-12 rounded-xl"
            />
          </div>

          {/* Calculate */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ boxShadow: "0 8px 30px rgba(155,44,155,0.30)" }}
            onClick={calculateMoyenne}
            className="w-full flex items-center justify-center gap-3 h-14 px-6 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-semibold text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-shadow"
          >
            <Calculator className="h-5 w-5" />
            Calculer la moyenne ECUE
          </motion.button>
        </div>
      </motion.div>

      {moyenneEcue !== null && (
        <ResultModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          moyenne={moyenneEcue}
          type="ECUE"
          onSave={saveToHistory}
        />
      )}
    </div>
  );
}

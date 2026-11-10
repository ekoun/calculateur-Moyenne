import { useState } from "react";
import { Plus, Trash2, Calculator } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResultModal } from "./result-modal";
import { fadeDown, scaleIn } from "./animations";

interface UE {
  id: string;
  nom: string;
  moyenne: number;
  credits: number;
}

export function SemestrePage() {
  const [ues, setUes] = useState<UE[]>([{ id: "1", nom: "", moyenne: 0, credits: 1 }]);
  const [nomSemestre, setNomSemestre] = useState<string>("");
  const [moyenneSemestre, setMoyenneSemestre] = useState<number | null>(null);
  const [statut, setStatut] = useState<string>("");
  const [showModal, setShowModal] = useState(false);

  const calculateMoyenneSemestre = () => {
    const uesValides = ues.filter((u) => u.nom.trim() && u.moyenne > 0 && u.credits > 0);

    if (uesValides.length === 0) {
      toast.error("Veuillez entrer au moins une UE complète avec sa moyenne et ses crédits");
      return;
    }

    const totalCredits = uesValides.reduce((sum, u) => sum + u.credits, 0);
    const moyennePonderee = uesValides.reduce((sum, u) => sum + u.moyenne * u.credits, 0);
    const moyenne = moyennePonderee / totalCredits;
    setMoyenneSemestre(Number(moyenne.toFixed(2)));
    setStatut(moyenne >= 10 ? "Admis" : moyenne >= 8 ? "Rattrapage" : "Ajourné");
    setShowModal(true);
  };

  const addUe = () => {
    const newId = (Math.max(...ues.map((u) => parseInt(u.id)), 0) + 1).toString();
    setUes([...ues, { id: newId, nom: "", moyenne: 0, credits: 1 }]);
  };

  const removeUe = (id: string) => {
    if (ues.length > 1) {
      setUes(ues.filter((u) => u.id !== id));
    } else {
      toast.error("Vous devez avoir au moins une UE");
    }
  };

  const updateUe = (id: string, field: keyof UE, value: string | number) => {
    setUes(
      ues.map((u) => {
        if (u.id !== id) return u;

        if (field === "moyenne") {
          const numericValue = value === "" ? 0 : Number(value);
          return { ...u, moyenne: Number.isFinite(numericValue) ? Math.min(20, Math.max(0, numericValue)) : 0 };
        }

        if (field === "credits") {
          const numericValue = value === "" ? 0 : Number(value);
          return { ...u, credits: Number.isFinite(numericValue) ? Math.max(0, numericValue) : 0 };
        }

        return { ...u, [field]: value };
      })
    );
  };

  const saveToHistory = () => {
    if (moyenneSemestre === null || !nomSemestre.trim()) {
      toast.error("Veuillez calculer la moyenne et entrer un nom pour le semestre");
      return;
    }
    try {
      const history = JSON.parse(localStorage.getItem("ecueHistory") || "[]");
      history.push({
        id: Date.now().toString(),
        nom: nomSemestre,
        moyenne: moyenneSemestre,
        date: new Date().toISOString(),
        type: "Semestre",
        statut,
        ues: ues.filter((u) => u.nom.trim()).map((u) => ({ nom: u.nom, moyenne: u.moyenne, credits: u.credits })),
        totalCredits: ues.reduce((sum, u) => sum + u.credits, 0),
      });
      localStorage.setItem("ecueHistory", JSON.stringify(history));
      toast.success("Calcul enregistré avec succès");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
    setNomSemestre("");
    setUes([{ id: "1", nom: "", moyenne: 0, credits: 1 }]);
    setMoyenneSemestre(null);
    setStatut("");
  };

  const totalCredits = ues.reduce((sum, u) => sum + u.credits, 0);

  return (
    <div className="max-w-5xl mx-auto pt-2 sm:pt-3 space-y-5 sm:space-y-6">
      {/* Header */}
      <motion.div variants={fadeDown} initial="hidden" animate="visible" className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Calcul Moyenne Semestre</h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Calculez votre moyenne générale du semestre avec le statut académique
        </p>
        {/* Status legend — utilise le token --warning au lieu de orange-500 hardcodé */}
        <div className="flex flex-wrap gap-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 text-secondary rounded-xl text-sm font-medium">
            ✓ Admis: ≥ 10/20
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-warning/10 text-warning rounded-xl text-sm font-medium">
            ⚠ Rattrapage: 8‑10/20
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-destructive/10 text-destructive rounded-xl text-sm font-medium">
            ✗ Ajourné: &lt; 8/20
          </div>
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
          {/* Nom Semestre */}
          <div className="space-y-2">
            <label htmlFor="nomSemestre" className="block text-sm font-semibold text-foreground">
              Nom du Semestre
            </label>
            <Input
              id="nomSemestre"
              type="text"
              value={nomSemestre}
              onChange={(e) => setNomSemestre(e.target.value)}
              placeholder="Ex: Semestre 1 – Année 2025/2026"
              className="h-12 rounded-xl"
            />
          </div>

          {/* UE list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-foreground">Liste des UE</h3>
              <div className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-semibold">
                Total: {totalCredits} crédits
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {ues.map((ue, index) => (
                <motion.div
                  key={ue.id}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985, y: -8 }}
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-muted/30 border border-border rounded-xl p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-foreground">UE {index + 1}</h4>
                    {ues.length > 1 && (
                      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeUe(ue.id)}
                          className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1 space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Nom UE
                      </label>
                      <Input
                        type="text"
                        value={ue.nom}
                        onChange={(e) => updateUe(ue.id, "nom", e.target.value)}
                        placeholder="Nom de l'UE"
                        className="h-11 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Moyenne
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={ue.moyenne || ""}
                        onChange={(e) =>
                          updateUe(ue.id, "moyenne", parseFloat(e.target.value) || 0)
                        }
                        placeholder="/ 20"
                        className="h-11 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Crédits ECTS
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="30"
                        value={ue.credits || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateUe(ue.id, "credits", value === "" ? "" : parseInt(value, 10));
                        }}
                        className="h-11 rounded-lg"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                onClick={addUe}
                className="w-full h-12 border-dashed border-2 rounded-xl text-muted-foreground hover:text-secondary hover:border-secondary hover:bg-secondary/5 font-medium transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une UE
              </Button>
            </motion.div>
          </div>

          {/* Calculate */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ boxShadow: "0 8px 30px rgba(155,44,155,0.30)" }}
            onClick={calculateMoyenneSemestre}
            className="w-full flex items-center justify-center gap-3 h-14 px-6 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-semibold text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-shadow"
          >
            <Calculator className="h-5 w-5" />
            Calculer la moyenne du semestre
          </motion.button>
        </div>
      </motion.div>

      {moyenneSemestre !== null && (
        <ResultModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          moyenne={moyenneSemestre}
          type="Semestre"
          statut={statut}
          totalCredits={totalCredits}
          onSave={saveToHistory}
        />
      )}
    </div>
  );
}

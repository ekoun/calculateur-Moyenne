import { useState } from "react";
import { Plus, Trash2, Calculator } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResultModal } from "./result-modal";
import { fadeDown, scaleIn } from "./animations";

interface Ecue {
  id: string;
  nom: string;
  moyenne: number;
  credits: number;
}

export function UePage() {
  const [ecues, setEcues] = useState<Ecue[]>([
    { id: "1", nom: "", moyenne: 0, credits: 1 },
  ]);
  const [nomUe, setNomUe] = useState<string>("");
  const [moyenneUe, setMoyenneUe] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const calculateMoyenneUe = () => {
    if (ecues.every((e) => !e.nom.trim() || e.moyenne === 0)) {
      toast.error("Veuillez entrer au moins une ECUE avec sa moyenne");
      return;
    }
    const totalCredits = ecues.reduce((sum, e) => sum + e.credits, 0);
    const moyennePonderee = ecues.reduce(
      (sum, e) => sum + e.moyenne * e.credits,
      0
    );
    setMoyenneUe(Number((moyennePonderee / totalCredits).toFixed(2)));
    setShowModal(true);
  };

  const addEcue = () => {
    const newId = (Math.max(...ecues.map((e) => parseInt(e.id)), 0) + 1).toString();
    setEcues([...ecues, { id: newId, nom: "", moyenne: 0, credits: 1 }]);
  };

  const removeEcue = (id: string) => {
    if (ecues.length > 1) {
      setEcues(ecues.filter((e) => e.id !== id));
    } else {
      toast.error("Vous devez avoir au moins une ECUE");
    }
  };

  const updateEcue = (id: string, field: keyof Ecue, value: string | number) => {
    setEcues(
      ecues.map((e) => {
        if (e.id !== id) return e;
        if (field === "moyenne") return { ...e, [field]: Math.min(20, Math.max(0, Number(value))) };
        if (field === "credits") return { ...e, [field]: Math.max(1, Number(value)) };
        return { ...e, [field]: value };
      })
    );
  };

  const saveToHistory = () => {
    if (moyenneUe === null || !nomUe.trim()) {
      toast.error("Veuillez calculer la moyenne et entrer un nom pour l'UE");
      return;
    }
    try {
      const history = JSON.parse(localStorage.getItem("ecueHistory") || "[]");
      history.push({
        id: Date.now().toString(),
        nom: nomUe,
        moyenne: moyenneUe,
        date: new Date().toISOString(),
        type: "UE",
        ecues: ecues.filter((e) => e.nom.trim()).map((e) => ({
          nom: e.nom,
          moyenne: e.moyenne,
          credits: e.credits,
        })),
        totalCredits: ecues.reduce((sum, e) => sum + e.credits, 0),
      });
      localStorage.setItem("ecueHistory", JSON.stringify(history));
      toast.success("Calcul enregistré avec succès");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
    setNomUe("");
    setEcues([{ id: "1", nom: "", moyenne: 0, credits: 1 }]);
    setMoyenneUe(null);
  };

  const totalCredits = ecues.reduce((sum, e) => sum + e.credits, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-5 sm:space-y-6">
      {/* Header */}
      <motion.div variants={fadeDown} initial="hidden" animate="visible" className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Calcul Moyenne UE</h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Calculez votre moyenne d'Unité d'Enseignement pondérée par les crédits
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-xl text-sm font-medium">
          <Calculator className="h-4 w-4 shrink-0" />
          Moyenne pondérée par les crédits ECTS
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">
          {/* Nom UE */}
          <div className="space-y-2">
            <label htmlFor="nomUe" className="block text-sm font-semibold text-foreground">
              Nom de l'UE
            </label>
            <Input
              id="nomUe"
              type="text"
              value={nomUe}
              onChange={(e) => setNomUe(e.target.value)}
              placeholder="Ex: UE Informatique Fondamentale"
              className="h-12 rounded-xl"
            />
          </div>

          {/* ECUE list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-foreground">Liste des ECUE</h3>
              <div className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-semibold">
                Total: {totalCredits} crédits
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {ecues.map((ecue, index) => (
                <motion.div
                  key={ecue.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="bg-muted/30 border border-border rounded-xl p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-foreground">ECUE {index + 1}</h4>
                    {ecues.length > 1 && (
                      <motion.div whileTap={{ scale: 0.88 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEcue(ecue.id)}
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
                        Nom ECUE
                      </label>
                      <Input
                        type="text"
                        value={ecue.nom}
                        onChange={(e) => updateEcue(ecue.id, "nom", e.target.value)}
                        placeholder="Nom de l'ECUE"
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
                        value={ecue.moyenne || ""}
                        onChange={(e) =>
                          updateEcue(ecue.id, "moyenne", parseFloat(e.target.value) || 0)
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
                        min="1"
                        max="10"
                        value={ecue.credits}
                        onChange={(e) =>
                          updateEcue(ecue.id, "credits", parseInt(e.target.value) || 1)
                        }
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
                onClick={addEcue}
                className="w-full h-12 border-dashed border-2 rounded-xl text-muted-foreground hover:text-secondary hover:border-secondary hover:bg-secondary/5 font-medium transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une ECUE
              </Button>
            </motion.div>
          </div>

          {/* Calculate */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ boxShadow: "0 8px 30px rgba(155,44,155,0.30)" }}
            onClick={calculateMoyenneUe}
            className="w-full flex items-center justify-center gap-3 h-14 px-6 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-semibold text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-shadow"
          >
            <Calculator className="h-5 w-5" />
            Calculer la moyenne UE
          </motion.button>
        </div>
      </motion.div>

      {moyenneUe !== null && (
        <ResultModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          moyenne={moyenneUe}
          type="UE"
          totalCredits={totalCredits}
          onSave={saveToHistory}
        />
      )}
    </div>
  );
}

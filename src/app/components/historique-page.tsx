import { useState, useEffect } from "react";
import { Trash2, Calendar, Award, Filter, Download, Printer, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { fadeDown, scaleIn } from "./animations";

interface HistoryItem {
  id: string;
  nom: string;
  moyenne: number;
  date: string;
  type: "ECUE" | "UE" | "Semestre";
  statut?: string;
  devoirs?: number[];
  examen?: number;
  ecues?: Array<{ nom: string; moyenne: number; credits: number }>;
  ues?: Array<{ nom: string; moyenne: number; credits: number }>;
  totalCredits?: number;
}

export function HistoriquePage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<"Tous" | "ECUE" | "UE" | "Semestre">("Tous");
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem("ecueHistory");
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(
          parsed.sort(
            (a: HistoryItem, b: HistoryItem) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        );
      }
    } catch {
      toast.error("Erreur lors du chargement de l'historique");
    }
  };

  const deleteItem = (id: string) => {
    const newHistory = history.filter((item) => item.id !== id);
    localStorage.setItem("ecueHistory", JSON.stringify(newHistory));
    setHistory(newHistory);
    toast.success("Élément supprimé");
  };

  const clearAll = () => {
    localStorage.removeItem("ecueHistory");
    setHistory([]);
    setShowConfirmClear(false);
    toast.success("Historique effacé");
  };

  const exportToPDF = () => {
    if (history.length === 0) { toast.error("Aucune donnée disponible"); return; }
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("CM - REATD", 14, 15);
      doc.setFontSize(12);
      doc.text("Historique des Résultats", 14, 22);
      doc.setFontSize(10);
      doc.text(`Export: ${new Date().toLocaleDateString("fr-FR")}`, 14, 28);

      const filtered = filter === "Tous" ? history : history.filter((i) => i.type === filter);
      autoTable(doc, {
        startY: 35,
        head: [["Nom", "Type", "Moyenne", "Date", "Statut"]],
        body: filtered.map((item) => [
          item.nom,
          item.type,
          item.moyenne.toFixed(2),
          new Date(item.date).toLocaleDateString("fr-FR"),
          item.statut || (item.moyenne >= 10 ? "Validé" : "Non validé"),
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [155, 44, 155] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });
      doc.save(`historique_REATD_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("Document PDF exporté");
    } catch {
      toast.error("Erreur lors de l'export PDF");
    }
  };

  const filteredHistory =
    filter === "Tous" ? history : history.filter((item) => item.type === filter);

  const typeColor = (type: string) => {
    if (type === "ECUE") return "bg-primary/10 text-primary";
    if (type === "UE") return "bg-secondary/10 text-secondary";
    return "bg-accent/10 text-accent";
  };

  const statutStyle = (item: HistoryItem) => {
    if (item.statut === "Admis" || (!item.statut && item.moyenne >= 10))
      return "bg-secondary/10 text-secondary";
    if (item.statut === "Rattrapage") return "bg-warning/10 text-warning";
    return "bg-destructive/10 text-destructive";
  };

  return (
    <div className="max-w-6xl mx-auto pt-2 sm:pt-3 space-y-5 sm:space-y-6">
      {/* Header */}
      <motion.div variants={fadeDown} initial="hidden" animate="visible" className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Historique des Résultats</h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Consultez et exportez tous vos résultats sauvegardés
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="bg-card border border-border rounded-2xl shadow-lg p-5 sm:p-6"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Filters */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filtrer par type</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["Tous", "ECUE", "UE", "Semestre"] as const).map((type) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-xl transition-all font-medium text-sm relative ${
                    filter === type
                      ? "text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  {filter === type && (
                    <motion.div
                      layoutId="filterActive"
                      className="absolute inset-0 bg-primary rounded-xl shadow-md shadow-primary/20"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{type}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2.5">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
              <Button
                onClick={exportToPDF}
                disabled={history.length === 0}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/20 transition-shadow gap-2"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
              <Button
                variant="outline"
                onClick={() => window.print()}
                disabled={history.length === 0}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Imprimer
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
              <Button
                variant="destructive"
                onClick={() => setShowConfirmClear(true)}
                disabled={history.length === 0}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Tout supprimer
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* History list */}
      <AnimatePresence mode="popLayout">
        {filteredHistory.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-card border border-border rounded-2xl shadow-lg p-12 sm:p-16 text-center"
          >
            <div className="text-muted-foreground space-y-4 max-w-md mx-auto">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Award className="h-16 sm:h-20 w-16 sm:w-20 mx-auto opacity-20" />
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-semibold">Aucun résultat enregistré</h3>
              <p className="text-sm sm:text-base">
                Calculez et sauvegardez vos moyennes ECUE, UE ou Semestre pour les voir ici
              </p>
            </div>
          </motion.div>
        ) : (
          filteredHistory.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: index * 0.04 } }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-card border border-border rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
            >
              <div className="p-5 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-5 justify-between">
                  {/* Left content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-2xl font-bold text-foreground mb-2 truncate">
                          {item.nom}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className={`px-2.5 py-1 rounded-lg font-semibold text-xs sm:text-sm ${typeColor(item.type)}`}>
                            {item.type}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            {new Date(item.date).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                          {item.totalCredits ? (
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              {item.totalCredits} crédits
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Delete — toujours visible (corrige le bug hover mobile) */}
                      <motion.div whileTap={{ scale: 0.88 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteItem(item.id)}
                          className="h-9 w-9 sm:h-10 sm:w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>

                    {/* Details */}
                    {item.type === "ECUE" && item.devoirs && (
                      <div className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-3 space-y-1">
                        <p>
                          <span className="font-semibold">Devoirs:</span>{" "}
                          {item.devoirs.join(", ")} (Moy:{" "}
                          {(item.devoirs.reduce((a, b) => a + b, 0) / item.devoirs.length).toFixed(2)})
                        </p>
                        <p><span className="font-semibold">Examen:</span> {item.examen}</p>
                      </div>
                    )}

                    {item.type === "UE" && item.ecues && (
                      <div className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-3">
                        <p className="font-semibold mb-2">ECUE composantes :</p>
                        <ul className="space-y-1 ml-2">
                          {item.ecues.map((ecue, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                              {ecue.nom}: {ecue.moyenne}/20 ({ecue.credits} crédits)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.type === "Semestre" && item.ues && (
                      <div className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-3">
                        <p className="font-semibold mb-2">UE composantes :</p>
                        <ul className="space-y-1 ml-2">
                          {item.ues.map((ue, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                              {ue.nom}: {ue.moyenne}/20 ({ue.credits} crédits)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Score card */}
                  <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 lg:gap-3 min-w-[140px] p-4 sm:p-5 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-border">
                    <div className="text-center">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Moyenne
                      </p>
                      <p className="text-4xl sm:text-5xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent tabular-nums">
                        {item.moyenne}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">/ 20</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg font-semibold text-xs sm:text-sm text-center ${statutStyle(item)}`}>
                      {item.statut || (item.moyenne >= 10 ? "Validé" : "Non validé")}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </AnimatePresence>

      {/* Confirmation Dialog — remplace window.confirm() */}
      <Dialog open={showConfirmClear} onOpenChange={setShowConfirmClear}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-destructive/10 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Supprimer l'historique ?</DialogTitle>
            </div>
            <DialogDescription>
              Cette action est irréversible. Tous vos résultats sauvegardés seront définitivement supprimés.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowConfirmClear(false)}>
              Annuler
            </Button>
            <Button variant="destructive" className="flex-1" onClick={clearAll}>
              Supprimer tout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

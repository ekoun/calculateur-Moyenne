# Calculateur de Moyenne

**Calculateur de Moyenne** est une application web simple et moderne qui permet de calculer vos moyennes facilement, que ce soit pour l'école ou d'autres calculs numériques.  

Le site utilise **React**, **Vite**, **Framer Motion** pour les animations et **jsPDF** pour générer des rapports PDF.

---

## 🔹 Fonctionnalités

- Calcul automatique de moyennes simples ou pondérées  
- Interface **responsive** pour tous les écrans  
- Animations fluides avec **Framer Motion**  
- Export de résultats au format **PDF** avec **jsPDF**  
- Écran de chargement moderne lors de l’ouverture du site

---

## � Formules de calcul utilisées par l'application

### 1. Moyenne ECUE
La moyenne d'une ECUE est calculée selon la formule suivante :

Moyenne ECUE = (Moyenne devoirs × 0,4) + (Note examen × 0,6)

Où :
- Moyenne devoirs = moyenne des notes de devoirs de l'ECUE
- Note examen = note obtenue à l'examen final

### 2. Moyenne UE
La moyenne d'une UE est calculée comme une moyenne pondérée par les crédits :

Moyenne UE = Σ (Moyenne ECUE × Crédit ECUE) / Σ Crédits ECUE

### 3. Moyenne semestrielle
La moyenne du semestre est calculée comme une moyenne pondérée par les crédits des UE :

Moyenne semestrielle = Σ (Moyenne UE × Crédit UE) / Σ Crédits UE

### 4. Total des crédits validés
Le total des crédits validés correspond à la somme des crédits des UE validées, selon la règle de validation appliquée par l'établissement.

---

## �💻 Installation

1. Cloner le dépôt :

```bash
git clone https://github.com/ekoun/calculateur-Moyenne.git
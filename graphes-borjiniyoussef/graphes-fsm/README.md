# Graphes et algorithmes — Atelier d'étude (Chapitre 1)

Application web d'étude, **entièrement en français**, construite à partir du PDF du cours de Héla Haj Mohamed (FSM, 2026–2027). Aucune installation, aucune connexion, aucune clé.

## Lancer

1. Dézippez le dossier.
2. Double-cliquez sur **`index.html`** (Chrome, Firefox, Edge ou Safari).

La progression est enregistrée dans votre navigateur. Pour changer d'appareil : page **Notes → Exporter ma progression**.

## Ce qui fonctionne (testé)

| Fonction | Détail |
|---|---|
| Tableau de bord | Progression par partie et par notion (non commencée / en cours / à revoir / maîtrisée), reprise là où vous vous êtes arrêté, points forts, difficultés récurrentes, activité sur 4 semaines. Aucune donnée de démonstration. |
| Exercices (19 notions) | 29 générateurs : graphes aléatoires différents à chaque fois, **réponses calculées** par le moteur. Niveaux 1 à 3, adaptatif (le niveau monte si vous réussissez), série progressive. Boutons Indice, Indice supplémentaire, Expliquer autrement, Voir la correction. |
| Types de questions | Choix, choix multiple, vrai/faux **avec justification**, calcul, ensemble de sommets, matrice d'adjacence cliquable, matrice de poids, listes d'adjacence, chaîne/cycle à écrire, liste d'arêtes, exercices de synthèse. |
| Révision espacée | Boîtes de Leitner (1, 3, 7, 14, 30 jours). Les questions ratées reviennent. Bilan des lacunes et prochaines notions. |
| Révision rapide | Fiches (définitions, théorèmes, formules), questions courtes, erreurs fréquentes. |
| Mode examen | Chapitres au choix, sans indice, durée facultative, correction détaillée, notions à revoir. |
| Outil graphes | Créer/déplacer/supprimer sommets et arêtes, orienté/pondéré, degrés, matrices, listes, distance, composantes, Euler, Hamilton, parcours pas à pas, analyse expliquée. |
| Notes | Notes par notion, marque-pages, favoris, fiche imprimable, export/import. |
| Cours rédigé (n01 à n19) | Cours diapo par diapo, compréhension guidée, **mode socratique**, **mode Feynman**, synthèse. |

## Ce qui n'est PAS terminé (honnêtement)

- Seul le **Chapitre 1** est dans le PDF (diapos 1, 3–5, 7–33 sur 131).

## Correction des réponses rédigées

Les réponses **fermées** sont vérifiées par calcul sur le graphe (pas par mots-clés). Les réponses **rédigées** (socratique, Feynman, définitions) ne sont **pas analysées** : vous comparez à une réponse type et cochez une grille. Une vraie évaluation sémantique exigerait un modèle de langage via une API externe (clé secrète, Internet, service payant) ; ce n'est pas intégré.

## Fidélité au cours

- Chaque bloc de cours indique sa diapo. Les ajouts hors PDF sont en **violet** et signalés ; les anomalies du PDF en **jaune** (page « À propos » : 20 points relevés, dont la matrice incohérente de la diapo 30 et l'ensemble E incomplet de la diapo 10).
- Conventions : boucle = 2 dans d(v) ; longueur d'une chaîne = nombre d'arêtes ; sous-graphe = induit ; densité D = 2m/(n(n−1)) pour un graphe simple non orienté.

## Tests

```
node tests/engine.test.js     # moteur de graphes
node tests/gens.test.js       # générateurs d'exercices
node tests/store.test.js      # progression et révision espacée
node tests/content.test.js           # validation des 19 notions (ou : n05-n07 pour une plage)
node tests/smoke.js           # test dans un vrai navigateur (Playwright)
```

## Structure

`index.html` · `css/style.css` · `js/graphlib.js` (moteur) · `js/graphs.js` (graphes du cours) · `js/render.js` (SVG) · `js/exercises.js`, `gens.js`, `gens2.js` (exercices) · `js/store.js` (progression) · `js/editor.js` (éditeur) · `js/content-*.js` (cours, séparé du code) · `js/app-*.js` (interface).

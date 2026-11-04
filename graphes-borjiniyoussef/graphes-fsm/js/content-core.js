/* content-core.js — cadre du contenu pédagogique (schéma, registre, points ambigus du PDF).
 *
 * SCHÉMA D'UNE NOTION — GF.content.add({ ... })  (un appel par notion, dans js/content-NN.js)
 * ---------------------------------------------------------------------------------------------
 * id        'n01'…'n19' (ordre réel du cours)       title  intitulé fidèle au cours
 * short     ≤ 28 caractères (tuiles)                slides  ex. '13–14' (numéros imprimés sur les diapos)
 * prereqs   ['n03', …]                              objectives  3–4 phrases à l'infinitif (« Calculer… »)
 *
 * course  [ { k, slide, t, h, g?, go? } ]  contenu du PDF, dans l'ordre des diapos
 *     k : 'def' définition | 'thm' théorème/corollaire | 'proof' preuve | 'rem' remarque du cours |
 *         'q' question posée par le cours | 'extra' AJOUT HORS PDF (signalé à l'écran) |
 *         'warn' point ambigu/incomplet/incohérent du PDF (signalé ; voir ambiguities ci-dessous)
 *     slide : numéro de diapo imprimé ('13') — obligatoire sauf pour k:'extra'
 *     t titre court, h HTML (p, ul/li, b, i, sub, sup, br, <span class="mth">…</span>)
 *     g : graphe = id nommé de graphs.js ('s10') | fonction () => graphe (ex. GF.ex.mk('ABC',['AB'])) | graphe
 *     go : options de GF.render.svg (showDeg, hlV:{A:'hl'|'hl2'|'cur'}, groups:[[…]], walk:{seq,numbers}, weights…)
 *          + go.show : tableau parmi 'deg' | 'matrix' | 'wmatrix' | 'lists' (panneaux affichés sous la figure)
 *          Les arêtes sont numérotées 1, 2, 3… dans l'ordre de la liste (utile pour hlE:{3:'hl'}).
 * guided   [ { h, ask?, reveal?, g?, go? } ]   compréhension guidée : 3–5 étapes courtes ; ask = question de
 *          réflexion, reveal = réponse (masquée jusqu'au clic)
 * examples [ { t, h, g?, go?, counter? } ]     exemples ; counter:true = contre-exemple ; ≥ 2 par notion
 * compare  [ { t, cols:[…], rows:[[…],…] } ]   (optionnel) notions souvent confondues
 * mistakes [ { tag, wrong, right } ]           3–5 erreurs fréquentes ; tag = tag des questions concernées
 * alt      [ html, html, … ]                   ≥ 2 explications alternatives (analogie, autre représentation)
 * socratic { warm:STEP, steps:[STEP,STEP,STEP(,STEP)], verify:{gen:'degsum',level:2} | {q:'n04.q3'} }
 *     STEP : { id, type:'choice'|'num'|'set'|'text', q, g?, go?, options?, answer?, expect?,
 *              counter, hints:[h1,h2], ok, explain, restate }
 *       - choice : options[], answer = indice ; num : answer = nombre ; set : answer = [sommets]
 *       - text : réponse libre AUTO-ÉVALUÉE — expect:[idées clés] sert de liste à cocher (aucune analyse automatique)
 *       - answer peut être une fonction (G) => valeur si g est fourni
 *       - counter : contre-exemple ou cas plus simple (1er échec) ; hints : 2 indices progressifs ;
 *         ok : confirmation brève + question d'approfondissement ; explain : explication directe ≤ 5 phrases + 1 exemple
 *         (après 3 échecs ou « je ne sais pas ») ; restate : consigne de reformulation
 * feynman  { topic, prompt, must:[…], pitfalls:[…], beginner:[…], model }
 *     must = éléments attendus (liste à cocher) ; pitfalls = imprécisions à vérifier ; beginner = 2–4 questions de
 *     « débutant curieux » ; model = explication modèle (HTML)
 * recap    { key:[html×3–6], defs:[{t,d,slide}], thms:[{t,s,cond}], formulas:[{t,f}] }  synthèse « À retenir »
 * qs       [ spec… ]  questions STATIQUES (GF.ex.qb.*), ids uniques préfixés par l'id de la notion : 'n04.q1'…
 *     options utiles : { graph, hints:[…], tag, src:'course'|'extra', slide:'14', challenge:true (mini-défi),
 *                        transfer:true (question de transfert), noPool:true }
 *     src:'course' = question posée par le PDF lui-même. Niveaux : 1 compréhension, 2 application, 3 raisonnement.
 *     Les réponses doivent être CALCULÉES par le moteur (answer: function (G) {…}) chaque fois que possible.
 *     type 'text' (qb.text) = définition à expliquer / question de compréhension, auto-évaluée avec rubric.
 *
 * Règles de fidélité : n'attribuer au professeur que ce qui figure dans le PDF (renvoyer à la diapo) ;
 * tout le reste porte k:'extra' ; toute anomalie du PDF porte k:'warn'.
 */
(function (root) {
  'use strict';
  var GF = root.GF = root.GF || {};
  var GS = GF.graphs, GR = GF.graph;

  var content = {
    chapter: {
      id: 'ch1', title: 'Chapitre 1',
      subtitle: 'Graphes et algorithmes — diapositives 1 à 33 du support',
      author: 'Héla Haj Mohamed', institution: 'FSM — Université de Monastir', year: '2026–2027',
      note: 'Le PDF fourni ne donne pas de titre au chapitre : seule la mention « Ch. 1 » figure sur les diapos.'
    },
    /* regroupement proposé par l'application (le PDF n'a pas de sections numérotées) */
    parts: [
      { id: 'A', title: 'Définitions et vocabulaire', notions: ['n01', 'n02', 'n03'] },
      { id: 'B', title: 'Degrés', notions: ['n04', 'n05', 'n06', 'n07'] },
      { id: 'C', title: 'Trajets, distance et connexité', notions: ['n08', 'n09', 'n10', 'n11', 'n12'] },
      { id: 'D', title: 'Deux problèmes de parcours', notions: ['n13', 'n14'] },
      { id: 'E', title: 'Représentations d’un graphe', notions: ['n15', 'n16', 'n17', 'n18', 'n19'] }
    ],
    notions: [],
    byId: {},
    add: function (n) {
      if (this.byId[n.id]) throw new Error('Notion déjà enregistrée : ' + n.id);
      this.byId[n.id] = n;
      this.notions.push(n);
      this.notions.sort(function (a, b) { return a.id < b.id ? -1 : 1; });
      return n;
    },
    graph: function (g) {
      if (!g) return null;
      if (typeof g === 'string') return GS.get(g);
      if (typeof g === 'function') return g();
      return GR.clone(g);
    },
    ambiguitiesFor: function (id) { return this.ambiguities.filter(function (a) { return a.notion === id; }); },
    partOf: function (id) { for (var i = 0; i < this.parts.length; i++) if (this.parts[i].notions.indexOf(id) >= 0) return this.parts[i]; return null; },

    /* Points ambigus, incomplets ou incohérents du PDF (vérifiés sur les diapos). Affichés dans l'application. */
    ambiguities: [
      { id: 'A00', notion: null, slide: '1–33', title: 'Périmètre du PDF fourni',
        text: 'Le PDF contient 31 pages, soit les diapositives 1, 3 à 5 et 7 à 33 d’un support de 131 diapositives (les diapos 2 et 6 ne figurent pas dans le fichier). Seul le « Ch. 1 » est donc couvert ; les chapitres suivants (algorithmes) ne sont pas fournis et ne sont pas traités.' },
      { id: 'A01', notion: 'n01', slide: '8, 10', title: 'Couples ou paires ?',
        text: 'La diapo 8 définit E comme un ensemble de <i>couples</i> (v<sub>i</sub>, v<sub>j</sub>) ∈ V², alors que la diapo 10 (graphe non orienté) parle de <i>paires</i> {u, v}. Le mot « couple » est employé de façon générique. L’application distingue paires {u, v} (non orienté) et couples (u, v) (orienté), comme aux diapos 10 et 11.' },
      { id: 'A02', notion: 'n02', slide: '10', title: 'Ensemble E incomplet sous la figure',
        text: 'L’ensemble E affiché sous la figure ne liste que 4 paires : (A,B), (A,C), (B,C), (B,D). La figure montre 7 arêtes (il y a aussi C–E, D–E et E–F) et la diapo 13 donne |E| = 7 avec les degrés 2, 3, 3, 2, 3, 1. L’application utilise la figure à 7 arêtes. Les arêtes y sont aussi écrites avec des parenthèses alors que la définition parle de paires {u, v}.' },
      { id: 'A03', notion: 'n03', slide: '12', title: 'd(C) = |N(C)| : cas des graphes simples',
        text: 'L’égalité d(v) = |N(v)| est vraie pour un graphe <b>simple</b> (ni boucle, ni arêtes multiples). Avec une boucle ou des arêtes multiples, le degré et le nombre de voisins diffèrent.' },
      { id: 'A04', notion: 'n04', slide: '13', title: 'Théorème énoncé pour les graphes simples, mais boucle comptée double',
        text: 'Le théorème est énoncé pour « tout graphe simple non orienté », mais la remarque « une boucle sur un sommet compte double » l’étend aux boucles. L’application adopte cette convention : une boucle compte 2 dans d(v), et Σ d(v) = 2|E| reste vraie.' },
      { id: 'A05', notion: 'n04', slide: '14', title: 'Réponse de la question non fournie',
        text: 'La question « Les degrés 3, 3, 2, 1, 0 peuvent-ils décrire un graphe simple ? » n’est pas corrigée sur la diapo. On la résout avec le corollaire : la somme vaut 9 (impaire) et il y a 3 sommets de degré impair (nombre impair) : impossible.' },
      { id: 'A06', notion: 'n06', slide: '16', title: 'Graphe de la question avec une boucle',
        text: 'Le graphe de la diapo 16 comporte une boucle en v<sub>5</sub> : il n’est donc pas simple. Avec la convention de la diapo 13 (boucle = 2), les degrés sont v<sub>1</sub> : 2, v<sub>2</sub> : 2, v<sub>3</sub> : 4, v<sub>4</sub> : 1, v<sub>5</sub> : 3 : le graphe n’est pas régulier. La diapo ne donne pas la réponse.' },
      { id: 'A07', notion: 'n07', slide: '17', title: 'Densité : graphes simples non orientés seulement',
        text: 'La formule D = 2m / (n(n − 1)) est donnée pour un graphe simple non orienté d’ordre n ≥ 2. Aucune formule n’est donnée pour les graphes orientés ou avec boucles.' },
      { id: 'A08', notion: 'n08', slide: '18', title: '« Longueur zéro » et « non vide »',
        text: 'La diapo autorise « le trajet de longueur zéro » mais définit un cycle comme une chaîne fermée <i>non vide</i>. L’application considère qu’un cycle a au moins une arête : le trajet de longueur zéro est une chaîne valide (un seul sommet) mais pas un cycle.' },
      { id: 'A09', notion: 'n09', slide: '19', title: 'Diamètre et distance hors du cas connexe',
        text: 'Le diamètre est défini comme « la plus longue des distances entre deux sommets » ; rien n’est dit pour un graphe non connexe (δ = ∞) ni pour la distance dans un graphe orienté. <b>Hors cours :</b> l’application note δ = ∞ quand aucune chaîne n’existe et diamètre = ∞ pour un graphe non connexe.' },
      { id: 'A10', notion: 'n11', slide: '21', title: 'Connexité forte non définie comme propriété',
        text: 'Le cours définit CC(s) (graphe non orienté) et CFC(s) (graphe orienté) mais pas « graphe fortement connexe ». <b>Hors cours :</b> on dit qu’un graphe orienté est fortement connexe s’il n’a qu’une seule CFC.' },
      { id: 'A11', notion: 'n12', slide: '22', title: '« Sous-graphe » = sous-graphe induit',
        text: 'Dans ce cours, un sous-graphe (A, E(A)) contient <b>toutes</b> les arêtes de G entre sommets de A (ce que d’autres sources appellent sous-graphe induit). Un graphe partiel garde tous les sommets mais retire des arêtes. Le PDF ne définit pas de notion combinant les deux.' },
      { id: 'A12', notion: 'n13', slide: '24', title: 'Hypothèse de connexité et sommets isolés',
        text: 'Les deux théorèmes d’Euler supposent G connexe. Le PDF ne dit pas comment traiter un graphe ayant des sommets isolés ; l’application exige la connexité du graphe (un sommet isolé le rend non connexe).' },
      { id: 'A13', notion: 'n13', slide: '25', title: 'Modélisation non donnée',
        text: 'La diapo pose la question des 16 segments sans modèle ni réponse. <b>Hors cours :</b> on prend les régions (5 pièces + l’extérieur) comme sommets et chaque segment comme une arête entre les deux régions qu’il sépare : 6 sommets, 16 arêtes, quatre sommets de degré impair (l’extérieur : 9 ; trois pièces : 5) ; il n’y a donc pas de chaîne eulérienne et le tracé est impossible.' },
      { id: 'A14', notion: 'n14', slide: '27', title: 'Théorème et corollaire non nommés',
        text: 'Le théorème (d(u) + d(v) ≥ n pour toute paire non adjacente) et son corollaire (d(u) ≥ n/2) sont donnés sans nom. <b>Hors cours :</b> la littérature les désigne par Ore et Dirac. Ce sont des conditions <b>suffisantes</b>, non nécessaires.' },
      { id: 'A15', notion: 'n14', slide: '26, 28', title: 'Questions et applications sans correction',
        text: 'La question de la diapo 26 (« Un cycle peut-il être hamiltonien sans utiliser toutes les arêtes ? ») et l’application de la diapo 28 n’ont pas de correction. Les deux graphes de la diapo 28 sont lus sur la figure : un cube (8 sommets, 12 arêtes, 3-régulier) et une « échelle » à 8 sommets avec deux diagonales (12 arêtes, degrés 2, 4, 3, 3, 3, 3, 4, 2).' },
      { id: 'A16', notion: 'n15', slide: '29, 33', title: 'Matrice d’un graphe orienté ou avec boucles',
        text: 'La diapo 29 définit la matrice pour un graphe simple non orienté. Pour un graphe orienté, l’application lit « ligne = origine, colonne = destination » (cohérent avec W<sub>ij</sub> = w(i, j) de la diapo 30) et place 1 sur la diagonale pour une boucle : cette convention n’est pas écrite sur les diapos.' },
      { id: 'A17', notion: 'n16', slide: '30', title: 'Matrice illustrée incohérente avec son graphe',
        text: 'Sur la diapo 30, trois cases ne correspondent pas au graphe : (B,C) = 7,7 alors que l’arête {B,C} porte 0,7 ; (C,B) = 0,5 (au lieu de 0,7, et la matrice n’est pas symétrique) ; (F,D) = ∞ alors que (D,F) = 0,5. L’application suit le graphe.' },
      { id: 'A18', notion: 'n18', slide: '32', title: 'Test d’arête avec les listes',
        text: 'Le tableau donne O(d<sup>+</sup>(u)) « en orienté » pour tester l’arête (u, v) avec les listes. <b>Hors cours :</b> en non orienté, c’est O(d(u)).' },
      { id: 'A19', notion: 'n19', slide: '33', title: 'Arcs non listés dans l’énoncé',
        text: 'L’énoncé annonce « les arcs : » mais ne les liste pas ; ils sont lus sur la figure : 9 arcs, dont deux boucles (en 2 et en 3) et un lien à double flèche entre 3 et 4, lu comme deux arcs (3,4) et (4,3). L’énoncé écrit G = (V, E) alors que la diapo 11 note les arcs A.' }
    ]
  };
  GF.content = content;
  if (typeof module === 'object' && module.exports) module.exports = content;
})(typeof self !== 'undefined' ? self : (typeof global !== 'undefined' ? global : this));

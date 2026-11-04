/* content-05.js — notions n15 à n19 (diapos 29 à 33 du Chapitre 1). Schéma : voir content-core.js. */
(function (root) {
  'use strict';
  var GF = root.GF, GR = GF.graph, GS = GF.graphs, U = GF.u, X = GF.ex, RD = GF.render, qb = X.qb, mk = X.mk;
  function fr(a, b) { function g(x, y) { return y ? g(y, x % y) : x; } var d = g(a, b); a /= d; b /= d; return b === 1 ? String(a) : a + '/' + b; }
  function dec(x) { return X.fmtNum(Math.round(x * 1000) / 1000); }
  function Kn(s) { return mk(s, X.allPairs(s.split(''))); }
  function degList(G) { return G.vertices.map(function (v) { return 'd(' + v + ') = ' + GR.degree(G, v); }).join(', '); }
  function hasAll(g, vs) { return g.vertices.length === vs.length && vs.every(function (v) { return g.vertices.indexOf(v) >= 0; }); }

  /* ================= n15 ================= */
  (function () {
    var G29 = GS.get('s29'), TRI = mk('ABC', ['AB', 'BC', 'CA']);
    var DIR3 = mk('123', [['1', '2'], ['2', '3'], ['3', '1']], { directed: true });
    var DIR12 = mk('12', [['1', '2']], { directed: true });
    var ARC4 = mk('1234', [['1', '2'], ['2', '2'], ['2', '3'], ['4', '1'], ['3', '4']], { directed: true });
    var SM = mk('ABCD', ['AB', 'AC', 'CD']);
    function rowSum(G, v) { return GR.adjMatrix(G)[GR.vIndex(G)[v]].reduce(function (a, b) { return a + b; }, 0); }
  GF.content.add({
    id: 'n15', title: 'Matrice d’adjacence', short: 'Matrice d’adjacence', slides: '29', prereqs: ['n03', 'n05'],
    objectives: [
      'Construire la matrice d’adjacence d’un graphe simple non orienté : 1 si une arête relie les deux sommets, 0 sinon.',
      'Lire sur la matrice les voisins, le degré (somme d’une ligne) et le nombre d’arêtes (somme de tous les 1 divisée par 2).',
      'Expliquer pourquoi la matrice d’un graphe non orienté est symétrique, à diagonale de zéros pour un graphe simple.',
      'Adapter la lecture à un graphe orienté (ligne = origine, colonne = destination) en sachant que cette convention n’est pas écrite sur la diapo.'
    ],
    course: [
      { k: 'def', slide: '29', t: 'Matrice d’adjacence', h: '<p>La <b>matrice d’adjacence</b> est une matrice en deux dimensions <b>indexée par les sommets</b> du graphe. À l’intersection de chaque ligne et colonne on trouve un nombre : il vaut <b>1</b> si une arête relie les deux sommets, <b>0</b> sinon.</p><p>Graphe de la diapo 29 : arêtes {A,B}, {B,C}, {C,D}, {D,E}, {D,F}, {E,F}.</p>', g: 's29', go: { show: ['matrix'] } },
      { k: 'q', slide: '29', t: 'Question du cours', h: '<p>« Pourquoi cette matrice est-elle symétrique ? Que représente la somme d’une ligne ? » La diapo ne donne pas la réponse : voir la résolution hors diapo.</p>', g: 's29' },
      { k: 'extra', t: 'Résolution : pourquoi symétrique (hors diapo)', h: '<p>Le graphe est <b>non orienté</b> : une arête {u, v} relie u à v <i>et</i> v à u. Elle met donc un 1 en (u, v) <b>et</b> en (v, u). Les cases symétriques par rapport à la diagonale sont toujours égales. Sur le graphe de la diapo 29, l’arête {A, B} donne M[A][B] = M[B][A] = 1.</p>', g: 's29', go: { show: ['matrix'] } },
      { k: 'extra', t: 'Résolution : somme d’une ligne (hors diapo)', h: '<p>La ligne d’un sommet contient un 1 pour chaque sommet qui lui est relié : la <b>somme d’une ligne est le degré du sommet</b> (graphe simple, sans boucle). Sur la diapo 29 : A 1, B 2, C 2, D 3, E 2, F 2. En additionnant tous les 1 de la matrice on obtient 12 = 2 × 6 arêtes (théorème de la diapo 13).</p>', g: 's29', go: { showDeg: true } },
      { k: 'warn', slide: '29', t: 'Matrice d’un graphe orienté ou avec boucles', h: '<p>La diapo 29 définit la matrice pour un graphe simple non orienté. Pour un graphe orienté, l’application lit « <b>ligne = origine, colonne = destination</b> » (cohérent avec W<sub>ij</sub> = w(i, j) de la diapo 30) et place <b>1 sur la diagonale pour une boucle</b> : cette convention n’est pas écrite sur les diapos. La matrice d’un graphe orienté n’est pas forcément symétrique.</p>' },
      { k: 'extra', t: 'Cas orienté : lecture des lignes et colonnes (hors diapo)', h: '<p>Avec la convention ci-dessus, la somme de la ligne de s est le demi-degré sortant d<sup>+</sup>(s) et la somme de la colonne de s est le demi-degré entrant d<sup>−</sup>(s). Pour l’arc 1→2 seul, M[1][2] = 1 mais M[2][1] = 0.</p>', g: DIR12, go: { show: ['matrix'] } },
      { k: 'extra', t: 'Diagonale et taille (hors diapo)', h: '<p>Pour un graphe simple, la diagonale ne contient que des 0 (pas de boucle). La matrice a n × n cases quel que soit le nombre d’arêtes : un graphe à 6 sommets donne 36 cases, dont 12 valent 1 sur la diapo 29. Le coût en mémoire est étudié à la diapo 32.</p>' }
    ],
    guided: [
      { h: '<p>Lisons la matrice du graphe de la diapo 29. Les lignes et colonnes sont rangées dans l’ordre A, B, C, D, E, F.</p>', g: 's29', go: { show: ['matrix'] }, ask: 'Que valent les cases (B, C) et (C, B) ? Pourquoi ?', reveal: '<p>Les deux valent 1 : l’arête {B, C} existe et le graphe est non orienté, donc elle apparaît symétriquement.</p>' },
      { h: '<p>Regardons la ligne du sommet D.</p>', g: 's29', go: { show: ['matrix'], hlV: { D: 'hl' } }, ask: 'Combien de 1 y a-t-il dans la ligne D ? Que représente ce nombre ?', reveal: '<p>La ligne D contient trois 1 (en C, E, F) : c’est le <b>degré</b> de D, d(D) = 3.</p>' },
      { h: '<p>Additionnons tous les 1 de la matrice.</p>', g: 's29', ask: 'Combien de 1 y a-t-il au total, et combien d’arêtes a le graphe ?', reveal: '<p>Les sommes de lignes sont 1, 2, 2, 3, 2, 2 : total 12. Chaque arête compte deux fois (symétrie) : 12 / 2 = 6 arêtes.</p>' },
      { h: '<p>Un petit exemple : le triangle A–B–C.</p>', g: TRI, go: { show: ['matrix'] }, ask: 'Écrivez la matrice du triangle. Que remarquez-vous sur la diagonale ?', reveal: '<p>Tous les coefficients hors diagonale valent 1 ; la diagonale ne contient que des 0 (pas de boucle). Chaque ligne a deux 1 : d(v) = 2.</p>' },
      { h: '<p>Dans un graphe orienté, il faut distinguer origine et destination. Voici le graphe orienté 1→2, 2→3, 3→1.</p>', g: DIR3, go: { show: ['matrix'] }, ask: 'La matrice est-elle symétrique ? Où est le 1 de l’arc 1→2 ?', reveal: '<p>Non. L’arc 1→2 met 1 en ligne 1, colonne 2 (M[1][2] = 1) et rien en (2, 1). La matrice n’est pas symétrique.</p>' }
    ],
    examples: [
      { t: 'Le graphe de la diapo 29 et sa matrice', h: '<p>La matrice est symétrique, de diagonale de zéros ; les sommes de lignes 1, 2, 2, 3, 2, 2 sont les degrés.</p>', g: 's29', go: { show: ['matrix'] } },
      { t: 'Le triangle', h: '<p>Matrice avec des 1 partout sauf sur la diagonale : toutes les lignes ont pour somme 2.</p>', g: TRI, go: { show: ['matrix'] } },
      { t: 'Un petit graphe à 4 sommets', h: '<p>Arêtes {A,B}, {A,C}, {C,D} : matrice symétrique ; D a pour ligne (0, 0, 1, 0), donc d(D) = 1.</p>', g: SM, go: { show: ['matrix'] } },
      { t: 'Contre-exemple : une matrice non symétrique n’est pas celle d’un graphe non orienté', h: '<p>La matrice du graphe orienté 1→2, 2→3, 3→1 n’est pas symétrique : (1, 2) vaut 1 mais (2, 1) vaut 0. Ce n’est pas la matrice d’un graphe non orienté.</p>', g: DIR3, go: { show: ['matrix'] }, counter: true },
      { t: 'Contre-exemple : un 1 sur la diagonale', h: '<p>Un 1 en (v, v) signifie une boucle. Il est impossible dans la matrice d’un graphe <b>simple</b>.</p>', g: ARC4, go: { show: ['matrix'] }, counter: true }
    ],
    compare: [{ t: 'Matrice d’un graphe non orienté et d’un graphe orienté', cols: ['', 'Non orienté (diapo 29)', 'Orienté (convention hors cours)'], rows: [['Case (u, v)', '1 si une arête relie u et v', '1 si l’arc (u, v) existe'], ['Symétrie', 'toujours symétrique', 'pas forcément'], ['Somme d’une ligne', 'degré d(u)', 'demi-degré sortant d⁺(u)'], ['Somme de tous les 1', '2|E|', '|A|']] }],
    mistakes: [
      { tag: 'matrice-symetrie', wrong: 'Pour une arête {u, v}, on ne met un 1 que d’un côté de la diagonale.', right: 'Dans un graphe non orienté, on met un 1 en (u, v) <b>et</b> en (v, u) : la matrice est symétrique.' },
      { tag: 'matrice-lecture', wrong: 'La somme d’une ligne vaut le nombre d’arêtes du graphe.', right: 'La somme d’une ligne vaut le <b>degré du sommet</b>. C’est la somme de <i>tous</i> les 1, divisée par 2, qui donne le nombre d’arêtes.' },
      { tag: 'matrice-lecture', wrong: 'Le nombre de 1 de la matrice est égal au nombre d’arêtes.', right: 'Chaque arête apparaît deux fois (symétrie) : nombre de 1 = 2|E| (diapo 13).' },
      { tag: 'matrice-orientee', wrong: 'Pour un arc (u, v), on met aussi un 1 en (v, u).', right: 'Un arc (u, v) ne met un 1 qu’en ligne u, colonne v. La matrice d’un graphe orienté n’est pas forcément symétrique.' },
      { tag: 'matrice-lecture', wrong: 'On peut mettre n’importe quel ordre de sommets sur les lignes et les colonnes.', right: 'Il faut le <b>même ordre</b> sur les lignes et les colonnes (diapo 29 : A, B, C, D, E, F), sinon la symétrie et la diagonale perdent leur sens.' }
    ],
    alt: [
      '<p>Pensez à un tableau de « qui connaît qui » : une ligne par personne, une colonne par personne, un 1 si elles se connaissent. Comme « se connaître » est réciproque, le tableau est symétrique ; compter les 1 d’une ligne, c’est compter les connaissances de cette personne.</p>',
      '<p>Pour construire la matrice : écrivez la grille vide n × n, puis pour <i>chaque arête</i> {u, v} cochez la case (u, v) <i>et</i> la case (v, u). Les cases restantes valent 0.</p>',
      '<p>Pour vérifier votre matrice : (1) symétrique ? (2) diagonale à 0 ? (3) chaque somme de ligne égale-t-elle le degré lu sur le dessin ?</p>'
    ],
    socratic: {
      warm: { id: 'n15.s0', type: 'choice', q: 'Dans un graphe simple non orienté, que compte le degré d(v) d’un sommet v ?', options: ['Le nombre d’arêtes incidentes à v', 'Le nombre total d’arêtes du graphe', 'Le nombre de sommets du graphe', 'La somme des poids des arêtes de v'], answer: 0,
        counter: '<p>Cas plus simple : dans un triangle A–B–C, combien d’arêtes touchent A ?</p>', hints: ['<p>Relisez la diapo 12.</p>', '<p>Le degré dépend d’un sommet précis.</p>'],
        ok: '<p>Exact. Comment lirait-on ce nombre dans un tableau de 0 et de 1 ?</p>', explain: '<p>d(v) est le nombre d’arêtes qui touchent v (diapo 12). Exemple : dans un triangle, d(A) = 2.</p>', restate: '<p>Redites ce que mesure le degré d’un sommet.</p>' },
      steps: [
        { id: 'n15.s1', type: 'num', g: 's29', go: { show: ['matrix'] }, q: 'Combien de 1 y a-t-il dans la ligne du sommet <b>D</b> de la matrice d’adjacence du graphe de la diapo 29 ?', answer: function (G) { return rowSum(G, 'D'); },
          counter: '<p>Cas plus simple : dans un triangle, combien de 1 y a-t-il dans la ligne de A ?</p>', hints: ['<p>Lisez la ligne D : à quels sommets D est-il relié ?</p>', '<p>Un 1 marque une arête.</p>'],
          ok: '<p>Oui, 3. Que représente ce nombre pour D ?</p>', explain: '<p>D est relié à C, E et F : trois 1 dans sa ligne. Exemple : dans un triangle, la ligne de A contient deux 1.</p>', restate: '<p>Redites comment lire les voisins d’un sommet sur la matrice.</p>' },
        { id: 'n15.s2', type: 'choice', g: 's29', q: 'Pourquoi la matrice d’adjacence du graphe de la diapo 29 est-elle symétrique ?', options: ['Le graphe est non orienté : une arête {u, v} met un 1 en (u, v) et en (v, u)', 'Le graphe est connexe', 'Tous les sommets ont le même degré', 'La diagonale est nulle'], answer: 0,
          counter: '<p>Cas plus simple : une seule arête {A, B}. Quelles cases de la matrice reçoivent un 1 ?</p>', hints: ['<p>Une arête relie u à v <i>et</i> v à u.</p>', '<p>Que se passerait-il avec un arc (orienté) ?</p>'],
          ok: '<p>Oui. Et la somme d’une ligne, que représente-t-elle ?</p>', explain: '<p>Une arête n’a pas de sens : {u, v} = {v, u}. Elle donne donc un 1 en (u, v) et en (v, u). Exemple : l’arête {A, B} remplit les cases (A, B) et (B, A).</p>', restate: '<p>Reformulez pourquoi la matrice est symétrique.</p>' },
        { id: 'n15.s3', type: 'choice', g: 's29', q: 'Que représente la somme des valeurs d’une ligne de la matrice d’un graphe simple non orienté ?', options: ['Le degré du sommet correspondant', 'Le nombre d’arêtes du graphe', 'Le nombre de sommets', 'La distance maximale'], answer: 0,
          counter: '<p>Cas plus simple : ligne de D dans la matrice du graphe de la diapo 29 : (0, 0, 1, 0, 1, 1). Quelle est la somme ? Quel est d(D) ?</p>', hints: ['<p>Chaque 1 de la ligne correspond à un voisin.</p>', '<p>Comptez les voisins de D.</p>'],
          ok: '<p>Oui. Que donne alors la somme de tous les 1 de la matrice ?</p>', explain: '<p>Un 1 par voisin : la somme de la ligne de v est d(v). Exemple : ligne de D (0, 0, 1, 0, 1, 1) → 3 = d(D).</p>', restate: '<p>Redites ce que représente la somme d’une ligne.</p>' },
        { id: 'n15.s4', type: 'num', q: 'La somme de toutes les entrées de la matrice d’adjacence d’un graphe simple non orienté vaut 14. Combien ce graphe a-t-il d’arêtes ?', answer: 7,
          counter: '<p>Cas plus simple : le triangle a 3 arêtes. Combien de 1 contient sa matrice ?</p>', hints: ['<p>Chaque arête apparaît deux fois dans la matrice.</p>', '<p>Divisez par 2.</p>'],
          ok: '<p>Oui, 7. Quel théorème du cours retrouve-t-on ainsi ?</p>', explain: '<p>Somme des 1 = Σ d(v) = 2|E| (diapo 13), donc |E| = 14 / 2 = 7. Exemple : le triangle a 6 « 1 » dans sa matrice et 3 arêtes.</p>', restate: '<p>Redites le lien entre nombre de 1 et nombre d’arêtes.</p>' },
        { id: 'n15.s5', type: 'text', q: 'Expliquez avec vos mots comment on construit la matrice d’adjacence d’un graphe non orienté et comment elle se lit (symétrie, somme d’une ligne). Qu’est-ce qui change pour un graphe orienté ?', expect: ['Case (u, v) = 1 si une arête relie u et v, 0 sinon ; mêmes sommets en lignes et colonnes', 'Graphe non orienté : matrice symétrique ; somme d’une ligne = degré du sommet', 'Graphe orienté : un arc (u, v) ne met un 1 qu’en ligne u, colonne v ; la matrice n’est pas forcément symétrique'],
          counter: '<p>Construisez la matrice de l’arc 1→2 seul, puis celle de l’arête {1, 2}.</p>', hints: ['<p>Pensez à ce qu’apporte une arête par rapport à un arc.</p>', '<p>Rappelez la convention : ligne = origine, colonne = destination.</p>'],
          ok: '<p>Bien. Que faudrait-il pour représenter les poids d’un graphe pondéré ?</p>', explain: '<p>La case (u, v) vaut 1 si une arête relie u et v, 0 sinon. Non orienté : symétrique, la somme d’une ligne est le degré. Orienté : un arc (u, v) ne met qu’un 1 en (u, v), donc pas forcément symétrique. Exemple : l’arc 1→2 donne M[1][2] = 1 et M[2][1] = 0.</p>', restate: '<p>Reformulez la différence de lecture entre graphe orienté et non orienté.</p>' }
      ],
      verify: { gen: 'matrix', level: 2 }
    },
    feynman: {
      topic: 'Matrice d’adjacence',
      prompt: 'Expliquez à un débutant ce qu’est la matrice d’adjacence d’un graphe, comment la remplir et ce qu’on peut y lire, avec un exemple et un contre-exemple.',
      must: ['Matrice indexée par les sommets : case (u, v) = 1 si une arête relie u et v, 0 sinon (diapo 29)', 'Graphe non orienté : matrice symétrique, diagonale de zéros pour un graphe simple', 'La somme d’une ligne est le degré du sommet ; la somme de tous les 1 vaut 2|E|', 'Un exemple (graphe de la diapo 29)', 'Un contre-exemple ou une différence : graphe orienté, matrice non symétrique'],
      pitfalls: ['Ne mettre qu’un seul 1 par arête non orientée', 'Confondre somme d’une ligne et nombre d’arêtes', 'Oublier le sens des arcs dans un graphe orienté'],
      beginner: ['Pourquoi y a-t-il des 0 sur la diagonale ?', 'Que représente la somme d’une ligne ?', 'Comment retrouver le nombre d’arêtes avec la matrice ?', 'La matrice d’un graphe orienté est-elle aussi symétrique ?'],
      model: '<p>La <b>matrice d’adjacence</b> est un tableau carré dont les lignes et les colonnes sont les sommets : la case (u, v) vaut <b>1</b> si une arête relie u et v, <b>0</b> sinon. Pour un graphe simple non orienté, elle est <b>symétrique</b> (une arête {u, v} compte pour (u, v) et (v, u)) et sa diagonale ne contient que des 0 ; la <b>somme d’une ligne</b> est le degré du sommet et la somme de tous les 1 vaut 2|E|. Exemple : sur la diapo 29, la ligne de D contient trois 1, d(D) = 3. Contre-exemple : dans un graphe orienté, un arc (u, v) ne met un 1 qu’en (u, v) ; la matrice n’est pas forcément symétrique.</p>'
    },
    recap: {
      key: ['Matrice d’adjacence : indexée par les sommets, case (u, v) = 1 si une arête relie u et v, 0 sinon (diapo 29).', 'Graphe simple non orienté : matrice symétrique, diagonale de zéros.', 'Somme d’une ligne = degré du sommet ; somme de tous les 1 = 2|E|.', 'Hors cours : graphe orienté, ligne = origine, colonne = destination, matrice non nécessairement symétrique.'],
      defs: [{ t: 'Matrice d’adjacence', d: 'Matrice en deux dimensions indexée par les sommets : 1 à l’intersection de deux sommets reliés par une arête, 0 sinon.', slide: '29' }],
      thms: [],
      formulas: [{ t: 'Degré lu sur la matrice (hors cours)', f: 'd(u) = Σ_v M[u][v]' }, { t: 'Nombre d’arêtes (hors cours)', f: '|E| = (Σ_u Σ_v M[u][v]) / 2' }]
    },
    qs: [
      qb.choice('n15.q1', 1, 'D’après la diapo 29, à l’intersection d’une ligne et d’une colonne de la matrice d’adjacence, on trouve…', ['1 si une arête relie les deux sommets, 0 sinon', 'le degré du sommet', 'le poids de l’arête, toujours', 'le nombre de chaînes entre les deux sommets'], 0, '<p>La matrice d’adjacence contient 1 si une arête relie les deux sommets, 0 sinon (diapo 29). Les poids apparaissent dans la matrice de poids (diapo 30).</p>', { src: 'course', slide: '29', tag: 'matrice-lecture', hints: ['Relisez le texte de la diapo 29.'] }),
      qb.matrix('n15.q2', 1, 'Complétez la <b>matrice d’adjacence</b> de ce graphe (diapo 29), sommets rangés dans l’ordre A, B, C, D, E, F (cliquez sur une case pour la faire passer de 0 à 1).', 's29', 'M[i][j] = 1 si une arête relie i et j. La matrice est symétrique, à diagonale de zéros ; les sommes de lignes sont les degrés 1, 2, 2, 3, 2, 2.', { src: 'course', slide: '29', tag: 'matrice-symetrie', hints: ['Pour chaque arête {u, v}, mettez 1 en (u, v) ET en (v, u).'] }),
      qb.text('n15.q3', 1, '<b>Question de la diapo 29</b> : pourquoi cette matrice est-elle symétrique ? Que représente la somme d’une ligne ?', '<p>Le graphe est non orienté : une arête {u, v} relie u à v et v à u, donc elle met un 1 en (u, v) et en (v, u) ; la matrice est symétrique. La somme d’une ligne est le nombre d’arêtes qui touchent le sommet, c’est-à-dire son degré (graphe simple, sans boucle). La diapo ne donne pas la réponse : elle se déduit de la définition.</p>', ['Graphe non orienté : une arête compte pour (u, v) et (v, u)', 'La matrice est donc symétrique', 'La somme d’une ligne est le degré du sommet', 'Précision : graphe simple, sans boucle (diagonale de zéros)'], { src: 'course', slide: '29', tag: 'matrice-symetrie', hints: ['Une arête a-t-elle un sens ?', 'Un 1 dans la ligne de u correspond à un voisin de u.'] }),
      qb.num('n15.q4', 2, 'Quel est le degré du sommet D d’après la somme de sa ligne ?', function (G) { return rowSum(G, 'D'); }, function (G) { return '<p>Ligne D : (' + GR.adjMatrix(G)[GR.vIndex(G)['D']].join(', ') + '), somme ' + rowSum(G, 'D') + '. D est relié à C, E et F : d(D) = ' + rowSum(G, 'D') + '.</p>'; }, { graph: 's29', tag: 'matrice-lecture', hints: ['Additionnez les valeurs de la ligne D.'] }),
      qb.num('n15.q5', 2, 'Combien ce graphe (diapo 29) contient-il d’arêtes, sachant que la somme de toutes les entrées de sa matrice d’adjacence vaut 12 ?', function (G) { return GR.m(G); }, '<p>Chaque arête apparaît deux fois (en (u, v) et en (v, u)) : 12 / 2 = 6 arêtes. On retrouve Σ d(v) = 2|E| (diapo 13).</p>', { graph: 's29', tag: 'matrice-lecture', hints: ['Chaque arête compte pour deux 1.'] }),
      qb.tf('n15.q6', 2, 'La diagonale de la matrice d’adjacence d’un graphe simple ne contient que des 0.', true, ['Un 1 sur la diagonale signifierait une boucle, qui n’existe pas dans un graphe simple.', 'Parce que la matrice est symétrique.', 'Parce que chaque sommet est adjacent à lui-même.', 'Parce que la somme d’une ligne vaut le degré.'], 0, '<p>M[v][v] = 1 signifierait une boucle sur v (convention hors cours, A16). Un graphe simple n’en a pas : la diagonale ne contient que des 0.</p>', { src: 'extra', tag: 'matrice-lecture', hints: ['Que signifierait un 1 en (v, v) ?'] }),
      qb.matrix('n15.q7', 2, 'Complétez la <b>matrice d’adjacence</b> de ce graphe orienté (ligne = origine, colonne = destination).', ARC4, 'Un arc (u, v) met un 1 en ligne u, colonne v seulement. La boucle (2, 2) met un 1 sur la diagonale. La matrice n’est pas symétrique.', { src: 'extra', tag: 'matrice-orientee', hints: ['Un arc (u, v) donne un seul 1.', 'La boucle est sur la diagonale.'] }),
      qb.choice('n15.q8', 2, 'Dans un graphe orienté (convention : ligne = origine, colonne = destination), la somme de la ligne de s est égale à…', ['son demi-degré sortant d⁺(s)', 'son demi-degré entrant d⁻(s)', 'son degré d(s) = d⁺(s) + d⁻(s)', 'le nombre d’arcs du graphe'], 0, '<p>La ligne de s a un 1 pour chaque arc (s, v) qui part de s : la somme est d⁺(s). La somme de la <i>colonne</i> de s est d⁻(s). (Convention hors cours, A16.)</p>', { src: 'extra', tag: 'matrice-orientee', hints: ['La ligne correspond à l’origine de l’arc.'] }),
      qb.num('n15.q9', 3, 'Combien de « 1 » contient la matrice d’adjacence du graphe de la diapo 31 (8 sommets, 11 arêtes) ?', function (G) { return 2 * GR.m(G); }, '<p>Chaque arête est comptée deux fois : 2 × 11 = 22.</p>', { graph: 's31', tag: 'matrice-lecture', hints: ['Chaque arête apparaît deux fois.'] }),
      qb.choice('n15.q10', 3, 'Dans un réseau social, on code M[i][j] = 1 si i et j sont amis (relation réciproque). La somme de la ligne de Karim vaut 17. Cela signifie que…', ['Karim a 17 amis', 'il y a 17 personnes dans le réseau', 'il y a 17 amitiés dans le réseau', 'Karim est à distance 17 des autres'], 0, '<p>La somme de la ligne de Karim est son degré : le nombre d’amis (la relation est réciproque, donc la matrice est symétrique). Le nombre d’amitiés vaut la somme de tous les 1 divisée par 2.</p>', { transfer: true, tag: 'matrice-lecture', hints: ['Modélisez : sommets = personnes, arêtes = amitiés.'] }),
      qb.edges('n15.q11', 3, 'Voici la matrice d’adjacence d’un graphe simple non orienté dont les sommets sont rangés dans l’ordre A, B, C, D, E.<div class="mx">' + RD.matrixHTML(GF.content.graph(mk('ABCDE', ['AB', 'AD', 'BC', 'DE']))) + '</div>Écrivez la liste de ses arêtes.', function (g) {
        var want = {}, got = {}, i, k;
        [['A', 'B'], ['A', 'D'], ['B', 'C'], ['D', 'E']].forEach(function (p) { want[GR.pairKey(p[0], p[1])] = true; });
        for (i = 0; i < g.edges.length; i++) { k = GR.pairKey(g.edges[i].u, g.edges[i].v); if (!want[k]) return { ok: false, msg: 'L’arête ' + g.edges[i].u + '-' + g.edges[i].v + ' n’apparaît pas dans la matrice.' }; got[k] = true; }
        var miss = Object.keys(want).filter(function (x) { return !got[x]; }).length;
        if (miss) return { ok: false, msg: miss + ' arête(s) de la matrice ne sont pas écrites.' };
        return { ok: true };
      }, '<p>Lisez les 1 au-dessus de la diagonale : (A, B), (A, D), (B, C), (D, E). Les 1 symétriques ne donnent pas d’arête supplémentaire.</p>', { sample: 'A-B, A-D, B-C, D-E', challenge: true, tag: 'matrice-lecture', hints: ['Il suffit de lire la moitié de la matrice, au-dessus de la diagonale.'] })
    ]
  });
  })();
  /* ================= n16 ================= */
  (function () {
    var ZW = mk('ABCD', [['A', 'B', 5], ['B', 'C', 0], ['C', 'D', 2], ['A', 'D', 7]], { weighted: true });
    var ARCW = mk('ABC', [['A', 'B', 2], ['B', 'C', 5], ['C', 'A', 1]], { directed: true, weighted: true });
    function wm(G, i, j) { return GR.weightMatrix(G, { zeroDiag: true })[i][j]; }
  GF.content.add({
    id: 'n16', title: 'Matrice de poids', short: 'Matrice de poids', slides: '30', prereqs: ['n15'],
    objectives: [
      'Construire la matrice de poids W d’un graphe pondéré : W<sub>ij</sub> = w(i, j) si l’arête ou l’arc existe, +∞ sinon.',
      'Expliquer pourquoi la diagonale vaut 0 pour les calculs de distances (en l’absence de boucle négative).',
      'Distinguer un poids nul (vraie arête) de l’absence d’arête (+∞).',
      'Repérer l’incohérence entre la matrice illustrée sur la diapo 30 et son graphe.'
    ],
    course: [
      { k: 'def', slide: '30', t: 'Matrice de poids', h: '<p>La matrice d’adjacence peut également être utilisée pour un graphe <b>pondéré</b> : <span class="mth">W<sub>ij</sub> = w(i, j)</span> si l’arc existe, <b>+∞</b> sinon.</p>', g: 's30', go: { show: ['wmatrix'] } },
      { k: 'def', slide: '30', t: 'Diagonale et calculs de distances', h: '<p>Pour les calculs de distances, poser <span class="mth">W<sub>ii</sub> = 0</span> en l’absence de boucle négative.</p>' },
      { k: 'def', slide: '30', t: 'Poids nul', h: '<p>Un poids nul peut être une <b>vraie arête</b> : il ne signifie pas absence.</p>', g: ZW, go: { show: ['wmatrix'] } },
      { k: 'def', slide: '30', t: 'Le graphe pondéré de la diapo 30', h: '<p>Arêtes pondérées : {A,B} : 0,5 ; {B,C} : 0,7 ; {C,D} : 0,1 ; {D,E} : 0,4 ; {D,F} : 0,5 ; {E,F} : 0,9.</p>', g: 's30' },
      { k: 'warn', slide: '30', t: 'Matrice illustrée incohérente avec son graphe', h: '<p>Sur la diapo 30, trois cases ne correspondent pas au graphe : (B, C) = 7,7 alors que l’arête {B, C} porte 0,7 ; (C, B) = 0,5 (au lieu de 0,7, et la matrice n’est pas symétrique) ; (F, D) = ∞ alors que (D, F) = 0,5. L’application suit le graphe : sa matrice de poids est la matrice correcte ci-dessous.</p>', g: 's30', go: { show: ['wmatrix'] } },
      { k: 'warn', slide: '30', t: 'Arc et arête', h: '<p>La diapo écrit « si l’arc existe » alors que la figure est un graphe <b>non orienté</b> (arêtes). On lit « si l’arête (ou l’arc) existe » ; pour un graphe non orienté, la matrice est symétrique : W<sub>ij</sub> = W<sub>ji</sub>.</p>' },
      { k: 'warn', slide: '30', t: '« Boucle négative » non expliquée', h: '<p>La diapo parle d’une « boucle négative » sans l’expliquer : c’est un circuit dont le poids total est négatif (une boucle de poids négatif en est un cas). Un tel circuit rendrait la distance non définie, car on pourrait toujours la diminuer en le parcourant encore. Ce point dépasse ce chapitre ; on le retient seulement comme condition de W<sub>ii</sub> = 0.</p>' },
      { k: 'extra', t: 'Pourquoi +∞ et pas 0 pour l’absence (hors diapo)', h: '<p>Un poids nul est un poids possible : confondre 0 et absence ferait croire qu’une arête gratuite existe là où il n’y en a pas. Avec +∞, une absence d’arête ne peut jamais être « la moins chère » dans un calcul de minimum (par exemple une distance).</p>' },
      { k: 'extra', t: 'Matrice correcte du graphe de la diapo 30 (hors diapo)', h: '<p>Lignes et colonnes A à F : A : (0 ; 0,5 ; ∞ ; ∞ ; ∞ ; ∞) ; B : (0,5 ; 0 ; 0,7 ; ∞ ; ∞ ; ∞) ; C : (∞ ; 0,7 ; 0 ; 0,1 ; ∞ ; ∞) ; D : (∞ ; ∞ ; 0,1 ; 0 ; 0,4 ; 0,5) ; E : (∞ ; ∞ ; ∞ ; 0,4 ; 0 ; 0,9) ; F : (∞ ; ∞ ; ∞ ; 0,5 ; 0,9 ; 0). La matrice est symétrique.</p>', g: 's30', go: { show: ['wmatrix'] } },
      { k: 'extra', t: 'Matrice d’adjacence et matrice de poids (hors diapo)', h: '<p>La matrice d’adjacence (diapo 29) code seulement présence (1) ou absence (0). La matrice de poids code la <b>valeur</b> w(i, j) quand l’arête existe et +∞ sinon ; avec W<sub>ii</sub> = 0 pour les calculs de distances. Un graphe non pondéré est un cas particulier où toutes les arêtes pèsent 1.</p>' }
    ],
    guided: [
      { h: '<p>Lisons la matrice de poids du graphe de la diapo 30.</p>', g: 's30', go: { show: ['wmatrix'] }, ask: 'Que valent W[C][D] et W[D][C] ? Pourquoi ?', reveal: '<p>Les deux valent 0,1 : le poids de l’arête {C, D}. Le graphe est non orienté : la matrice est symétrique.</p>' },
      { h: '<p>Regardons une case entre deux sommets non reliés.</p>', g: 's30', go: { show: ['wmatrix'] }, ask: 'Que vaut W[A][C] ?', reveal: '<p>A et C ne sont pas reliés par une arête : W[A][C] = +∞ (et non 0).</p>' },
      { h: '<p>La diagonale, elle, ne vaut pas +∞.</p>', g: 's30', ask: 'Que valent les cases W[B][B] et, d’une façon générale, W[i][i] ? Pourquoi ?', reveal: '<p>W[i][i] = 0 : la distance d’un sommet à lui-même vaut 0 (trajet de longueur zéro, diapo 18), en l’absence de boucle négative (diapo 30).</p>' },
      { h: '<p>Dans le graphe ci-contre, l’arête {B, C} a un poids égal à 0.</p>', g: ZW, go: { show: ['wmatrix'] }, ask: 'W[B][C] = 0 : B et C sont-ils reliés ?', reveal: '<p>Oui : un poids nul peut être une vraie arête (diapo 30). L’absence d’arête s’écrit +∞, pas 0.</p>' },
      { h: '<p>Revenons à la matrice dessinée sur la diapo 30 pour la comparer au graphe.</p>', g: 's30', ask: 'La case (B, C) de la matrice illustrée affiche 7,7. Le graphe donne un poids de 0,7. Laquelle faut-il croire ?', reveal: '<p>Le graphe : l’arête {B, C} porte 0,7. La matrice illustrée contient trois cases erronées ((B, C), (C, B), (F, D)) ; l’application suit le graphe.</p>' }
    ],
    examples: [
      { t: 'La matrice de poids du graphe de la diapo 30', h: '<p>Symétrique, diagonale 0, +∞ entre sommets non reliés ; par exemple W[D][F] = 0,5.</p>', g: 's30', go: { show: ['wmatrix'] } },
      { t: 'Un graphe avec un poids nul', h: '<p>L’arête {B, C} de poids 0 est une vraie arête : W[B][C] = W[C][B] = 0, alors que W[A][C] = +∞ (pas d’arête).</p>', g: ZW, go: { show: ['wmatrix'] } },
      { t: 'Un graphe orienté pondéré', h: '<p>Arcs A→B (2), B→C (5), C→A (1) : W[A][B] = 2 mais W[B][A] = +∞ ; la matrice n’est pas symétrique.</p>', g: ARCW, go: { show: ['wmatrix'] } },
      { t: 'Contre-exemple : 0 pour l’absence d’arête', h: '<p>Écrire W[A][C] = 0 dans le graphe de la diapo 30 laisserait croire qu’une arête de poids 0 relie A et C. L’absence se note +∞.</p>', g: 's30', counter: true },
      { t: 'Contre-exemple : la matrice illustrée de la diapo 30', h: '<p>La case (B, C) affiche 7,7 alors que le graphe donne 0,7 ; la case (C, B) affiche 0,5 alors que {B, C} pèse 0,7 ; la case (F, D) affiche ∞ alors que {D, F} pèse 0,5. Elle n’est donc pas la matrice de ce graphe.</p>', g: 's30', counter: true }
    ],
    compare: [{ t: 'Matrice d’adjacence et matrice de poids', cols: ['', 'Adjacence (diapo 29)', 'Poids (diapo 30)'], rows: [['Graphe', 'non pondéré', 'pondéré'], ['Arête présente', '1', 'w(i, j)'], ['Arête absente', '0', '+∞'], ['Diagonale', '0 (pas de boucle)', '0 pour les calculs de distances']] }],
    mistakes: [
      { tag: 'matrice-poids', wrong: 'On note 0 l’absence d’arête dans la matrice de poids.', right: 'L’absence se note <b>+∞</b> ; 0 est un poids possible (diapo 30).' },
      { tag: 'poids-nul', wrong: 'W[u][v] = 0 (u ≠ v) signifie qu’il n’y a pas d’arête.', right: 'Un poids nul peut être une <b>vraie arête</b> : il ne signifie pas absence (diapo 30).' },
      { tag: 'matrice-poids', wrong: 'La diagonale de la matrice de poids vaut +∞ (pas de boucle).', right: 'Pour les calculs de distances, on pose W<sub>ii</sub> = <b>0</b> (en l’absence de boucle négative).' },
      { tag: 'matrice-poids', wrong: 'Dans la matrice de poids, on met 1 pour une arête présente.', right: 'On met le <b>poids</b> w(i, j) de l’arête. Le 1 est celui de la matrice d’adjacence.' },
      { tag: 'matrice-poids', wrong: 'La matrice de poids d’un graphe orienté est toujours symétrique.', right: 'Elle l’est pour un graphe non orienté ; pour un arc (u, v), seule la case (u, v) reçoit w(u, v).' }
    ],
    alt: [
      '<p>Pensez à un tableau de distances routières entre villes. Une case contient le nombre de kilomètres de la route directe ; si aucune route directe n’existe, on écrit « infini » (et non 0 km, qui voudrait dire que les deux villes sont au même endroit). La diagonale vaut 0 : pour aller d’une ville à elle-même, il n’y a rien à parcourir.</p>',
      '<p>Pour construire W : (1) écrivez 0 sur la diagonale ; (2) pour chaque arête {u, v} de poids w, écrivez w en (u, v) et en (v, u) ; (3) remplissez toutes les autres cases avec ∞.</p>',
      '<p>Pour vérifier : la matrice est-elle symétrique (graphe non orienté) ? Y a-t-il autant de valeurs finies hors diagonale que 2 × le nombre d’arêtes ?</p>'
    ],
    socratic: {
      warm: { id: 'n16.s0', type: 'choice', q: 'Dans un graphe pondéré, que représente w(u, v) ?', options: ['Le poids associé à l’arête (ou à l’arc) entre u et v', 'Le degré de u', 'Le nombre de chaînes de u à v', 'La distance en nombre d’arêtes'], answer: 0,
        counter: '<p>Cas plus simple : une route entre deux villes de longueur 12 km : que vaut le poids de l’arête correspondante ?</p>', hints: ['<p>Un graphe pondéré associe un nombre à chaque arête.</p>', '<p>Regardez les nombres écrits sur les arêtes de la diapo 30.</p>'],
        ok: '<p>Exact. Que mettrait-on dans un tableau pour deux sommets non reliés ?</p>', explain: '<p>w(u, v) est le nombre porté par l’arête (ou l’arc) reliant u et v. Exemple : sur la diapo 30, w(C, D) = 0,1.</p>', restate: '<p>Redites ce qu’est un poids.</p>' },
      steps: [
        { id: 'n16.s1', type: 'num', g: 's30', q: 'Quel est le poids de l’arête {D, F} dans le graphe de la diapo 30 (donc la valeur de W[D][F]) ?', answer: 0.5,
          counter: '<p>Cas plus simple : lisez sur le dessin le nombre écrit près de l’arête {A, B}.</p>', hints: ['<p>Cherchez l’arête entre D et F.</p>', '<p>Le nombre écrit à côté est son poids.</p>'],
          ok: '<p>Oui : 0,5. Que vaut alors W[F][D] ?</p>', explain: '<p>L’arête {D, F} porte le poids 0,5 : W[D][F] = 0,5. Le graphe est non orienté, donc W[F][D] = 0,5 aussi. Exemple : W[A][B] = 0,5.</p>', restate: '<p>Redites comment lire un poids sur le graphe.</p>' },
        { id: 'n16.s2', type: 'choice', g: 's30', q: 'Que vaut W[A][C] dans la matrice de poids du graphe de la diapo 30 ?', options: ['0', '+∞ (A et C ne sont pas reliés par une arête)', '0,5', '1'], answer: 1,
          counter: '<p>Cas plus simple : dans un triangle pondéré, que mettriez-vous pour une paire non reliée ?</p>', hints: ['<p>Y a-t-il une arête entre A et C ?</p>', '<p>Relisez la définition : W<sub>ij</sub> = w(i, j) si l’arc existe, +∞ sinon.</p>'],
          ok: '<p>Oui. Pourquoi ne met-on pas 0 ?</p>', explain: '<p>Aucune arête ne relie A et C : W[A][C] = +∞ (diapo 30). Exemple : une paire de villes sans route directe est notée ∞.</p>', restate: '<p>Redites comment on code l’absence d’arête.</p>' },
        { id: 'n16.s3', type: 'choice', g: 's30', q: 'Pour les calculs de distances, que vaut W[B][B] ?', options: ['0', '+∞', '0,5', 'Le poids de la plus petite arête de B'], answer: 0,
          counter: '<p>Cas plus simple : quelle est la distance d’un sommet à lui-même ?</p>', hints: ['<p>Relisez la diapo 30 : « poser W<sub>ii</sub> = 0 ».</p>', '<p>Le trajet de longueur zéro est autorisé (diapo 18).</p>'],
          ok: '<p>Oui. Que dirait-on d’une boucle de poids négatif ?</p>', explain: '<p>On pose W<sub>ii</sub> = 0 : aller de i à i sans rien parcourir coûte 0, tant qu’il n’y a pas de boucle négative (diapo 30). Exemple : la distance de A à A est 0.</p>', restate: '<p>Redites pourquoi la diagonale vaut 0.</p>' },
        { id: 'n16.s4', type: 'choice', g: ZW, q: 'Dans ce graphe, W[B][C] = 0 avec B ≠ C. Les sommets B et C sont-ils reliés par une arête ?', options: ['Oui : un poids nul peut être une vraie arête', 'Non : 0 signifie l’absence d’arête', 'On ne peut pas le savoir', 'Non : une arête a toujours un poids positif'], answer: 0,
          counter: '<p>Cas plus simple : comment la matrice de poids code-t-elle l’absence d’arête ?</p>', hints: ['<p>Relisez : « Un poids nul peut être une vraie arête : il ne signifie pas absence » (diapo 30).</p>', '<p>L’absence se code par +∞.</p>'],
          ok: '<p>Oui. Quelle valeur coderait l’absence entre A et C ?</p>', explain: '<p>L’absence d’arête s’écrit +∞. Un 0 hors diagonale est donc un poids de 0 : une vraie arête. Exemple : ici l’arête {B, C} existe et pèse 0.</p>', restate: '<p>Redites la différence entre poids nul et absence.</p>' },
        { id: 'n16.s5', type: 'text', q: 'Expliquez avec vos mots comment on construit la matrice de poids d’un graphe pondéré (arête présente, absente, diagonale) et pourquoi on n’utilise pas 0 pour l’absence.', expect: ['Arête présente : W<sub>ij</sub> = w(i, j) ; arête absente : +∞', 'Diagonale : W<sub>ii</sub> = 0 pour les calculs de distances (sans boucle négative)', '0 est un poids possible (une vraie arête) : on ne peut pas l’utiliser pour l’absence'],
          counter: '<p>Construisez la matrice d’un graphe à 2 sommets reliés par une arête de poids 0.</p>', hints: ['<p>Trois sortes de cases : arête, pas d’arête, diagonale.</p>', '<p>Que se passerait-il si 0 voulait dire « pas d’arête » et aussi « poids 0 » ?</p>'],
          ok: '<p>Bien. Où retrouve-t-on cette matrice pour calculer des distances ?</p>', explain: '<p>W<sub>ij</sub> = w(i, j) si l’arête existe, +∞ sinon, et W<sub>ii</sub> = 0 pour les calculs de distances. On ne code pas l’absence par 0 car un poids nul est possible. Exemple : deux sommets reliés par une arête de poids 0 ont W = 0 hors diagonale.</p>', restate: '<p>Reformulez les trois règles de remplissage.</p>' }
      ],
      verify: { gen: 'wmatrix', level: 2 }
    },
    feynman: {
      topic: 'Matrice de poids',
      prompt: 'Expliquez à un débutant ce qu’est la matrice de poids d’un graphe pondéré et comment la remplir, avec un exemple et un piège à éviter.',
      must: ['W<sub>ij</sub> = w(i, j) si l’arête (ou l’arc) existe, +∞ sinon (diapo 30)', 'Diagonale : W<sub>ii</sub> = 0 pour les calculs de distances, en l’absence de boucle négative', 'Un poids nul peut être une vraie arête : il ne signifie pas absence', 'Un exemple (diapo 30 : W[D][F] = 0,5, W[A][C] = ∞)', 'Symétrique si le graphe est non orienté'],
      pitfalls: ['Noter 0 pour une arête absente', 'Mettre ∞ sur la diagonale', 'Oublier que la matrice illustrée de la diapo 30 contient des cases fausses'],
      beginner: ['Pourquoi ne pas mettre 0 quand il n’y a pas d’arête ?', 'Que vaut la diagonale ?', 'Quelle différence avec la matrice d’adjacence ?', 'Que veut dire un poids égal à 0 ?'],
      model: '<p>La <b>matrice de poids</b> W d’un graphe pondéré est un tableau indexé par les sommets : <b>W<sub>ij</sub> = w(i, j)</b> si l’arête (ou l’arc) existe, <b>+∞</b> sinon. Pour les calculs de distances on pose <b>W<sub>ii</sub> = 0</b> (en l’absence de boucle négative). Un poids nul est un vrai poids : il ne signifie pas l’absence d’arête, qui se note +∞. Exemple (diapo 30) : W[D][F] = 0,5 et W[A][C] = ∞. Piège : la matrice dessinée sur la diapo contient trois cases incohérentes avec son graphe.</p>'
    },
    recap: {
      key: ['Matrice de poids : W<sub>ij</sub> = w(i, j) si l’arête (ou l’arc) existe, +∞ sinon (diapo 30).', 'Pour les calculs de distances : W<sub>ii</sub> = 0 en l’absence de boucle négative.', 'Un poids nul peut être une vraie arête : il ne signifie pas absence.', 'Graphe non orienté : matrice symétrique ; la matrice illustrée de la diapo 30 contient 3 cases erronées.'],
      defs: [{ t: 'Matrice de poids', d: 'W<sub>ij</sub> = w(i, j) si l’arc (ou l’arête) existe, +∞ sinon ; W<sub>ii</sub> = 0 pour les calculs de distances (sans boucle négative).', slide: '30' }],
      thms: [],
      formulas: [{ t: 'Matrice de poids', f: 'W_ij = w(i, j) si l’arête existe, +∞ sinon ; W_ii = 0' }]
    },
    qs: [
      qb.choice('n16.q1', 1, 'D’après la diapo 30, dans la matrice de poids W d’un graphe pondéré, W<sub>ij</sub> vaut…', ['w(i, j) si l’arc (ou l’arête) existe, +∞ sinon', '1 si l’arête existe, 0 sinon', 'w(i, j) si l’arête existe, 0 sinon', 'le degré de i'], 0, '<p>La diapo 30 : W<sub>ij</sub> = w(i, j) si l’arc existe, +∞ sinon. La réponse « 1 / 0 » est la matrice d’adjacence (diapo 29).</p>', { src: 'course', slide: '30', tag: 'matrice-poids', hints: ['Relisez la première puce de la diapo 30.'] }),
      qb.wmatrix('n16.q2', 1, 'Complétez la <b>matrice de poids</b> de ce graphe pondéré (diapo 30). Écrivez <b>inf</b> (ou ∞) quand il n’y a pas d’arête et 0 sur la diagonale.', 's30', 'W[i][j] = w(i, j) si l’arête existe, +∞ sinon ; W[i][i] = 0. Le graphe est non orienté : la matrice est symétrique. (Elle diffère en trois cases de la matrice dessinée sur la diapo 30.)', { src: 'course', slide: '30', tag: 'matrice-poids', hints: ['Reportez le poids de chaque arête en (u, v) et (v, u).', 'Les cases sans arête contiennent ∞.'] }),
      qb.text('n16.q3', 1, 'Expliquez avec vos mots pourquoi, dans une matrice de poids, l’absence d’arête ne se note pas 0.', '<p>Un poids nul peut être le poids d’une vraie arête (diapo 30) : écrire 0 pour une arête absente serait donc ambigu. L’absence se note +∞ : une absence d’arête ne peut jamais être « la moins chère » dans un calcul de minimum, comme une distance. La diagonale, elle, vaut 0 pour les calculs de distances (trajet de longueur zéro).</p>', ['Un poids nul peut être une vraie arête', 'Il y aurait ambiguïté entre « poids 0 » et « pas d’arête »', 'L’absence d’arête se note +∞', 'La diagonale vaut 0 pour les calculs de distances'], { src: 'course', slide: '30', tag: 'poids-nul', hints: ['Relisez la dernière puce de la diapo 30.'] }),
      qb.num('n16.q4', 2, 'Quelle est la valeur de la case W[B][C] de la matrice de poids de ce graphe (diapo 30) ? (La matrice dessinée sur la diapo affiche 7,7 : cette valeur est erronée.)', function (G) { return wm(G, 1, 2); }, '<p>L’arête {B, C} porte le poids 0,7 : W[B][C] = 0,7. La matrice illustrée de la diapo 30 affiche 7,7, ce qui est incohérent avec le graphe (anomalie A17).</p>', { graph: 's30', tol: 1e-9, src: 'course', slide: '30', tag: 'matrice-poids', hints: ['Lisez le poids de l’arête {B, C} sur le dessin du graphe.'] }),
      qb.tf('n16.q5', 2, 'Dans une matrice de poids, W[u][v] = 0 (avec u ≠ v) signifie qu’il n’y a pas d’arête entre u et v.', false, ['L’absence d’arête se note +∞ ; un poids nul peut être une vraie arête.', 'Parce que la diagonale vaut toujours 0.', 'Parce que la matrice est symétrique.', 'Parce que 0 est plus petit que 1.'], 0, '<p>Diapo 30 : « Un poids nul peut être une vraie arête : il ne signifie pas absence. » L’absence est codée par +∞.</p>', { graph: ZW, src: 'course', slide: '30', tag: 'poids-nul', hints: ['Comment la matrice code-t-elle l’absence d’arête ?'] }),
      qb.choice('n16.q6', 2, 'À quoi sert la convention W<sub>ii</sub> = 0 (diapo 30) ?', ['Aux calculs de distances : la distance d’un sommet à lui-même est 0 (sans boucle négative)', 'À indiquer qu’il y a une boucle sur chaque sommet', 'À rendre la matrice symétrique', 'À signaler qu’un sommet est isolé'], 0, '<p>« Pour les calculs de distances, poser W<sub>ii</sub> = 0 en l’absence de boucle négative » : aller de i à i par un trajet de longueur zéro coûte 0.</p>', { src: 'course', slide: '30', tag: 'matrice-poids', hints: ['Pensez au trajet de longueur zéro (diapo 18).'] }),
      qb.wmatrix('n16.q7', 2, 'Complétez la <b>matrice de poids</b> de ce graphe orienté pondéré (ligne = origine, colonne = destination). Écrivez <b>inf</b> quand il n’y a pas d’arc et 0 sur la diagonale.', ARCW, 'Un arc (u, v) de poids w met w en ligne u, colonne v seulement : W[A][B] = 2, W[B][C] = 5, W[C][A] = 1 ; les autres cases hors diagonale valent ∞ et la diagonale 0. La matrice n’est pas symétrique.', { src: 'extra', tag: 'matrice-poids', hints: ['Un arc (u, v) ne remplit que la case (u, v).'] }),
      qb.num('n16.q8', 3, 'Un graphe non orienté pondéré a 5 sommets et 6 arêtes (poids tous différents de ∞). Combien de cases <b>hors diagonale</b> de sa matrice de poids contiennent une valeur finie ?', 12, '<p>Chaque arête apparaît dans deux cases, (u, v) et (v, u) : 2 × 6 = 12 cases finies hors diagonale.</p>', { tag: 'matrice-poids', hints: ['Une arête non orientée remplit deux cases.'] }),
      qb.choice('n16.q9', 3, 'Un tableau de distances routières W donne W[Tunis][Sfax] = +∞. Cela signifie que…', ['il n’existe pas de route directe entre Tunis et Sfax dans le modèle', 'Sfax est à une distance nulle de Tunis', 'la route est infiniment longue mais existe', 'Tunis et Sfax sont la même ville'], 0, '<p>Dans une matrice de poids, +∞ code l’absence d’arête (ici : pas de route directe). Une distance de 0 voudrait dire une arête de poids 0, ce qui n’est pas la même chose.</p>', { transfer: true, tag: 'matrice-poids', hints: ['Comment la matrice de poids code-t-elle l’absence d’arête ?'] }),
      qb.wmatrix('n16.q10', 3, 'Complétez la <b>matrice de poids</b> de ce graphe, qui contient une arête de <b>poids 0</b> (attention à ne pas la confondre avec une absence). Écrivez <b>inf</b> pour l’absence d’arête.', ZW, 'Arêtes : {A,B} : 5, {B,C} : 0, {C,D} : 2, {A,D} : 7. W[B][C] = W[C][B] = 0 (vraie arête de poids 0) ; W[A][C] = W[B][D] = ∞ (pas d’arête) ; diagonale 0.', { challenge: true, tag: 'poids-nul', hints: ['Ne mettez ∞ que là où il n’y a pas d’arête.', 'La case (B, C) vaut 0 : c’est un poids.'] })
    ]
  });
  })();
  /* ================= n17 ================= */
  (function () {
    var G29 = GS.get('s29');
    var ARC4 = mk('1234', [['1', '2'], ['2', '2'], ['2', '3'], ['4', '1'], ['3', '4']], { directed: true });
    var DIR3 = mk('123', [['1', '2'], ['2', '3'], ['3', '1']], { directed: true });
    var SMALL = mk('1234', ['12', '13', '24']);
  GF.content.add({
    id: 'n17', title: 'Listes d’adjacence', short: 'Listes d’adjacence', slides: '31', prereqs: ['n15'],
    objectives: [
      'Écrire les listes d’adjacence d’un graphe simple non orienté : pour chaque sommet, la liste des sommets auxquels il est adjacent.',
      'Lire sur les listes le degré d’un sommet (longueur de sa liste) et le nombre d’arêtes (total des longueurs divisé par 2).',
      'Vérifier la cohérence des listes d’un graphe non orienté : v est dans la liste de u si et seulement si u est dans celle de v.',
      'Adapter les listes à un graphe orienté (successeurs), en sachant que cette convention n’est pas écrite sur la diapo.'
    ],
    course: [
      { k: 'def', slide: '31', t: 'Listes d’adjacence', h: '<p>On peut aussi représenter un graphe <b>simple</b> en donnant, pour chacun de ses sommets, la <b>liste des sommets auxquels il est adjacent</b>. Ce sont les <b>listes d’adjacence</b>.</p>', g: 's31', go: { show: ['lists'] } },
      { k: 'def', slide: '31', t: 'L’exemple de la diapo 31', h: '<p>Graphe à 8 sommets. Listes : 1 : 2, 3 ; 2 : 1, 3, 4, 5 ; 3 : 1, 2, 5, 7, 8 ; 4 : 2, 5 ; 5 : 2, 3, 4, 6 ; 6 : 5 ; 7 : 3, 8 ; 8 : 3, 7. La diapo met en évidence l’arête {2, 4} (en rouge) : le 4 figure dans la liste de 2, et le 2 dans la liste de 4.</p>', g: 's31', go: { hlV: { '2': 'hl', '4': 'hl' } } },
      { k: 'warn', slide: '31', t: 'Seul le graphe simple est traité', h: '<p>La diapo définit les listes pour un graphe <b>simple</b> (non orienté). Pour un graphe orienté, l’application utilise la lecture usuelle : la liste de s contient les <b>successeurs</b> de s (extrémités des arcs qui partent de s), et une boucle (s, s) place s dans sa propre liste. Cette convention n’est pas écrite sur la diapo (voir aussi la diapo 32, qui parle de d⁺(u) « en orienté »).</p>' },
      { k: 'warn', slide: '31', t: 'Ordre des voisins', h: '<p>Sur la diapo, les sommets sont rangés par ordre croissant dans chaque liste. Le texte n’impose aucun ordre : l’ordre à l’intérieur d’une liste n’a pas d’importance pour la représentation (seule la <i>liste</i> des voisins compte).</p>' },
      { k: 'extra', t: 'Lecture des listes (hors diapo)', h: '<p>La <b>longueur</b> de la liste d’un sommet est son <b>degré</b> : sur la diapo 31, d(3) = 5, d(6) = 1. La somme des longueurs de toutes les listes vaut 22 = 2 × 11 : chaque arête {u, v} est écrite deux fois (v dans la liste de u, u dans celle de v) — c’est le théorème de la diapo 13.</p>', g: 's31', go: { showDeg: true } },
      { k: 'extra', t: 'Cohérence des listes d’un graphe non orienté (hors diapo)', h: '<p>Si le 4 apparaît dans la liste de 2, alors le 2 doit apparaître dans la liste de 4. Des listes qui ne vérifient pas cette symétrie ne peuvent pas décrire un graphe non orienté (elles pourraient décrire un graphe orienté).</p>' },
      { k: 'extra', t: 'Cas orienté : listes de successeurs (hors diapo)', h: '<p>Dans le graphe orienté 1→2, 2→3, 3→1, les listes sont 1 : 2 ; 2 : 3 ; 3 : 1. Elles ne sont pas symétriques. Le total des longueurs est le nombre d’arcs (ici 3), non 2|A|.</p>', g: DIR3, go: { show: ['lists'] } }
    ],
    guided: [
      { h: '<p>La liste d’un sommet, c’est l’ensemble de ses voisins. Lisons le graphe de la diapo 31.</p>', g: 's31', go: { show: ['lists'], hlV: { '4': 'hl' } }, ask: 'Quelle est la liste d’adjacence du sommet 4 ?', reveal: '<p>4 est relié à 2 et à 5 : la liste du sommet 4 est (2, 5).</p>' },
      { h: '<p>La longueur d’une liste est le nombre de voisins du sommet.</p>', g: 's31', go: { show: ['lists'], hlV: { '3': 'hl' } }, ask: 'Combien d’éléments contient la liste du sommet 3 ? Que représente ce nombre ?', reveal: '<p>La liste du sommet 3 est (1, 2, 5, 7, 8) : 5 éléments. C’est le degré de 3, d(3) = 5.</p>' },
      { h: '<p>Additionnons les longueurs de toutes les listes : 2 + 4 + 5 + 2 + 4 + 1 + 2 + 2.</p>', g: 's31', ask: 'Quel est ce total ? Combien d’arêtes a le graphe ?', reveal: '<p>Total : 22 = 2 × 11. Chaque arête est écrite deux fois (une dans chaque liste) : le graphe a 11 arêtes.</p>' },
      { h: '<p>Regardons l’arête {2, 4}, en rouge sur la diapo.</p>', g: 's31', go: { hlV: { '2': 'hl', '4': 'hl' } }, ask: 'Dans quelles listes apparaît-elle ?', reveal: '<p>Dans deux listes : le 4 est dans la liste de 2, et le 2 est dans la liste de 4.</p>' },
      { h: '<p>Voici des listes : 1 : (2) ; 2 : ( ) ; 3 : (1).</p>', ask: 'Peuvent-elles représenter un graphe non orienté ?', reveal: '<p>Non : 2 est dans la liste de 1, mais 1 n’est pas dans la liste de 2 ; et 1 est dans la liste de 3 mais 3 n’est pas dans la liste de 1. Dans un graphe non orienté, chaque arête figure dans les deux listes.</p>' }
    ],
    examples: [
      { t: 'Les listes du graphe de la diapo 31', h: '<p>Graphe à 8 sommets et 11 arêtes : total des longueurs 22 ; 6 est de degré 1 (liste (5)).</p>', g: 's31', go: { show: ['lists'] } },
      { t: 'Les listes du graphe de la diapo 29', h: '<p>A : B ; B : A, C ; C : B, D ; D : C, E, F ; E : D, F ; F : D, E. Total des longueurs : 12 = 2 × 6.</p>', g: 's29', go: { show: ['lists'] } },
      { t: 'Un petit graphe à 4 sommets', h: '<p>Arêtes {1,2}, {1,3}, {2,4} : listes 1 : 2, 3 ; 2 : 1, 4 ; 3 : 1 ; 4 : 2.</p>', g: SMALL, go: { show: ['lists'] } },
      { t: 'Contre-exemple : des listes incohérentes', h: '<p>Si le 2 figure dans la liste de 1 sans que 1 figure dans celle de 2, ces listes ne décrivent pas un graphe non orienté.</p>', counter: true },
      { t: 'Contre-exemple : le cas orienté', h: '<p>Dans le circuit 1→2→3→1, les listes (successeurs) ne sont pas symétriques : 2 est dans la liste de 1, mais 1 n’est pas dans la liste de 2.</p>', g: DIR3, go: { show: ['lists'] }, counter: true }
    ],
    compare: [{ t: 'Matrice d’adjacence et listes d’adjacence', cols: ['', 'Matrice (diapo 29)', 'Listes (diapo 31)'], rows: [['Ce qui est stocké', 'une case par paire de sommets (0 ou 1)', 'les voisins de chaque sommet seulement'], ['Degré d’un sommet', 'somme de la ligne', 'longueur de la liste'], ['Total à lire pour tout le graphe', '2|E| fois « 1 » parmi n² cases', '2|E| éléments (non orienté)']] }],
    mistakes: [
      { tag: 'listes-lecture', wrong: 'La liste d’un sommet contient les arêtes de ce sommet.', right: 'Elle contient les <b>sommets</b> auxquels il est adjacent (diapo 31), pas les arêtes.' },
      { tag: 'listes-lecture', wrong: 'Dans un graphe non orienté, chaque arête n’apparaît que dans une seule liste.', right: 'Elle apparaît dans <b>deux</b> listes : v dans celle de u, u dans celle de v. D’où un total de 2|E| éléments.' },
      { tag: 'listes-orientees', wrong: 'Dans un graphe orienté, la liste de s contient aussi les sommets qui pointent vers s.', right: 'Elle ne contient que les <b>successeurs</b> de s (arcs qui partent de s). Les prédécesseurs ne figurent pas dans cette liste.' },
      { tag: 'listes-lecture', wrong: 'Un sommet isolé n’a pas de liste.', right: 'Il a une liste, mais <b>vide</b> (degré 0).' },
      { tag: 'listes-lecture', wrong: 'L’ordre des voisins dans la liste change le graphe.', right: 'L’ordre est sans importance : seule compte la liste des voisins (la diapo 31 les range par ordre croissant par commodité).' }
    ],
    alt: [
      '<p>Pensez à un carnet d’adresses : pour chaque personne, une page avec la liste de ses contacts. La longueur de la page est son nombre de contacts (son degré). Si Anna a Basile dans ses contacts, Basile doit avoir Anna dans les siens : sinon la relation n’est pas réciproque.</p>',
      '<p>Pour construire les listes : prenez chaque sommet à tour de rôle, parcourez toutes les arêtes et notez l’autre extrémité de chaque arête qui le touche.</p>',
      '<p>Pour vérifier : (1) le total des longueurs vaut-il 2 × le nombre d’arêtes ? (2) chaque arête apparaît-elle dans les deux listes ?</p>'
    ],
    socratic: {
      warm: { id: 'n17.s0', type: 'choice', q: 'Dans un graphe non orienté, deux sommets u et v sont adjacents lorsque…', options: ['une arête les relie', 'ils ont le même degré', 'ils sont dans la même composante', 'δ(u, v) = 2'], answer: 0,
        counter: '<p>Cas plus simple : dans un chemin A–B–C, A et C sont-ils adjacents ?</p>', hints: ['<p>Relisez la définition d’adjacence (diapo 10 ou 11).</p>', '<p>Adjacent = relié directement par une arête.</p>'],
        ok: '<p>Exact. La liste d’un sommet regroupe justement ses sommets adjacents : comment l’écrirait-on pour tous les sommets ?</p>', explain: '<p>Deux sommets sont adjacents quand une arête les relie. Exemple : dans A–B–C, A et B sont adjacents, pas A et C.</p>', restate: '<p>Redites avec vos mots ce qu’est l’adjacence.</p>' },
      steps: [
        { id: 'n17.s1', type: 'set', g: 's31', q: 'Donnez la <b>liste d’adjacence du sommet 5</b> du graphe de la diapo 31 (les sommets auxquels 5 est adjacent).', answer: function (G) { return GR.neighbors(G, '5'); },
          counter: '<p>Cas plus simple : dans un triangle A–B–C, quelle est la liste d’adjacence de A ?</p>', hints: ['<p>Repérez les arêtes qui touchent 5 sur le dessin.</p>', '<p>Notez l’autre extrémité de chacune.</p>'],
          ok: '<p>Oui : 2, 3, 4, 6. Combien d’éléments a cette liste ?</p>', explain: '<p>Les arêtes qui touchent 5 sont {2,5}, {3,5}, {4,5}, {5,6} : la liste de 5 est (2, 3, 4, 6). Exemple : dans un triangle, la liste de A est (B, C).</p>', restate: '<p>Redites comment obtenir la liste d’un sommet.</p>' },
        { id: 'n17.s2', type: 'num', g: 's31', q: 'Combien d’éléments contient la liste d’adjacence du sommet <b>3</b> du graphe de la diapo 31 ?', answer: function (G) { return GR.degree(G, '3'); },
          counter: '<p>Cas plus simple : combien d’éléments a la liste de B dans un chemin A–B–C ?</p>', hints: ['<p>Comptez les voisins de 3.</p>', '<p>La longueur de la liste est le degré du sommet.</p>'],
          ok: '<p>Oui, 5. Que représente ce nombre ?</p>', explain: '<p>La liste du sommet 3 est (1, 2, 5, 7, 8) : 5 éléments, d(3) = 5. Exemple : la liste de B dans A–B–C a 2 éléments.</p>', restate: '<p>Redites le lien entre longueur de liste et degré.</p>' },
        { id: 'n17.s3', type: 'num', g: 's31', q: 'Si l’on écrit toutes les listes d’adjacence du graphe de la diapo 31, combien d’éléments y a-t-il <b>au total</b> (en additionnant les longueurs de toutes les listes) ?', answer: function (G) { return 2 * GR.m(G); },
          counter: '<p>Cas plus simple : pour un triangle, combien d’éléments au total ?</p>', hints: ['<p>Chaque arête est écrite combien de fois ?</p>', '<p>Σ d(v) = 2|E| (diapo 13).</p>'],
          ok: '<p>Oui, 22. Combien le graphe a-t-il d’arêtes ?</p>', explain: '<p>Chaque arête figure dans deux listes : total = 2|E| = 22 (le graphe a 11 arêtes). Exemple : pour un triangle, 3 listes de 2 éléments : total 6 = 2 × 3.</p>', restate: '<p>Redites pourquoi le total vaut 2|E|.</p>' },
        { id: 'n17.s4', type: 'choice', q: 'Dans les listes d’adjacence d’un graphe non orienté, le sommet 4 figure dans la liste du sommet 2. Que peut-on dire de la liste du sommet 4 ?', options: ['Elle contient le sommet 2', 'Elle ne contient pas le sommet 2', 'Elle est vide', 'Elle contient tous les sommets'], answer: 0,
          counter: '<p>Cas plus simple : l’arête {2, 4} a-t-elle un sens ?</p>', hints: ['<p>Une arête d’un graphe non orienté relie les deux sommets dans les deux sens.</p>', '<p>Regardez l’arête rouge {2, 4} de la diapo 31.</p>'],
          ok: '<p>Oui. Et dans un graphe orienté ?</p>', explain: '<p>L’arête {2, 4} est la même que {4, 2} : elle figure dans la liste de 2 (le 4) et dans celle de 4 (le 2), comme sur la diapo 31. Exemple : dans A–B, A est dans la liste de B et B dans celle de A.</p>', restate: '<p>Redites pourquoi chaque arête est écrite deux fois.</p>' },
        { id: 'n17.s5', type: 'text', q: 'Expliquez avec vos mots ce qu’est la liste d’adjacence d’un graphe, ce que représente la longueur d’une liste et ce que vaut le total des longueurs.', expect: ['Pour chaque sommet, la liste des sommets auxquels il est adjacent', 'La longueur de la liste est le degré du sommet', 'Chaque arête est écrite deux fois (non orienté) : total des longueurs = 2|E|'],
          counter: '<p>Écrivez les listes d’un triangle et comptez les éléments.</p>', hints: ['<p>Une liste par sommet.</p>', '<p>Chaque arête apparaît dans les listes de ses deux extrémités.</p>'],
          ok: '<p>Bien. Quelle mémoire cela demande-t-il par rapport à la matrice ?</p>', explain: '<p>La liste d’un sommet contient ses voisins ; sa longueur est son degré ; le total des longueurs est 2|E| puisque chaque arête est écrite dans deux listes. Exemple : un triangle a trois listes de 2 éléments, total 6.</p>', restate: '<p>Reformulez en une phrase ce que contiennent les listes.</p>' }
      ],
      verify: { gen: 'lists', level: 2 }
    },
    feynman: {
      topic: 'Listes d’adjacence',
      prompt: 'Expliquez à un débutant ce que sont les listes d’adjacence d’un graphe, comment les écrire et comment les lire, avec un exemple et un contre-exemple.',
      must: ['Pour chaque sommet, la liste des sommets auxquels il est adjacent (diapo 31)', 'La longueur d’une liste est le degré ; le total des longueurs vaut 2|E| (graphe non orienté)', 'Chaque arête apparaît dans deux listes (symétrie)', 'Un exemple (diapo 31)', 'Un contre-exemple : listes incohérentes, ou cas orienté (successeurs)'],
      pitfalls: ['Écrire les arêtes au lieu des sommets', 'Oublier qu’une arête apparaît deux fois', 'Oublier la liste vide d’un sommet isolé'],
      beginner: ['Quelle est la liste d’un sommet isolé ?', 'Pourquoi le total des longueurs est-il pair ?', 'Dans un graphe orienté, que met-on dans la liste de s ?', 'Quelle différence avec la matrice d’adjacence ?'],
      model: '<p>Les <b>listes d’adjacence</b> décrivent un graphe en donnant, pour <b>chaque sommet</b>, la <b>liste des sommets auxquels il est adjacent</b>. La longueur de la liste d’un sommet est son degré, et comme chaque arête est écrite dans les listes de ses deux extrémités, le total des longueurs vaut 2|E|. Exemple (diapo 31) : la liste du sommet 4 est (2, 5), celle du sommet 6 est (5). Contre-exemple : dans un graphe orienté, la liste de s ne contient que les successeurs de s, donc les listes ne sont pas symétriques.</p>'
    },
    recap: {
      key: ['Listes d’adjacence : pour chaque sommet, la liste des sommets auxquels il est adjacent (diapo 31).', 'Longueur d’une liste = degré du sommet ; total des longueurs = 2|E| (non orienté).', 'Chaque arête figure dans deux listes (v dans celle de u, u dans celle de v).', 'Hors cours : graphe orienté → liste des successeurs ; le total des longueurs est le nombre d’arcs.'],
      defs: [{ t: 'Listes d’adjacence', d: 'Représentation d’un graphe simple donnant, pour chaque sommet, la liste des sommets auxquels il est adjacent.', slide: '31' }],
      thms: [],
      formulas: [{ t: 'Total des longueurs des listes (non orienté, hors cours)', f: 'Σ |liste(v)| = 2|E|' }]
    },
    qs: [
      qb.choice('n17.q1', 1, 'D’après la diapo 31, la liste d’adjacence d’un sommet contient…', ['les sommets auxquels il est adjacent', 'les arêtes qui le touchent', 'tous les sommets du graphe', 'les sommets de degré maximum'], 0, '<p>La liste d’adjacence d’un sommet contient les <b>sommets</b> auxquels il est adjacent (diapo 31).</p>', { src: 'course', slide: '31', tag: 'listes-lecture', hints: ['Relisez le texte de la diapo 31.'] }),
      qb.lists('n17.q2', 1, 'Écrivez les <b>listes d’adjacence</b> de ce graphe (diapo 29) : pour chaque sommet, la liste des sommets auxquels il est adjacent (séparés par des virgules ; laissez vide si la liste est vide).', 's29', 'La liste d’un sommet contient ses voisins : A : B ; B : A, C ; C : B, D ; D : C, E, F ; E : D, F ; F : D, E. Chaque arête est écrite deux fois.', { src: 'course', slide: '31', tag: 'listes-lecture', hints: ['La liste de v, c’est l’ensemble de ses voisins.'] }),
      qb.text('n17.q3', 1, 'Expliquez avec vos mots ce que sont les listes d’adjacence et ce que représente la longueur de la liste d’un sommet.', '<p>Les listes d’adjacence donnent, pour chaque sommet, la liste des sommets auxquels il est adjacent (diapo 31). La longueur de la liste d’un sommet est son degré. Comme chaque arête est écrite deux fois (dans les listes de ses deux extrémités), le total des longueurs vaut 2|E|.</p>', ['Pour chaque sommet, la liste des sommets adjacents', 'La longueur de la liste est le degré', 'Chaque arête est écrite deux fois', 'Total des longueurs = 2|E|'], { src: 'course', slide: '31', tag: 'listes-lecture', hints: ['Reprenez la définition de la diapo 31 puis comptez les éléments.'] }),
      qb.set('n17.q4', 2, 'Donnez la liste d’adjacence du sommet 3 dans le graphe de la diapo 31.', function (G) { return GR.neighbors(G, '3'); }, function (G) { return '<p>Les arêtes qui touchent 3 sont {1,3}, {2,3}, {3,5}, {3,7}, {3,8} : la liste de 3 est ' + U.set(GR.neighbors(G, '3')) + '.</p>'; }, { graph: 's31', src: 'course', slide: '31', tag: 'listes-lecture', hints: ['Repérez toutes les arêtes qui touchent 3.'] }),
      qb.num('n17.q5', 2, 'Combien d’éléments contient la liste d’adjacence du sommet 6 dans ce graphe (diapo 31) ?', function (G) { return GR.degree(G, '6'); }, '<p>Le sommet 6 n’est relié qu’à 5 : sa liste est (5), un seul élément ; d(6) = 1.</p>', { graph: 's31', tag: 'listes-lecture', hints: ['La longueur de la liste est le degré du sommet.'] }),
      qb.tf('n17.q6', 2, 'Dans les listes d’adjacence d’un graphe non orienté, si le sommet 4 figure dans la liste du sommet 2, alors le sommet 2 figure dans la liste du sommet 4.', true, ['Une arête {2, 4} relie les deux sommets : elle est écrite dans les deux listes.', 'Parce que les deux listes ont la même longueur.', 'Parce que 2 est plus petit que 4.', 'Seulement si le graphe est complet.'], 0, '<p>Dans un graphe non orienté, {2, 4} = {4, 2} : l’arête figure dans les deux listes (comme l’arête rouge de la diapo 31).</p>', { src: 'extra', tag: 'listes-lecture', hints: ['Une arête a-t-elle un sens ?'] }),
      qb.lists('n17.q7', 2, 'Écrivez les <b>listes d’adjacence</b> de ce graphe orienté : pour chaque sommet s, la liste des sommets v tels que (s, v) est un arc.', ARC4, 'La liste de s contient les successeurs de s : 1 : 2 ; 2 : 2, 3 (la boucle (2, 2) place 2 dans sa propre liste) ; 3 : 4 ; 4 : 1.', { src: 'extra', tag: 'listes-orientees', hints: ['On ne suit que le sens des flèches, depuis s.'] }),
      qb.choice('n17.q8', 2, 'Quelles listes ne peuvent <b>pas</b> représenter un graphe non orienté ? (a) 1 : 2 ; 2 : 1 ; (b) 1 : 2 ; 2 : ( ) ; (c) 1 : ( ) ; 2 : ( ).', ['Seulement (b)', 'Seulement (a)', '(a) et (b)', 'Seulement (c)'], 0, '<p>Dans (b), 2 figure dans la liste de 1 mais pas 1 dans celle de 2 : incohérent pour un graphe non orienté (cela décrit un arc 1→2). (a) décrit l’arête {1, 2} ; (c) décrit deux sommets isolés.</p>', { src: 'extra', tag: 'listes-lecture', hints: ['Vérifiez la symétrie : u dans la liste de v ⇔ v dans celle de u.'] }),
      qb.num('n17.q9', 3, 'Combien d’éléments y a-t-il au total dans les listes d’adjacence du graphe de la diapo 31 (8 sommets, 11 arêtes) ?', function (G) { return 2 * GR.m(G); }, '<p>Chaque arête figure dans deux listes : 2 × 11 = 22.</p>', { graph: 's31', tag: 'listes-lecture', hints: ['Chaque arête est écrite deux fois.'] }),
      qb.choice('n17.q10', 3, 'Un site web stocke, pour chaque page, la liste des pages vers lesquelles elle contient un lien. Du point de vue des graphes, c’est…', ['les listes d’adjacence d’un graphe orienté (liste des successeurs)', 'une matrice d’adjacence', 'les listes d’adjacence d’un graphe non orienté', 'un cycle eulérien'], 0, '<p>Pages = sommets, liens hypertexte = arcs. La liste d’une page contient les pages vers lesquelles elle pointe : ce sont ses successeurs. Les listes ne sont pas symétriques.</p>', { transfer: true, tag: 'listes-orientees', hints: ['Un lien a un sens : de la page qui le contient vers la page cible.'] }),
      qb.edges('n17.q11', 3, 'Voici les listes d’adjacence d’un graphe simple non orienté : <b>1 : 2, 3 ; 2 : 1, 4 ; 3 : 1 ; 4 : 2</b>. Écrivez la liste de ses arêtes.', function (g) {
        var want = {}, got = {}, i, k;
        [['1', '2'], ['1', '3'], ['2', '4']].forEach(function (p) { want[GR.pairKey(p[0], p[1])] = true; });
        for (i = 0; i < g.edges.length; i++) { k = GR.pairKey(g.edges[i].u, g.edges[i].v); if (!want[k]) return { ok: false, msg: 'L’arête ' + g.edges[i].u + '-' + g.edges[i].v + ' ne figure pas dans les listes.' }; got[k] = true; }
        var miss = Object.keys(want).filter(function (x) { return !got[x]; }).length;
        if (miss) return { ok: false, msg: miss + ' arête(s) des listes ne sont pas écrites.' };
        return { ok: true };
      }, '<p>Chaque arête figure deux fois dans les listes : {1,2} (dans les listes de 1 et de 2), {1,3} (dans celles de 1 et de 3), {2,4} (dans celles de 2 et de 4). Total des longueurs : 6 = 2 × 3.</p>', { sample: '1-2, 1-3, 2-4', challenge: true, tag: 'listes-lecture', hints: ['Chaque arête apparaît deux fois : ne la comptez qu’une fois.'] })
    ]
  });
  })();
  /* ================= n18 ================= */
  (function () {
    var TAB = { t: 'Comparaison des deux représentations (tableau de la diapo 32)', cols: ['', 'Matrice d’adjacence', 'Listes d’adjacence'], rows: [['Mémoire', 'Θ(n²)', 'Θ(n + m)'], ['Tester si (u, v) est une arête', 'O(1)', 'O(d⁺(u)) en orienté'], ['Énumérer les voisins de u', 'Θ(n)', 'Θ(d⁺(u))']] };
  GF.content.add({
    id: 'n18', title: 'Choisir une représentation : les coûts', short: 'Coûts des représentations', slides: '32', prereqs: ['n15', 'n17'],
    objectives: [
      'Citer, pour la matrice et les listes d’adjacence, le coût en mémoire, en test d’arête et en énumération des voisins (tableau de la diapo 32).',
      'Choisir la représentation adaptée à un graphe creux ou dense et à l’opération la plus fréquente.',
      'Expliquer pourquoi le coût d’un algorithme dépend de la représentation du graphe.',
      'Distinguer ce qui est écrit sur la diapo (cas orienté) de ce qui est ajouté hors cours (cas non orienté).'
    ],
    course: [
      { k: 'def', slide: '32', t: 'Le tableau de comparaison', h: '<p>La diapo 32 compare les deux représentations (n = nombre de sommets, m = nombre d’arêtes ou d’arcs) :</p><table><tr><th></th><th>Matrice</th><th>Listes</th></tr><tr><td>Mémoire</td><td>Θ(n²)</td><td>Θ(n + m)</td></tr><tr><td>Tester si (u, v) est une arête</td><td>O(1)</td><td>O(d<sup>+</sup>(u)) en orienté</td></tr><tr><td>Énumérer les voisins de u</td><td>Θ(n)</td><td>Θ(d<sup>+</sup>(u))</td></tr></table>' },
      { k: 'thm', slide: '32', t: 'À retenir', h: '<p>Les <b>listes d’adjacence</b> sont adaptées aux graphes <b>creux</b> (peu d’arêtes par rapport à n²), et le <b>coût d’un algorithme dépend de la représentation</b> choisie.</p>' },
      { k: 'rem', slide: '32', t: 'Pourquoi ces coûts ?', h: '<p>La matrice a n lignes et n colonnes : n² cases, quel que soit le nombre d’arêtes. Lire une case M[u][v] est immédiat (O(1)), mais pour trouver les voisins de u il faut parcourir toute la ligne u (n cases). Les listes ne stockent que les voisins : n listes et au total m éléments (en orienté), d’où Θ(n + m). Énumérer les voisins de u, c’est parcourir sa liste, de longueur d⁺(u). Pour tester (u, v), il faut chercher v dans la liste de u : au pire d⁺(u) comparaisons.</p>' },
      { k: 'warn', slide: '32', t: 'Notations Θ et O', h: '<p>Le PDF utilise Θ(·) et O(·) sans les définir (le cours général en parle sans doute ailleurs). Lecture usuelle : O(f) borne le coût par le haut, Θ(f) donne l’ordre de grandeur exact. Cette lecture n’est pas écrite dans les diapos fournies.</p>' },
      { k: 'warn', slide: '32', t: 'Le cas non orienté', h: '<p>Le tableau écrit O(d⁺(u)) « en orienté ». Pour un graphe non orienté (hors diapo), le test d’arête avec les listes est O(d(u)) : on cherche v dans la liste de u, de longueur d(u) (voir A18).</p>' },
      { k: 'extra', t: 'Graphe creux, graphe dense (hors diapo)', h: '<p>Un graphe simple a au plus n(n − 1)/2 arêtes. Il est <b>dense</b> quand m est proche de ce maximum (densité proche de 1, diapo 15) et <b>creux</b> quand m est petit devant n² (par exemple m proportionnel à n). Pour un graphe creux, Θ(n + m) est bien plus petit que Θ(n²).</p>' },
      { k: 'extra', t: 'Un chiffre pour s’en convaincre (hors diapo)', h: '<p>Avec n = 10 000 sommets et m = 30 000 arêtes : la matrice a 10 000² = 100 000 000 cases ; les listes ont n + 2m = 70 000 éléments environ (non orienté). Énumérer les voisins d’un sommet de degré 3 coûte 3 avec les listes, 10 000 avec la matrice.</p>' }
    ],
    guided: [
      { h: '<p>Un graphe a n = 1000 sommets et seulement m = 2000 arcs. On veut le stocker.</p>', ask: 'Combien de cases pour la matrice ? Combien d’éléments environ pour les listes ?', reveal: '<p>Matrice : n² = 1 000 000 cases. Listes : de l’ordre de n + m = 3000. Pour un graphe creux, les listes sont bien plus économes (diapo 32 : Θ(n²) contre Θ(n + m)).</p>' },
      { h: '<p>On veut savoir si l’arc (u, v) existe, avec la matrice d’adjacence.</p>', ask: 'Que faut-il lire ? Quel est le coût ?', reveal: '<p>Une seule case : la ligne u, colonne v. Coût O(1), quelle que soit la taille du graphe.</p>' },
      { h: '<p>On veut maintenant tous les voisins d’un sommet u.</p>', ask: 'Que parcourt-on avec la matrice ? Avec les listes ?', reveal: '<p>Matrice : toute la ligne de u (n cases), coût Θ(n). Listes : la liste de u seulement, coût Θ(d⁺(u)).</p>' },
      { h: '<p>Un réseau social a des millions d’utilisateurs, chacun avec quelques centaines d’amis.</p>', ask: 'Graphe creux ou dense ? Quelle représentation ?', reveal: '<p>Creux : m est minuscule devant n². Les listes d’adjacence conviennent (diapo 32 : « adaptées aux graphes creux »). Une matrice n × n serait gigantesque et presque vide.</p>' }
    ],
    examples: [
      { t: 'Graphe creux : 10 000 sommets, 30 000 arêtes', h: '<p>Matrice : 100 000 000 cases. Listes : environ 70 000 éléments. Les listes l’emportent largement.</p>' },
      { t: 'Graphe presque complet : 200 sommets', h: '<p>Un graphe complet K₂₀₀ a 19 900 arêtes. La matrice (40 000 cases) et les listes (≈ 40 000 éléments) ont une mémoire du même ordre, mais la matrice teste une arête en O(1) alors que les listes parcourent une liste de longueur proche de 200.</p>' },
      { t: 'Le graphe de la diapo 29', h: '<p>6 sommets, 6 arêtes : la matrice a 36 cases, les listes 12 éléments (2m). À cette taille la différence est faible, mais elle croît avec n.</p>', g: 's29', go: { show: ['matrix'] } },
      { t: 'Contre-exemple : « les listes sont toujours meilleures »', h: '<p>Faux : pour tester une arête (u, v), la matrice répond en O(1) alors que les listes parcourent la liste de u. Si l’algorithme teste sans arrêt des arêtes dans un graphe dense, la matrice est préférable.</p>', counter: true },
      { t: 'Contre-exemple : « le coût ne dépend que du graphe »', h: '<p>Faux (diapo 32) : le même graphe, le même algorithme, mais deux représentations donnent des coûts différents pour la même opération (énumérer les voisins : Θ(n) ou Θ(d⁺(u))).</p>', counter: true }
    ],
    compare: [TAB],
    mistakes: [
      { tag: 'cout-representation', wrong: 'La matrice d’adjacence prend Θ(n + m) en mémoire.', right: 'Elle prend toujours <b>Θ(n²)</b> (n × n cases), même si le graphe a très peu d’arêtes. C’est Θ(n + m) qui est le coût des listes.' },
      { tag: 'cout-representation', wrong: 'Avec les listes, tester une arête est en O(1).', right: 'Il faut chercher v dans la liste de u : <b>O(d⁺(u))</b> (diapo 32). C’est la matrice qui répond en O(1).' },
      { tag: 'cout-representation', wrong: 'Énumérer les voisins de u coûte Θ(d⁺(u)) avec la matrice.', right: 'Avec la matrice, on parcourt toute la ligne : <b>Θ(n)</b>. Θ(d⁺(u)) est le coût avec les listes.' },
      { tag: 'cout-representation', wrong: 'Les listes d’adjacence sont meilleures pour tous les graphes.', right: 'Elles sont adaptées aux graphes <b>creux</b>. Pour un graphe dense avec beaucoup de tests d’arêtes, la matrice peut convenir mieux.' },
      { tag: 'cout-representation', wrong: 'Le coût d’un algorithme dépend uniquement du graphe.', right: 'Il dépend aussi de la <b>représentation</b> choisie (diapo 32).' }
    ],
    alt: [
      '<p>Image : la matrice est un grand tableau d’horaires où l’on lit une case instantanément, mais qui occupe de la place même s’il est presque vide ; les listes sont un carnet où chaque sommet note seulement ses voisins : peu de place, mais il faut feuilleter la page pour savoir si un voisin précis y figure.</p>',
      '<p>Trois questions pour choisir : le graphe est-il creux ? Quelle opération est la plus fréquente (tester une arête ou énumérer des voisins) ? La mémoire est-elle limitée ?</p>',
      '<p>Mnémo : matrice = n² cases, lecture directe ; listes = n + m éléments, parcours de la liste.</p>'
    ],
    socratic: {
      warm: { id: 'n18.s0', type: 'choice', q: 'Combien de cases a la matrice d’adjacence d’un graphe d’ordre n ?', options: ['n²', 'n + m', 'm', 'n'], answer: 0,
        counter: '<p>Cas plus simple : pour un graphe à 3 sommets, la matrice est de taille 3 × 3 : combien de cases ?</p>', hints: ['<p>Une ligne et une colonne par sommet.</p>', '<p>n lignes × n colonnes.</p>'],
        ok: '<p>Oui, n². Cela dépend-il du nombre d’arêtes ?</p>', explain: '<p>Une matrice carrée n × n a n² cases, quel que soit le nombre d’arêtes. Exemple : 3 sommets, 9 cases.</p>', restate: '<p>Redites la taille de la matrice avec vos mots.</p>' },
      steps: [
        { id: 'n18.s1', type: 'choice', q: 'D’après la diapo 32, quelle représentation occupe Θ(n + m) en mémoire ?', options: ['Les listes d’adjacence', 'La matrice d’adjacence', 'Les deux', 'Aucune des deux'], answer: 0,
          counter: '<p>Cas plus simple : un graphe sans aucune arête (m = 0) : que stocke chaque représentation ?</p>', hints: ['<p>Une des deux dépend de m, l’autre non.</p>', '<p>Les listes ne stockent que les voisins.</p>'],
          ok: '<p>Oui. Et la matrice ?</p>', explain: '<p>Les listes : n listes et m éléments au total, Θ(n + m). La matrice : Θ(n²). Exemple : avec m = 0, les listes sont vides alors que la matrice a encore n² cases.</p>', restate: '<p>Redites les deux coûts en mémoire.</p>' },
        { id: 'n18.s2', type: 'choice', q: 'Avec la matrice d’adjacence, quel est le coût pour tester si (u, v) est une arête ?', options: ['O(1)', 'Θ(n)', 'O(d⁺(u))', 'Θ(n²)'], answer: 0,
          counter: '<p>Cas plus simple : que lit-on pour savoir si (2, 3) est une arête ?</p>', hints: ['<p>Combien de cases faut-il lire ?</p>', '<p>Une seule : la ligne u, colonne v.</p>'],
          ok: '<p>Oui. Et avec les listes ?</p>', explain: '<p>On lit la case M[u][v] : coût constant O(1). Exemple : pour (2, 3), on lit ligne 2, colonne 3.</p>', restate: '<p>Redites pourquoi c’est immédiat.</p>' },
        { id: 'n18.s3', type: 'choice', q: 'Avec les listes d’adjacence, quel est le coût pour énumérer les voisins d’un sommet u (orienté) ?', options: ['Θ(d⁺(u))', 'Θ(n)', 'O(1)', 'Θ(n²)'], answer: 0,
          counter: '<p>Cas plus simple : u a 3 successeurs ; combien d’éléments parcourt-on ?</p>', hints: ['<p>On parcourt la liste de u.</p>', '<p>Sa longueur est le demi-degré sortant.</p>'],
          ok: '<p>Oui. Comparez avec la matrice.</p>', explain: '<p>On parcourt la liste de u, de longueur d⁺(u) : Θ(d⁺(u)). Avec la matrice : Θ(n). Exemple : 3 successeurs → 3 éléments.</p>', restate: '<p>Redites la comparaison avec la matrice.</p>' },
        { id: 'n18.s4', type: 'choice', q: 'Un graphe a 100 000 sommets et 300 000 arêtes. Quelle représentation choisir pour économiser la mémoire ?', options: ['Les listes d’adjacence', 'La matrice d’adjacence', 'Peu importe', 'Aucune des deux ne convient'], answer: 0,
          counter: '<p>Cas plus simple : comparez n² et n + m pour ces valeurs.</p>', hints: ['<p>Comparez 100 000² avec 100 000 + 300 000.</p>', '<p>Le graphe est-il creux ?</p>'],
          ok: '<p>Oui. Dans quel cas la matrice serait-elle meilleure ?</p>', explain: '<p>n² = 10¹⁰ cases contre environ 4 × 10⁵ éléments : le graphe est creux, les listes sont adaptées (diapo 32).</p>', restate: '<p>Redites le critère de choix.</p>' },
        { id: 'n18.s5', type: 'text', q: 'Dans quel cas la matrice peut-elle être préférable aux listes ? Justifiez avec les coûts du tableau.', expect: ['Graphe dense (mémoire Θ(n²) acceptable)', 'Tests d’arête fréquents : O(1) avec la matrice contre O(d⁺(u)) avec les listes', 'Le choix dépend de l’opération la plus fréquente'],
          counter: '<p>Prenez un graphe presque complet et un algorithme qui teste des milliers d’arêtes.</p>', hints: ['<p>Quelle opération la matrice fait-elle en O(1) ?</p>', '<p>Quand les listes sont-elles longues ?</p>'],
          ok: '<p>Bien. Quel message retient-on de la diapo 32 ?</p>', explain: '<p>Pour un graphe dense, Θ(n²) n’est pas un gaspillage ; si l’algorithme teste très souvent des arêtes, O(1) bat O(d⁺(u)). Le coût dépend de la représentation.</p>', restate: '<p>Reformulez en une phrase.</p>' }
      ],
      verify: { gen: 'cost', level: 2 }
    },
    feynman: {
      topic: 'Coût des représentations d’un graphe',
      prompt: 'Expliquez à un débutant la différence de coût entre matrice et listes d’adjacence, et comment choisir, avec un exemple et un contre-exemple.',
      must: ['Mémoire : Θ(n²) pour la matrice, Θ(n + m) pour les listes (diapo 32)', 'Test d’arête : O(1) avec la matrice, O(d⁺(u)) avec les listes', 'Énumérer les voisins : Θ(n) avec la matrice, Θ(d⁺(u)) avec les listes', 'Les listes conviennent aux graphes creux ; le coût dépend de la représentation', 'Un exemple chiffré et un contre-exemple (graphe dense ou tests fréquents)'],
      pitfalls: ['Inverser les coûts de la matrice et des listes', 'Dire que les listes sont toujours meilleures', 'Oublier que le coût dépend de la représentation'],
      beginner: ['Pourquoi la matrice prend-elle n² même si le graphe a peu d’arêtes ?', 'Pourquoi tester une arête est-il rapide avec la matrice ?', 'Qu’est-ce qu’un graphe creux ?', 'Quand préférer la matrice ?'],
      model: '<p>Diapo 32 : la <b>matrice</b> coûte Θ(n²) en mémoire, teste une arête en O(1) mais énumère les voisins en Θ(n) ; les <b>listes</b> coûtent Θ(n + m), testent une arête en O(d⁺(u)) et énumèrent les voisins en Θ(d⁺(u)). Les listes conviennent aux graphes creux, et le coût d’un algorithme dépend de la représentation. Exemple : n = 10 000 et m = 30 000 → 10⁸ cases contre environ 7 × 10⁴ éléments. Contre-exemple : sur un graphe presque complet avec beaucoup de tests d’arêtes, la matrice est préférable.</p>'
    },
    recap: {
      key: ['Matrice : mémoire Θ(n²), test d’arête O(1), énumération des voisins Θ(n).', 'Listes : mémoire Θ(n + m), test d’arête O(d⁺(u)) en orienté, énumération Θ(d⁺(u)).', 'Les listes d’adjacence sont adaptées aux graphes creux.', 'Le coût d’un algorithme dépend de la représentation du graphe.'],
      defs: [{ t: 'Graphe creux (hors diapo)', d: 'Graphe dont le nombre d’arêtes m est petit devant n² ; les listes d’adjacence y sont adaptées (diapo 32).', slide: '32' }],
      thms: [{ t: 'À retenir (diapo 32)', s: 'Le coût d’un algorithme dépend de la représentation du graphe.', cond: 'Les listes d’adjacence sont adaptées aux graphes creux.', slide: '32' }],
      formulas: [{ t: 'Mémoire de la matrice', f: 'Θ(n²)' }, { t: 'Mémoire des listes', f: 'Θ(n + m)' }, { t: 'Énumération des voisins avec les listes', f: 'Θ(d⁺(u))' }]
    },
    qs: [
      qb.choice('n18.q1', 1, 'D’après la diapo 32, quelle est la mémoire occupée par la matrice d’adjacence ?', ['Θ(n²)', 'Θ(n + m)', 'Θ(m)', 'Θ(d⁺(u))'], 0, '<p>La matrice a n × n cases : Θ(n²).</p>', { src: 'course', slide: '32', tag: 'cout-representation', hints: ['n lignes, n colonnes.'] }),
      qb.choice('n18.q2', 1, 'D’après la diapo 32, quelle est la mémoire occupée par les listes d’adjacence ?', ['Θ(n + m)', 'Θ(n²)', 'Θ(n)', 'Θ(m²)'], 0, '<p>n listes et m éléments au total : Θ(n + m).</p>', { src: 'course', slide: '32', tag: 'cout-representation', hints: ['Les listes ne stockent que les voisins.'] }),
      qb.choice('n18.q3', 1, 'D’après la diapo 32, pour quels graphes les listes d’adjacence sont-elles adaptées ?', ['Les graphes creux', 'Les graphes denses', 'Les graphes complets', 'Les graphes orientés uniquement'], 0, '<p>« Les listes d’adjacence sont adaptées aux graphes creux. »</p>', { src: 'course', slide: '32', tag: 'cout-representation', hints: ['Peu d’arêtes par rapport à n².'] }),
      qb.tf('n18.q4', 1, 'D’après la diapo 32, le coût d’un algorithme dépend de la représentation choisie pour le graphe.', true, ['Oui : par exemple énumérer les voisins coûte Θ(n) avec la matrice et Θ(d⁺(u)) avec les listes.', 'Non : il ne dépend que du nombre de sommets.', 'Non : il ne dépend que de l’algorithme.', 'Oui, mais seulement pour les graphes pondérés.'], 0, '<p>C’est l’un des deux messages « À retenir » de la diapo 32.</p>', { src: 'course', slide: '32', tag: 'cout-representation', hints: ['Comparez les deux colonnes du tableau.'] }),
      qb.num('n18.q5', 2, 'Un graphe orienté a 300 sommets. Combien d’entrées contient sa matrice d’adjacence ?', 90000, '<p>n² = 300² = 90 000 entrées, Θ(n²).</p>', { tag: 'cout-representation', hints: ['Matrice carrée n × n.'] }),
      qb.num('n18.q6', 2, 'Un graphe orienté a 300 sommets et 500 arcs. Combien d’éléments (sommets écrits) contiennent au total ses listes d’adjacence ?', 500, '<p>Chaque arc (u, v) place v dans la liste de u : 500 éléments au total (plus les 300 listes elles-mêmes : Θ(n + m)).</p>', { tag: 'cout-representation', hints: ['Un élément par arc.'] }),
      qb.choice('n18.q7', 2, 'Un algorithme énumère très souvent les voisins d’un sommet dans un graphe creux. Quelle représentation est la plus efficace ?', ['Les listes : Θ(d⁺(u)) au lieu de Θ(n)', 'La matrice : O(1)', 'Les deux sont équivalentes', 'La matrice : Θ(d⁺(u))'], 0, '<p>Avec les listes, on ne parcourt que les d⁺(u) successeurs ; avec la matrice, toute la ligne (n cases).</p>', { src: 'course', slide: '32', tag: 'cout-representation', hints: ['Comparez Θ(n) et Θ(d⁺(u)).'] }),
      qb.multi('n18.q8', 2, 'Quelles affirmations sont conformes au tableau de la diapo 32 ?', ['Tester (u, v) avec la matrice : O(1)', 'Mémoire des listes : Θ(n + m)', 'Énumérer les voisins avec la matrice : Θ(d⁺(u))', 'Mémoire de la matrice : Θ(m)'], [0, 1], '<p>Matrice : O(1) pour le test ; listes : Θ(n + m). L’énumération avec la matrice coûte Θ(n) (non Θ(d⁺(u))) et la mémoire de la matrice est Θ(n²).</p>', { src: 'course', slide: '32', tag: 'cout-representation', hints: ['Relisez les trois lignes du tableau.'] }),
      qb.text('n18.q9', 2, 'Comparez en quelques phrases la matrice et les listes d’adjacence (mémoire, test d’arête, énumération des voisins).', '<p>Matrice : Θ(n²) en mémoire, test d’arête en O(1), énumération des voisins en Θ(n). Listes : Θ(n + m) en mémoire, test d’arête en O(d⁺(u)) en orienté, énumération en Θ(d⁺(u)). Les listes conviennent aux graphes creux.</p>', ['Matrice : Θ(n²) en mémoire', 'Listes : Θ(n + m) en mémoire', 'Test d’arête : O(1) pour la matrice, O(d⁺(u)) pour les listes', 'Énumération des voisins : Θ(n) pour la matrice, Θ(d⁺(u)) pour les listes'], { src: 'course', slide: '32', tag: 'cout-representation', hints: ['Reprenez les trois lignes du tableau.'] }),
      qb.choice('n18.q10', 3, 'Un graphe presque complet a 150 sommets. L’algorithme teste des milliers de fois « (u, v) est-elle une arête ? ». Quelle représentation choisir ?', ['La matrice : test en O(1), mémoire Θ(n²) acceptable pour un graphe dense', 'Les listes : elles sont toujours meilleures', 'Les listes : test en O(1)', 'Aucune différence'], 0, '<p>Graphe dense : la mémoire Θ(n²) de la matrice n’est pas un gaspillage, et le test d’arête en O(1) est le plus rapide. Avec les listes il faudrait parcourir des listes de longueur proche de n.</p>', { transfer: true, tag: 'cout-representation', hints: ['Graphe dense, test d’arête fréquent.'] }),
      qb.num('n18.q11', 3, 'Un réseau routier a 50 000 carrefours (sommets) ; chacun mène à 4 carrefours en moyenne (arcs sortants). Environ combien d’arcs au total (nombre d’éléments dans les listes) ?', 200000, '<p>m = 50 000 × 4 = 200 000 arcs, donc environ 200 000 éléments dans les listes. La matrice aurait 50 000² = 2,5 × 10⁹ cases : le graphe est très creux.</p>', { transfer: true, challenge: true, tag: 'cout-representation', hints: ['Somme des d⁺ = nombre d’arcs.'] })
    ]
  });
  })();
  /* ================= n19 ================= */
  (function () {
    var D33 = GF.content.graph('s33');
    var DX = mk('123', [['1', '2'], ['2', '2'], ['2', '3'], ['3', '1']], { directed: true });
    var DEQ = mk('123', [['1', '2'], ['2', '3'], ['3', '1']], { directed: true });
  GF.content.add({
    id: 'n19', title: 'Application : un graphe orienté de A à Z', short: 'Application orientée', slides: '33', prereqs: ['n05', 'n15', 'n17'],
    objectives: [
      'Lire la liste des arcs d’un graphe orienté sur son dessin (boucles et double flèche comprises).',
      'En déduire la matrice d’adjacence, les listes d’adjacence et les demi-degrés d⁺, d⁻ de chaque sommet.',
      'Vérifier la cohérence des résultats : Σ d⁺ = Σ d⁻ = nombre d’arcs.',
      'Repérer les sommets vérifiant d⁺(v) = d⁻(v) (ou constater qu’il n’y en a pas).'
    ],
    course: [
      { k: 'q', slide: '33', t: 'Énoncé de la diapo 33', h: '<p>Soit G le graphe orienté de la figure (4 sommets). On demande : les <b>arcs</b>, la <b>matrice d’adjacence</b>, la <b>liste d’adjacence</b> et les <b>demi-degrés</b> (d⁺, d⁻).</p>', g: 's33' },
      { k: 'warn', slide: '33', t: 'Les arcs ne sont pas listés', h: '<p>L’énoncé annonce « les arcs : » mais ne les écrit pas : on les lit sur la figure (A19). On lit 9 arcs : (2,2) et (3,3) (boucles), (2,1), (3,1), (4,1), (4,2), (3,2), puis (3,4) et (4,3) (lien à double flèche entre 3 et 4, lu comme deux arcs).</p>', g: 's33' },
      { k: 'def', slide: '33', t: 'Matrice d’adjacence (ligne = origine, colonne = destination)', h: '<p>Lignes 1 à 4 : 1 : (0, 0, 0, 0) ; 2 : (1, 1, 0, 0) ; 3 : (1, 1, 1, 1) ; 4 : (1, 1, 1, 0). Les boucles (2,2) et (3,3) donnent 1 sur la diagonale ; le sommet 1 n’a aucun arc sortant : sa ligne ne contient que des 0.</p>', g: 's33', go: { show: ['matrix'] } },
      { k: 'def', slide: '33', t: 'Listes d’adjacence (successeurs)', h: '<p>1 : (vide) ; 2 : (1, 2) ; 3 : (1, 2, 3, 4) ; 4 : (1, 2, 3). Le total des longueurs est 9, le nombre d’arcs.</p>', g: 's33', go: { show: ['lists'] } },
      { k: 'def', slide: '33', t: 'Demi-degrés', h: '<table><tr><th>Sommet</th><th>d⁺</th><th>d⁻</th><th>d</th></tr><tr><td>1</td><td>0</td><td>3</td><td>3</td></tr><tr><td>2</td><td>2</td><td>3</td><td>5</td></tr><tr><td>3</td><td>4</td><td>2</td><td>6</td></tr><tr><td>4</td><td>3</td><td>1</td><td>4</td></tr></table><p>Une boucle compte 1 dans d⁺ et 1 dans d⁻ (convention du cours pour les arcs, voir n05).</p>', g: 's33', go: { showDeg: true } },
      { k: 'extra', t: 'Vérifications (hors diapo)', h: '<p>Σ d⁺ = 0 + 2 + 4 + 3 = 9 ; Σ d⁻ = 3 + 3 + 2 + 1 = 9 ; nombre d’arcs = 9 ; nombre de 1 dans la matrice = 9 ; total des listes = 9. Les cinq décomptes concordent.</p>' },
      { k: 'extra', t: 'Sommets avec d⁺(v) = d⁻(v) (hors diapo)', h: '<p>Aucun des quatre sommets : (0, 3), (2, 3), (4, 2), (3, 1). Pour comparer : dans le circuit 1→2→3→1, chaque sommet a d⁺ = d⁻ = 1.</p>', g: DEQ },
      { k: 'warn', slide: '33', t: 'Notation G = (V, E)', h: '<p>L’énoncé écrit G = (V, E), alors que pour un graphe orienté la diapo 11 note A l’ensemble des arcs (A19). Le fond est inchangé : ce sont bien des arcs.</p>' }
    ],
    guided: [
      { h: '<p>Première étape : lire le dessin. On cherche, pour chaque sommet, les flèches qui <b>partent</b> de lui.</p>', g: 's33', ask: 'Quels arcs partent du sommet 2 ?', reveal: '<p>(2,1) et la boucle (2,2). Donc d⁺(2) = 2.</p>' },
      { h: '<p>Le sommet 3 a une boucle et un lien à double flèche avec le 4.</p>', g: 's33', ask: 'Quelle est la liste d’adjacence de 3 ?', reveal: '<p>Successeurs de 3 : 1, 2, 3 (boucle) et 4. Liste : (1, 2, 3, 4), d⁺(3) = 4.</p>' },
      { h: '<p>Ligne 1 de la matrice : le sommet 1 n’a aucun arc sortant.</p>', g: 's33', go: { show: ['matrix'] }, ask: 'Que contient la ligne 1 ? Que vaut d⁺(1) ?', reveal: '<p>Ligne 1 : (0, 0, 0, 0). d⁺(1) = 0. Le sommet 1 reçoit trois arcs (de 2, 3 et 4) : d⁻(1) = 3.</p>' },
      { h: '<p>Vérification globale.</p>', ask: 'Que doivent valoir Σ d⁺ et Σ d⁻ ?', reveal: '<p>Les deux égalent le nombre d’arcs : 9. Ici 0 + 2 + 4 + 3 = 9 et 3 + 3 + 2 + 1 = 9.</p>' },
      { h: '<p>Dernière question : existe-t-il un sommet avec d⁺ = d⁻ ?</p>', g: 's33', go: { showDeg: true }, ask: 'Comparez d⁺ et d⁻ de chaque sommet.', reveal: '<p>(0, 3), (2, 3), (4, 2), (3, 1) : aucun sommet ne convient.</p>' }
    ],
    examples: [
      { t: 'Le graphe de la diapo 33, matrice', h: '<p>Matrice 4 × 4 avec 9 uns.</p>', g: 's33', go: { show: ['matrix'] } },
      { t: 'Le graphe de la diapo 33, listes', h: '<p>1 : ( ) ; 2 : 1, 2 ; 3 : 1, 2, 3, 4 ; 4 : 1, 2, 3.</p>', g: 's33', go: { show: ['lists'] } },
      { t: 'Un petit graphe orienté avec boucle', h: '<p>Arcs 1→2, 2→2, 2→3, 3→1 : listes 1 : 2 ; 2 : 2, 3 ; 3 : 1. d⁺ = (1, 2, 1), d⁻ = (1, 2, 1) : chaque sommet vérifie d⁺ = d⁻.</p>', g: DX, go: { show: ['lists'] } },
      { t: 'Contre-exemple : confondre d et d⁺', h: '<p>Dans la diapo 33, d(3) = 6 mais d⁺(3) = 4 : le degré total est d⁺ + d⁻, pas d⁺.</p>', g: 's33', go: { showDeg: true }, counter: true },
      { t: 'Contre-exemple : lire la double flèche comme un seul arc', h: '<p>Le lien 3 ↔ 4 compte pour deux arcs, (3,4) et (4,3). Si on n’en compte qu’un, la matrice a 8 uns au lieu de 9 et les degrés sont faux.</p>', counter: true }
    ],
    compare: [{ t: 'Trois façons de lire le même graphe orienté', cols: ['', 'Matrice', 'Listes', 'Demi-degrés'], rows: [['d⁺(v)', 'somme de la ligne v', 'longueur de la liste de v', 'd⁺(v)'], ['d⁻(v)', 'somme de la colonne v', 'nombre d’apparitions de v dans les listes', 'd⁻(v)'], ['Nombre d’arcs', 'nombre de 1', 'total des longueurs', 'Σ d⁺ = Σ d⁻']] }],
    mistakes: [
      { tag: 'synthese-orientee', wrong: 'Pour d⁺(v), je compte les flèches qui arrivent en v.', right: 'Ce sont les arcs qui <b>partent</b> de v : d⁺(v) = somme de la ligne v. Ceux qui arrivent comptent dans d⁻(v).' },
      { tag: 'synthese-orientee', wrong: 'Une boucle ne compte pas dans les demi-degrés.', right: 'Une boucle compte 1 dans d⁺ et 1 dans d⁻ du sommet, et met 1 sur la diagonale de la matrice.' },
      { tag: 'synthese-orientee', wrong: 'La double flèche entre 3 et 4 est un seul arc.', right: 'C’est deux arcs : (3,4) et (4,3). Les deux apparaissent dans la matrice et dans les listes.' },
      { tag: 'synthese-orientee', wrong: 'Dans la liste de s, on met aussi les prédécesseurs.', right: 'La liste de s ne contient que ses successeurs (arcs partant de s).' },
      { tag: 'synthese-orientee', wrong: 'Σ d⁺ peut être différent de Σ d⁻.', right: 'Chaque arc part d’un sommet et arrive en un sommet : Σ d⁺ = Σ d⁻ = nombre d’arcs. Si ce n’est pas le cas, une erreur de lecture s’est glissée.' }
    ],
    alt: [
      '<p>Méthode en 4 temps : (1) écrire la liste des arcs en lisant le dessin ; (2) remplir la matrice (ligne = origine) ; (3) en déduire les listes (les 1 de chaque ligne) ; (4) calculer d⁺ (somme des lignes) et d⁻ (somme des colonnes).</p>',
      '<p>Contrôle rapide : Σ d⁺ = Σ d⁻ = nombre de 1 de la matrice = total des listes. Si l’un diffère, relisez les arcs.</p>',
      '<p>Pour la double flèche, pensez à deux routes à sens unique parallèles : deux arcs.</p>'
    ],
    socratic: {
      warm: { id: 'n19.s0', type: 'choice', q: 'Dans un graphe orienté, d⁺(v) est…', options: ['le nombre d’arcs qui partent de v', 'le nombre d’arcs qui arrivent en v', 'le nombre de sommets du graphe', 'la distance maximale depuis v'], answer: 0,
        counter: '<p>Cas plus simple : pour le seul arc a→b, que valent d⁺(a) et d⁺(b) ?</p>', hints: ['<p>Le « + » est associé à la sortie.</p>', '<p>Sortant = qui part du sommet.</p>'],
        ok: '<p>Oui. Et d⁻(v) ?</p>', explain: '<p>d⁺(v) compte les arcs sortants. Exemple : pour a→b, d⁺(a) = 1 et d⁺(b) = 0.</p>', restate: '<p>Redites la différence entre d⁺ et d⁻.</p>' },
      steps: [
        { id: 'n19.s1', type: 'num', g: 's33', q: 'Dans le graphe de la diapo 33, combien vaut <b>d⁺(3)</b> ?', answer: function (G) { return GR.outDeg(G, '3'); },
          counter: '<p>Cas plus simple : avec une seule boucle sur un sommet, que vaut d⁺ ?</p>', hints: ['<p>Comptez les arcs qui partent de 3, boucle comprise.</p>', '<p>Lien avec 4 : (3,4) part de 3.</p>'],
          ok: '<p>Oui, 4. Et d⁻(3) ?</p>', explain: '<p>Arcs partant de 3 : (3,1), (3,2), (3,3), (3,4) : d⁺(3) = 4.</p>', restate: '<p>Redites comment on compte d⁺.</p>' },
        { id: 'n19.s2', type: 'num', g: 's33', q: 'Dans le graphe de la diapo 33, combien vaut <b>d⁻(1)</b> ?', answer: function (G) { return GR.inDeg(G, '1'); },
          counter: '<p>Cas plus simple : pour l’arc a→b, combien vaut d⁻(b) ?</p>', hints: ['<p>Comptez les arcs qui arrivent en 1.</p>', '<p>Venant de 2, 3 et 4.</p>'],
          ok: '<p>Oui, 3. Et d⁺(1) ?</p>', explain: '<p>Arcs arrivant en 1 : (2,1), (3,1), (4,1) : d⁻(1) = 3.</p>', restate: '<p>Redites comment on compte d⁻.</p>' },
        { id: 'n19.s3', type: 'num', g: 's33', q: 'Combien y a-t-il d’<b>arcs</b> dans le graphe de la diapo 33 (boucles et double flèche comprises) ?', answer: function (G) { return GR.m(G); },
          counter: '<p>Cas plus simple : combien d’arcs représente une double flèche ?</p>', hints: ['<p>Σ d⁺ = nombre d’arcs.</p>', '<p>0 + 2 + 4 + 3.</p>'],
          ok: '<p>Oui, 9. Vérifiez avec Σ d⁻.</p>', explain: '<p>Σ d⁺ = 0 + 2 + 4 + 3 = 9. Autre contrôle : Σ d⁻ = 3 + 3 + 2 + 1 = 9.</p>', restate: '<p>Redites pourquoi Σ d⁺ = nombre d’arcs.</p>' },
        { id: 'n19.s4', type: 'set', g: 's33', q: 'Quels sommets vérifient <b>d⁺(v) = d⁻(v)</b> ? (Aucun : laissez vide.)', answer: function (G) { return G.vertices.filter(function (v) { return GR.outDeg(G, v) === GR.inDeg(G, v); }); },
          counter: '<p>Cas plus simple : dans un circuit 1→2→3→1, quels sommets vérifient l’égalité ?</p>', hints: ['<p>Comparez (d⁺, d⁻) pour chaque sommet.</p>', '<p>(0,3), (2,3), (4,2), (3,1).</p>'],
          ok: '<p>Oui, aucun sommet. Que dire de Σ d⁺ − Σ d⁻ ?</p>', explain: '<p>Les couples (d⁺, d⁻) sont (0,3), (2,3), (4,2), (3,1) : jamais égaux. Dans un circuit orienté, au contraire, chaque sommet a d⁺ = d⁻ = 1.</p>', restate: '<p>Redites comment vérifier l’égalité sommet par sommet.</p>' },
        { id: 'n19.s5', type: 'text', q: 'Décrivez la méthode pour passer d’un dessin de graphe orienté à sa matrice, ses listes et ses demi-degrés, avec les vérifications.', expect: ['Lire les arcs sur le dessin (boucles, double flèche = deux arcs)', 'Matrice : ligne = origine, colonne = destination ; listes = successeurs ; d⁺ = somme des lignes, d⁻ = somme des colonnes', 'Vérifier : Σ d⁺ = Σ d⁻ = nombre d’arcs'],
          counter: '<p>Appliquez la méthode à 1→2, 2→1, 2→2.</p>', hints: ['<p>Commencez par la liste des arcs.</p>', '<p>Pensez aux contrôles finaux.</p>'],
          ok: '<p>Bien. Vous savez maintenant traiter la diapo 33 seul.</p>', explain: '<p>Lire les arcs, remplir la matrice, en déduire listes et demi-degrés, puis contrôler Σ d⁺ = Σ d⁻ = nombre d’arcs. Exemple : 1→2, 2→1, 2→2 donne d⁺ = (1, 2), d⁻ = (1, 2).</p>', restate: '<p>Redites les quatre étapes.</p>' }
      ],
      verify: { gen: 'synth', level: 2 }
    },
    feynman: {
      topic: 'Application sur un graphe orienté',
      prompt: 'Expliquez à un débutant comment, à partir du dessin d’un graphe orienté, on obtient sa matrice d’adjacence, ses listes et ses demi-degrés, avec un exemple et un contre-exemple.',
      must: ['Lire les arcs sur le dessin (boucle, double flèche = deux arcs)', 'Matrice : ligne = origine, colonne = destination ; listes = successeurs', 'd⁺ = arcs sortants (somme de la ligne), d⁻ = arcs entrants (somme de la colonne)', 'Vérification : Σ d⁺ = Σ d⁻ = nombre d’arcs', 'Un exemple (diapo 33) et un contre-exemple (erreur typique)'],
      pitfalls: ['Confondre d⁺ et d⁻', 'Compter la double flèche comme un seul arc', 'Mettre les prédécesseurs dans la liste de s'],
      beginner: ['Que veut dire « ligne = origine » ?', 'Comment compte-t-on une boucle ?', 'Pourquoi Σ d⁺ = Σ d⁻ ?', 'Que se passe-t-il pour un sommet sans arc sortant ?'],
      model: '<p>On lit d’abord les <b>arcs</b> sur le dessin (une boucle est un arc, une double flèche en fait deux). La <b>matrice</b> a un 1 en (i, j) si (i, j) est un arc (ligne = origine, colonne = destination) ; la <b>liste</b> de s contient ses successeurs. d⁺(v) est la somme de la ligne v, d⁻(v) celle de la colonne v. Contrôle : Σ d⁺ = Σ d⁻ = nombre d’arcs. Exemple (diapo 33) : 9 arcs, d⁺ = (0, 2, 4, 3), d⁻ = (3, 3, 2, 1). Contre-exemple : en lisant la double flèche 3↔4 comme un seul arc, on trouve 8 arcs et des degrés faux.</p>'
    },
    recap: {
      key: ['Lire les arcs sur le dessin : une boucle est un arc ; une double flèche donne deux arcs.', 'Matrice : ligne = origine, colonne = destination ; liste de s = successeurs de s.', 'd⁺ = somme de la ligne, d⁻ = somme de la colonne ; une boucle compte 1 dans chacun.', 'Σ d⁺ = Σ d⁻ = nombre d’arcs : vérification systématique.'],
      defs: [{ t: 'Demi-degrés d⁺ et d⁻', d: 'd⁺(v) : nombre d’arcs qui partent de v ; d⁻(v) : nombre d’arcs qui arrivent en v.', slide: '33' }],
      thms: [{ t: 'Somme des demi-degrés (hors diapo)', s: 'Σ d⁺(v) = Σ d⁻(v) = nombre d’arcs.', cond: 'Graphe orienté fini.', slide: '33' }],
      formulas: [{ t: 'Diapo 33', f: 'd⁺ = (0, 2, 4, 3) ; d⁻ = (3, 3, 2, 1) ; 9 arcs' }]
    },
    qs: [
      qb.matrix('n19.q1', 2, 'Donnez la <b>matrice d’adjacence</b> du graphe orienté de la diapo 33 (ligne = origine, colonne = destination).', 's33', '<p>Lignes : 1 : (0,0,0,0) ; 2 : (1,1,0,0) ; 3 : (1,1,1,1) ; 4 : (1,1,1,0). Neuf 1 au total : un par arc.</p>', { src: 'course', slide: '33', tag: 'synthese-orientee', hints: ['Un 1 en (i, j) par arc i→j ; boucle = diagonale.'] }),
      qb.lists('n19.q2', 2, 'Donnez les <b>listes d’adjacence</b> du graphe orienté de la diapo 33 (successeurs de chaque sommet).', 's33', '<p>1 : ( ) ; 2 : 1, 2 ; 3 : 1, 2, 3, 4 ; 4 : 1, 2, 3. Total des longueurs : 9.</p>', { src: 'course', slide: '33', tag: 'synthese-orientee', hints: ['La liste de s = les 1 de la ligne s.'] }),
      qb.num('n19.q3', 1, 'Dans le graphe de la diapo 33, que vaut d⁺(3) ?', function (G) { return GR.outDeg(G, '3'); }, '<p>Arcs partant de 3 : (3,1), (3,2), (3,3), (3,4) : d⁺(3) = 4.</p>', { graph: 's33', src: 'course', slide: '33', tag: 'demi-degres', hints: ['Boucle comprise.'] }),
      qb.num('n19.q4', 1, 'Dans le graphe de la diapo 33, que vaut d⁻(1) ?', function (G) { return GR.inDeg(G, '1'); }, '<p>Arcs arrivant en 1 : (2,1), (3,1), (4,1) : d⁻(1) = 3.</p>', { graph: 's33', src: 'course', slide: '33', tag: 'demi-degres', hints: ['Comptez les arcs qui arrivent en 1.'] }),
      qb.set('n19.q5', 2, 'Quels sommets du graphe de la diapo 33 ont un demi-degré sortant nul ? (laissez vide s’il n’y en a aucun)', function (G) { return G.vertices.filter(function (v) { return GR.outDeg(G, v) === 0; }); }, '<p>Seul le sommet 1 n’a aucun arc sortant : d⁺(1) = 0 (sa ligne de la matrice ne contient que des 0).</p>', { graph: 's33', tag: 'demi-degres', hints: ['Cherchez une ligne de zéros.'] }),
      qb.set('n19.q6', 2, 'Quels sommets du graphe de la diapo 33 vérifient d⁺(v) = d⁻(v) ? (laissez vide s’il n’y en a aucun)', function (G) { return G.vertices.filter(function (v) { return GR.outDeg(G, v) === GR.inDeg(G, v); }); }, '<p>(d⁺, d⁻) = (0,3), (2,3), (4,2), (3,1) : aucun sommet ne convient.</p>', { graph: 's33', tag: 'demi-degres', hints: ['Comparez les deux nombres pour chaque sommet.'] }),
      qb.num('n19.q7', 2, 'Combien d’arcs a le graphe de la diapo 33 (boucles comprises, double flèche = deux arcs) ?', function (G) { return GR.m(G); }, '<p>9 arcs : Σ d⁺ = 0 + 2 + 4 + 3 = 9, Σ d⁻ = 3 + 3 + 2 + 1 = 9.</p>', { graph: 's33', tag: 'synthese-orientee', hints: ['Σ d⁺ = nombre d’arcs.'] }),
      qb.tf('n19.q8', 2, 'Dans tout graphe orienté fini, la somme des demi-degrés sortants est égale à la somme des demi-degrés entrants.', true, ['Chaque arc part d’un sommet et arrive en un sommet : il compte 1 dans Σ d⁺ et 1 dans Σ d⁻.', 'Seulement s’il n’y a pas de boucle.', 'Seulement si le graphe est fortement connexe.', 'Seulement si d⁺ = d⁻ en chaque sommet.'], 0, '<p>Chaque arc contribue 1 à Σ d⁺ (son origine) et 1 à Σ d⁻ (sa destination) ; une boucle compte 1 dans chacun, la propriété reste vraie.</p>', { src: 'extra', tag: 'demi-degres', hints: ['Un arc a une origine et une destination.'] }),
      qb.composite('n19.q9', 3, 'Soit G le graphe orienté ci-dessous (les boucles comptent 1 dans d⁺ et 1 dans d⁻). Répondez aux trois questions puis cliquez sur « Vérifier ».', [
        qb.matrix('', 2, 'Donnez la <b>matrice d’adjacence</b> de G.', D33, '', { tag: 'synthese-orientee' }),
        qb.lists('', 2, 'Donnez les <b>listes d’adjacence</b> de G.', D33, '', { tag: 'synthese-orientee' }),
        qb.set('', 3, 'Quels sommets v vérifient d⁺(v) = d⁻(v) ? (laissez vide s’il n’y en a aucun)', [], 'Aucun : (d⁺, d⁻) = (0,3), (2,3), (4,2), (3,1).', { tag: 'demi-degres' })
      ], '<p>Matrice : 1 : (0,0,0,0) ; 2 : (1,1,0,0) ; 3 : (1,1,1,1) ; 4 : (1,1,1,0). Listes : 1 : ( ) ; 2 : 1, 2 ; 3 : 1, 2, 3, 4 ; 4 : 1, 2, 3. Aucun sommet avec d⁺ = d⁻. Contrôle : 9 arcs.</p>', { graph: 's33', challenge: true, tag: 'synthese-orientee', hints: ['Faites d’abord la liste des arcs, puis déduisez la matrice, les listes et les degrés.'] }),
      qb.text('n19.q12', 2, 'Expliquez avec vos mots comment obtenir d⁺(v) et d⁻(v) à partir de la matrice d’adjacence d’un graphe orienté, et comment vérifier vos résultats.', '<p>d⁺(v) est la somme de la ligne v (arcs qui partent de v) et d⁻(v) la somme de la colonne v (arcs qui arrivent en v). Une boucle met 1 sur la diagonale et compte dans les deux. Vérification : Σ d⁺ = Σ d⁻ = nombre de 1 de la matrice = nombre d’arcs.</p>', ['d⁺(v) = somme de la ligne v', 'd⁻(v) = somme de la colonne v', 'Une boucle compte dans les deux', 'Σ d⁺ = Σ d⁻ = nombre d’arcs'], { src: 'extra', tag: 'synthese-orientee', hints: ['Ligne = origine, colonne = destination.'] }),
      qb.choice('n19.q10', 3, 'Dans un graphe orienté, la somme de la ligne i de la matrice d’adjacence et la somme de sa colonne i valent respectivement…', ['d⁺(i) et d⁻(i)', 'd⁻(i) et d⁺(i)', 'd(i) et d(i)', 'le nombre de boucles et d’arcs'], 0, '<p>Ligne i : arcs partant de i, donc d⁺(i). Colonne i : arcs arrivant en i, donc d⁻(i). Exemple diapo 33, i = 3 : ligne (1,1,1,1) → d⁺(3) = 4 ; colonne (0,0,1,1) → d⁻(3) = 2.</p>', { src: 'extra', tag: 'synthese-orientee', hints: ['Ligne = origine, colonne = destination.'] }),
      qb.choice('n19.q11', 3, 'Dans un réseau de pages web (liens hypertextes), une page qui ne contient aucun lien sortant correspond, dans la matrice d’adjacence, à…', ['une ligne ne contenant que des 0 (d⁺ = 0)', 'une colonne ne contenant que des 0', 'un 1 sur la diagonale', 'une ligne ne contenant que des 1'], 0, '<p>Aucun lien sortant : d⁺ = 0, la ligne de la page est faite de zéros (comme le sommet 1 de la diapo 33).</p>', { transfer: true, tag: 'synthese-orientee', hints: ['Ligne = origine.'] })
    ]
  });
  })();
  /*SUITE*/
})(typeof self !== 'undefined' ? self : (typeof global !== 'undefined' ? global : this));

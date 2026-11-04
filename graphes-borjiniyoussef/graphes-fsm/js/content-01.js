/* content-01.js — notions n01 à n05 (diapos 3–5, 8–15 du Chapitre 1). Schéma : voir content-core.js. */
(function (root) {
  'use strict';
  var GF = root.GF, GR = GF.graph, U = GF.u, X = GF.ex, qb = X.qb, mk = X.mk;
  var KINDS = ['Non orienté, non pondéré', 'Orienté, non pondéré', 'Non orienté, pondéré', 'Orienté, pondéré'];
  function keyCount(g) { var c = {}; g.edges.forEach(function (e) { var k = GR.pairKey(e.u, e.v); c[k] = (c[k] || 0) + 1; }); return c; }
  function inSet(g, arr) { return g.vertices.filter(function (v) { return arr.indexOf(v) < 0; }); }

  /* ================= n01 ================= */
  GF.content.add({
    id: 'n01', title: 'Graphe : définition et types de graphes', short: 'Définition et types', slides: '3–5, 8–9, 11', prereqs: [],
    objectives: [
      'Définir un graphe comme un couple G = (V, E) (sommets, arêtes ou arcs).',
      'Distinguer graphe orienté et non orienté, pondéré et non pondéré.',
      'Choisir le type de graphe adapté à une situation (réseau social, carte routière…).',
      'Expliquer pourquoi (u, v) et (v, u) sont distincts dans un graphe orienté.'
    ],
    course: [
      { k: 'rem', slide: '3–4', t: 'Motivation', h: '<p>La diapo 3 illustre trois domaines (figures sans texte) : <b>réseaux sociaux</b>, <b>graphe de connaissances</b> et <b>finance</b>. La diapo 4 en ajoute trois : <b>chimie</b>, <b>santé</b> et <b>images volumétriques</b>.</p>' },
      { k: 'rem', slide: '5', t: 'Historique', h: '<p>Problème des sept ponts de Königsberg (1736) : « a priori le premier problème résolu par la théorie des graphes ». Euler démontra qu’il était impossible de traverser chacun des sept ponts une fois exactement et de revenir au point de départ. Nous y reviendrons avec les parcours eulériens (notion n13).</p>' },
      { k: 'def', slide: '8', t: 'Graphe', h: '<p>Un graphe est défini par un couple <span class="mth">G = (V, E)</span> tel que :</p><ul><li><span class="mth">V</span> est un ensemble fini de <i>n</i> sommets (Vertices en anglais) ;</li><li><span class="mth">E</span> est un ensemble de <i>m</i> couples de sommets (v<sub>i</sub>, v<sub>j</sub>) ∈ V², appelés arêtes (Edges en anglais).</li></ul>', g: 's10' },
      { k: 'warn', slide: '8', t: 'Couples ou paires ?', h: '<p>La diapo 8 parle de <i>couples</i> (v<sub>i</sub>, v<sub>j</sub>) ∈ V², alors que la diapo 10 (graphe non orienté) parle de <i>paires</i> {u, v}. Le mot « couple » est employé de façon générique. Ici : paires {u, v} en non orienté, couples (u, v) en orienté (diapos 10 et 11).</p>' },
      { k: 'def', slide: '9', t: 'Types de graphes', h: '<p>Un graphe peut être : <b>orienté</b>, <b>non orienté</b>, <b>pondéré</b>, <b>non pondéré</b>.</p><p>Les illustrations de la diapo : « Facebook » (liens sans flèche) et « Twitter » (flèches « Follows »).</p>' },
      { k: 'def', slide: '11', t: 'Orientation et pondération', h: '<p><b>Graphe orienté</b> <span class="mth">G = (V, A)</span> : un arc (u, v) ∈ V × V autorise le déplacement de u vers v. (u, v) et (v, u) sont <b>distincts</b>.</p><p><b>Graphe pondéré</b> : une fonction w associe un poids à chaque arête ou arc. Un poids représente une durée, un coût ou une distance.</p>', g: mk('uv', [['u', 'v', 5]], { directed: true, weighted: true }) }
    ],
    guided: [
      { h: '<p>Un graphe, ce sont d’abord <b>deux ensembles</b> : V (les sommets) et E (les liaisons).</p>', g: 's10', ask: 'Sur ce graphe, que valent V et n ?', reveal: '<p>V = {A, B, C, D, E, F} et n = |V| = 6.</p>' },
      { h: '<p>Sur un réseau comme Facebook, la liaison entre A et B est la même dans les deux sens.</p>', ask: 'Quel type de graphe obtient-on, et comment note-t-on la liaison ?', reveal: '<p>Un graphe <b>non orienté</b> : la liaison est la paire {A, B}, identique à {B, A}.</p>' },
      { h: '<p>Sur Twitter, « X suit Y » n’implique pas « Y suit X ».</p>', ask: 'Comment distinguer les deux situations ?', reveal: '<p>Par des <b>arcs</b> : (X, Y) ≠ (Y, X). Le graphe est <b>orienté</b>.</p>' },
      { h: '<p>Sur une carte routière, on attache à chaque route sa longueur.</p>', ask: 'Qu’ajoute-t-on à (V, E) ?', reveal: '<p>Une fonction w qui associe un <b>poids</b> à chaque arête (ou arc) : le graphe est <b>pondéré</b>.</p>' },
      { h: '<p>L’orientation et la pondération sont deux critères indépendants.</p>', ask: 'Combien de types de graphes obtient-on en les croisant ?', reveal: '<p>2 × 2 = <b>4</b> types (non orienté/orienté × non pondéré/pondéré).</p>' }
    ],
    examples: [
      { t: 'Facebook : non orienté, non pondéré', h: '<p>L’amitié est réciproque : on représente la liaison par une paire {A, B}, sans valeur.</p>', g: mk('ABCD', ['AB', 'AC', 'AD', 'CD']) },
      { t: 'Twitter : orienté, non pondéré', h: '<p>« X suit Y » est un arc (X, Y) ; il n’y a pas forcément d’arc (Y, X).</p>', g: mk('XYZ', ['XY', 'XZ', 'ZY', 'YX'], { directed: true }) },
      { t: 'Carte de villes : non orienté, pondéré', h: '<p>Routes à double sens, chaque route portant sa distance (graphe de la diapo 30 réutilisé ici comme exemple).</p>', g: 's30' },
      { t: 'Contre-exemple : « X suit Y » en arête', h: '<p>Modéliser « X suit Y » par une arête {X, Y} est une erreur : on perd le sens de la relation, alors que (X, Y) et (Y, X) sont distincts.</p>', g: mk('XY', ['XY'], { directed: true }), counter: true }
    ],
    compare: [{ t: 'Non orienté ou orienté', cols: ['', 'Non orienté', 'Orienté'], rows: [['Liaison', 'arête {u, v} = {v, u}', 'arc (u, v) ≠ (v, u)'], ['Notation (diapos 10, 11)', 'G = (V, E)', 'G = (V, A)'], ['Illustration (diapo 9)', 'Facebook', 'Twitter']] }],
    mistakes: [
      { tag: 'types-graphes', wrong: 'Un graphe pondéré est forcément orienté.', right: 'Les deux critères sont indépendants : on peut peser des arêtes non orientées (distances routières).' },
      { tag: 'types-graphes', wrong: 'Modéliser « X suit Y » par une arête non orientée.', right: 'La relation n’est pas symétrique : il faut un arc (X, Y).' },
      { tag: 'types-graphes', wrong: 'Dans un graphe orienté, (u, v) et (v, u) sont le même arc.', right: 'Ils sont distincts (diapo 11).' },
      { tag: 'types-graphes', wrong: 'Le poids est une propriété des sommets.', right: 'w associe un poids à chaque arête ou arc.' },
      { tag: 'definition-graphe', wrong: 'Un graphe est son dessin.', right: 'Un graphe est un couple (V, E) ; plusieurs dessins peuvent représenter le même graphe.' }
    ],
    alt: [
      '<p>Pensez à une carte : les sommets sont les villes, les liaisons les routes. Route à double sens = non orienté ; route à sens unique = orienté ; panneau de distance = poids.</p>',
      '<p>Deux questions suffisent pour typer un graphe : « les liaisons ont-elles un sens ? » (orienté) et « portent-elles une valeur ? » (pondéré). Le dessin n’est qu’une représentation du couple (V, E).</p>'
    ],
    socratic: {
      warm: { id: 'n01.s0', type: 'choice', q: 'Dans un réseau social où l’amitié est réciproque, la liaison entre A et B a-t-elle un sens (de A vers B) ?', options: ['Oui : A→B et B→A sont différents', 'Non : c’est la même liaison dans les deux sens', 'Cela dépend du nom des personnes'], answer: 1,
        counter: '<p>Cas plus simple : si A est ami avec B, B peut-il ne pas être ami avec A ?</p>', hints: ['<p>Relisez la phrase : l’amitié est <i>réciproque</i>.</p>', '<p>Réciproque signifie que A–B et B–A disent la même chose.</p>'],
        ok: '<p>Exact. Et dans un réseau où « X suit Y », la liaison aurait-elle le même statut ?</p>', explain: '<p>Une amitié réciproque est symétrique : la liaison {A, B} est identique à {B, A}. On parle d’arête non orientée. Si la relation n’était pas réciproque (suivre), il faudrait distinguer (A, B) de (B, A). Exemple : Facebook est symétrique, Twitter ne l’est pas.</p>', restate: '<p>Reformulez en une phrase : quand une liaison est-elle « sans sens » ?</p>' },
      steps: [
        { id: 'n01.s1', type: 'choice', q: 'Sur Twitter, « X suit Y ». Quel objet mathématique représente cette relation ?', options: ['Une arête {X, Y}', 'Un arc (X, Y) distinct de (Y, X)', 'Un sommet', 'Un poids'], answer: 1,
          counter: '<p>Si Y ne suit pas X, une arête {X, Y} (identique à {Y, X}) dirait-elle quelque chose de faux ?</p>', hints: ['<p>La relation est-elle symétrique ?</p>', '<p>Quel objet autorise le déplacement de u vers v seulement (diapo 11) ?</p>'],
          ok: '<p>Oui. Maintenant : orientation et pondération sont-elles liées ?</p>', explain: '<p>Un arc (u, v) autorise le déplacement de u vers v ; (u, v) et (v, u) sont distincts. Pour « X suit Y », on ne veut pas supposer « Y suit X ». C’est donc un arc, et le graphe est orienté. Une arête serait symétrique.</p>', restate: '<p>Redites avec vos mots pourquoi une arête ne convient pas ici.</p>' },
        { id: 'n01.s2', type: 'num', q: 'En croisant « orienté / non orienté » et « pondéré / non pondéré », combien de types de graphes obtient-on ?', answer: 4,
          counter: '<p>Listez : non orienté non pondéré, … Quelles autres combinaisons existent ?</p>', hints: ['<p>Deux choix pour l’orientation, deux pour la pondération.</p>', '<p>Multipliez les possibilités.</p>'],
          ok: '<p>Oui, 4. Pouvez-vous donner un exemple concret du type « non orienté, pondéré » ?</p>', explain: '<p>Il y a 2 choix d’orientation et 2 choix de pondération, indépendants : 2 × 2 = 4. Exemple : un réseau routier à double sens avec distances est non orienté pondéré. Un réseau de rues à sens unique avec durées est orienté pondéré.</p>', restate: '<p>Citez un exemple pour chacun des 4 types.</p>' },
        { id: 'n01.s3', type: 'text', q: 'Expliquez en quelques phrases la différence entre une arête et un arc, et ce que représente un poids.', expect: ['Une arête {u, v} est identique à {v, u}', 'Un arc (u, v) autorise u vers v seulement et diffère de (v, u)', 'Un poids est une valeur (durée, coût, distance) associée à une arête ou un arc'],
          counter: '<p>Reprenez l’exemple Facebook / Twitter : lequel utilise des arêtes, lequel des arcs ?</p>', hints: ['<p>Pensez au sens de la liaison.</p>', '<p>Le poids répond à la question « combien ? ».</p>'],
          ok: '<p>Bien. Appliquons : des rues à sens unique avec temps de parcours, quel type ?</p>', explain: '<p>Une arête est une liaison sans sens. Un arc a un sens et (u, v) ≠ (v, u). Un poids est une valeur attachée à chaque arête ou arc, comme une durée, un coût ou une distance. Exemple : la distance entre deux villes.</p>', restate: '<p>Réécrivez votre réponse en une phrase par notion.</p>' },
        { id: 'n01.s4', type: 'choice', q: 'Des rues à sens unique, chacune étiquetée par son temps de parcours : quel type de graphe ?', options: KINDS, answer: 3,
          counter: '<p>Une rue à sens unique autorise-t-elle les deux déplacements ? Le temps de parcours est-il une valeur ?</p>', hints: ['<p>Sens unique : orienté ou non ?</p>', '<p>Temps de parcours : durée, donc… ?</p>'],
          ok: '<p>Exact : orienté et pondéré.</p>', explain: '<p>Sens unique : on distingue (u, v) de (v, u), donc orienté. Le temps de parcours est une durée attachée à chaque arc, donc pondéré. Exemple : une rue A→B de 3 minutes sans rue B→A.</p>', restate: '<p>Justifiez en deux critères.</p>' }
      ],
      verify: { gen: 'kind', level: 2 }
    },
    feynman: {
      topic: 'Graphe, graphe orienté, graphe pondéré',
      prompt: 'Expliquez à un débutant ce qu’est un graphe et comment on distingue orienté / pondéré, avec un exemple concret.',
      must: ['Un graphe est un couple G = (V, E) : sommets (ensemble fini, n) et arêtes ou arcs (m)', 'Arête : liaison sans sens ; arc : liaison orientée, (u, v) ≠ (v, u)', 'Orienté ou non, pondéré ou non : deux critères indépendants', 'Un poids représente une durée, un coût ou une distance', 'Un exemple concret (réseau social, carte routière)'],
      pitfalls: ['Confondre le graphe avec son dessin', 'Dire qu’un graphe pondéré est forcément orienté', 'Parler de « lien » sans préciser s’il a un sens', 'Oublier que V est un ensemble fini'],
      beginner: ['C’est quoi un sommet, concrètement ?', 'Pourquoi dis-tu « couple » plutôt que « liste de liens » ?', 'Peux-tu donner un exemple où le sens compte et un où il ne compte pas ?', 'À quoi sert le poids ?'],
      model: '<p>Un graphe, c’est un ensemble de points (les sommets) et des liaisons entre eux. On l’écrit G = (V, E). Si les liaisons ont un sens, comme « X suit Y » sur Twitter, on parle de graphe orienté ; sinon, comme les amitiés Facebook, il est non orienté. Si chaque liaison porte une valeur (durée, coût, distance), le graphe est pondéré. Les deux critères sont indépendants.</p>'
    },
    recap: {
      key: ['Un graphe est un couple G = (V, E) : V fini (n sommets), E les liaisons (m).', 'Non orienté : arête {u, v} = {v, u}. Orienté : arc (u, v) ≠ (v, u), G = (V, A).', 'Pondéré : une fonction w associe un poids (durée, coût, distance) à chaque arête ou arc.', 'Orientation et pondération sont indépendantes : 4 types.'],
      defs: [{ t: 'Graphe', d: 'Couple G = (V, E) : V ensemble fini de n sommets, E ensemble de m liaisons entre sommets.', slide: '8' }, { t: 'Graphe orienté', d: 'G = (V, A) : un arc (u, v) autorise le déplacement de u vers v ; (u, v) et (v, u) sont distincts.', slide: '11' }, { t: 'Graphe pondéré', d: 'Une fonction w associe un poids à chaque arête ou arc.', slide: '11' }],
      formulas: [{ t: 'Graphe', f: 'G = (V, E), n = |V|, m = |E|' }, { t: 'Graphe orienté', f: 'G = (V, A), arc (u, v) ∈ V × V' }]
    },
    qs: [
      qb.choice('n01.q1', 1, 'Dans la définition G = (V, E) de la diapo 8, que représente V ?', ['Un ensemble fini de n sommets', 'Un ensemble de m arêtes', 'Le poids des arêtes', 'Le nombre de sommets'], 0, '<p>V est l’ensemble fini des <i>n</i> sommets (Vertices) ; E est l’ensemble des liaisons. Le nombre de sommets est n = |V|, pas V lui-même.</p>', { src: 'course', slide: '8', tag: 'definition-graphe', hints: ['Pensez à l’anglais : V = Vertices.'] }),
      qb.tf('n01.q2', 1, 'Dans un graphe orienté, les arcs (u, v) et (v, u) sont identiques.', false, ['(u, v) autorise le déplacement de u vers v et (v, u) de v vers u : ils sont distincts (diapo 11).', 'Un arc n’a pas de sens.', 'Seulement si le graphe est pondéré.'], 0, '<p>Un arc (u, v) autorise le déplacement de u vers v seulement. (u, v) et (v, u) sont donc distincts, contrairement à la paire non orientée {u, v} = {v, u}.</p>', { src: 'course', slide: '11', tag: 'types-graphes', hints: ['Relisez la définition d’un arc.'] }),
      qb.multi('n01.q3', 1, 'Parmi ces adjectifs, lesquels peuvent qualifier un graphe selon la diapo 9 ?', ['orienté', 'non orienté', 'pondéré', 'non pondéré', 'coloré'], [0, 1, 2, 3], '<p>La diapo 9 liste : orienté, non orienté, pondéré, non pondéré. « Coloré » n’y figure pas.</p>', { src: 'course', slide: '9', tag: 'types-graphes', hints: ['Quatre adjectifs figurent sur la diapo.'] }),
      qb.choice('n01.q4', 2, 'Ce graphe est…', KINDS, function (G) { return (G.directed ? 1 : 0) + (G.weighted ? 2 : 0); }, '<p>Les liaisons portent une flèche (orienté) et aucune valeur n’est indiquée (non pondéré).</p>', { graph: mk('1234', ['12', '23', '31'], { directed: true }), tag: 'types-graphes', hints: ['Y a-t-il des flèches ? Des nombres sur les liaisons ?'] }),
      qb.choice('n01.q5', 2, 'Ce graphe est…', KINDS, function (G) { return (G.directed ? 1 : 0) + (G.weighted ? 2 : 0); }, '<p>Pas de flèche : non orienté. Chaque arête porte un nombre : pondéré.</p>', { graph: 's30', tag: 'types-graphes', hints: ['Cherchez des flèches, puis des nombres.'] }),
      qb.num('n01.q6', 1, 'Quel poids porte l’arc (B, C) ?', function (G) { return G.edges.filter(function (e) { return e.u === 'B' && e.v === 'C'; })[0].w; }, '<p>Le poids de l’arc (B, C) est la valeur écrite sur la flèche allant de B vers C : 2.</p>', { graph: mk('ABC', [['A', 'B', 5], ['B', 'C', 2], ['A', 'C', 4]], { directed: true, weighted: true }), tag: 'types-graphes', hints: ['Repérez la flèche qui part de B et arrive en C.'] }),
      qb.tf('n01.q7', 2, 'Un graphe pondéré est forcément orienté.', false, ['Les deux critères sont indépendants : un graphe non orienté peut porter des poids (distances).', 'Un poids n’a de sens que sur un arc.', 'Les graphes pondérés n’existent pas.'], 0, '<p>Orientation et pondération sont indépendantes : un réseau routier à double sens avec distances est non orienté et pondéré.</p>', { tag: 'types-graphes', hints: ['Pensez à une carte routière avec des kilomètres.'] }),
      qb.choice('n01.q8', 3, 'On modélise « A est ami avec B » (amitié réciproque) par deux arcs (A, B) et (B, A) dans un graphe orienté. Que peut-on dire ?', ['Ce n’est pas faux, mais redondant : une arête {A, B} suffit en non orienté.', 'C’est faux : un graphe orienté ne peut pas contenir deux arcs opposés.', 'C’est faux : (A, B) et (B, A) désignent le même arc.', 'C’est obligatoire : un graphe non orienté ne peut pas modéliser une amitié.'], 0, '<p>(A, B) et (B, A) sont des arcs distincts (diapo 11), donc le modèle est valide. Mais pour une relation réciproque, l’arête {A, B}, identique à {B, A}, exprime la même chose plus simplement.</p>', { tag: 'types-graphes', hints: ['Relisez : (u, v) et (v, u) sont-ils distincts ?', 'Une arête non orientée traduit-elle déjà la réciprocité ?'] }),
      qb.text('n01.q9', 1, 'Expliquez avec vos mots ce qu’est un graphe G = (V, E), puis la différence entre graphe orienté et non orienté.', '<p>Un graphe est un couple G = (V, E) : V est un ensemble fini de n sommets et E un ensemble de m liaisons entre sommets. Dans un graphe non orienté, la liaison est une arête {u, v} identique à {v, u}. Dans un graphe orienté G = (V, A), un arc (u, v) autorise le déplacement de u vers v et (u, v) ≠ (v, u).</p>', ['V est un ensemble fini de sommets (n = |V|)', 'E est un ensemble de liaisons entre sommets (m = |E|)', 'Arête non orientée : {u, v} = {v, u}', 'Arc orienté : (u, v) ≠ (v, u)'], { src: 'course', slide: '8, 11', tag: 'definition-graphe', hints: ['Commencez par V et E, puis parlez du sens des liaisons.'] }),
      qb.edges('n01.q10', 2, 'Écrivez la liste des arêtes d’un graphe non orienté sur les sommets A, B, C, D dans lequel A est relié à chacun des autres sommets, sans aucune autre arête.', function (g) {
        var c = keyCount(g), want = ['A|B', 'A|C', 'A|D'];
        if (g.edges.some(function (e) { return e.u === e.v; })) return { ok: false, msg: 'Une boucle n’est pas demandée ici.' };
        var miss = want.filter(function (k) { return !c[k]; });
        if (miss.length) return { ok: false, msg: 'Il manque encore ' + miss.length + ' arête(s) issue(s) de A.' };
        if (Object.keys(c).some(function (k) { return want.indexOf(k) < 0 || c[k] > 1; })) return { ok: false, msg: 'Il y a une arête en trop ou répétée : seules A-B, A-C, A-D sont attendues.' };
        return { ok: true };
      }, '<p>A relié à B, C et D, et rien d’autre : E = {{A,B}, {A,C}, {A,D}}.</p>', { sample: 'A-B, A-C, A-D', challenge: true, tag: 'definition-graphe', hints: ['Il faut exactement trois arêtes, toutes incidentes à A.'] }),
      qb.choice('n01.q11', 3, 'Des pages web sont reliées par des hyperliens ; on note pour chaque lien de A vers B le nombre de clics reçus. Quel type de graphe ?', KINDS, 3, '<p>Un lien de A vers B n’implique pas un lien de B vers A : orienté. Le nombre de clics est une valeur attachée à chaque lien : pondéré.</p>', { transfer: true, tag: 'types-graphes', hints: ['Le lien a-t-il un sens ? Porte-t-il une valeur ?'] })
    ]
  });
  /*SUITE*/
})(typeof self !== 'undefined' ? self : (typeof global !== 'undefined' ? global : this));

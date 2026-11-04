/* gens2.js — générateurs complémentaires : types de graphes, ordre/taille et exercices de CONSTRUCTION
 * (plus courte chaîne, cycles, graphes réguliers, compléter un graphe, sous-graphe induit, parcours
 * eulériens et hamiltoniens). Les réponses sont validées par le moteur (graphlib), pas par mots-clés.
 */
(function (root) {
  'use strict';
  var GF = root.GF, GR = GF.graph, U = GF.u, X = GF.ex, qb = X.qb;
  var rint = X.rint, pick = X.pick, shuffle = X.shuffle;
  function add(id, notion, levels, tag, make) { X.gens.push({ id: id, notion: notion, levels: levels, tag: tag, make: make }); }
  function B(x) { return '<b>' + x + '</b>'; }
  function laid(G, r) { G.pos = GR.layoutCircle(G.vertices, 150, 118, r || 92); return G; }
  function pairs(prs) { return prs.map(function (p) { return p[0] + '-' + p[1]; }).join(', '); }

  /* ===== n01 : types de graphes (orienté / pondéré) ===== */
  var KINDS = ['Non orienté, non pondéré', 'Orienté, non pondéré', 'Non orienté, pondéré', 'Orienté, pondéré'];
  var SC = [
    { lv: 1, a: 0, t: 'les amitiés entre les membres d’un réseau social comme Facebook (si A est ami avec B, alors B est ami avec A)',
      why: 'L’amitié est réciproque : la liaison {A, B} est identique à {B, A}, donc le graphe est <b>non orienté</b>. Aucune valeur n’est attachée aux liaisons : <b>non pondéré</b> (c’est l’exemple « Facebook » de la diapo 9).' },
    { lv: 1, a: 1, t: 'les abonnements « X suit Y » d’un réseau comme Twitter',
      why: '« X suit Y » n’implique pas « Y suit X » : il faut distinguer (X, Y) de (Y, X), donc le graphe est <b>orienté</b> (diapo 11). Aucune valeur numérique : <b>non pondéré</b> (exemple « Twitter » de la diapo 9).' },
    { lv: 1, a: 2, t: 'des villes reliées par des routes à double sens, chaque route étant étiquetée par sa longueur en kilomètres',
      why: 'Une route à double sens se parcourt dans les deux directions : <b>non orienté</b>. La longueur est une distance attachée à chaque liaison (diapo 11) : <b>pondéré</b>.' },
    { lv: 1, a: 3, t: 'des rues à sens unique, chacune étant étiquetée par son temps de parcours',
      why: 'Une rue à sens unique autorise le déplacement de u vers v seulement : <b>orienté</b>. Le temps de parcours est une durée attachée à chaque arc : <b>pondéré</b> (diapo 11).' },
    { lv: 1, a: 0, t: 'les câbles (bidirectionnels) qui relient les machines d’une salle informatique, sans autre information',
      why: 'Un câble bidirectionnel se parcourt dans les deux sens : <b>non orienté</b>. On ne retient que l’existence de la liaison : <b>non pondéré</b>.' },
    { lv: 1, a: 1, t: 'des pages web reliées par des hyperliens (la page A contient un lien vers la page B)',
      why: 'Un lien de A vers B n’implique pas un lien de B vers A : <b>orienté</b>. On ne retient que l’existence du lien : <b>non pondéré</b>.' },
    { lv: 1, a: 3, t: 'des vols entre aéroports, chaque vol allant d’un aéroport de départ vers un aéroport d’arrivée et ayant un prix',
      why: 'Un vol a un sens (départ → arrivée) : <b>orienté</b>. Le prix est un coût attaché à chaque arc : <b>pondéré</b> (diapo 11).' },
    { lv: 2, a: 2, t: 'des chercheurs reliés lorsqu’ils ont co-écrit au moins un article, avec le nombre d’articles co-écrits',
      why: 'Co-écrire est symétrique : <b>non orienté</b>. Le nombre d’articles est une valeur attachée à chaque liaison : <b>pondéré</b>.' },
    { lv: 2, a: 3, t: 'des virements entre comptes bancaires, avec le montant de chaque virement',
      why: 'Un virement va d’un compte émetteur vers un compte destinataire : <b>orienté</b>. Le montant est un poids : <b>pondéré</b>.' },
    { lv: 2, a: 1, t: 'la relation « est le parent de » entre des personnes',
      why: 'Si A est le parent de B, B n’est pas le parent de A : la relation n’est pas symétrique, donc <b>orienté</b>. Pas de valeur numérique : <b>non pondéré</b>.' },
    { lv: 2, a: 0, t: 'les poignées de main échangées lors d’une réunion (on retient seulement qui a serré la main à qui)',
      why: 'Une poignée de main est réciproque : <b>non orienté</b>. On ne retient que l’existence de la liaison : <b>non pondéré</b>.' },
    { lv: 2, a: 3, t: 'une carte routière où chaque tronçon est à double sens, mais où la durée du trajet dépend du sens (montée ou descente)',
      why: 'Comme la durée dépend du sens, il faut distinguer (u, v) de (v, u) et leur donner deux poids différents : <b>orienté</b> et <b>pondéré</b>. Un graphe non orienté ne peut porter qu’un seul poids par liaison.' },
    { lv: 2, a: 1, t: 'les résultats d’un tournoi : on trace une flèche de A vers B lorsque A a battu B',
      why: 'La relation « a battu » n’est pas symétrique : <b>orienté</b>. Aucune valeur n’est attachée : <b>non pondéré</b>.' }
  ];
  add('kind', 'n01', [1, 2], 'types-graphes', function (rng, lv) {
    var s = pick(rng, SC.filter(function (x) { return x.lv === lv; }));
    return qb.choice('', lv, 'Quel type de graphe faut-il choisir pour modéliser ' + s.t + ' ?', KINDS, s.a, s.why,
      { hints: ['Les liaisons se parcourent-elles dans un seul sens ou dans les deux ?', 'Chaque liaison porte-t-elle une valeur (durée, coût, distance…) ?'], tag: 'types-graphes' });
  });

  /* ===== n02 : ordre, taille, graphe simple ===== */
  add('order', 'n02', [1, 2, 3], 'ordre-taille', function (rng, lv) {
    var G, n, m;
    if (lv === 1) {
      G = X.randSimple(rng, rint(rng, 5, 7), rint(rng, 5, 8));
      var askN = rng() < 0.5;
      return qb.num('', 1, askN ? 'Quel est l’' + B('ordre') + ' n de ce graphe ?' : 'Quelle est la ' + B('taille') + ' m de ce graphe ?', askN ? GR.n(G) : GR.m(G),
        askN ? 'L’ordre est le nombre de sommets : n = |V| = ' + GR.n(G) + '.' : 'La taille est le nombre d’arêtes : m = |E| = ' + GR.m(G) + ' (arêtes : ' + GR.describeEdges(G) + ').',
        { graph: G, hints: [askN ? 'Comptez les sommets.' : 'Comptez chaque arête une seule fois.'], tag: 'ordre-taille' });
    }
    if (lv === 2) {
      var V = ['A', 'B', 'C', 'D'], allp = X.allPairs(V);
      var flip = function (p) { return rng() < 0.5 ? p.slice() : [p[1], p[0]]; };
      var validList = function () { return shuffle(rng, allp).slice(0, rint(rng, 2, 4)).map(flip); };
      var invalidList = function () {
        var kind = pick(rng, ['loop', 'dup', 'rev']), base = shuffle(rng, allp).slice(0, rint(rng, 2, 3)).map(flip);
        if (kind === 'loop') { var v = pick(rng, V); base.splice(rint(rng, 0, base.length), 0, [v, v]); }
        else if (kind === 'dup') { base.push(base[rint(rng, 0, base.length - 1)].slice()); }
        else { var e = base[rint(rng, 0, base.length - 1)]; base.push([e[1], e[0]]); }
        return shuffle(rng, base);
      };
      var nValid = rint(rng, 1, 3), lists = [], i;
      for (i = 0; i < 5; i++) lists.push(i < nValid ? validList() : invalidList());
      lists = shuffle(rng, lists);
      var verdict = lists.map(function (l) { return GR.isSimple(GR.make({ vertices: V, edges: l })); });
      var ans = []; verdict.forEach(function (ok, k) { if (ok) ans.push(k); });
      var why = '<ul>' + lists.map(function (l, k) {
        var loop = l.some(function (p) { return p[0] === p[1]; }), seen = {}, dupPair = null;
        l.forEach(function (p) { var key = GR.pairKey(p[0], p[1]); if (seen[key] && p[0] !== p[1]) dupPair = p; seen[key] = true; });
        return '<li><b>' + String.fromCharCode(65 + k) + '</b> — ' + (loop ? 'contient une boucle : un graphe simple n’en a pas.' : dupPair ? 'deux liaisons relient la même paire {' + dupPair[0] + ', ' + dupPair[1] + '} (la liaison {u, v} est identique à {v, u}) : pas simple.' : 'ni boucle, ni deux liaisons entre la même paire : simple.') + '</li>';
      }).join('') + '</ul>';
      return qb.multi('', 2, 'Soit V = {A, B, C, D}. Chaque ligne liste des liaisons ; une liaison u–v est non orientée (donc identique à v–u). Lesquelles définissent un ' + B('graphe simple non orienté') + ' ?',
        lists.map(function (l, k) { return String.fromCharCode(65 + k) + ' : ' + l.map(function (p) { return p[0] + '–' + p[1]; }).join(' ; '); }), ans, why,
        { hints: ['Simple : ni boucle, ni plusieurs arêtes entre la même paire (diapo 10).', 'Attention : A–B et B–A désignent la même paire.'], tag: 'simple-def' });
    }
    n = rint(rng, 5, 8); m = rint(rng, n - 1, n * (n - 1) / 2 - 1); G = X.randSimple(rng, n, m);
    var free = GR.maxEdgesSimple(n) - m;
    return qb.num('', 3, 'Ce graphe est simple et non orienté, d’ordre ' + B(n) + ' et de taille ' + B(m) + '. Combien de paires de sommets ne sont ' + B('pas') + ' reliées par une arête ?', free,
      'Un graphe simple a au plus une arête par paire de sommets (ni arêtes multiples, ni boucle). Il y a n(n − 1)/2 = ' + n + '×' + (n - 1) + '/2 = ' + (n * (n - 1) / 2) + ' paires de sommets, dont ' + m + ' sont reliées : il en reste ' + (n * (n - 1) / 2) + ' − ' + m + ' = ' + free + '.',
      { graph: G, hints: ['Combien de paires de sommets existe-t-il ?', 'Une arête par paire au maximum.'], tag: 'simple-def' });
  });

  /* ===== n08 : construire un cycle / circuit élémentaire ===== */
  add('buildcycle', 'n08', [2, 3], 'construire-cycle', function (rng, lv) {
    var dir = lv === 3, G, x0, sample = null, tries = 0;
    while (!sample && tries < 300) {
      tries++;
      G = dir ? X.randDigraph(rng, 5, rint(rng, 7, 9), 0) : X.randConnected(rng, 6, rint(rng, 7, 9));
      var cands = shuffle(rng, G.vertices);
      for (var i = 0; i < cands.length && !sample; i++) {
        var x = cands[i], succs = GR.succ(G, x);
        for (var j = 0; j < succs.length && !sample; j++) {
          var y = succs[j];
          if (y === x) continue;
          var chs = GR.elementaryChains(G, y, x, 200).chains.filter(function (c) { return dir ? c.length >= 2 : c.length >= 3; });
          if (chs.length) { x0 = x; sample = [x].concat(chs[rint(rng, 0, chs.length - 1)]); }
        }
      }
    }
    var nm = dir ? 'circuit' : 'cycle';
    return qb.walk('', lv, 'Donnez un ' + B(nm + ' élémentaire') + ' de ce graphe' + (dir ? ' orienté' : '') + ' passant par le sommet ' + B(x0) + ' (sommets séparés par des tirets ; répète le sommet de départ à la fin).',
      function (g, seq) {
        var cw = GR.classifyWalk(g, seq);
        if (!cw.valid) return { ok: false, msg: cw.reason };
        if (!cw.closed) return { ok: false, msg: 'Un ' + nm + ' est fermé : il revient à son sommet de départ.' };
        if (cw.length === 0) return { ok: false, msg: 'Un ' + nm + ' est non vide (au moins une ' + (dir ? 'arc' : 'arête') + ').' };
        if (!cw.simple) return { ok: false, msg: (dir ? 'Un arc est' : 'Une arête est') + ' utilisé' + (dir ? '' : 'e') + ' deux fois : ce n’est pas un ' + nm + '.' };
        if (!cw.elementary) return { ok: false, msg: 'Un sommet est répété : le ' + nm + ' n’est pas élémentaire (seul le sommet de départ est répété à l’arrivée).' };
        if (seq.indexOf(x0) < 0) return { ok: false, msg: 'Le ' + nm + ' doit passer par ' + x0 + '.' };
        return { ok: true };
      },
      'Un ' + nm + ' élémentaire est un trajet fermé, non vide, sans répétition d’' + (dir ? 'arc' : 'arête') + ' ni de sommet (hors départ = arrivée) (diapo 18). Exemple : ' + sample.join('-') + '.',
      { graph: G, sample: sample.join('-'), hints: ['Partez de ' + x0 + ', suis ' + (dir ? 'les flèches' : 'des arêtes') + ' sans repasser par un sommet déjà visité, puis reviens en ' + x0 + '.'], tag: 'construire-cycle' });
  });

  /* ===== n09 : plus courte chaîne ===== */
  add('shortest', 'n09', [2, 3], 'plus-court-chemin', function (rng, lv) {
    var G, u, v, d, tries = 0;
    do {
      G = X.randConnected(rng, lv === 2 ? 6 : 7, rint(rng, 7, 9)); u = pick(rng, G.vertices); v = pick(rng, G.vertices); d = GR.distance(G, u, v); tries++;
    } while (tries < 300 && d < (lv === 2 ? 2 : 3));
    var ch = GR.shortestChain(G, u, v);
    return qb.walk('', lv, 'Donnez une ' + B('chaîne de longueur minimale') + ' de ' + B(u) + ' à ' + B(v) + ' (sommets séparés par des tirets, ex. A-B-C).',
      function (g, seq) {
        var cw = GR.classifyWalk(g, seq);
        if (!cw.valid) return { ok: false, msg: cw.reason };
        if (seq[0] !== u || seq[seq.length - 1] !== v) return { ok: false, msg: 'La chaîne doit commencer en ' + u + ' et finir en ' + v + '.' };
        if (cw.length > d) return { ok: false, msg: 'C’est bien une chaîne de ' + u + ' à ' + v + ', de longueur ' + cw.length + ', mais il en existe une plus courte.' };
        return { ok: true };
      },
      'La distance δ(' + u + ', ' + v + ') est la longueur minimale d’une chaîne de ' + u + ' à ' + v + ' (diapo 19). Ici δ(' + u + ', ' + v + ') = ' + d + ', atteinte par exemple par ' + ch.join('-') + '.',
      { graph: G, sample: ch.join('-'), hints: ['Partez des voisins de ' + u + ' puis de leurs voisins, en comptant le nombre d’arêtes.', 'Comparez plusieurs chaînes : la longueur est le nombre d’arêtes, pas de sommets.'], tag: 'plus-court-chemin' });
  });

  /* ===== n06 : construire un graphe k-régulier ===== */
  add('buildreg', 'n06', [3], 'construire-regulier', function (rng) {
    var cfg = pick(rng, [[5, 2], [6, 2], [6, 3], [7, 2], [6, 4], [4, 3]]), n = cfg[0], k = cfg[1], vs = X.labels(n);
    var hh = GR.havelHakimi(new Array(n).fill(k)), smp = hh.map(function (p) { return vs[p[0]] + '-' + vs[p[1]]; }).join(', ');
    return qb.edges('', 3, 'Écrivez la liste des arêtes d’un graphe simple non orienté ' + B(k + '-régulier') + ' sur les ' + n + ' sommets ' + B(vs.join(', ')) + ' (séparées par des virgules, ex. A-B, B-C).',
      function (g) {
        var bad = g.vertices.filter(function (v) { return vs.indexOf(v) < 0; });
        if (bad.length) return { ok: false, msg: 'Sommet(s) inconnu(s) : ' + bad.join(', ') + '.' };
        if (g.edges.some(function (e) { return e.u === e.v; })) return { ok: false, msg: 'Pas de boucle : le graphe doit être simple.' };
        if (!GR.isSimple(g)) return { ok: false, msg: 'Le graphe doit être simple : une seule arête par paire de sommets.' };
        var H = GR.make({ vertices: vs, edges: g.edges.map(function (e) { return [e.u, e.v]; }) }), reg = GR.regularity(H);
        if (reg.regular && reg.k === k) return { ok: true };
        return { ok: false, msg: 'Degrés obtenus — ' + vs.map(function (v) { return v + ' : ' + GR.degree(H, v); }).join(', ') + '. Tous les sommets doivent avoir le degré ' + k + ' (un sommet non cité est isolé, de degré 0).' };
      },
      'Il faut que d(v) = ' + k + ' pour les ' + n + ' sommets, soit Σ d(v) = ' + (n * k) + ' = 2|E| et donc ' + (n * k / 2) + ' arêtes. Exemple : ' + smp + '.',
      { sample: smp, hints: ['Il faudra ' + (n * k / 2) + ' arêtes en tout (somme des degrés = 2|E|).', 'Faites le total des degrés au fur et à mesure.'], tag: 'construire-regulier' });
  });

  /* ===== n10 : compléter un graphe ===== */
  add('completeit', 'n10', [3], 'completer', function (rng) {
    var n = rint(rng, 5, 6), vs = X.labels(n), all = X.allPairs(vs), miss = shuffle(rng, all).slice(0, rint(rng, 2, 4));
    var keys = {}; miss.forEach(function (p) { keys[GR.pairKey(p[0], p[1])] = true; });
    var have = all.filter(function (p) { return !keys[GR.pairKey(p[0], p[1])]; });
    var G = laid(GR.make({ vertices: vs, edges: have })), smp = pairs(miss);
    return qb.edges('', 3, 'Ce graphe est presque complet. Écris uniquement les ' + B('arêtes à ajouter') + ' pour obtenir le graphe complet K' + n + ' (séparées par des virgules, ex. A-C, B-D).',
      function (g) {
        var seen = {}, i;
        for (i = 0; i < g.edges.length; i++) {
          var e = g.edges[i], k = GR.pairKey(e.u, e.v);
          if (e.u === e.v) return { ok: false, msg: 'Une boucle n’a pas sa place dans un graphe complet (graphe simple).' };
          if (vs.indexOf(e.u) < 0 || vs.indexOf(e.v) < 0) return { ok: false, msg: 'Sommet inconnu dans ' + e.u + '-' + e.v + '.' };
          if (!keys[k]) return { ok: false, msg: 'L’arête ' + e.u + '-' + e.v + ' existe déjà dans le graphe.' };
          if (seen[k]) return { ok: false, msg: 'L’arête ' + e.u + '-' + e.v + ' est écrite deux fois.' };
          seen[k] = true;
        }
        var left = miss.length - Object.keys(seen).length;
        return left === 0 ? { ok: true } : { ok: false, msg: 'Il manque encore ' + left + ' arête(s) pour obtenir K' + n + '.' };
      },
      'K' + n + ' est simple et toutes ses paires de sommets sont reliées : il a ' + (n * (n - 1) / 2) + ' arêtes. Le graphe en a ' + have.length + ' ; il manque les ' + miss.length + ' paires non adjacentes : ' + smp + '.',
      { graph: G, sample: smp, hints: ['Repérez, sommet par sommet, ceux auxquels il manque une liaison.', 'Dans K' + n + ', chaque sommet a pour degré ' + (n - 1) + '.'], tag: 'completer' });
  });

  /* ===== n12 : sous-graphe induit ===== */
  add('inducedsub', 'n12', [2, 3], 'induit', function (rng, lv) {
    var G, A, H, tries = 0;
    do {
      G = X.randConnected(rng, 6, rint(rng, 7, 9));
      A = shuffle(rng, G.vertices).slice(0, lv === 2 ? rint(rng, 3, 4) : rint(rng, 4, 5)).sort();
      H = GR.inducedSubgraph(G, A); tries++;
    } while (tries < 200 && H.edges.length < 2);
    var want = {}; H.edges.forEach(function (e) { want[GR.pairKey(e.u, e.v)] = true; });
    var smp = H.edges.map(function (e) { return e.u + '-' + e.v; }).join(', ');
    return qb.edges('', lv, 'Écrivez les arêtes du ' + B('sous-graphe de G induit par A = {' + A.join(', ') + '}') + ' (au sens du cours : A est un sous-ensemble de sommets et le sous-graphe contient toutes les arêtes de G ayant leurs deux extrémités dans A). Sépare par des virgules.',
      function (g) {
        var got = {}, i;
        for (i = 0; i < g.edges.length; i++) {
          var e = g.edges[i], k = GR.pairKey(e.u, e.v);
          if (A.indexOf(e.u) < 0 || A.indexOf(e.v) < 0) return { ok: false, msg: 'L’arête ' + e.u + '-' + e.v + ' a une extrémité hors de A.' };
          if (!want[k]) return { ok: false, msg: 'L’arête ' + e.u + '-' + e.v + ' n’existe pas dans G.' };
          got[k] = true;
        }
        var missing = Object.keys(want).filter(function (k) { return !got[k]; }).length;
        if (missing) return { ok: false, msg: missing + ' arête(s) de G entre sommets de A ne sont pas écrites : un sous-graphe contient TOUTES les arêtes de G ayant leurs deux extrémités dans A.' };
        return { ok: true };
      },
      'Les arêtes de G dont les deux extrémités sont dans A = {' + A.join(', ') + '} sont : ' + smp + '. Le sous-graphe doit toutes les contenir (contrairement à un graphe partiel, où l’on peut en retirer).',
      { graph: G, sample: smp, hints: ['Parcourez les arêtes de G une par une : garde celles dont les deux extrémités sont dans A.'], tag: 'induit' });
  });

  /* ===== n13 : donner un parcours eulérien ===== */
  add('eulerwalk', 'n13', [2, 3], 'euler-construire', function (rng, lv) {
    var want = rng() < 0.5 ? 'cycle' : 'chain', G, e, tries = 0, n;
    do {
      n = lv === 2 ? 5 : 6; G = laid(X.randConnected(rng, n, rint(rng, n, n + 3))); e = GR.euler(G); tries++;
    } while (tries < 800 && e.kind !== want);
    if (e.kind !== want) {
      G = laid(GR.make({ vertices: X.labels(5), edges: want === 'cycle' ? [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['E', 'A']] : [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E']] }));
      e = GR.euler(G);
    }
    var smp = e.walk.join('-');
    return qb.walk('', lv, want === 'cycle'
      ? 'Donnez un ' + B('cycle eulérien') + ' de ce graphe (il passe une et une seule fois par chaque arête ; répète le sommet de départ à la fin).'
      : 'Donnez une ' + B('chaîne eulérienne') + ' de ce graphe (non fermée : elle passe une et une seule fois par chaque arête).',
      function (g, seq) {
        var cw = GR.classifyWalk(g, seq);
        if (!cw.valid) return { ok: false, msg: cw.reason };
        if (!GR.isEulerTrail(g, seq)) {
          var used = seq.length - 1;
          return { ok: false, msg: used < GR.m(g) ? 'Il reste des arêtes non utilisées : ce parcours en utilise ' + used + ' sur ' + GR.m(g) + '.' : 'Ce parcours utilise plus d’arêtes que le graphe n’en a : une arête est répétée.' };
        }
        if (want === 'cycle' && !cw.closed) return { ok: false, msg: 'Toutes les arêtes sont utilisées une fois, mais le parcours n’est pas fermé : un cycle revient à son départ.' };
        return { ok: true };
      },
      'Degrés : ' + G.vertices.map(function (v) { return v + ':' + GR.degree(G, v); }).join(', ') + ' — sommets de degré impair : ' + U.set(e.odd) + '. ' + (want === 'cycle' ? 'Aucun sommet de degré impair et G connexe : cycle eulérien.' : 'Exactement deux sommets de degré impair : une chaîne eulérienne relie ces deux sommets (elle commence en l’un et finit en l’autre).') + ' Exemple : ' + smp + '.',
      { graph: G, sample: smp, hints: want === 'cycle' ? ['Tous les degrés sont pairs : vous peux partir de n’importe quel sommet.', 'Évitez de vous enfermer : ne « coupe » pas le graphe en laissant des arêtes derrière vous.']
        : ['Les extrémités de la chaîne sont les deux sommets de degré impair.', 'Commencez par l’un d’eux.'], tag: 'euler-construire' });
  });

  /* ===== n14 : donner une chaîne hamiltonienne ===== */
  add('hamchain', 'n14', [2], 'hamilton-chaine', function (rng) {
    var G, h, tries = 0, n;
    do {
      n = rint(rng, 5, 6); G = laid(X.randConnected(rng, n, rint(rng, n - 1, n + 2))); h = GR.hamilton(G); tries++;
    } while (tries < 400 && !(h.path && !h.cycle));
    if (!h.path) { G = laid(GR.make({ vertices: X.labels(5), edges: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E']] })); h = GR.hamilton(G); }
    n = GR.n(G);
    var smp = h.path.join('-');
    return qb.walk('', 2, 'Donnez une ' + B('chaîne hamiltonienne') + ' de ce graphe : une chaîne qui passe une et une seule fois par chaque sommet (pas besoin de revenir au départ).',
      function (g, seq) {
        var cw = GR.classifyWalk(g, seq);
        if (!cw.valid) return { ok: false, msg: cw.reason };
        if (GR.uniq(seq).length !== seq.length) return { ok: false, msg: 'Un sommet est répété : une chaîne hamiltonienne passe une seule fois par chaque sommet.' };
        if (seq.length < g.vertices.length) return { ok: false, msg: 'Il manque ' + (g.vertices.length - seq.length) + ' sommet(s) : il faut les visiter tous.' };
        return { ok: true };
      },
      'Une chaîne hamiltonienne visite chaque sommet exactement une fois (diapo 26, graphe « semi-hamiltonien »). Ici, par exemple : ' + smp + '. Ce graphe ' + (h.cycle ? 'admet même un cycle hamiltonien.' : 'n’admet pas de cycle hamiltonien : il est semi-hamiltonien sans être hamiltonien.'),
      { graph: G, sample: smp, hints: ['Commencez par un sommet de petit degré : il a peu de choix.', 'Un sommet de degré 1 ne peut être qu’une extrémité de la chaîne.'], tag: 'hamilton-chaine' });
  });
})(typeof self !== 'undefined' ? self : (typeof global !== 'undefined' ? global : this));

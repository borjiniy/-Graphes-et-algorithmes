/* gens.js — générateurs d'exercices paramétriques (graines aléatoires).
 * Toutes les réponses sont calculées par graphlib ; les énoncés varient à chaque tirage.
 */
(function (root) {
  'use strict';
  var GF = root.GF, GR = GF.graph, U = GF.u, X = GF.ex, RD = GF.render, qb = X.qb;
  var rint = X.rint, pick = X.pick, shuffle = X.shuffle;
  function add(id, notion, levels, tag, make) { X.gens.push({ id: id, notion: notion, levels: levels, tag: tag, make: make }); }
  function B(x) { return '<b>' + x + '</b>'; }
  function dv(v) { return 'd(' + U.esc(v) + ')'; }

  function randConnectedOn(rng, vs, m) {
    var order = shuffle(rng, vs), edges = [], has = {};
    for (var i = 1; i < order.length; i++) {
      var j = rint(rng, 0, i - 1);
      edges.push([order[i], order[j]]); has[GR.pairKey(order[i], order[j])] = true;
    }
    var rest = shuffle(rng, X.allPairs(vs).filter(function (p) { return !has[GR.pairKey(p[0], p[1])]; }));
    while (edges.length < m && rest.length) edges.push(rest.pop());
    return GR.make({ vertices: vs, edges: shuffle(rng, edges) });
  }
  function laid(G, r) { G.pos = GR.layoutCircle(G.vertices, 150, 118, r || 92); return G; }
  function ratio(num, den) { // fraction réduite en texte
    function g(a, b) { return b ? g(b, a % b) : a; }
    var d = g(num, den); num /= d; den /= d;
    return den === 1 ? String(num) : num + '/' + den;
  }

  /* ===== n03 : degré, voisins, sommets isolés ===== */
  add('deg', 'n03', [1, 2, 3], 'degre-compte', function (rng, lv) {
    var G, v, N;
    if (lv === 1) {
      G = X.randSimple(rng, rint(rng, 5, 6), rint(rng, 5, 8)); v = pick(rng, G.vertices); N = GR.neighbors(G, v);
      return qb.num('', 1, 'Quel est le degré ' + B(dv(v)) + ' du sommet ' + U.esc(v) + ' ?', N.length,
        'Le degré est le nombre d’arêtes incidentes à ' + U.esc(v) + '. Ses voisins sont N(' + U.esc(v) + ') = ' + U.set(N) + ', donc ' + dv(v) + ' = |N(' + U.esc(v) + ')| = ' + N.length + ' (graphe simple : une arête par voisin).',
        { graph: G, hints: ['Repérez les arêtes qui touchent le sommet ' + v + '.', 'Listez les sommets reliés à ' + v + ' par une arête, puis compte-les.'] });
    }
    if (lv === 2) {
      G = X.randSimple(rng, rint(rng, 5, 7), rint(rng, 6, 9));
      do { v = pick(rng, G.vertices); N = GR.neighbors(G, v); } while (!N.length);
      return qb.set('', 2, 'Donnez l’ensemble ' + B('N(' + U.esc(v) + ')') + ' des voisins de ' + U.esc(v) + ' (séparés par des virgules).', N,
        'Deux sommets sont adjacents si une arête les relie. Les arêtes incidentes à ' + U.esc(v) + ' sont ' + G.edges.filter(function (e) { return e.u === v || e.v === v; }).map(function (e) { return U.edge(e.u, e.v); }).join(', ') + ', d’où N(' + U.esc(v) + ') = ' + U.set(N) + '.',
        { graph: G, hints: ['Un voisin de ' + v + ' est l’autre extrémité d’une arête incidente à ' + v + '.'] });
    }
    var vs = X.labels(6), iso = pick(rng, vs), others = vs.filter(function (x) { return x !== iso; });
    G = randConnectedOn(rng, others, rint(rng, 5, 7)); G.vertices = vs.slice(); laid(G);
    return qb.set('', 3, 'Quel(s) sommet(s) de ce graphe est (sont) ' + B('isolé(s)') + ' ? (Réponds « aucun » s’il n’y en a pas.)', [iso],
      'Un sommet est isolé s’il n’existe pas d’arête incidente à ce sommet, c’est-à-dire si son degré vaut 0. Ici seul ' + U.esc(iso) + ' n’a aucune arête.',
      { graph: G, hints: ['Cherchez un sommet auquel aucune arête n’aboutit.'], tag: 'isole' });
  });

  /* ===== n04 : somme des degrés ===== */
  add('degsum', 'n04', [1, 2], 'somme-degres', function (rng, lv) {
    var G = X.randSimple(rng, rint(rng, 5, 7), rint(rng, 6, 10)), ds = shuffle(rng, G.vertices.map(function (v) { return GR.degree(G, v); }));
    var mm = GR.m(G);
    if (lv === 1) {
      return qb.num('', 1, 'Un graphe simple non orienté a pour degrés (dans un ordre quelconque) : ' + B(ds.join(', ')) + '. Combien d’arêtes possède-t-il ?', mm,
        'Théorème de la somme des degrés : Σ d(v) = 2|E|. Ici Σ d(v) = ' + ds.reduce(function (a, b) { return a + b; }, 0) + ', donc |E| = ' + ds.reduce(function (a, b) { return a + b; }, 0) + ' / 2 = ' + mm + '.',
        { hints: ['Additionnez tous les degrés.', 'Chaque arête est comptée deux fois dans cette somme (une par extrémité).'], tag: 'somme-degres' });
    }
    var k = rint(rng, 0, ds.length - 1), shown = ds.map(function (d, i) { return i === k ? 'x' : d; }), rest = ds.reduce(function (a, b, i) { return i === k ? a : a + b; }, 0);
    return qb.num('', 2, 'Un graphe simple non orienté a ' + B(mm + ' arêtes') + ' et ' + ds.length + ' sommets de degrés : ' + B(shown.join(', ')) + '. Quelle est la valeur de x ?', ds[k],
      'Σ d(v) = 2|E| = ' + (2 * mm) + '. La somme des autres degrés vaut ' + rest + ', donc x = ' + (2 * mm) + ' − ' + rest + ' = ' + ds[k] + '.',
      { hints: ['Calculez d’abord 2|E|.', 'Soustrayez la somme des degrés connus.'], tag: 'somme-degres' });
  });

  add('parity', 'n04', [2, 3], 'parite-degres', function (rng, lv) {
    var kind = pick(rng, ['odd', 'hh', 'toobig']);
    var n = rint(rng, 5, 7), G = X.randSimple(rng, n, rint(rng, n, n + 3)), seq = G.vertices.map(function (v) { return GR.degree(G, v); }), sum;
    if (kind === 'odd') {
      var i = rint(rng, 0, n - 1); seq[i] = seq[i] < n - 1 ? seq[i] + 1 : seq[i] - 1;
    } else if (kind === 'toobig') {
      seq[0] = n;
      sum = seq.reduce(function (a, b) { return a + b; }, 0);
      if (sum % 2) { var j = seq.findIndex(function (d, ix) { return ix > 0 && d < n - 1; }); if (j < 0) kind = 'hh'; else seq[j] += 1; }
      if (kind === 'toobig') { /* ok */ } else { seq = G.vertices.map(function (v) { return GR.degree(G, v); }); }
    }
    sum = seq.reduce(function (a, b) { return a + b; }, 0);
    var sorted = seq.slice().sort(function (a, b) { return b - a; });
    var jo = [
      'La somme des degrés est impaire, alors qu’elle doit valoir 2|E|.',
      'Un sommet ne peut pas avoir plus de n − 1 voisins dans un graphe simple.',
      'On peut construire un graphe simple qui réalise ces degrés.',
      'La somme est paire : c’est donc toujours possible.'
    ];
    var ans, just, why;
    if (kind === 'odd') { ans = false; just = 0; why = 'La somme vaut ' + sum + ', un nombre impair. Or Σ d(v) = 2|E| est toujours pair : <b>impossible</b>. (Même résultat via le corollaire : le nombre de sommets de degré impair doit être pair.)'; }
    else if (kind === 'toobig') { ans = false; just = 1; why = 'Un sommet de degré ' + n + ' aurait ' + n + ' voisins distincts, mais il n’y a que ' + (n - 1) + ' autres sommets (graphe simple : ni boucle, ni arêtes multiples). La somme (' + sum + ') est paire, mais ça ne suffit pas : <b>impossible</b>.'; }
    else { ans = true; just = 2; why = 'La somme (' + sum + ') est paire <b>et</b> une construction existe, par exemple avec les arêtes ' + GR.describeEdges(G) + ' (sommets ' + G.vertices.join(', ') + ' de degrés ' + seq.join(', ') + '). Attention : une somme paire est nécessaire mais ne garantit pas, à elle seule, l’existence.'; }
    return qb.tf('', lv, 'Les nombres ' + B(sorted.join(', ')) + ' peuvent-ils être les degrés des ' + n + ' sommets d’un <b>graphe simple</b> non orienté ?', ans, jo, just, why,
      { hints: ['Calculez la somme des degrés. Que doit-elle valoir ?', 'Quel est le plus grand degré possible dans un graphe simple à ' + n + ' sommets ?'], tag: 'parite-degres' });
  });

  /* ===== n05 : graphes orientés ===== */
  add('dirdeg', 'n05', [1, 2, 3], 'demi-degres', function (rng, lv) {
    var G = X.randDigraph(rng, 4, rint(rng, 5, 7), rint(rng, 0, 1)), v = pick(rng, G.vertices);
    var out = GR.outDeg(G, v), inn = GR.inDeg(G, v), arcs = GR.describeEdges(G);
    var loopNote = G.edges.some(function (e) { return e.u === e.v; }) ? ' (une boucle compte pour 1 dans d⁺ et pour 1 dans d⁻)' : '';
    if (lv === 1) {
      var plus = rng() < 0.5;
      return qb.num('', 1, 'Dans ce graphe orienté, quel est le demi-degré ' + (plus ? B('sortant d⁺(' + v + ')') : B('entrant d⁻(' + v + ')')) + ' du sommet ' + v + ' ?', plus ? out : inn,
        'Arcs : ' + arcs + '. ' + (plus ? 'd⁺(' + v + ') compte les arcs de la forme (' + v + ', ·)' : 'd⁻(' + v + ') compte les arcs de la forme (·, ' + v + ')') + ' : ' + (plus ? out : inn) + loopNote + '.',
        { graph: G, hints: [plus ? 'Comptez les flèches qui PARTENT de ' + v + '.' : 'Comptez les flèches qui ARRIVENT en ' + v + '.'], tag: 'demi-degres' });
    }
    if (lv === 2) {
      return qb.num('', 2, 'Quel est le degré ' + B('d(' + v + ')') + ' du sommet ' + v + ' dans ce graphe orienté ?', out + inn,
        'Arcs : ' + arcs + '. d⁺(' + v + ') = ' + out + ' et d⁻(' + v + ') = ' + inn + ', donc d(' + v + ') = d⁺(' + v + ') + d⁻(' + v + ') = ' + (out + inn) + loopNote + '.',
        { graph: G, hints: ['d(s) = d⁺(s) + d⁻(s).'], tag: 'demi-degres' });
    }
    var dp = G.vertices.map(function (x) { return GR.outDeg(G, x); });
    return qb.num('', 3, 'Un graphe orienté a 4 sommets dont les demi-degrés sortants valent ' + B(dp.join(', ')) + '. Combien d’arcs possède-t-il ?', GR.m(G),
      'Chaque arc part d’exactement un sommet : Σ d⁺(v) = |A|. Ici ' + dp.join(' + ') + ' = ' + GR.m(G) + '. (De même Σ d⁻(v) = |A|.)',
      { hints: ['Chaque arc a un point de départ et un seul.'], tag: 'demi-degres' });
  });

  /* ===== n06 : graphes réguliers, degré d'un graphe ===== */
  add('regular', 'n06', [1, 2, 3], 'regulier', function (rng, lv) {
    var G, k;
    if (lv === 1) {
      var kind = pick(rng, ['cycle', 'complete', 'matching', 'path', 'chord']), n;
      if (kind === 'cycle') { n = rint(rng, 4, 7); G = GR.make({ vertices: X.labels(n), edges: X.labels(n).map(function (v, i, a) { return [v, a[(i + 1) % n]]; }) }); }
      else if (kind === 'complete') { n = rint(rng, 4, 5); G = GR.make({ vertices: X.labels(n), edges: X.allPairs(X.labels(n)) }); }
      else if (kind === 'matching') { n = 6; G = GR.make({ vertices: X.labels(n), edges: [['A', 'B'], ['C', 'D'], ['E', 'F']] }); }
      else if (kind === 'path') { n = rint(rng, 4, 6); G = GR.make({ vertices: X.labels(n), edges: X.labels(n).slice(1).map(function (v, i) { return [X.labels(n)[i], v]; }) }); }
      else { n = rint(rng, 5, 6); G = GR.make({ vertices: X.labels(n), edges: X.labels(n).map(function (v, i, a) { return [v, a[(i + 1) % n]]; }).concat([['A', 'C']]) }); }
      laid(G);
      var reg = GR.regularity(G), ds = G.vertices.map(function (v) { return GR.degree(G, v); });
      return qb.choice('', 1, 'Ce graphe est-il régulier ? Si oui, de quel degré ?', ['Non régulier', '1-régulier', '2-régulier', '3-régulier', '4-régulier'], reg.regular ? reg.k : 0,
        'Degrés : ' + ds.join(', ') + '. ' + (reg.regular ? 'Tous les sommets ont le même degré k = ' + reg.k + ' : le graphe est ' + reg.k + '-régulier.' : 'Les degrés ne sont pas tous égaux : le graphe n’est pas régulier.'),
        { graph: G, hints: ['Calculez le degré de chaque sommet.', 'Un graphe est régulier si TOUS les sommets ont le même degré.'], tag: 'regulier' });
    }
    if (lv === 2) {
      G = X.randSimple(rng, 6, rint(rng, 6, 9));
      var ds2 = G.vertices.map(function (v) { return GR.degree(G, v); });
      return qb.num('', 2, 'Quel est le ' + B('degré du graphe') + ' (au sens du cours) ?', Math.max.apply(null, ds2),
        'Le degré d’un graphe est le degré maximum de ses sommets. Degrés : ' + G.vertices.map(function (v, i) { return v + ' : ' + ds2[i]; }).join(' ; ') + '. Le maximum est ' + Math.max.apply(null, ds2) + '.',
        { graph: G, hints: ['Le « degré du graphe » n’est pas la somme des degrés : c’est leur maximum.'], tag: 'degre-graphe' });
    }
    var n3 = rint(rng, 5, 8); k = rint(rng, 2, 4); if (k > n3 - 1) k = n3 - 1;
    var odd = (n3 * k) % 2 === 1, jo = ['Le produit k × n est impair : la somme des degrés serait impaire.', 'Un tel graphe existe : on peut le construire.', 'Un graphe régulier doit être complet.', 'Il faut n = k + 1 sommets exactement.'];
    var hh = odd ? null : GR.havelHakimi(new Array(n3).fill(k));
    if (!odd && !hh) odd = true;
    var why;
    if (hh && !odd) why = 'k × n = ' + (k * n3) + ' est pair et on peut construire un tel graphe, par exemple avec les arêtes ' + hh.map(function (p) { return '{' + X.labels(n3)[p[0]] + ', ' + X.labels(n3)[p[1]] + '}'; }).join(', ') + '. (Un graphe régulier n’est pas forcément complet.)';
    else why = 'Dans un graphe ' + k + '-régulier à ' + n3 + ' sommets, Σ d(v) = ' + k + ' × ' + n3 + ' = ' + (k * n3) + ' est impair. Or Σ d(v) = 2|E| est pair : <b>impossible</b>.';
    return qb.tf('', 3, 'Existe-t-il un graphe simple non orienté ' + B(k + '-régulier à ' + n3 + ' sommets') + ' ?', !odd, jo, odd ? 0 : 1, why,
      { hints: ['Calculez la somme des degrés d’un tel graphe.'], tag: 'regulier' });
  });

  /* ===== n07 : densité ===== */
  add('density', 'n07', [1, 2, 3], 'densite-formule', function (rng, lv) {
    var f = function (n, m) { return 2 * m / (n * (n - 1)); };
    if (lv === 1) {
      var n = pick(rng, [4, 5, 6, 10]), mx = n * (n - 1) / 2, m = rint(rng, 1, mx - 1), D = f(n, m);
      return qb.num('', 1, 'Un graphe simple non orienté a ' + B(n + ' sommets') + ' et ' + B(m + ' arêtes') + '. Calcule sa densité D (décimal ou fraction, ex. 7/15).', D,
        'D = ' + U.frac('2m', 'n(n − 1)') + ' = ' + U.frac('2 × ' + m, n + ' × ' + (n - 1)) + ' = ' + U.frac(2 * m, n * (n - 1)) + ' = ' + ratio(2 * m, n * (n - 1)) + ' ≈ ' + X.fmtNum(Math.round(D * 1000) / 1000) + '.',
        { tol: 0.006, hints: ['Appliquez D = 2m / (n(n − 1)).'], tag: 'densite-formule' });
    }
    if (lv === 2) {
      var n2 = pick(rng, [5, 6, 10]), mx2 = n2 * (n2 - 1) / 2, m2 = rint(rng, 2, mx2 - 1), Ds = ratio(2 * m2, n2 * (n2 - 1));
      return qb.num('', 2, 'Un graphe simple non orienté a ' + B(n2 + ' sommets') + ' et une densité ' + B('D = ' + Ds) + '. Combien d’arêtes a-t-il ?', m2,
        'D = 2m / (n(n − 1)) donc m = D × n(n − 1) / 2 = ' + Ds + ' × ' + (n2 * (n2 - 1)) + ' / 2 = ' + m2 + '.',
        { hints: ['Isolez m dans la formule de la densité.'], tag: 'densite-formule' });
    }
    var n1, m1, n2b, m2b, tries = 0;
    do {
      n1 = rint(rng, 8, 12); n2b = rint(rng, 4, 6); m2b = rint(rng, n2b, n2b * (n2b - 1) / 2); m1 = rint(rng, m2b + 1, m2b + 12); tries++;
    } while (tries < 80 && (m1 > n1 * (n1 - 1) / 2 || f(n1, m1) >= f(n2b, m2b)));
    if (m1 > n1 * (n1 - 1) / 2) m1 = n1 * (n1 - 1) / 2;
    var d1 = f(n1, m1), d2 = f(n2b, m2b);
    var ans = Math.abs(d1 - d2) < 1e-12 ? 2 : (d1 > d2 ? 0 : 1);
    return qb.choice('', 3, 'G₁ a ' + B(n1 + ' sommets et ' + m1 + ' arêtes') + ' ; G₂ a ' + B(n2b + ' sommets et ' + m2b + ' arêtes') + ' (graphes simples non orientés). Lequel est le plus dense ?',
      ['G₁', 'G₂', 'Même densité'], ans,
      'D(G₁) = 2×' + m1 + ' / (' + n1 + '×' + (n1 - 1) + ') ≈ ' + X.fmtNum(Math.round(d1 * 1000) / 1000) + ' et D(G₂) = 2×' + m2b + ' / (' + n2b + '×' + (n2b - 1) + ') ≈ ' + X.fmtNum(Math.round(d2 * 1000) / 1000) + '. Avoir plus d’arêtes ne rend pas un graphe plus dense : la densité compare au nombre maximal d’arêtes possibles.',
      { hints: ['Calculez la densité de chacun avant de comparer.'], tag: 'densite-nbaretes' });
  });

  /* ===== n08 : trajets ===== */
  var WL = {
    u: {
      notChain: 'Ce n’est pas une chaîne (deux sommets consécutifs ne sont pas adjacents)',
      elemChain: 'Une chaîne simple et élémentaire (non fermée)',
      simpleChain: 'Une chaîne simple mais non élémentaire (non fermée)',
      nonSimple: 'Une chaîne non simple (une arête est répétée, non fermée)',
      elemCycle: 'Un cycle élémentaire',
      cycle: 'Un cycle non élémentaire (un sommet est répété)',
      closedNonCycle: 'Une chaîne fermée qui n’est pas un cycle (une arête est répétée)'
    },
    d: {
      notChain: 'Ce n’est pas un chemin (il manque un arc dans le bon sens)',
      elemChain: 'Un chemin simple et élémentaire (non fermé)',
      simpleChain: 'Un chemin simple mais non élémentaire (non fermé)',
      nonSimple: 'Un chemin non simple (un arc est répété, non fermé)',
      elemCycle: 'Un circuit élémentaire',
      cycle: 'Un circuit non élémentaire (un sommet est répété)',
      closedNonCycle: 'Un chemin fermé qui n’est pas un circuit (un arc est répété)'
    }
  };
  var WORDER = ['notChain', 'elemChain', 'simpleChain', 'nonSimple', 'elemCycle', 'cycle', 'closedNonCycle'];
  function walkLabel(cw) {
    if (!cw.valid) return 'notChain';
    if (cw.length === 0) return 'elemChain'; /* diapo 18 : « on autorise le trajet de longueur zéro » */
    if (cw.closed) { if (!cw.simple) return 'closedNonCycle'; return cw.elementary ? 'elemCycle' : 'cycle'; }
    if (!cw.simple) return 'nonSimple';
    return cw.elementary ? 'elemChain' : 'simpleChain';
  }
  add('walk', 'n08', [1, 2, 3], 'confusion-chaine-cycle', function (rng, lv) {
    var G = lv === 3 ? X.randDigraph(rng, 5, rint(rng, 8, 10), 0) : X.randConnected(rng, 6, rint(rng, 7, 8));
    var dir = G.directed, set = dir ? WL.d : WL.u;
    var allowed = lv === 1 ? ['notChain', 'elemChain', 'elemCycle'] : WORDER;
    var byLab = {}, tries = 0;
    for (var t = 0; t < 600; t++) {
      var cur = pick(rng, G.vertices), seq = [cur], L = rint(rng, 2, 6);
      for (var s = 0; s < L; s++) {
        var nb = GR.succ(G, cur);
        if (!nb.length || rng() < 0.07) cur = pick(rng, G.vertices); else cur = pick(rng, nb);
        seq.push(cur);
      }
      var lab = walkLabel(GR.classifyWalk(G, seq));
      if (allowed.indexOf(lab) < 0) continue;
      (byLab[lab] = byLab[lab] || []).push(seq);
    }
    var labs = Object.keys(byLab);
    var lab2 = pick(rng, labs), seq2 = pick(rng, byLab[lab2]);
    var opts = allowed.map(function (k) { return set[k]; });
    var cw = GR.classifyWalk(G, seq2);
    var why = 'Séquence ' + seq2.join(' – ') + ' : ' + (cw.valid ? 'longueur ' + cw.length + ', ' + (cw.closed ? 'fermée' : 'non fermée') + ', ' + (cw.simple ? 'aucune ' + (dir ? 'arc' : 'arête') + ' répétée' : (dir ? 'un arc' : 'une arête') + ' est répété(e)') + ', ' + (cw.elementary ? 'aucun sommet répété (hors départ = arrivée)' : 'un sommet est répété') + '.' : cw.reason) +
      ' D’après le tableau du cours : simple = aucune ' + (dir ? 'arc' : 'arête') + ' répété(e) ; élémentaire = aucun sommet répété ; ' + (dir ? 'circuit' : 'cycle') + ' = trajet fermé non vide sans répétition d’' + (dir ? 'arcs' : 'arêtes') + '.';
    return qb.choice('', lv, 'Dans ce graphe' + (dir ? ' orienté' : '') + ', la séquence de sommets ' + B(seq2.join(' – ')) + ' est…', opts, allowed.indexOf(lab2), why,
      { graph: G, hints: ['Vérifiez d’abord que chaque paire de sommets consécutifs est bien reliée' + (dir ? ' (dans le bon sens)' : '') + '.', 'Puis cherche une répétition d’' + (dir ? 'arc' : 'arête') + ', puis de sommet, et regarde si le trajet est fermé.'], tag: 'confusion-chaine-cycle' });
  });

  /* ===== n09 : distance, diamètre, connexité ===== */
  add('dist', 'n09', [1, 2, 3], 'distance-longueur', function (rng, lv) {
    var G, u, v, d, tries = 0;
    if (lv === 1) {
      G = X.randConnected(rng, 6, rint(rng, 6, 8));
      do { u = pick(rng, G.vertices); v = pick(rng, G.vertices); d = GR.distance(G, u, v); tries++; } while (tries < 60 && d < 2);
      var ch = GR.shortestChain(G, u, v);
      return qb.num('', 1, 'Quelle est la distance ' + B('δ(' + u + ', ' + v + ')') + ' entre ' + u + ' et ' + v + ' ?', d,
        'La distance est la longueur minimale d’une chaîne de ' + u + ' à ' + v + ' (longueur = nombre d’arêtes). Une chaîne la plus courte est ' + ch.join(' – ') + ', de longueur ' + d + '.',
        { graph: G, hints: ['Cherchez la chaîne qui utilise le moins d’arêtes.'], tag: 'distance-longueur' });
    }
    G = lv === 2 ? X.randConnected(rng, 6, rint(rng, 6, 7)) : X.randConnected(rng, 7, 6);
    var D = GR.diameter(G), best = null;
    G.vertices.forEach(function (a) { G.vertices.forEach(function (b) { if (!best && GR.distance(G, a, b) === D) best = [a, b]; }); });
    return qb.num('', lv, 'Quel est le ' + B('diamètre') + ' de ce graphe (connexe) ?', D,
      'Le diamètre est la plus longue des distances entre deux sommets. Ici δ(' + best[0] + ', ' + best[1] + ') = ' + D + ' et aucune paire n’est plus éloignée.',
      { graph: G, hints: ['Calculez les distances entre les sommets les plus « éloignés », puis prends la plus grande.'], tag: 'diametre' });
  });

  add('connexe', 'n09', [2], 'connexite', function (rng) {
    var G, comps;
    if (rng() < 0.5) { G = X.randConnected(rng, 6, rint(rng, 6, 8)); }
    else {
      var vs = shuffle(rng, X.labels(6)), cut = rint(rng, 2, 4), a = vs.slice(0, cut), b = vs.slice(cut);
      var G1 = randConnectedOn(rng, a, a.length - 1 + rint(rng, 0, 1)), G2 = randConnectedOn(rng, b, b.length - 1 + rint(rng, 0, 1));
      G = GR.make({ vertices: X.labels(6), edges: G1.edges.concat(G2.edges).map(function (e) { return [e.u, e.v]; }) }); laid(G);
    }
    comps = GR.components(G);
    var conn = comps.length === 1, x = comps[0][0], y = comps.length > 1 ? comps[1][0] : null;
    var jo = ['Toute paire de sommets est reliée par une chaîne.', 'Il existe deux sommets entre lesquels il n’y a aucune chaîne : ' + (y ? x + ' et ' + y : '…'), 'Le graphe possède des sommets de degré impair.', 'Le graphe possède plus de n − 1 arêtes.'];
    return qb.tf('', 2, 'Ce graphe est-il ' + B('connexe') + ' ?', conn, jo, conn ? 0 : 1,
      conn ? 'On peut atteindre n’importe quel sommet depuis n’importe quel autre : composante connexe unique ' + U.set(comps[0]) + '.' : 'Composantes connexes : ' + comps.map(U.set).join(' ; ') + '. Aucune chaîne ne relie ' + x + ' à ' + y + ' : le graphe n’est pas connexe.',
      { graph: G, hints: ['Choisissez deux sommets et cherche une chaîne qui les relie.'], tag: 'connexite' });
  });

  /* ===== n10 : graphes complets et cliques ===== */
  add('complete', 'n10', [1, 2, 3], 'complet-cliques', function (rng, lv) {
    var G;
    if (lv === 1) {
      var n = rint(rng, 4, 9);
      return qb.num('', 1, 'Combien d’arêtes possède le graphe complet ' + B('K' + n) + ' ?', n * (n - 1) / 2,
        'Dans K' + n + ', toute paire de sommets est reliée : il y a C(' + n + ', 2) = ' + n + '×' + (n - 1) + '/2 = ' + (n * (n - 1) / 2) + ' arêtes. (C’est aussi la valeur de m pour laquelle la densité vaut 1 : 2m / (n(n − 1)) = 1.)',
        { hints: ['Comptez les paires de sommets, chaque paire donne une arête.'], tag: 'complet-cliques' });
    }
    if (lv === 2) {
      G = X.randSimple(rng, rint(rng, 5, 6), rint(rng, 6, 9));
      var need = GR.maxEdgesSimple(GR.n(G)) - GR.m(G);
      return qb.num('', 2, 'Combien d’arêtes faut-il ' + B('ajouter') + ' à ce graphe pour qu’il devienne complet ?', need,
        'Un graphe complet à ' + GR.n(G) + ' sommets a ' + GR.maxEdgesSimple(GR.n(G)) + ' arêtes ; G en a ' + GR.m(G) + '. Il en manque ' + need + '.',
        { graph: G, hints: ['Combien d’arêtes a K' + GR.n(G) + ' ?'], tag: 'complet-cliques' });
    }
    var n3 = 6, k = rint(rng, 3, 4), vs = X.labels(n3), S = shuffle(rng, vs).slice(0, k), edges = X.allPairs(S).map(function (p) { return p.slice(); });
    var rest = shuffle(rng, X.allPairs(vs).filter(function (p) { return !(S.indexOf(p[0]) >= 0 && S.indexOf(p[1]) >= 0); })).slice(0, rint(rng, 2, 3));
    G = laid(GR.make({ vertices: vs, edges: edges.concat(rest) }));
    var w = GR.maxCliqueSize(G), best = GR.maximalCliques(G).filter(function (c) { return c.length === w; })[0];
    return qb.num('', 3, 'Quel est le nombre de sommets de la ' + B('plus grande clique') + ' (sous-graphe complet) de ce graphe ?', w,
      'Une clique est un sous-graphe complet : toutes ses paires de sommets sont adjacentes. La plus grande ici est ' + U.set(best) + ', de taille ' + w + '.',
      { graph: G, hints: ['Cherchez des groupes de sommets tous reliés deux à deux (des triangles, puis des K4…).'], tag: 'complet-cliques' });
  });

  /* ===== n11 : composantes connexes / fortement connexes ===== */
  add('comp', 'n11', [1, 2, 3], 'composantes', function (rng, lv) {
    var kc = rint(rng, 2, 3), vs = shuffle(rng, X.labels(7)), parts = [], idx = 0, sizes = kc === 2 ? [rint(rng, 2, 4)] : [rint(rng, 2, 3), rint(rng, 2, 3)];
    var used = sizes.reduce(function (a, b) { return a + b; }, 0); sizes.push(7 - used);
    if (sizes[sizes.length - 1] < 1) { sizes = [3, 2, 2]; kc = 3; }
    sizes.forEach(function (s) { parts.push(vs.slice(idx, idx + s)); idx += s; });
    var edges = [];
    parts.forEach(function (p) { if (p.length > 1) randConnectedOn(rng, p, p.length - 1 + rint(rng, 0, 1)).edges.forEach(function (e) { edges.push([e.u, e.v]); }); });
    var G = laid(GR.make({ vertices: X.labels(7), edges: edges })), comps = GR.components(G);
    if (lv === 1) return qb.num('', 1, 'Combien de ' + B('composantes connexes') + ' ce graphe possède-t-il ? (Un sommet isolé forme une composante.)', comps.length,
      'Composantes : ' + comps.map(U.set).join(' ; ') + '. Il y en a ' + comps.length + '.', { graph: G, hints: ['Une composante est un ensemble de sommets mutuellement accessibles par des chaînes.'], tag: 'composantes' });
    if (lv === 2) { var s = pick(rng, G.vertices), cc = GR.componentOf(G, s);
      return qb.set('', 2, 'Donnez la composante connexe ' + B('CC(' + s + ')') + ' du sommet ' + s + '.', cc,
        'CC(' + s + ') est l’ensemble des sommets accessibles depuis ' + s + ' (y compris ' + s + ' lui-même) : ' + U.set(cc) + '.', { graph: G, hints: ['Partez de ' + s + ' et suis les arêtes aussi loin que possible. N’oublie pas ' + s + '.'], tag: 'composantes' }); }
    return qb.num('', 3, 'Combien d’arêtes faut-il ajouter ' + B('au minimum') + ' pour rendre ce graphe connexe ?', comps.length - 1,
      'Il y a ' + comps.length + ' composantes (' + comps.map(U.set).join(' ; ') + '). Chaque arête ajoutée entre deux composantes distinctes en fusionne deux : il faut au minimum ' + (comps.length - 1) + ' arêtes. (Raisonnement hors cours, mais élémentaire.)',
      { graph: G, hints: ['Une arête reliant deux composantes différentes réduit leur nombre de 1.'], tag: 'composantes' });
  });

  add('scc', 'n11', [3], 'composantes', function (rng) {
    var G, tries = 0;
    do { G = X.randDigraph(rng, 5, rint(rng, 6, 8), 0); tries++; } while (tries < 50 && GR.scc(G).every(function (c) { return c.length === 1; }));
    var s = pick(rng, G.vertices), c = GR.sccOf(G, s);
    return qb.set('', 3, 'Donnez la composante fortement connexe ' + B('CFC(' + s + ')') + ' du sommet ' + s + ' (l’ensemble maximal de sommets mutuellement accessibles).', c,
      'CFC(' + s + ') regroupe les sommets u tels qu’il existe un chemin de ' + s + ' à u ET un chemin de u à ' + s + '. Ici : ' + U.set(c) + '. Toutes les composantes fortement connexes : ' + GR.scc(G).map(U.set).join(' ; ') + '.',
      { graph: G, hints: ['Dans un graphe orienté, « accessible » respecte le sens des arcs, dans les deux directions.'], tag: 'composantes-orientees' });
  });

  /* ===== n12 : graphe partiel / sous-graphe ===== */
  add('subgraph', 'n12', [1, 2, 3], 'partiel-vs-sousgraphe', function (rng, lv) {
    var G = X.randConnected(rng, 6, rint(rng, 7, 9)), H, kind = pick(rng, lv === 1 ? ['sub', 'partial'] : ['sub', 'partial', 'dropped', 'dropped']);
    var vs = G.vertices;
    if (kind === 'sub' || kind === 'dropped') {
      var A = shuffle(rng, vs).slice(0, rint(rng, 3, 5));
      H = GR.inducedSubgraph(G, A);
      if (kind === 'dropped') { if (!H.edges.length) { kind = 'sub'; } else { H = GR.removeEdges(H, [H.edges[rint(rng, 0, H.edges.length - 1)].id]); } }
    } else if (kind === 'partial') {
      var ids = shuffle(rng, G.edges.map(function (e) { return e.id; })).slice(0, rint(rng, 1, 3)); H = GR.removeEdges(G, ids);
    }
    var sub = GR.isSubgraphOf(H, G), part = GR.isPartialGraphOf(H, G), ans = (sub && part) ? 2 : sub ? 0 : part ? 1 : 3;
    var A2 = H.vertices, ind = GR.inducedSubgraph(G, A2);
    var why = 'V(H) = ' + U.set(H.vertices) + ' (' + (H.vertices.length === vs.length ? 'tous les sommets de G' : 'une partie des sommets de G') + '). ' +
      (sub ? 'H contient toutes les arêtes de G ayant leurs deux extrémités dans V(H) : c’est un sous-graphe (au sens du cours). ' : 'Entre les sommets de V(H), G possède ' + ind.edges.length + ' arête(s) et H en a ' + H.edges.length + ' : H n’est pas un sous-graphe au sens du cours (il faut TOUTES les arêtes entre ces sommets). ') +
      (part ? 'Il garde tous les sommets de G et seulement des arêtes de G : c’est un graphe partiel.' : 'Il ne garde pas tous les sommets de G (ou ajoute des arêtes) : ce n’est pas un graphe partiel.');
    return qb.choice('', lv, 'H est obtenu à partir de G. Quelle est la bonne qualification de H ?', ['Un sous-graphe de G (au sens du cours)', 'Un graphe partiel de G', 'À la fois un sous-graphe et un graphe partiel de G', 'Ni l’un ni l’autre'], ans, why,
      { graph: G, graph2: H, caption: 'À gauche G, à droite H.', hints: ['Graphe partiel : on garde tous les sommets, on enlève des arêtes.', 'Sous-graphe : on garde certains sommets ET toutes les arêtes de G entre eux.'], tag: 'partiel-vs-sousgraphe' });
  });

  /* ===== n13 : Euler ===== */
  function eulerGraph(rng, target, tries) {
    for (var t = 0; t < (tries || 600); t++) {
      var n = rint(rng, 5, 7), G = laid(X.randConnected(rng, n, rint(rng, n, n + 4)));
      var e = GR.euler(G);
      if (e.kind === target) return G;
    }
    return null;
  }
  add('euler', 'n13', [1, 2, 3], 'euler-conditions', function (rng, lv) {
    var opts = ['Le graphe admet un cycle eulérien (parcours fermé)', 'Le graphe admet une chaîne eulérienne non fermée (extrémités distinctes), mais pas de cycle eulérien', 'Le graphe n’admet ni cycle eulérien ni chaîne eulérienne'];
    var G, target = pick(rng, ['cycle', 'chain', 'none']);
    if (lv === 3 && rng() < 0.6) {
      /* degrés tous pairs mais graphe non connexe : un triangle et un 4-cycle disjoints */
      G = laid(GR.make({ vertices: X.labels(7), edges: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['D', 'E'], ['E', 'F'], ['F', 'G'], ['G', 'D']] }));
      return qb.choice('', 3, 'Tous les sommets de ce graphe ont un degré pair. Admet-il un cycle eulérien ?', opts, 2,
        'Tous les degrés sont pairs, mais le graphe n’est <b>pas connexe</b> (deux triangles/cycles séparés) : le théorème du cours exige « G connexe ». Un cycle étant d’un seul tenant, il ne peut pas parcourir les arêtes des deux composantes : ni cycle ni chaîne eulérienne.',
        { graph: G, hints: ['Relisez les hypothèses du théorème d’Euler (diapo 24).', 'Un seul trait peut-il relier les deux morceaux ?'], tag: 'euler-connexite' });
    }
    G = eulerGraph(rng, target) || eulerGraph(rng, 'none');
    var e = GR.euler(G), idx = e.kind === 'cycle' ? 0 : e.kind === 'chain' ? 1 : 2;
    if (lv === 2) {
      var odd = e.odd, ds = G.vertices.map(function (v) { return v + ':' + GR.degree(G, v); }).join(', ');
      return qb.set('', 2, 'Quels sont les sommets de ' + B('degré impair') + ' de ce graphe ? (« aucun » s’il n’y en a pas)', odd,
        'Degrés : ' + ds + '. Les sommets de degré impair sont ' + U.set(odd) + ' (leur nombre est pair, comme le prévoit le corollaire de la diapo 14).',
        { graph: G, hints: ['Calculez le degré de chaque sommet.'], tag: 'euler-conditions' });
    }
    var ds2 = G.vertices.map(function (v) { return v + ':' + GR.degree(G, v); }).join(', ');
    var why = 'Graphe connexe. Degrés : ' + ds2 + ' ; sommets de degré impair : ' + U.set(e.odd) + '. ' +
      (idx === 0 ? 'Aucun sommet de degré impair : cycle eulérien. Exemple : ' + e.walk.join(' – ') + '.' : idx === 1 ? 'Exactement deux sommets de degré impair : chaîne eulérienne d’extrémités ' + e.odd.join(' et ') + ' (pas de cycle). Exemple : ' + e.walk.join(' – ') + '.' : 'Il y a ' + e.odd.length + ' sommets de degré impair (ni 0 ni 2) : ni cycle ni chaîne eulérienne.');
    return qb.choice('', lv, 'Ce graphe est connexe. Que peut-on dire de ses parcours eulériens ?', opts, idx, why,
      { graph: G, hints: ['Comptez les sommets de degré impair.', '0 sommet impair → cycle ; exactement 2 → chaîne ; sinon rien (graphe connexe).'], tag: 'euler-conditions' });
  });

  /* ===== n14 : Hamilton ===== */
  add('hamilton', 'n14', [1, 2, 3], 'hamilton-conditions', function (rng, lv) {
    if (lv === 1) {
      var n = rint(rng, 5, 6), order = shuffle(rng, X.labels(n)), edges = order.map(function (v, i) { return [v, order[(i + 1) % n]]; });
      var extra = shuffle(rng, X.allPairs(order).filter(function (p) { return !edges.some(function (e) { return GR.pairKey(e[0], e[1]) === GR.pairKey(p[0], p[1]); }); })).slice(0, rint(rng, 1, 3));
      var G = laid(GR.make({ vertices: X.labels(n), edges: edges.concat(extra) }));
      return qb.walk('', 1, 'Donnez un ' + B('cycle hamiltonien') + ' de ce graphe (liste de sommets séparés par des tirets ; répète le sommet de départ à la fin).',
        function (g, seq) {
          if (seq.length === g.vertices.length && GR.classifyWalk(g, seq.concat([seq[0]])).valid) seq = seq.concat([seq[0]]);
          var cw = GR.classifyWalk(g, seq);
          if (!cw.valid) return { ok: false, msg: cw.reason };
          if (!cw.elementaryCycle) return { ok: false, msg: 'Ce n’est pas un cycle élémentaire (fermé, sans répétition de sommet ni d’arête).' };
          var all = g.vertices.every(function (v) { return seq.indexOf(v) >= 0; });
          return all ? { ok: true } : { ok: false, msg: 'Il manque des sommets : un cycle hamiltonien passe par TOUS les sommets.' };
        },
        'Un cycle hamiltonien passe une et une seule fois par chaque sommet. Par construction ce graphe contient le cycle ' + order.concat([order[0]]).join(' – ') + ' ; il peut y en avoir d’autres.',
        { graph: G, sample: order.concat([order[0]]).join('-'), hints: ['Cherchez un « grand tour » qui visite chaque sommet une seule fois et revient au départ.', 'Les arêtes en plus du tour ne servent pas forcément.'], tag: 'hamilton-conditions' });
    }
    if (lv === 2) {
      var G2, c, tries = 0, want = pick(rng, [0, 1, 2]);
      do {
        var n2 = rint(rng, 5, 6); G2 = laid(X.randConnected(rng, n2, rint(rng, n2 - 1, n2 + 4))); c = GR.hamiltonConditions(G2); tries++;
        var idx = c.ore ? 0 : (c.degreeOne.length ? 2 : 1);
        if (idx === want) break;
      } while (tries < 300);
      c = GR.hamiltonConditions(G2);
      var ans = c.ore ? 0 : (c.degreeOne.length ? 2 : 1), h = GR.hamilton(G2), n3 = GR.n(G2);
      var why = 'Ordre n = ' + n3 + '. ' + (c.ore ? 'Pour toute paire de sommets non adjacents, d(u) + d(v) ≥ n = ' + n3 + ' : le théorème de la diapo 27 s’applique, G est hamiltonien.' :
        'La condition d(u) + d(v) ≥ n échoue (par exemple pour ' + c.oreFail.join(' et ') + '). ' + (c.degreeOne.length ? 'Mais ' + c.degreeOne.join(', ') + ' est de degré 1, ce qui empêche un cycle hamiltonien : G n’est pas hamiltonien.' : 'Le théorème est une condition SUFFISANTE : son échec ne permet pas de conclure. (Vérification exhaustive : G ' + (h.cycle ? 'est en fait hamiltonien, cycle ' + h.cycle.join(' – ') : 'n’est pas hamiltonien') + '.)'));
      return qb.choice('', 2, 'Que peut-on conclure du théorème « si d(u) + d(v) ≥ n pour toute paire de sommets non adjacents, alors G est hamiltonien » (diapo 27) et de la remarque sur les sommets de degré 1 ?',
        ['G est hamiltonien', 'On ne peut pas conclure avec ces seuls résultats', 'G n’est pas hamiltonien'], ans, why,
        { graph: G2, hints: ['Calculez les degrés, puis teste d(u) + d(v) ≥ n sur chaque paire non adjacente.', 'Le théorème donne une condition suffisante, pas nécessaire.'], tag: 'ore-suffisant' });
    }
    var G3, hamil = rng() < 0.5;
    if (hamil) {
      var n4 = 6, ord = shuffle(rng, X.labels(n4)), ed = ord.map(function (v, i) { return [v, ord[(i + 1) % n4]]; }).concat(shuffle(rng, X.allPairs(ord)).slice(0, 2));
      G3 = laid(GR.make({ vertices: X.labels(n4), edges: ed })); G3.edges = G3.edges.filter(function (e, i, a) { return a.findIndex(function (f) { return GR.pairKey(f.u, f.v) === GR.pairKey(e.u, e.v) && f.u !== f.v; }) === i && e.u !== e.v; });
    } else {
      var base = X.randConnected(rng, 5, rint(rng, 6, 8)), leaf = 'F';
      G3 = laid(GR.make({ vertices: X.labels(6), edges: base.edges.map(function (e) { return [e.u, e.v]; }).concat([[pick(rng, X.labels(5)), leaf]]) }));
    }
    var hh = GR.hamilton(G3), isH = !!hh.cycle;
    var jo = ['Un sommet de degré 1 empêche un cycle hamiltonien.', 'Le graphe n’est pas complet, donc il n’est pas hamiltonien.', 'Il existe un cycle passant une fois par chaque sommet : ' + (isH ? hh.cycle.join(' – ') : '…'), 'Le graphe a moins d’arêtes que de sommets.'];
    return qb.tf('', 3, 'Ce graphe est-il ' + B('hamiltonien') + ' ?', isH, jo, isH ? 2 : 0,
      isH ? 'Le cycle ' + hh.cycle.join(' – ') + ' passe une seule fois par chaque sommet. (Un graphe hamiltonien n’a pas besoin d’être complet.)' : 'Les degrés valent ' + G3.vertices.map(function (v) { return v + ':' + GR.degree(G3, v); }).join(', ') + '. Le sommet de degré 1 ne peut pas appartenir à un cycle (il faudrait entrer et sortir par deux arêtes distinctes) : G n’est pas hamiltonien.',
      { graph: G3, hints: ['Regardez d’abord les degrés des sommets.'], tag: 'hamilton-conditions' });
  });

  /* ===== n15 : matrice d'adjacence ===== */
  add('matrix', 'n15', [1, 2, 3], 'matrice-lecture', function (rng, lv) {
    var G;
    if (lv === 1) { G = X.randSimple(rng, rint(rng, 4, 5), rint(rng, 4, 6)); return qb.matrix('', 1, 'Complétez la <b>matrice d’adjacence</b> de ce graphe (clique sur une case pour la faire passer de 0 à 1). Les sommets sont rangés dans l’ordre alphabétique.', G,
      'M[i][j] = 1 si une arête relie i et j, 0 sinon. La matrice d’un graphe non orienté est symétrique, avec des 0 sur la diagonale (pas de boucle), et la somme d’une ligne est le degré du sommet.', { hints: ['Pour chaque arête {u, v}, mets 1 en (u, v) ET en (v, u).'], tag: 'matrice-symetrie' }); }
    if (lv === 2) { G = X.randDigraph(rng, 4, rint(rng, 5, 7), rint(rng, 0, 1)); return qb.matrix('', 2, 'Complétez la <b>matrice d’adjacence</b> de ce graphe orienté (ligne = origine, colonne = destination).', G,
      'Pour un arc (u, v), on met 1 en ligne u, colonne v seulement : la matrice n’est pas forcément symétrique. Une boucle (u, u) met 1 sur la diagonale.', { hints: ['Un arc (u, v) ne donne qu’UN seul 1 : ligne u, colonne v.'], tag: 'matrice-orientee' }); }
    G = X.randSimple(rng, 5, rint(rng, 5, 7)); var v = pick(rng, G.vertices), ix = GR.vIndex(G)[v];
    var asDeg = rng() < 0.5;
    return qb.num('', 3, 'Voici la matrice d’adjacence d’un graphe simple non orienté.<div class="mx">' + RD.matrixHTML(G) + '</div>' + (asDeg ? 'Quel est le degré de ' + B(v) + ' ?' : 'Combien ce graphe a-t-il d’arêtes ?'), asDeg ? GR.degree(G, v) : GR.m(G),
      asDeg ? 'La somme de la ligne ' + v + ' (' + GR.adjMatrix(G)[ix].join(' + ') + ') vaut ' + GR.degree(G, v) + ' : c’est le degré de ' + v + ' (graphe simple, sans boucle).' : 'La somme de tous les 1 vaut 2|E| = ' + (2 * GR.m(G)) + ' (chaque arête apparaît deux fois, par symétrie), donc |E| = ' + GR.m(G) + '.',
      { hints: [asDeg ? 'Additionnez les valeurs de la ligne de ' + v + '.' : 'Chaque arête apparaît à deux endroits de la matrice.'], tag: 'matrice-lecture' });
  });

  /* ===== n16 : matrice de poids ===== */
  add('wmatrix', 'n16', [1, 2, 3], 'matrice-poids', function (rng, lv) {
    var G, vs;
    if (lv <= 2) {
      var dir = lv === 2, n = 4, prs = dir ? [] : X.allPairs(X.labels(n));
      if (dir) X.labels(n).forEach(function (a) { X.labels(n).forEach(function (b) { if (a !== b) prs.push([a, b]); }); });
      var chosen = shuffle(rng, prs).slice(0, rint(rng, 4, 5)).map(function (p) { return [p[0], p[1], rint(rng, 1, 9)]; });
      G = laid(GR.make({ directed: dir, weighted: true, vertices: X.labels(n), edges: chosen }));
      return qb.wmatrix('', lv, 'Complétez la <b>matrice de poids</b> W de ce graphe' + (dir ? ' orienté' : '') + ' pondéré. Écris ' + B('inf') + ' (ou ∞) quand l’arc n’existe pas, et 0 sur la diagonale (convention pour les calculs de distances).', G,
        'W[i][j] = w(i, j) si l’arc existe, +∞ sinon. Pour les calculs de distances on pose W[i][i] = 0 (en l’absence de boucle négative).' + (dir ? ' Ici le graphe est orienté : W n’est pas forcément symétrique.' : ' Graphe non orienté : W est symétrique.'),
        { hints: ['Reportez le poids de chaque arête dans les cases (u, v)' + (dir ? '' : ' et (v, u)') + '.', 'Les cases sans arête contiennent ∞, pas 0.'], tag: 'matrice-poids' });
    }
    var vs2 = X.labels(4), edges = [['A', 'B', 5], ['B', 'C', 0], ['C', 'D', 2], ['A', 'D', 7]];
    G = laid(GR.make({ weighted: true, vertices: vs2, edges: edges }));
    var Wm = GR.weightMatrix(G, { zeroDiag: true });
    var html = '<div class="mx">' + RD.matrixHTML(G, { weighted: true, plain: true }) + '</div>';
    var jo = ['W[B][C] = 0 est un vrai poids : l’arête {B, C} existe (l’absence s’écrit +∞).', 'W[B][C] = 0 signifie qu’il n’y a pas d’arête entre B et C.', 'On ne peut pas savoir : 0 est ambigu.', 'B et C ne sont adjacents que si W[B][C] = 1.'];
    return qb.tf('', 3, 'Dans la matrice de poids ci-dessous, ' + B('B et C sont-ils adjacents') + ' ?' + html, true, jo, 0,
      'Dans une matrice de poids, l’absence d’arête se code par +∞, pas par 0. Un poids nul peut être une vraie arête (ici w(B, C) = 0) : il ne signifie pas « absence ». (Diapo 30.)',
      { hints: ['Comment la matrice de poids code-t-elle l’absence d’arête ?'], tag: 'poids-nul' });
  });

  /* ===== n17 : listes d'adjacence ===== */
  add('lists', 'n17', [1, 2, 3], 'listes-lecture', function (rng, lv) {
    var G;
    if (lv === 1) { G = X.randSimple(rng, 5, rint(rng, 5, 7)); return qb.lists('', 1, 'Écrivez les ' + B('listes d’adjacence') + ' de ce graphe : pour chaque sommet, la liste des sommets auxquels il est adjacent (séparés par des virgules ; laisse vide si la liste est vide).', G,
      'La liste d’un sommet contient ses voisins. Dans un graphe non orienté, v apparaît dans la liste de u si et seulement si u apparaît dans celle de v (chaque arête est écrite deux fois).', { hints: ['La liste de v, c’est N(v).'], tag: 'listes-lecture' }); }
    if (lv === 2) { G = X.randDigraph(rng, 4, rint(rng, 5, 7), rint(rng, 0, 1)); return qb.lists('', 2, 'Écrivez les ' + B('listes d’adjacence') + ' de ce graphe orienté : pour chaque sommet s, la liste des sommets v tels que (s, v) est un arc.', G,
      'Dans un graphe orienté, la liste de s contient les successeurs de s (les extrémités des arcs qui PARTENT de s). Une boucle (s, s) place s dans sa propre liste.', { hints: ['On ne suit que le sens des flèches, depuis s.'], tag: 'listes-orientees' }); }
    G = X.randSimple(rng, rint(rng, 5, 6), rint(rng, 5, 8)); var dir = false;
    return qb.num('', 3, 'Les listes d’adjacence de ce graphe non orienté contiennent, au total, combien de sommets écrits (en comptant tous les éléments de toutes les listes) ?', 2 * GR.m(G),
      'Chaque arête {u, v} apparaît deux fois : v dans la liste de u, et u dans celle de v. Total = 2|E| = ' + (2 * GR.m(G)) + ' (pour un graphe orienté, ce serait |A|). C’est ce qui donne la mémoire Θ(n + m).',
      { graph: G, hints: ['Combien de fois chaque arête est-elle écrite ?'], tag: 'listes-lecture' });
  });

  /* ===== n18 : coûts des représentations ===== */
  add('cost', 'n18', [1, 2, 3], 'cout-representation', function (rng, lv) {
    if (lv === 1) {
      var sc = pick(rng, [0, 1, 2, 3]), n, m, txt, ans, why;
      var A = ['Matrice d’adjacence', 'Listes d’adjacence'];
      if (sc === 0) { n = rint(rng, 5, 20) * 1000; m = rint(rng, 2, 4) * n; txt = 'Un graphe creux a ' + B(n + ' sommets') + ' et ' + B(m + ' arêtes') + '. On veut minimiser la mémoire.'; ans = 1; why = 'Matrice : Θ(n²) = ' + (n * n).toLocaleString('fr-FR') + ' cases. Listes : Θ(n + m) ≈ ' + (n + m).toLocaleString('fr-FR') + '. Pour un graphe creux, les listes sont bien plus économes.'; }
      else if (sc === 1) { n = rint(rng, 100, 300); m = Math.floor(n * (n - 1) / 2 * 0.95); txt = 'Un graphe presque complet a ' + B(n + ' sommets') + ' et ' + B(m + ' arêtes') + '. L’algorithme teste très souvent « l’arête (u, v) existe-t-elle ? ». On veut un test le plus rapide possible.'; ans = 0; why = 'Dans une matrice, tester (u, v) est en O(1) (lire une case). Dans les listes, il faut parcourir la liste de u (O(d⁺(u))), ici de l’ordre de n. La mémoire est de toute façon Θ(n²) pour un graphe dense.'; }
      else if (sc === 2) { n = rint(rng, 3, 9) * 1000; m = 2 * n; txt = 'Un graphe creux a ' + B(n + ' sommets') + ' et ' + B(m + ' arêtes') + '. L’algorithme énumère très souvent tous les voisins d’un sommet u. On veut une énumération en Θ(d⁺(u)) plutôt qu’en Θ(n).'; ans = 1; why = 'Énumérer les voisins : Θ(n) avec la matrice (on parcourt toute la ligne), Θ(d⁺(u)) avec les listes. Pour un graphe creux d⁺(u) ≪ n.'; }
      else { n = rint(rng, 40, 80); m = Math.floor(n * (n - 1) / 2) - rint(rng, 1, 10); txt = 'Un graphe presque complet a ' + B(n + ' sommets') + ' et ' + B(m + ' arêtes') + '. On veut tester l’existence d’une arête en temps constant.'; ans = 0; why = 'Test d’arête : O(1) avec la matrice. Avec les listes : O(d⁺(u)), proche de n ici.'; }
      return qb.choice('', 1, txt + ' Quelle représentation choisir ?', A, ans, why, { hints: ['Comparez Θ(n²) et Θ(n + m).', 'Rappel (diapo 32) : les listes conviennent aux graphes creux.'], tag: 'cout-representation' });
    }
    if (lv === 2) {
      var n2 = rint(rng, 50, 900), m2 = rint(rng, n2, 3 * n2), mat = rng() < 0.5;
      return qb.num('', 2, 'Pour un graphe orienté d’ordre ' + B(n2) + ' et de taille ' + B(m2) + ', combien d’' + (mat ? B('entrées') + ' contient la matrice d’adjacence ?' : B('éléments') + ' contiennent au total les listes d’adjacence (on ne compte que les sommets écrits dans les listes) ?'), mat ? n2 * n2 : m2,
        mat ? 'La matrice est n × n : ' + n2 + '² = ' + (n2 * n2) + ' entrées, soit Θ(n²).' : 'Chaque arc (u, v) place v dans la liste de u : au total |A| = m = ' + m2 + ' éléments (plus les n listes elles-mêmes, d’où Θ(n + m)).',
        { hints: [mat ? 'Une matrice carrée de taille n.' : 'Un élément par arc.'], tag: 'cout-representation' });
    }
    var n3 = rint(rng, 500, 5000), d = rint(rng, 3, 15);
    return qb.num('', 3, 'Dans un graphe orienté d’ordre ' + B(n3) + ', le sommet u a un demi-degré sortant ' + B('d⁺(u) = ' + d) + '. Pour énumérer ses voisins avec les ' + B('listes d’adjacence') + ', combien d’éléments faut-il parcourir ?', d,
      'Les listes donnent l’énumération en Θ(d⁺(u)) : on parcourt exactement les ' + d + ' successeurs. Avec la matrice, il faudrait parcourir les ' + n3 + ' cases de la ligne de u.',
      { hints: ['Θ(d⁺(u)) pour les listes.'], tag: 'cout-representation' });
  });

  /* ===== n19 : synthèse sur un graphe orienté ===== */
  add('synth', 'n19', [2, 3], 'synthese-orientee', function (rng, lv) {
    var G = X.randDigraph(rng, 4, rint(rng, 5, 7), 1);
    var eq = G.vertices.filter(function (v) { return GR.outDeg(G, v) === GR.inDeg(G, v); });
    var degs = G.vertices.map(function (v) { return v + ' : d⁺ = ' + GR.outDeg(G, v) + ', d⁻ = ' + GR.inDeg(G, v); }).join(' ; ');
    var parts = [
      qb.matrix('', 2, 'Donnez la <b>matrice d’adjacence</b> de G.', G, '', { tag: 'matrice-orientee' }),
      qb.lists('', 2, 'Donnez la <b>liste d’adjacence</b> de G.', G, '', { tag: 'listes-orientees' }),
      qb.set('', 3, 'Quels sommets v vérifient ' + B('d⁺(v) = d⁻(v)') + ' ? (« aucun » s’il n’y en a pas)', eq, 'Demi-degrés : ' + degs + '.', { tag: 'demi-degres' })
    ];
    return qb.composite('', lv, 'Soit G le graphe orienté ci-dessous (les boucles comptent 1 dans d⁺ et 1 dans d⁻). Réponds aux trois questions puis clique sur « Vérifier ».', parts,
      'Demi-degrés : ' + degs + '. Vérification : Σ d⁺ = Σ d⁻ = |A| = ' + GR.m(G) + '.', { graph: G, hints: ['Faites d’abord la liste des arcs, puis déduis-en la matrice, les listes et les degrés.'], tag: 'synthese-orientee' });
  });
})(typeof self !== 'undefined' ? self : (typeof global !== 'undefined' ? global : this));

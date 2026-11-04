/* Vérification du moteur de graphes contre des références « force brute » indépendantes. */
const GF = require('./load.js');
const GR = GF.graph, X = GF.ex;
let fail = 0, checks = 0;
function eq(a, b, msg) { checks++; if (JSON.stringify(a) !== JSON.stringify(b)) { fail++; if (fail < 25) console.log('ÉCHEC', msg, '\n  moteur  :', JSON.stringify(a), '\n  attendu :', JSON.stringify(b)); } }
const rng = X.mulberry32(12345);
const L = 'ABCDEFGH'.split('');
function randG(n, p, o) {
  o = o || {};
  const vs = L.slice(0, n), es = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (rng() < p) es.push([vs[i], vs[j]]);
  if (o.loops) for (let i = 0; i < n; i++) if (rng() < 0.15) es.push([vs[i], vs[i]]);
  if (o.multi && es.length) es.push(es[Math.floor(rng() * es.length)].slice());
  return GR.make({ vertices: vs, edges: es });
}
function randD(n, p) {
  const vs = L.slice(0, n), es = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j && rng() < p) es.push([vs[i], vs[j]]);
  return GR.make({ directed: true, vertices: vs, edges: es });
}
function fw(G) {
  const vs = G.vertices, ix = GR.vIndex(G), n = vs.length, D = [];
  for (let i = 0; i < n; i++) { D.push(new Array(n).fill(Infinity)); D[i][i] = 0; }
  G.edges.forEach((e) => { const a = ix[e.u], b = ix[e.v]; if (a !== b) { D[a][b] = Math.min(D[a][b], 1); if (!G.directed) D[b][a] = Math.min(D[b][a], 1); } });
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (D[i][k] + D[k][j] < D[i][j]) D[i][j] = D[i][k] + D[k][j];
  return D;
}
function permutations(arr) { if (arr.length <= 1) return [arr]; const out = []; arr.forEach((x, i) => permutations(arr.slice(0, i).concat(arr.slice(i + 1))).forEach((p) => out.push([x].concat(p)))); return out; }

/* 1. degrés, somme des degrés, matrice, listes, distances, composantes */
for (let t = 0; t < 400; t++) {
  const n = 1 + Math.floor(rng() * 7), G = randG(n, rng() * 0.8, { loops: rng() < 0.3, multi: rng() < 0.3 });
  eq(GR.sumDegrees(G), 2 * GR.m(G), 'somme des degrés = 2m');
  eq(GR.oddVertices(G).length % 2, 0, 'nombre pair de sommets impairs');
  const M = GR.adjMatrix(G); let sm = 0; M.forEach((r) => r.forEach((x) => { sm += x; }));
  eq(sm, 2 * G.edges.filter((e) => e.u !== e.v).length + G.edges.filter((e) => e.u === e.v).length, 'somme de la matrice');
  const D = fw(G), ix = GR.vIndex(G);
  G.vertices.forEach((u) => G.vertices.forEach((v) => eq(GR.distance(G, u, v), D[ix[u]][ix[v]], 'distance ' + u + v)));
  /* composantes : union-find de référence */
  const par = {}; G.vertices.forEach((v) => { par[v] = v; });
  const find = (x) => (par[x] === x ? x : (par[x] = find(par[x])));
  G.edges.forEach((e) => { par[find(e.u)] = find(e.v); });
  const ref = {}; G.vertices.forEach((v) => { (ref[find(v)] = ref[find(v)] || []).push(v); });
  const refC = Object.values(ref).map((c) => c.slice().sort()).sort((a, b) => a[0].localeCompare(b[0]));
  const myC = GR.components(G).map((c) => c.slice().sort()).sort((a, b) => a[0].localeCompare(b[0]));
  eq(myC, refC, 'composantes connexes');
  if (!G.edges.some((e) => e.u === e.v) && GR.isSimple(G) && n >= 2) eq(GR.density(G), 2 * GR.m(G) / (n * (n - 1)), 'densité');
}

/* 2. Euler : force brute sur toutes les suites d'arêtes */
function eulerBrute(G) {
  const edges = G.edges.map((e) => [e.u, e.v]), m = edges.length;
  if (!m) return 'trivial';
  let circuit = false, open = false;
  const starts = G.vertices.filter((v) => GR.degree(G, v) > 0);
  starts.forEach((s) => {
    const used = new Array(m).fill(false);
    (function dfs(cur, cnt) {
      if (cnt === m) { if (cur === s) circuit = true; else open = true; return; }
      for (let i = 0; i < m; i++) {
        if (used[i]) continue;
        let to = null;
        if (edges[i][0] === cur) to = edges[i][1]; else if (edges[i][1] === cur) to = edges[i][0];
        if (to === null) continue;
        used[i] = true; dfs(to, cnt + 1); used[i] = false;
      }
    })(s, 0);
  });
  return circuit ? 'cycle' : open ? 'chain' : 'none';
}
for (let t = 0; t < 300; t++) {
  const n = 2 + Math.floor(rng() * 5), G = randG(n, 0.2 + rng() * 0.5, { loops: rng() < 0.2, multi: rng() < 0.2 });
  if (G.edges.length > 9) continue;
  const e = GR.euler(G), ref = eulerBrute(G);
  eq(e.kind, ref, 'Euler ' + GR.describeEdges(G));
  if (e.walk) eq(GR.isEulerTrail(G, e.walk), true, 'parcours eulérien produit valide ' + GR.describeEdges(G));
}

/* 3. Hamilton : permutations */
function hamBrute(G) {
  const vs = G.vertices, n = vs.length;
  let path = false, cycle = false;
  if (n === 0) return { path, cycle };
  permutations(vs).forEach((p) => {
    let ok = true;
    for (let i = 0; i + 1 < n && ok; i++) if (!GR.adjacent(G, p[i], p[i + 1])) ok = false;
    if (ok) { path = true; if (n >= (G.directed ? 2 : 3) && GR.adjacent(G, p[n - 1], p[0])) cycle = true; }
  });
  return { path, cycle };
}
for (let t = 0; t < 250; t++) {
  const n = 3 + Math.floor(rng() * 4), G = rng() < 0.75 ? randG(n, 0.25 + rng() * 0.6) : randD(n, 0.3 + rng() * 0.4);
  const h = GR.hamilton(G), ref = hamBrute(G);
  eq({ path: !!h.path, cycle: !!h.cycle }, ref, 'Hamilton ' + GR.describeEdges(G));
  if (h.cycle) eq(GR.classifyWalk(G, h.cycle).elementaryCycle && h.cycle.length === n + 1, true, 'cycle hamiltonien valide');
  if (h.path) eq(h.path.length === n && GR.uniq(h.path).length === n && GR.classifyWalk(G, h.path).valid, true, 'chaîne hamiltonienne valide');
}

/* 4. Conditions suffisantes du cours (diapo 27) : jamais de faux positif */
for (let t = 0; t < 300; t++) {
  const n = 3 + Math.floor(rng() * 4), G = randG(n, 0.3 + rng() * 0.7), c = GR.hamiltonConditions(G);
  if (c.ore) eq(!!GR.hamilton(G).cycle, true, 'théorème diapo 27 : d(u)+d(v) ≥ n ⇒ hamiltonien');
  if (c.dirac) { eq(!!GR.hamilton(G).cycle, true, 'corollaire diapo 27 : d(u) ≥ n/2 ⇒ hamiltonien'); eq(c.ore, true, 'corollaire ⇒ théorème'); }
  if (c.degreeOne.length) eq(!!GR.hamilton(G).cycle, false, 'sommet de degré 1 ⇒ pas de cycle hamiltonien (diapo 26)');
}

/* 5. Cliques maximales : sous-ensembles */
for (let t = 0; t < 200; t++) {
  const n = 2 + Math.floor(rng() * 5), G = randG(n, 0.3 + rng() * 0.6), vs = G.vertices;
  const cliques = []; for (let mask = 1; mask < (1 << n); mask++) { const S = vs.filter((_, i) => mask & (1 << i)); if (GR.isClique(G, S)) cliques.push(mask); }
  const maximal = cliques.filter((m) => !cliques.some((o) => o !== m && (o & m) === m)).map((m) => vs.filter((_, i) => m & (1 << i)).join('')).sort();
  eq(GR.maximalCliques(G).map((c) => c.join('')).sort(), maximal, 'cliques maximales ' + GR.describeEdges(G));
}

/* 6. Havel–Hakimi contre l'énumération de tous les graphes simples à 5 sommets */
{
  const n = 5, pairs = X.allPairs([0, 1, 2, 3, 4]), graphic = {};
  for (let mask = 0; mask < (1 << pairs.length); mask++) {
    const d = [0, 0, 0, 0, 0]; pairs.forEach((p, i) => { if (mask & (1 << i)) { d[p[0]]++; d[p[1]]++; } });
    graphic[d.slice().sort((a, b) => b - a).join(',')] = true;
  }
  for (let a = 0; a < 5; a++) for (let b = 0; b <= a; b++) for (let c = 0; c <= b; c++) for (let d = 0; d <= c; d++) for (let e = 0; e <= d; e++) {
    const seq = [a, b, c, d, e], r = GR.havelHakimi(seq);
    eq(!!r, !!graphic[seq.join(',')], 'Havel–Hakimi ' + seq);
    if (r) { const dd = [0, 0, 0, 0, 0]; r.forEach((p) => { dd[p[0]]++; dd[p[1]]++; }); eq(dd.slice().sort((x, y) => y - x), seq, 'Havel–Hakimi réalise la suite ' + seq); }
  }
}

/* 7. Graphes orientés : composantes fortement connexes, demi-degrés */
for (let t = 0; t < 200; t++) {
  const n = 2 + Math.floor(rng() * 5), G = randD(n, 0.25 + rng() * 0.4), D = fw(G), ix = GR.vIndex(G);
  const comps = GR.scc(G);
  G.vertices.forEach((u) => G.vertices.forEach((v) => {
    const same = comps.some((c) => c.indexOf(u) >= 0 && c.indexOf(v) >= 0);
    eq(same, D[ix[u]][ix[v]] < Infinity && D[ix[v]][ix[u]] < Infinity, 'CFC ' + u + v);
  }));
  eq(G.vertices.reduce((s, v) => s + GR.outDeg(G, v), 0), GR.m(G), 'Σ d⁺ = |A|');
  eq(G.vertices.reduce((s, v) => s + GR.inDeg(G, v), 0), GR.m(G), 'Σ d⁻ = |A|');
  G.vertices.forEach((v) => eq(GR.degree(G, v), GR.outDeg(G, v) + GR.inDeg(G, v), 'd = d⁺ + d⁻'));
}

/* 8. classifyWalk contre une définition de référence (diapo 18) */
for (let t = 0; t < 600; t++) {
  const dir = rng() < 0.4, n = 3 + Math.floor(rng() * 4), G = dir ? randD(n, 0.5) : randG(n, 0.55);
  const len = 1 + Math.floor(rng() * 6), seq = [G.vertices[Math.floor(rng() * n)]];
  for (let i = 0; i < len; i++) { const nb = GR.succ(G, seq[i]); seq.push(nb.length && rng() < 0.9 ? nb[Math.floor(rng() * nb.length)] : G.vertices[Math.floor(rng() * n)]); }
  const cw = GR.classifyWalk(G, seq);
  let valid = true; for (let i = 0; i + 1 < seq.length; i++) if (!GR.adjacent(G, seq[i], seq[i + 1])) valid = false;
  eq(cw.valid, valid, 'trajet valide');
  if (!valid) continue;
  const keys = seq.slice(0, -1).map((v, i) => (dir ? v + '>' + seq[i + 1] : GR.pairKey(v, seq[i + 1])));
  const simple = GR.uniq(keys).length === keys.length, closed = seq[0] === seq[seq.length - 1];
  eq(cw.simple, simple, 'simple ' + seq.join('-'));
  eq(cw.closed, closed, 'fermé');
  eq(cw.cycle, closed && simple && seq.length > 1, 'cycle/circuit (fermé, non vide, sans arête répétée) ' + seq.join('-'));
  const inner = closed ? seq.slice(0, -1) : seq;
  eq(cw.elementaryCycle, closed && simple && seq.length > 1 && GR.uniq(inner).length === inner.length, 'cycle élémentaire ' + seq.join('-'));
}

/* 9. sous-graphes (diapo 22) et valeurs du cours */
{
  const S = GF.graphs;
  eq(GR.isPartialGraphOf(S.get('s22p'), S.get('s22')), true, 'diapo 22 : graphe partiel');
  eq(GR.isSubgraphOf(S.get('s22s'), S.get('s22')), true, 'diapo 22 : sous-graphe');
  eq(GR.isSubgraphOf(S.get('s22p'), S.get('s22')), false, 'diapo 22 : le graphe partiel n’est pas un sous-graphe');
  eq(GR.isPartialGraphOf(S.get('s22'), S.get('s22')), true, 'G est (trivialement) un graphe partiel de lui-même — convention : le cours exige « une ou plusieurs » arêtes retirées');
  const g10 = S.get('s10');
  eq(g10.vertices.map((v) => GR.degree(g10, v)), [2, 3, 3, 2, 3, 1], 'diapo 13 : degrés A..F');
  eq([GR.sumDegrees(g10), GR.m(g10)], [14, 7], 'diapo 13 : Σ d = 14, |E| = 7');
  eq(GR.neighbors(g10, 'C'), ['A', 'B', 'E'], 'diapo 12 : N(C) = {A, B, E}');
  eq(GR.distance(g10, 'A', 'F'), 3, 'diapo 19 : A–C–E–F de longueur 3');
  const g16 = S.get('s16'); eq([GR.regularity(g16).regular, GR.maxDegree(g16)], [false, 4], 'diapo 16 : pas régulier, degré du graphe = 4');
  eq(GR.havelHakimi([3, 3, 2, 1, 0]), null, 'diapo 14 : les degrés 3,3,2,1,0 ne décrivent pas un graphe simple');
  const g33 = S.get('s33');
  eq(g33.vertices.map((v) => [GR.outDeg(g33, v), GR.inDeg(g33, v)]), [[0, 3], [2, 3], [4, 2], [3, 1]], 'diapo 33 : demi-degrés');
  eq(GR.adjMatrix(g33), [[0, 0, 0, 0], [1, 1, 0, 0], [1, 1, 1, 1], [1, 1, 1, 0]], 'diapo 33 : matrice');
  const g31 = S.get('s31'); eq(GR.adjLists(g31)['3'], ['1', '2', '5', '7', '8'], 'diapo 31 : liste de 3');
  ['s28a', 's28b'].forEach((id) => { const g = S.get(id); eq([GR.euler(g).kind, !!GR.hamilton(g).cycle], ['none', true], 'diapo 28 : hamiltonien et non eulérien (' + id + ')'); });
  eq(GR.euler(S.get('s25dual')).kind, 'none', 'diapo 25 : la courbe est impossible (4 sommets de degré impair)');
  eq(GR.euler(S.get('s25dual')).odd.length, 4, 'diapo 25 : quatre sommets impairs');
  eq(GR.euler(S.get('konigsberg')).kind, 'none', 'diapo 5 : Königsberg');
  eq(GR.isComplete(S.get('k5')) && GR.density(S.get('k5')) === 1, true, 'diapo 20 : K5 complet, densité 1');
  const w = S.get('s30'), W = GR.weightMatrix(w, { zeroDiag: true });
  eq([W[0][1], W[1][2], W[2][1], W[5][3], W[0][2]], [0.5, 0.7, 0.7, 0.5, Infinity], 'diapo 30 : matrice calculée à partir du graphe dessiné');
}

console.log(checks + ' vérifications, ' + fail + ' échec(s)');
process.exit(fail ? 1 : 0);

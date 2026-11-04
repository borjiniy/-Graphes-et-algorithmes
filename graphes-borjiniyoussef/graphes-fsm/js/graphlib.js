/* graphlib.js — moteur de graphes (sans dépendance).
 * Fonctionne dans le navigateur (window.GF.graph) et sous Node (require).
 * Conventions alignées sur le cours « Graphes et algorithmes » (H. Haj Mohamed, FSM) :
 *  - un graphe non orienté a des arêtes {u,v} ; un graphe orienté a des arcs (u,v) ;
 *  - une boucle compte double dans le degré d'un sommet (diapo 13) ;
 *  - la longueur d'une chaîne est son nombre d'arêtes (diapo 19).
 * Les fonctions marquées « hors cours » sortent du cadre du PDF fourni.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  else { root.GF = root.GF || {}; root.GF.graph = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var INF = Infinity;

  /* ---------- construction ---------- */
  function make(o) {
    o = o || {};
    var G = {
      directed: !!o.directed,
      weighted: !!o.weighted,
      vertices: (o.vertices || []).map(String),
      edges: [],
      pos: {}
    };
    var seen = {};
    G.vertices.forEach(function (v) { seen[v] = true; });
    var maxId = 0;
    (o.edges || []).forEach(function (e) {
      var id = Array.isArray(e) ? undefined : e.id;
      if (typeof id === 'number' && id > maxId) maxId = id;
    });
    (o.edges || []).forEach(function (e) {
      var x = Array.isArray(e) ? { u: e[0], v: e[1], w: e[2] } : { u: e.u, v: e.v, w: e.w, id: e.id };
      x.u = String(x.u); x.v = String(x.v);
      if (typeof x.id !== 'number') { maxId += 1; x.id = maxId; }
      if (G.weighted && (x.w === undefined || x.w === null)) x.w = 1;
      if (!G.weighted) delete x.w;
      [x.u, x.v].forEach(function (z) { if (!seen[z]) { seen[z] = true; G.vertices.push(z); } });
      G.edges.push(x);
    });
    if (o.pos) Object.keys(o.pos).forEach(function (k) { G.pos[k] = { x: o.pos[k].x, y: o.pos[k].y }; });
    return G;
  }
  function clone(G) {
    return make({ directed: G.directed, weighted: G.weighted, vertices: G.vertices,
      edges: G.edges.map(function (e) { return { u: e.u, v: e.v, w: e.w, id: e.id }; }), pos: G.pos });
  }
  function n(G) { return G.vertices.length; }
  function m(G) { return G.edges.length; }
  function vIndex(G) { var r = {}; G.vertices.forEach(function (v, i) { r[v] = i; }); return r; }
  function isLoop(e) { return e.u === e.v; }
  function pairKey(u, v) { return u < v ? u + '|' + v : v + '|' + u; }
  function edgeKey(G, e) { return G.directed ? e.u + '>' + e.v : pairKey(e.u, e.v); }
  function sortByOrder(G, arr) { var ix = vIndex(G); return arr.slice().sort(function (a, b) { return ix[a] - ix[b]; }); }
  function uniq(arr) { var s = {}, out = []; arr.forEach(function (x) { if (!s[x]) { s[x] = 1; out.push(x); } }); return out; }

  /* ---------- degrés ---------- */
  function degree(G, v) { var d = 0; G.edges.forEach(function (e) { if (e.u === v) d++; if (e.v === v) d++; }); return d; }
  function outDeg(G, v) { var d = 0; G.edges.forEach(function (e) { if (e.u === v) d++; }); return d; }
  function inDeg(G, v) { var d = 0; G.edges.forEach(function (e) { if (e.v === v) d++; }); return d; }
  function degrees(G) { var r = {}; G.vertices.forEach(function (v) { r[v] = degree(G, v); }); return r; }
  function sumDegrees(G) { return G.vertices.reduce(function (s, v) { return s + degree(G, v); }, 0); }
  function maxDegree(G) { return G.vertices.reduce(function (s, v) { return Math.max(s, degree(G, v)); }, 0); }
  function minDegree(G) { return G.vertices.length ? G.vertices.reduce(function (s, v) { return Math.min(s, degree(G, v)); }, INF) : 0; }
  function oddVertices(G) { return G.vertices.filter(function (v) { return degree(G, v) % 2 === 1; }); }
  function isolated(G) { return G.vertices.filter(function (v) { return degree(G, v) === 0; }); }
  function regularity(G) {
    if (!G.vertices.length) return { regular: true, k: 0 };
    var k = degree(G, G.vertices[0]);
    var ok = G.vertices.every(function (v) { return degree(G, v) === k; });
    return { regular: ok, k: ok ? k : null };
  }

  /* ---------- adjacence ---------- */
  function succ(G, v) {
    var r = [];
    G.edges.forEach(function (e) {
      if (e.u === v) r.push(e.v);
      else if (!G.directed && e.v === v) r.push(e.u);
    });
    return sortByOrder(G, uniq(r));
  }
  function pred(G, v) {
    if (!G.directed) return succ(G, v);
    var r = [];
    G.edges.forEach(function (e) { if (e.v === v) r.push(e.u); });
    return sortByOrder(G, uniq(r));
  }
  function neighbors(G, v) { // N(v) : voisins (en orienté : voisins dans le graphe sous-jacent)
    return sortByOrder(G, uniq(succ(G, v).concat(pred(G, v))));
  }
  function adjacent(G, u, v) {
    return G.edges.some(function (e) {
      return (e.u === u && e.v === v) || (!G.directed && e.u === v && e.v === u);
    });
  }
  function buildAdj(G, mode) { // mode 'und' ignore le sens ; sinon respecte le sens
    var A = {};
    G.vertices.forEach(function (v) { A[v] = {}; });
    G.edges.forEach(function (e) {
      A[e.u][e.v] = true;
      if (!G.directed || mode === 'und') A[e.v][e.u] = true;
    });
    return A;
  }
  function adjMatrix(G, opts) {
    opts = opts || {};
    var ix = vIndex(G), N = n(G), M = [], i, j;
    for (i = 0; i < N; i++) { M.push([]); for (j = 0; j < N; j++) M[i].push(0); }
    G.edges.forEach(function (e) {
      M[ix[e.u]][ix[e.v]] += 1;
      if (!G.directed && e.u !== e.v) M[ix[e.v]][ix[e.u]] += 1;
    });
    if (opts.binary) for (i = 0; i < N; i++) for (j = 0; j < N; j++) M[i][j] = M[i][j] ? 1 : 0;
    return M;
  }
  function weightMatrix(G, opts) {
    opts = opts || {};
    var ix = vIndex(G), N = n(G), W = [], i, j;
    for (i = 0; i < N; i++) { W.push([]); for (j = 0; j < N; j++) W[i].push(INF); }
    G.edges.forEach(function (e) {
      var w = (e.w === undefined) ? 1 : e.w;
      var a = ix[e.u], b = ix[e.v];
      W[a][b] = Math.min(W[a][b], w);
      if (!G.directed) W[b][a] = Math.min(W[b][a], w);
    });
    if (opts.zeroDiag) for (i = 0; i < N; i++) W[i][i] = Math.min(0, W[i][i] === INF ? 0 : W[i][i]);
    return W;
  }
  function adjLists(G) {
    var L = {};
    G.vertices.forEach(function (v) { L[v] = []; });
    G.edges.forEach(function (e) {
      L[e.u].push(e.v);
      if (!G.directed && e.u !== e.v) L[e.v].push(e.u);
    });
    var ix = vIndex(G);
    G.vertices.forEach(function (v) { L[v].sort(function (a, b) { return ix[a] - ix[b]; }); });
    return L;
  }

  /* ---------- propriétés globales ---------- */
  function isSimple(G) {
    var seen = {};
    for (var i = 0; i < G.edges.length; i++) {
      var e = G.edges[i];
      if (isLoop(e)) return false;
      var k = edgeKey(G, e);
      if (seen[k]) return false;
      seen[k] = true;
    }
    return true;
  }
  function density(G) { // Diapo 17 : valable pour un graphe simple non orienté, n ≥ 2
    var N = n(G);
    if (G.directed || N < 2 || !isSimple(G)) return null;
    return 2 * m(G) / (N * (N - 1));
  }
  function maxEdgesSimple(N) { return N * (N - 1) / 2; } // déduit de « densité 1 = graphe complet »
  function isComplete(G) {
    if (G.directed || !isSimple(G)) return false;
    return m(G) === maxEdgesSimple(n(G));
  }

  /* ---------- parcours, distances, connexité ---------- */
  function bfs(G, s, mode) {
    var A = buildAdj(G, mode), dist = {}, par = {};
    G.vertices.forEach(function (v) { dist[v] = INF; });
    dist[s] = 0; par[s] = null;
    var q = [s];
    while (q.length) {
      var x = q.shift();
      sortByOrder(G, Object.keys(A[x])).forEach(function (y) {
        if (dist[y] === INF) { dist[y] = dist[x] + 1; par[y] = x; q.push(y); }
      });
    }
    return { dist: dist, par: par };
  }
  function distance(G, u, v) { return bfs(G, u).dist[v]; } // δ(u,v), nombre d'arêtes/arcs
  function shortestChain(G, u, v) {
    var r = bfs(G, u);
    if (r.dist[v] === INF) return null;
    var p = [], c = v;
    while (c !== null) { p.push(c); c = r.par[c]; }
    return p.reverse();
  }
  function reachSet(G, s, mode) {
    var d = bfs(G, s, mode).dist, r = [];
    G.vertices.forEach(function (v) { if (d[v] !== INF) r.push(v); });
    return r;
  }
  function components(G) { // composantes connexes (graphe vu sans orientation)
    var done = {}, out = [];
    G.vertices.forEach(function (v) {
      if (done[v]) return;
      var c = reachSet(G, v, 'und');
      c.forEach(function (x) { done[x] = true; });
      out.push(c);
    });
    return out;
  }
  function componentOf(G, s) { return reachSet(G, s, 'und'); } // CC(s)
  function isConnected(G) { return n(G) === 0 || components(G).length === 1; }
  function scc(G) { // composantes fortement connexes (graphe orienté)
    var reach = {}, done = {}, out = [];
    G.vertices.forEach(function (v) { reach[v] = {}; reachSet(G, v).forEach(function (x) { reach[v][x] = true; }); });
    G.vertices.forEach(function (v) {
      if (done[v]) return;
      var c = G.vertices.filter(function (u) { return reach[v][u] && reach[u][v]; });
      c.forEach(function (x) { done[x] = true; });
      out.push(c);
    });
    return out;
  }
  function sccOf(G, s) { return scc(G).filter(function (c) { return c.indexOf(s) >= 0; })[0]; }
  function isStronglyConnected(G) { return n(G) === 0 || scc(G).length === 1; }
  function diameter(G) { // plus grande distance ; ∞ si le graphe n'est pas (fortement) connexe (convention hors cours)
    var best = 0;
    G.vertices.forEach(function (u) {
      var d = bfs(G, u).dist;
      G.vertices.forEach(function (v) { if (d[v] > best) best = d[v]; });
    });
    return best;
  }
  function distMatrix(G) {
    return G.vertices.map(function (u) { var d = bfs(G, u).dist; return G.vertices.map(function (v) { return d[v]; }); });
  }

  /* ---------- trajets (diapo 18) ---------- */
  function classifyWalk(G, seq) {
    var res = { valid: false, length: 0, closed: false, simple: false, elementary: false,
      cycle: false, elementaryCycle: false, kind: G.directed ? 'chemin' : 'chaîne', reason: '' };
    if (!seq || !seq.length) { res.reason = 'Séquence vide.'; return res; }
    var i, bad = null;
    for (i = 0; i < seq.length; i++) if (G.vertices.indexOf(seq[i]) < 0) { res.reason = 'Sommet inconnu : ' + seq[i] + '.'; return res; }
    for (i = 0; i + 1 < seq.length; i++) {
      if (!adjacent(G, seq[i], seq[i + 1])) { bad = [seq[i], seq[i + 1]]; break; }
    }
    if (bad) {
      res.reason = G.directed ? 'Il n’y a pas d’arc (' + bad[0] + ', ' + bad[1] + ').' : 'Il n’y a pas d’arête {' + bad[0] + ', ' + bad[1] + '}.';
      return res;
    }
    res.valid = true;
    res.length = seq.length - 1;
    res.closed = seq[0] === seq[seq.length - 1];
    var keys = {}, rep = false;
    for (i = 0; i + 1 < seq.length; i++) {
      var k = G.directed ? seq[i] + '>' + seq[i + 1] : pairKey(seq[i], seq[i + 1]);
      if (keys[k]) rep = true;
      keys[k] = true;
    }
    res.simple = !rep;
    var inner = res.closed && seq.length > 1 ? seq.slice(0, -1) : seq;
    res.elementary = uniq(inner).length === inner.length && (res.closed ? res.simple : true);
    res.cycle = res.closed && res.length >= 1 && res.simple;
    res.elementaryCycle = res.cycle && res.elementary;
    return res;
  }

  /* ---------- sous-graphes (diapo 22) ---------- */
  function inducedSubgraph(G, A) {
    var set = {}; A.forEach(function (v) { set[v] = true; });
    var H = make({ directed: G.directed, weighted: G.weighted, vertices: G.vertices.filter(function (v) { return set[v]; }),
      edges: G.edges.filter(function (e) { return set[e.u] && set[e.v]; }).map(function (e) { return { u: e.u, v: e.v, w: e.w, id: e.id }; }) });
    H.vertices.forEach(function (v) { if (G.pos[v]) H.pos[v] = { x: G.pos[v].x, y: G.pos[v].y }; });
    return H;
  }
  function removeEdges(G, ids) {
    var drop = {}; ids.forEach(function (i) { drop[i] = true; });
    var H = make({ directed: G.directed, weighted: G.weighted, vertices: G.vertices,
      edges: G.edges.filter(function (e) { return !drop[e.id]; }).map(function (e) { return { u: e.u, v: e.v, w: e.w, id: e.id }; }), pos: G.pos });
    return H;
  }
  function keyCounts(G) {
    var c = {};
    G.edges.forEach(function (e) { var k = edgeKey(G, e); c[k] = (c[k] || 0) + 1; });
    return c;
  }
  function edgesSubset(HK, GK) { return Object.keys(HK).every(function (k) { return (GK[k] || 0) >= HK[k]; }); }
  function sameKeys(HK, GK) {
    var a = Object.keys(HK), b = Object.keys(GK);
    return a.length === b.length && a.every(function (k) { return HK[k] === GK[k]; });
  }
  function sameSet(a, b) { return a.length === b.length && a.every(function (x) { return b.indexOf(x) >= 0; }); }
  function isPartialGraphOf(H, G) { // même ensemble de sommets, arêtes ⊆ arêtes de G
    return sameSet(H.vertices, G.vertices) && edgesSubset(keyCounts(H), keyCounts(G));
  }
  function isSubgraphOf(H, G) { // définition du cours : sous-ensemble A de sommets + TOUTES les arêtes de G entre sommets de A
    var allIn = H.vertices.every(function (v) { return G.vertices.indexOf(v) >= 0; });
    if (!allIn) return false;
    return sameKeys(keyCounts(H), keyCounts(inducedSubgraph(G, H.vertices)));
  }

  /* ---------- cliques (diapo 20) ---------- */
  function isClique(G, S) {
    for (var i = 0; i < S.length; i++) for (var j = i + 1; j < S.length; j++) if (!adjacent(G, S[i], S[j])) return false;
    return S.length > 0;
  }
  function maximalCliques(G) { // hors cours : Bron–Kerbosch
    var A = buildAdj(G, 'und'), out = [];
    function bk(R, P, X) {
      if (!P.length && !X.length) { out.push(sortByOrder(G, R)); return; }
      var u = P.concat(X)[0];
      P.filter(function (v) { return !A[u][v]; }).forEach(function (v) {
        var nb = Object.keys(A[v]).filter(function (x) { return x !== v; });
        bk(R.concat([v]), P.filter(function (x) { return nb.indexOf(x) >= 0; }), X.filter(function (x) { return nb.indexOf(x) >= 0; }));
        P = P.filter(function (x) { return x !== v; });
        X = X.concat([v]);
      });
    }
    bk([], G.vertices.slice(), []);
    return out;
  }
  function maxCliqueSize(G) { return maximalCliques(G).reduce(function (s, c) { return Math.max(s, c.length); }, 0); }

  /* ---------- Euler (diapos 23-25) ---------- */
  function edgesConnected(G) { // toutes les arêtes sont dans une même composante (sommets isolés ignorés)
    var act = G.vertices.filter(function (v) { return degree(G, v) > 0; });
    if (!act.length) return true;
    var comp = reachSet(G, act[0], 'und');
    return act.every(function (v) { return comp.indexOf(v) >= 0; });
  }
  function hierholzer(G, start) {
    var adj = {}, ptr = {}, used = {};
    G.vertices.forEach(function (v) { adj[v] = []; ptr[v] = 0; });
    G.edges.forEach(function (e) { adj[e.u].push({ to: e.v, id: e.id }); adj[e.v].push({ to: e.u, id: e.id }); });
    var stack = [start], path = [];
    while (stack.length) {
      var v = stack[stack.length - 1], L = adj[v];
      while (ptr[v] < L.length && used[L[ptr[v]].id]) ptr[v]++;
      if (ptr[v] === L.length) path.push(stack.pop());
      else { var a = L[ptr[v]++]; used[a.id] = true; stack.push(a.to); }
    }
    return path.reverse();
  }
  function isEulerTrail(G, seq) { // chaîne passant exactement une fois par chaque arête
    if (!seq || seq.length !== m(G) + 1) return false;
    var cw = classifyWalk(G, seq);
    if (!cw.valid) return false;
    var c = {}, i;
    for (i = 0; i + 1 < seq.length; i++) { var k = pairKey(seq[i], seq[i + 1]); c[k] = (c[k] || 0) + 1; }
    return sameKeys(c, keyCounts(G));
  }
  function euler(G) {
    if (G.directed) return { applicable: false };
    var odd = oddVertices(G), conn = isConnected(G), ec = edgesConnected(G);
    var res = { applicable: true, connected: conn, edgesConnected: ec, odd: odd, kind: 'none', walk: null };
    if (m(G) === 0) { res.kind = 'trivial'; return res; }
    if (ec && odd.length === 0) {
      res.kind = 'cycle';
      res.walk = hierholzer(G, G.vertices.filter(function (v) { return degree(G, v) > 0; })[0]);
    } else if (ec && odd.length === 2) {
      res.kind = 'chain';
      res.walk = hierholzer(G, odd[0]);
    }
    return res;
  }

  /* ---------- Hamilton (diapos 26-28) ---------- */
  function hamilton(G, opts) {
    var N = n(G), limit = (opts && opts.limit) || 15;
    if (N > limit) return { tooBig: true, limit: limit };
    var A = buildAdj(G), ix = vIndex(G), i, j;
    var B = []; for (i = 0; i < N; i++) { B.push([]); for (j = 0; j < N; j++) B[i].push(i !== j && !!A[G.vertices[i]][G.vertices[j]]); }
    var size = 1 << N;
    function run(starts) {
      var dp = new Int8Array(size * Math.max(N, 1)).fill(-2);
      starts.forEach(function (s) { dp[(1 << s) * N + s] = -1; });
      for (var mask = 1; mask < size; mask++) for (var v = 0; v < N; v++) {
        if (!(mask & (1 << v)) || dp[mask * N + v] === -2) continue;
        for (var u = 0; u < N; u++) {
          if ((mask & (1 << u)) || !B[v][u]) continue;
          var nm = mask | (1 << u);
          if (dp[nm * N + u] === -2) dp[nm * N + u] = v;
        }
      }
      return dp;
    }
    function rebuild(dp, end) {
      var seq = [], mask = size - 1, cur = end;
      while (cur !== -1) { seq.push(cur); var p = dp[mask * N + cur]; mask ^= (1 << cur); cur = p; }
      return seq.reverse().map(function (k) { return G.vertices[k]; });
    }
    var res = { tooBig: false, path: null, cycle: null };
    if (N === 0) return res;
    var all = []; for (i = 0; i < N; i++) all.push(i);
    var dpP = run(all);
    for (i = 0; i < N; i++) if (dpP[(size - 1) * N + i] !== -2) { res.path = rebuild(dpP, i); break; }
    if (N === 1) {
      var hasLoop = G.edges.some(isLoop);
      res.cycle = hasLoop ? [G.vertices[0], G.vertices[0]] : null;
      return res;
    }
    var minN = G.directed ? 2 : 3;
    if (N >= minN) {
      var dpC = run([0]);
      for (i = 1; i < N; i++) if (dpC[(size - 1) * N + i] !== -2 && B[i][0]) {
        var s = rebuild(dpC, i); s.push(s[0]); res.cycle = s; break;
      }
    }
    return res;
  }
  function hamiltonConditions(G) { // graphe simple non orienté d'ordre n ≥ 3
    var N = n(G), out = { applicable: !G.directed && isSimple(G) && N >= 3 };
    if (!out.applicable) return out;
    var d = degrees(G), ore = true, oreFail = null;
    for (var i = 0; i < N; i++) for (var j = i + 1; j < N; j++) {
      var u = G.vertices[i], v = G.vertices[j];
      if (!adjacent(G, u, v) && d[u] + d[v] < N) { ore = false; if (!oreFail) oreFail = [u, v]; }
    }
    out.ore = ore; out.oreFail = oreFail;
    out.dirac = G.vertices.every(function (v) { return 2 * d[v] >= N; });
    out.degreeOne = G.vertices.filter(function (v) { return d[v] === 1; });
    out.degreeZero = G.vertices.filter(function (v) { return d[v] === 0; });
    return out;
  }
  function elementaryChains(G, u, v, limit) { // chaînes élémentaires de u à v (énumération bornée)
    var A = buildAdj(G), out = [], lim = limit || 40, cut = false;
    (function dfs(cur, path) {
      if (out.length >= lim) { cut = true; return; }
      if (cur === v) { out.push(path.slice()); return; }
      sortByOrder(G, Object.keys(A[cur])).forEach(function (y) {
        if (path.indexOf(y) < 0) { path.push(y); dfs(y, path); path.pop(); }
      });
    })(u, [u]);
    return { chains: out, truncated: cut };
  }

  /* ---------- suites de degrés (Havel–Hakimi, hors cours) ---------- */
  function havelHakimi(seq) {
    var nodes = seq.map(function (d, i) { return { d: d, i: i }; }), edges = [];
    if (nodes.some(function (x) { return x.d < 0; })) return null;
    for (;;) {
      nodes.sort(function (a, b) { return b.d - a.d; });
      if (!nodes.length || nodes[0].d === 0) return edges;
      var first = nodes.shift();
      if (first.d > nodes.length) return null;
      for (var k = 0; k < first.d; k++) {
        nodes[k].d--;
        if (nodes[k].d < 0) return null;
        edges.push([first.i, nodes[k].i]);
      }
    }
  }

  /* ---------- texte <-> graphe ---------- */
  function parseSet(text) {
    var parts = String(text || '').split(/[\s,;{}()]+/).filter(Boolean);
    return uniq(parts);
  }
  function parseEdges(text, directed, weighted) {
    var errors = [], vertices = [], edges = [];
    function addV(x) { if (vertices.indexOf(x) < 0) vertices.push(x); }
    String(text || '').split(/[\n,;]+/).forEach(function (tok) {
      tok = tok.trim();
      if (!tok) return;
      var w;
      var mw = tok.match(/^(.*?):\s*(-?\d+(?:[.,]\d+)?)$/);
      if (mw) { tok = mw[1].trim(); w = parseFloat(mw[2].replace(',', '.')); }
      tok = tok.replace(/^[({]|[)}]$/g, '');
      var mm = tok.match(/^(\S+?)\s*(?:-->|->|→|>|--|-|–|—)\s*(\S+)$/);
      if (mm) {
        addV(mm[1]); addV(mm[2]);
        edges.push({ u: mm[1], v: mm[2], w: weighted ? (w === undefined ? 1 : w) : undefined });
      } else if (/^\S+$/.test(tok)) { addV(tok); }
      else errors.push('Entrée non comprise : « ' + tok + ' »');
    });
    return { graph: make({ directed: !!directed, weighted: !!weighted, vertices: vertices, edges: edges }), errors: errors };
  }
  function layoutCircle(vertices, cx, cy, r) {
    var pos = {}, N = vertices.length;
    vertices.forEach(function (v, i) {
      var a = -Math.PI / 2 + 2 * Math.PI * i / Math.max(N, 1);
      pos[v] = { x: Math.round((cx + r * Math.cos(a)) * 10) / 10, y: Math.round((cy + r * Math.sin(a)) * 10) / 10 };
    });
    return pos;
  }
  function describeEdges(G) {
    return G.edges.map(function (e) { return G.directed ? '(' + e.u + ', ' + e.v + ')' : '{' + e.u + ', ' + e.v + '}'; }).join(', ');
  }

  return {
    INF: INF, make: make, clone: clone, n: n, m: m, vIndex: vIndex, isLoop: isLoop, pairKey: pairKey, edgeKey: edgeKey,
    degree: degree, outDeg: outDeg, inDeg: inDeg, degrees: degrees, sumDegrees: sumDegrees, maxDegree: maxDegree, minDegree: minDegree,
    oddVertices: oddVertices, isolated: isolated, regularity: regularity,
    succ: succ, pred: pred, neighbors: neighbors, adjacent: adjacent, buildAdj: buildAdj,
    adjMatrix: adjMatrix, weightMatrix: weightMatrix, adjLists: adjLists,
    isSimple: isSimple, density: density, maxEdgesSimple: maxEdgesSimple, isComplete: isComplete,
    bfs: bfs, distance: distance, shortestChain: shortestChain, reachSet: reachSet, components: components, componentOf: componentOf,
    isConnected: isConnected, scc: scc, sccOf: sccOf, isStronglyConnected: isStronglyConnected, diameter: diameter, distMatrix: distMatrix,
    classifyWalk: classifyWalk, inducedSubgraph: inducedSubgraph, removeEdges: removeEdges,
    isPartialGraphOf: isPartialGraphOf, isSubgraphOf: isSubgraphOf, isClique: isClique, maximalCliques: maximalCliques, maxCliqueSize: maxCliqueSize,
    edgesConnected: edgesConnected, hierholzer: hierholzer, isEulerTrail: isEulerTrail, euler: euler,
    hamilton: hamilton, hamiltonConditions: hamiltonConditions, elementaryChains: elementaryChains,
    havelHakimi: havelHakimi, parseSet: parseSet, parseEdges: parseEdges, layoutCircle: layoutCircle, describeEdges: describeEdges,
    sortByOrder: sortByOrder, uniq: uniq, sameSet: sameSet
  };
});

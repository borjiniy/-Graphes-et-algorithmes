/* exercises.js — moteur de questions : constructeurs, vérification, sélection, graines aléatoires.
 * Une « spécification » (spec) décrit une question ; build(spec) produit la question exécutable
 * avec sa fonction check(réponse) -> {ok, score, msg}. Les réponses attendues sont CALCULÉES
 * par graphlib quand c'est possible (pas de réponse recopiée à la main).
 */
(function (root) {
  'use strict';
  var GF = root.GF = root.GF || {};
  var GR = GF.graph, GS = GF.graphs, U = GF.u, RD = GF.render;

  /* ---------- aléatoire à graine ---------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function rint(rng, a, b) { return a + Math.floor(rng() * (b - a + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  var LET = 'ABCDEFGHIJKL'.split('');

  /* ---------- graphes aléatoires ---------- */
  function labels(n) { return LET.slice(0, n); }
  function withLayout(G) { G.pos = GR.layoutCircle(G.vertices, 150, 118, 92); return G; }
  function allPairs(vs) { var r = []; for (var i = 0; i < vs.length; i++) for (var j = i + 1; j < vs.length; j++) r.push([vs[i], vs[j]]); return r; }
  function randSimple(rng, n, m) {
    var vs = labels(n), prs = shuffle(rng, allPairs(vs)).slice(0, m);
    return withLayout(GR.make({ vertices: vs, edges: prs }));
  }
  function randConnected(rng, n, m) {
    var vs = labels(n), order = shuffle(rng, vs), edges = [], has = {};
    for (var i = 1; i < n; i++) {
      var j = rint(rng, 0, i - 1);
      edges.push([order[i], order[j]]); has[GR.pairKey(order[i], order[j])] = true;
    }
    var rest = shuffle(rng, allPairs(vs).filter(function (p) { return !has[GR.pairKey(p[0], p[1])]; }));
    while (edges.length < m && rest.length) edges.push(rest.pop());
    return withLayout(GR.make({ vertices: vs, edges: shuffle(rng, edges) }));
  }
  function randDigraph(rng, n, m, loops) {
    var vs = labels(n).map(function (_, i) { return String(i + 1); }), prs = [];
    vs.forEach(function (a) { vs.forEach(function (b) { if (a !== b) prs.push([a, b]); }); });
    var chosen = shuffle(rng, prs).slice(0, m);
    if (loops) { for (var k = 0; k < loops; k++) { var v = pick(rng, vs); if (!chosen.some(function (e) { return e[0] === v && e[1] === v; })) chosen.push([v, v]); } }
    var G = GR.make({ directed: true, vertices: vs, edges: chosen });
    G.pos = GR.layoutCircle(vs, 150, 118, 88);
    return G;
  }

  /* ---------- lecture des réponses ---------- */
  function parseNum(s) {
    if (typeof s === 'number') return s;
    var t = String(s == null ? '' : s).trim().toLowerCase().replace(/[−–—]/g, '-').replace(/\s+/g, '');
    if (!t) return NaN;
    if (/^\+?(∞|inf|infini|infinity)$/.test(t)) return Infinity;
    if (/^-(∞|inf|infini|infinity)$/.test(t)) return -Infinity;
    var f = t.match(/^(-?\d+(?:[.,]\d+)?)\/(\d+(?:[.,]\d+)?)$/);
    if (f) { var d = parseFloat(f[2].replace(',', '.')); return d === 0 ? NaN : parseFloat(f[1].replace(',', '.')) / d; }
    if (!/^-?\d+(?:[.,]\d+)?$/.test(t)) return NaN;
    return parseFloat(t.replace(',', '.'));
  }
  function parseVSet(s) {
    var t = String(s == null ? '' : s).trim().toLowerCase();
    if (!t || /^(aucun|aucune|vide|∅|\{\}|rien|{ })$/.test(t)) return [];
    return GR.parseSet(s);
  }
  function sameStrSet(a, b) {
    var x = a.map(function (z) { return String(z).toLowerCase(); }).sort(), y = b.map(function (z) { return String(z).toLowerCase(); }).sort();
    return x.length === y.length && x.every(function (v, i) { return v === y[i]; });
  }
  function parseWalk(s) {
    var t = String(s == null ? '' : s).trim();
    if (!t) return [];
    return t.split(/\s*(?:-->|->|→|–|—|-|,|;|\s)\s*/).filter(Boolean);
  }
  function fmtNum(x) {
    if (x === Infinity) return '∞';
    if (Math.abs(x - Math.round(x)) < 1e-9) return String(Math.round(x)).replace('-', '−');
    return String(Math.round(x * 1000) / 1000).replace('-', '−').replace('.', ',');
  }

  /* ---------- constructeurs de spécifications ---------- */
  function ext(base, o) { if (o) for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) base[k] = o[k]; return base; }
  var qb = {
    choice: function (id, level, prompt, options, answer, why, o) { return ext({ type: 'choice', id: id, level: level, prompt: prompt, options: options, answer: answer, why: why }, o); },
    multi: function (id, level, prompt, options, answer, why, o) { return ext({ type: 'multi', id: id, level: level, prompt: prompt, options: options, answer: answer, why: why }, o); },
    tf: function (id, level, prompt, answer, justOptions, just, why, o) { return ext({ type: 'tf', id: id, level: level, prompt: prompt, answer: answer, justOptions: justOptions, just: just, why: why }, o); },
    num: function (id, level, prompt, answer, why, o) { return ext({ type: 'num', id: id, level: level, prompt: prompt, answer: answer, why: why }, o); },
    set: function (id, level, prompt, answer, why, o) { return ext({ type: 'set', id: id, level: level, prompt: prompt, answer: answer, why: why }, o); },
    text: function (id, level, prompt, model, rubric, o) { return ext({ type: 'text', id: id, level: level, prompt: prompt, model: model, rubric: rubric }, o); },
    walk: function (id, level, prompt, pred, why, o) { return ext({ type: 'walk', id: id, level: level, prompt: prompt, pred: pred, why: why }, o); },
    edges: function (id, level, prompt, pred, why, o) { return ext({ type: 'edges', id: id, level: level, prompt: prompt, pred: pred, why: why }, o); },
    matrix: function (id, level, prompt, graph, why, o) { return ext({ type: 'matrix', id: id, level: level, prompt: prompt, graph: graph, why: why }, o); },
    wmatrix: function (id, level, prompt, graph, why, o) { return ext({ type: 'wmatrix', id: id, level: level, prompt: prompt, graph: graph, why: why }, o); },
    lists: function (id, level, prompt, graph, why, o) { return ext({ type: 'lists', id: id, level: level, prompt: prompt, graph: graph, why: why }, o); },
    composite: function (id, level, prompt, parts, why, o) { return ext({ type: 'composite', id: id, level: level, prompt: prompt, parts: parts, why: why }, o); }
  };

  /* ---------- instanciation ---------- */
  function resolveGraph(g) {
    if (!g) return null;
    if (typeof g === 'string') return GS.get(g);
    if (typeof g === 'function') return g();
    return GR.clone(g);
  }
  function val(x, G, q) { return typeof x === 'function' ? x(G, q) : x; }
  function setHTML(a) { return U.set(a); }
  function matrixSolution(G, weighted) { return RD.matrixHTML(G, { weighted: weighted, zeroDiag: true }); }

  function build(spec, notionId, keyOverride) {
    var q = {
      key: keyOverride || spec.key || spec.id, id: spec.id, notion: spec.notion || notionId, level: spec.level || 1,
      type: spec.type, tag: spec.tag || null, hints: (spec.hints || []).slice(), raw: spec,
      challenge: !!spec.challenge
    };
    var G = resolveGraph(spec.graph);
    q.graph = G;
    q.graph2 = resolveGraph(spec.graph2);
    q.gopts = spec.gopts || {};
    q.gopts2 = spec.gopts2 || {};
    q.caption = spec.caption || '';
    q.prompt = val(spec.prompt, G, q);
    var why = function () { return spec.why ? val(spec.why, G, q) : ''; };

    switch (spec.type) {
      case 'choice': {
        q.options = val(spec.options, G, q).slice();
        var ans = val(spec.answer, G, q);
        q.oracle = function () { return ans; };
        q.check = function (a) {
          var ok = a === ans;
          return { ok: ok, score: ok ? 1 : 0, msg: !ok && spec.miscon && spec.miscon[a] ? spec.miscon[a] : '' };
        };
        q.solution = function () { return '<p><b>Réponse :</b> ' + q.options[ans] + '</p>' + why(); };
        break;
      }
      case 'multi': {
        q.options = val(spec.options, G, q).slice();
        var mans = val(spec.answer, G, q).slice().sort();
        q.oracle = function () { return mans.slice(); };
        q.check = function (a) {
          var x = (a || []).slice().sort(), ok = x.length === mans.length && x.every(function (v, i) { return v === mans[i]; });
          return { ok: ok, score: ok ? 1 : 0 };
        };
        q.solution = function () { return '<p><b>Réponses :</b></p><ul>' + mans.map(function (i) { return '<li>' + q.options[i] + '</li>'; }).join('') + '</ul>' + why(); };
        break;
      }
      case 'tf': {
        var tans = val(spec.answer, G, q), jopts = spec.justOptions ? val(spec.justOptions, G, q) : null, jans = jopts ? val(spec.just, G, q) : null;
        q.justOptions = jopts;
        q.oracle = function () { return { v: tans, j: jans }; };
        q.check = function (a) {
          a = a || {};
          var okV = a.v === tans, okJ = !jopts || a.j === jans;
          var ok = okV && okJ;
          var msg = '';
          if (okV && !okJ) msg = 'Le verdict est bon, mais la justification choisie ne convient pas.';
          if (!okV && okJ && jopts) msg = '';
          return { ok: ok, score: ok ? 1 : (okV ? 0.5 : 0), msg: msg };
        };
        q.solution = function () {
          return '<p><b>Réponse :</b> ' + (tans ? 'Vrai' : 'Faux') + (jopts ? ' — ' + jopts[jans] : '') + '</p>' + why();
        };
        break;
      }
      case 'num': {
        var nans = val(spec.answer, G, q), tol = spec.tol || 1e-9;
        q.unit = spec.unit || '';
        q.oracle = function () { return fmtNum(nans); };
        q.check = function (a) {
          var x = parseNum(a);
          if (isNaN(x)) return { ok: false, score: 0, msg: 'Entrez un nombre (ou une fraction comme 7/15).' };
          var ok = nans === Infinity ? x === Infinity : Math.abs(x - nans) <= tol;
          return { ok: ok, score: ok ? 1 : 0 };
        };
        q.solution = function () { return '<p><b>Réponse :</b> ' + fmtNum(nans) + (q.unit ? ' ' + q.unit : '') + '</p>' + why(); };
        break;
      }
      case 'set': {
        var sans = val(spec.answer, G, q);
        q.oracle = function () { return sans.length ? sans.join(', ') : 'aucun'; };
        q.check = function (a) {
          var ok = sameStrSet(parseVSet(a), sans);
          return { ok: ok, score: ok ? 1 : 0 };
        };
        q.solution = function () { return '<p><b>Réponse :</b> ' + setHTML(sans) + '</p>' + why(); };
        break;
      }
      case 'text': {
        q.model = val(spec.model, G, q);
        q.rubric = val(spec.rubric, G, q);
        q.selfGraded = true;
        q.solution = function () { return '<p><b>Réponse type :</b></p>' + q.model; };
        q.check = function (a) { // a = nombre de critères cochés
          var k = typeof a === 'number' ? a : 0, tot = q.rubric.length, sc = tot ? k / tot : 0;
          return { ok: sc >= 0.75, score: sc, msg: '' };
        };
        q.oracle = function () { return q.rubric.length; };
        break;
      }
      case 'walk': {
        var wsmp = spec.sample !== undefined ? val(spec.sample, G, q) : null;
        q.sample = wsmp;
        q.oracle = wsmp == null ? null : function () { return wsmp; };
        q.check = function (a) {
          var seq = parseWalk(a);
          var r = spec.pred(G, seq);
          return { ok: !!r.ok, score: r.ok ? 1 : 0, msg: r.msg || '' };
        };
        q.solution = function () { return why() + (wsmp ? '<p><b>Exemple de réponse correcte :</b> ' + U.esc(wsmp) + '</p>' : ''); };
        break;
      }
      case 'edges': {
        var esmp = spec.sample !== undefined ? val(spec.sample, G, q) : null;
        q.sample = esmp;
        q.oracle = esmp == null ? null : function () { return esmp; };
        q.check = function (a) {
          var p = GR.parseEdges(a, G ? G.directed : false, G ? G.weighted : false);
          if (p.errors.length) return { ok: false, score: 0, msg: p.errors.join(' ') };
          var r = spec.pred(p.graph);
          return { ok: !!r.ok, score: r.ok ? 1 : 0, msg: r.msg || '' };
        };
        q.solution = function () { return why() + (esmp ? '<p><b>Exemple de réponse correcte :</b> ' + U.esc(esmp) + '</p>' : ''); };
        break;
      }
      case 'matrix':
      case 'wmatrix': {
        var weighted = spec.type === 'wmatrix';
        q.weighted = weighted;
        var exp = weighted ? GR.weightMatrix(G, { zeroDiag: true }) : GR.adjMatrix(G, { binary: true });
        q.expected = exp;
        q.vertices = G.vertices.slice();
        q.oracle = function () { return exp.map(function (r) { return r.map(function (x) { return weighted ? (x === Infinity ? '∞' : String(x)) : x; }); }); };
        q.check = function (a) {
          var good = 0, tot = 0, bad = [];
          for (var i = 0; i < exp.length; i++) for (var j = 0; j < exp.length; j++) {
            tot++;
            var got = a && a[i] ? a[i][j] : null, ok;
            if (weighted) { var x = parseNum(got); ok = (exp[i][j] === Infinity) ? x === Infinity : (!isNaN(x) && Math.abs(x - exp[i][j]) < 1e-9); }
            else ok = Number(got) === exp[i][j];
            if (ok) good++; else bad.push(G.vertices[i] + '→' + G.vertices[j]);
          }
          var allOk = good === tot;
          return { ok: allOk, score: good / tot, msg: allOk ? '' : (tot - good) + ' case(s) à revoir : ' + bad.slice(0, 8).join(', ') + (bad.length > 8 ? '…' : '') };
        };
        q.solution = function () { return matrixSolution(G, weighted) + why(); };
        break;
      }
      case 'lists': {
        var L = GR.adjLists(G);
        q.vertices = G.vertices.slice();
        q.expectedLists = L;
        q.oracle = function () { var o = {}; G.vertices.forEach(function (v) { o[v] = GR.uniq(L[v]).join(', '); }); return o; };
        q.check = function (a) {
          var good = 0, bad = [];
          G.vertices.forEach(function (v) {
            var got = parseVSet(a && a[v]), exp2 = GR.uniq(L[v]);
            if (sameStrSet(got, exp2)) good++; else bad.push(v);
          });
          var ok = good === G.vertices.length;
          return { ok: ok, score: good / G.vertices.length, msg: ok ? '' : 'Liste(s) à revoir pour : ' + bad.join(', ') };
        };
        q.solution = function () { return RD.listsHTML(G) + why(); };
        break;
      }
      case 'composite': {
        var parts = val(spec.parts, G, q);
        q.parts = parts.map(function (p, i) { return build(p, q.notion, q.key + '#' + i); });
        q.oracle = function () { return q.parts.map(function (p) { return p.oracle ? p.oracle() : null; }); };
        q.check = function (a) {
          var sc = 0, allOk = true, msgs = [];
          q.parts.forEach(function (p, i) {
            var r = p.check(a ? a[i] : undefined);
            sc += r.score; if (!r.ok) { allOk = false; msgs.push('Partie ' + (i + 1) + ' : ' + (r.msg || 'à revoir')); }
          });
          return { ok: allOk, score: sc / q.parts.length, msg: msgs.join(' ') };
        };
        q.solution = function () { return q.parts.map(function (p, i) { return '<h5>Partie ' + (i + 1) + '</h5>' + p.solution(); }).join('') + why(); };
        break;
      }
      default:
        throw new Error('Type de question inconnu : ' + spec.type);
    }
    return q;
  }

  /* ---------- registre ---------- */
  var gens = [];   // générateurs paramétriques (voir gens.js)
  function genById(id) { for (var i = 0; i < gens.length; i++) if (gens[i].id === id) return gens[i]; return null; }
  function staticSpecs(notionId) {
    var n = GF.content && GF.content.byId[notionId];
    return n ? (n.qs || []) : [];
  }
  function fromKey(key) {
    if (key.indexOf('g:') === 0) {
      var p = key.split(':'), gen = genById(p[1]);
      if (!gen) return null;
      var spec = gen.make(mulberry32(parseInt(p[2], 10)), parseInt(p[3], 10));
      spec.notion = gen.notion;
      spec.tag = spec.tag || gen.tag || null;
      return build(spec, gen.notion, key);
    }
    var cs = GF.content ? GF.content.notions : [];
    for (var i = 0; i < cs.length; i++) {
      var ss = cs[i].qs || [];
      for (var j = 0; j < ss.length; j++) if (ss[j].id === key) return build(ss[j], cs[i].id);
    }
    return null;
  }
  function fresh(genId, level, seed) {
    var gen = genById(genId);
    seed = seed === undefined ? Math.floor(Math.random() * 1e9) : seed;
    return fromKey('g:' + gen.id + ':' + seed + ':' + level);
  }
  /* sélectionne des questions pour une notion : mélange statique + généré, niveau donné */
  function pick1(notionId, level, opts) {
    opts = opts || {};
    var excl = opts.exclude || {};
    var seedBase = opts.seed === undefined ? Math.floor(Math.random() * 1e9) : opts.seed;
    var rng = mulberry32(seedBase);
    var pool = [];
    staticSpecs(notionId).forEach(function (s) {
      if ((s.level || 1) === level && !excl[s.id] && s.type !== 'text' && !s.noPool) pool.push({ k: s.id });
    });
    gens.forEach(function (g) {
      if (g.notion === notionId && g.levels.indexOf(level) >= 0) pool.push({ g: g.id, w: 2 });
    });
    if (!pool.length) return null;
    var weighted = [];
    pool.forEach(function (p) { for (var i = 0; i < (p.w || 1); i++) weighted.push(p); });
    var c = pick(rng, weighted);
    if (c.k) return fromKey(c.k);
    return fromKey('g:' + c.g + ':' + rint(rng, 1, 1e9) + ':' + level);
  }
  /* série progressive : niveaux 1,1,2,2,3,3 (sans doublons de clé) */
  function progressive(notionId, perLevel, seed) {
    perLevel = perLevel || 2;
    var rng = mulberry32(seed === undefined ? Math.floor(Math.random() * 1e9) : seed), out = [], seen = {};
    [1, 2, 3].forEach(function (lv) {
      var tries = 0, got = 0;
      while (got < perLevel && tries < 30) {
        tries++;
        var q = pick1(notionId, lv, { seed: rint(rng, 1, 1e9), exclude: seen });
        if (!q) break;
        if (seen[q.key]) continue;
        seen[q.key] = true; out.push(q); got++;
      }
    });
    return out;
  }
  function textSpecs(notionId) { return staticSpecs(notionId).filter(function (s) { return s.type === 'text'; }); }

  /* Fabrique de graphe pour les énoncés statiques (sommets à un caractère) :
   *   graph: X.mk('ABCDE', ['AB', 'BC', 'CD'])                      non orienté
   *   graph: X.mk('1234', ['12', '23'], { directed: true })          orienté
   *   graph: X.mk('ABC', [['A', 'B', 5], ['B', 'C', 2]], { weighted: true })
   * Retourne une fonction (résolue par build) ; disposition circulaire sauf { pos } fourni. */
  function mk(vs, es, o) {
    o = o || {};
    var V = typeof vs === 'string' ? vs.split('') : vs.slice();
    return function () {
      var edges = es.map(function (e) { return typeof e === 'string' ? [e.charAt(0), e.charAt(1)] : e; });
      var G = GR.make({ directed: !!o.directed, weighted: !!o.weighted, vertices: V, edges: edges, pos: o.pos });
      if (!o.pos) G.pos = GR.layoutCircle(G.vertices, 150, 118, o.r || 92);
      return G;
    };
  }

  GF.ex = {
    mk: mk,
    mulberry32: mulberry32, rint: rint, pick: pick, shuffle: shuffle, labels: labels, withLayout: withLayout,
    randSimple: randSimple, randConnected: randConnected, randDigraph: randDigraph, allPairs: allPairs,
    parseNum: parseNum, parseVSet: parseVSet, parseWalk: parseWalk, fmtNum: fmtNum, sameStrSet: sameStrSet,
    qb: qb, build: build, gens: gens, genById: genById, fromKey: fromKey, fresh: fresh, pick1: pick1, progressive: progressive,
    staticSpecs: staticSpecs, textSpecs: textSpecs
  };
  if (typeof module === 'object' && module.exports) module.exports = GF.ex;
})(typeof self !== 'undefined' ? self : (typeof global !== 'undefined' ? global : this));

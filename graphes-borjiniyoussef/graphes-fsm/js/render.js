/* render.js — rendu SVG des graphes, matrices et listes d'adjacence. Sans dépendance. */
(function (root, factory) {
  var GR = (typeof module === 'object' && module.exports) ? require('./graphlib.js') : root.GF.graph;
  var api = factory(GR);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  else { root.GF = root.GF || {}; root.GF.render = api; }
})(typeof self !== 'undefined' ? self : this, function (GR) {
  'use strict';
  var uid = 0;
  var R = 17;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function fmtW(w) {
    if (w === Infinity) return '∞';
    if (w === -Infinity) return '−∞';
    if (typeof w !== 'number') return String(w);
    return String(Math.round(w * 1000) / 1000).replace('-', '−');
  }
  function r1(x) { return Math.round(x * 10) / 10; }

  function layout(G) {
    var pos = {}, miss = [];
    G.vertices.forEach(function (v) { if (G.pos && G.pos[v]) pos[v] = G.pos[v]; else miss.push(v); });
    if (miss.length === G.vertices.length) return GR.layoutCircle(G.vertices, 150, 120, 95);
    if (miss.length) {
      var extra = GR.layoutCircle(miss, 150, 120, 95);
      miss.forEach(function (v) { pos[v] = extra[v]; });
    }
    return pos;
  }

  /* opts : hlV {v:'hl'|'hl2'|'cur'}, hlE {id:'hl'|'hl2'}, groups [[v..]], walk {seq, upTo, numbers},
   *        showDeg bool, hit bool (zones de clic), dimV [v..], maxWidth px, alt string, weights bool */
  function svg(G, opts) {
    opts = opts || {};
    var pos = layout(G), id = 'g' + (++uid), ix = GR.vIndex(G);
    var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    G.vertices.forEach(function (v) {
      minX = Math.min(minX, pos[v].x); maxX = Math.max(maxX, pos[v].x);
      minY = Math.min(minY, pos[v].y); maxY = Math.max(maxY, pos[v].y);
    });
    if (!G.vertices.length) { minX = 0; maxX = 200; minY = 0; maxY = 120; }
    var padX = 52, padY = 52;
    var vw = Math.max(maxX - minX + 2 * padX, 220), vh = Math.max(maxY - minY + 2 * padY, 150);
    var vx = (minX + maxX) / 2 - vw / 2, vy = (minY + maxY) / 2 - vh / 2;
    if (opts.fixedBox) { vx = opts.fixedBox[0]; vy = opts.fixedBox[1]; vw = opts.fixedBox[2]; vh = opts.fixedBox[3]; }

    var cx = 0, cy = 0;
    G.vertices.forEach(function (v) { cx += pos[v].x; cy += pos[v].y; });
    cx /= Math.max(G.vertices.length, 1); cy /= Math.max(G.vertices.length, 1);

    var groupOf = {};
    (opts.groups || []).forEach(function (g, i) { g.forEach(function (v) { groupOf[v] = i % 6; }); });

    /* arêtes d'un parcours */
    var walkEdge = {}, walkNum = {};
    if (opts.walk && opts.walk.seq) {
      var used = {}, seq = opts.walk.seq, upTo = opts.walk.upTo === undefined ? seq.length - 1 : opts.walk.upTo;
      for (var s = 0; s < Math.min(upTo, seq.length - 1); s++) {
        for (var k = 0; k < G.edges.length; k++) {
          var e = G.edges[k];
          if (used[e.id]) continue;
          var fw = e.u === seq[s] && e.v === seq[s + 1], bw = !G.directed && e.v === seq[s] && e.u === seq[s + 1];
          if (fw || bw) { used[e.id] = true; walkEdge[e.id] = true; walkNum[e.id] = s + 1; break; }
        }
      }
    }

    /* groupes d'arêtes parallèles */
    var groups = {};
    G.edges.forEach(function (e) {
      if (e.u === e.v) return;
      var k = GR.pairKey(e.u, e.v);
      (groups[k] = groups[k] || []).push(e);
    });
    var loops = {};
    G.edges.forEach(function (e) { if (e.u === e.v) (loops[e.u] = loops[e.u] || []).push(e); });

    var out = [];
    var hlCls = function (c) { return c ? ' ' + c : ''; };
    out.push('<svg class="gf-svg" xmlns="http://www.w3.org/2000/svg" viewBox="' + r1(vx) + ' ' + r1(vy) + ' ' + r1(vw) + ' ' + r1(vh) +
      '" role="img" aria-label="' + esc(opts.alt || 'Représentation d’un graphe') + '"' +
      (opts.maxWidth ? ' style="max-width:' + opts.maxWidth + 'px"' : '') + '>');
    out.push('<defs>' +
      ['', ' hl', ' hl2', ' walk'].map(function (c, i) {
        return '<marker id="' + id + 'a' + i + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="gf-arrow' + c + '" d="M0 0 L10 5 L0 10 z"/></marker>';
      }).join('') + '</defs>');

    function markerFor(cls) { return cls.indexOf('walk') >= 0 ? 3 : cls.indexOf('hl2') >= 0 ? 2 : cls.indexOf('hl') >= 0 ? 1 : 0; }

    var edgeSvg = [], labelSvg = [];
    function edgeClass(e) {
      var c = '';
      if (opts.hlE && opts.hlE[e.id]) c = opts.hlE[e.id];
      if (walkEdge[e.id]) c = 'walk';
      if (!c && groupOf[e.u] !== undefined && groupOf[e.u] === groupOf[e.v]) c = 'grp' + groupOf[e.u];
      return c;
    }
    Object.keys(groups).forEach(function (k) {
      var list = groups[k].slice().sort(function (a, b) { return a.id - b.id; });
      var a0 = list[0].u, b0 = list[0].v;
      var lo = ix[a0] <= ix[b0] ? a0 : b0, hi = lo === a0 ? b0 : a0;
      var P0 = pos[lo], P1 = pos[hi];
      var dx = P1.x - P0.x, dy = P1.y - P0.y, L = Math.sqrt(dx * dx + dy * dy) || 1;
      var nx = -dy / L, ny = dx / L;
      list.forEach(function (e, i) {
        var off = (i - (list.length - 1) / 2) * 36;
        var p = pos[e.u], q = pos[e.v];
        var mx = (p.x + q.x) / 2 + nx * off * 2, my = (p.y + q.y) / 2 + ny * off * 2;
        var t1x = mx - p.x, t1y = my - p.y, l1 = Math.sqrt(t1x * t1x + t1y * t1y) || 1;
        var t2x = mx - q.x, t2y = my - q.y, l2 = Math.sqrt(t2x * t2x + t2y * t2y) || 1;
        var sx = p.x + t1x / l1 * R, sy = p.y + t1y / l1 * R;
        var ex = q.x + t2x / l2 * (R + (G.directed ? 2 : 0)), ey = q.y + t2y / l2 * (R + (G.directed ? 2 : 0));
        var cls = edgeClass(e);
        var d = 'M' + r1(sx) + ' ' + r1(sy) + ' Q' + r1(mx) + ' ' + r1(my) + ' ' + r1(ex) + ' ' + r1(ey);
        if (opts.hit) edgeSvg.push('<path class="gf-hit" data-e="' + e.id + '" d="' + d + '"/>');
        edgeSvg.push('<path class="gf-edge' + hlCls(cls) + '" data-eid="' + e.id + '" d="' + d + '"' +
          (G.directed ? ' marker-end="url(#' + id + 'a' + markerFor(cls) + ')"' : '') + '/>');
        var ax = 0.25 * sx + 0.5 * mx + 0.25 * ex, ay = 0.25 * sy + 0.5 * my + 0.25 * ey;
        var sgn = off === 0 ? 1 : (off > 0 ? 1 : -1);
        if (G.weighted && opts.weights !== false) labelSvg.push('<text class="gf-w" x="' + r1(ax + nx * 11 * sgn) + '" y="' + r1(ay + ny * 11 * sgn + 4) + '" text-anchor="middle">' + esc(fmtW(e.w)) + '</text>');
        if (walkNum[e.id] && opts.walk.numbers) labelSvg.push('<text class="gf-num" x="' + r1(ax + nx * 12 * sgn) + '" y="' + r1(ay + ny * 12 * sgn + 4) + '" text-anchor="middle">' + walkNum[e.id] + '</text>');
      });
    });
    Object.keys(loops).forEach(function (v) {
      var p = pos[v], dx = p.x - cx, dy = p.y - cy;
      var base = (Math.abs(dx) + Math.abs(dy) < 1) ? -Math.PI / 2 : Math.atan2(dy, dx);
      loops[v].forEach(function (e, i) {
        var a = base + i * 0.9, dlt = 0.5;
        var reach = 46 + 10 * i;
        var s = { x: p.x + R * Math.cos(a - dlt * 0.6), y: p.y + R * Math.sin(a - dlt * 0.6) };
        var t = { x: p.x + (R + (G.directed ? 2 : 0)) * Math.cos(a + dlt * 0.6), y: p.y + (R + (G.directed ? 2 : 0)) * Math.sin(a + dlt * 0.6) };
        var c1 = { x: p.x + reach * Math.cos(a - dlt * 1.5), y: p.y + reach * Math.sin(a - dlt * 1.5) };
        var c2 = { x: p.x + reach * Math.cos(a + dlt * 1.5), y: p.y + reach * Math.sin(a + dlt * 1.5) };
        var cls = edgeClass(e);
        var d = 'M' + r1(s.x) + ' ' + r1(s.y) + ' C' + r1(c1.x) + ' ' + r1(c1.y) + ' ' + r1(c2.x) + ' ' + r1(c2.y) + ' ' + r1(t.x) + ' ' + r1(t.y);
        if (opts.hit) edgeSvg.push('<path class="gf-hit" data-e="' + e.id + '" d="' + d + '"/>');
        edgeSvg.push('<path class="gf-edge' + hlCls(cls) + '" data-eid="' + e.id + '" d="' + d + '"' +
          (G.directed ? ' marker-end="url(#' + id + 'a' + markerFor(cls) + ')"' : '') + '/>');
        var lx = p.x + (reach * 0.78 + 8) * Math.cos(a), ly = p.y + (reach * 0.78 + 8) * Math.sin(a);
        if (G.weighted && opts.weights !== false) labelSvg.push('<text class="gf-w" x="' + r1(lx) + '" y="' + r1(ly + 4) + '" text-anchor="middle">' + esc(fmtW(e.w)) + '</text>');
        if (walkNum[e.id] && opts.walk.numbers) labelSvg.push('<text class="gf-num" x="' + r1(lx) + '" y="' + r1(ly + 4) + '" text-anchor="middle">' + walkNum[e.id] + '</text>');
      });
    });
    out.push(edgeSvg.join(''));
    out.push(labelSvg.join(''));

    var dimmed = {}; (opts.dimV || []).forEach(function (v) { dimmed[v] = true; });
    G.vertices.forEach(function (v) {
      var p = pos[v], cls = '';
      if (opts.hlV && opts.hlV[v]) cls = opts.hlV[v];
      else if (groupOf[v] !== undefined) cls = 'grp' + groupOf[v];
      if (dimmed[v]) cls += ' dim';
      out.push('<g class="gf-vertex' + hlCls(cls) + '" data-v="' + esc(v) + '"><circle class="gf-node" cx="' + r1(p.x) + '" cy="' + r1(p.y) + '" r="' + R + '"/>' +
        '<text class="gf-label" x="' + r1(p.x) + '" y="' + r1(p.y + 5) + '" text-anchor="middle">' + esc(v) + '</text></g>');
      if (opts.showDeg) {
        var txt = G.directed ? 'd⁺=' + GR.outDeg(G, v) + ' d⁻=' + GR.inDeg(G, v) : 'd=' + GR.degree(G, v);
        out.push('<text class="gf-deg" x="' + r1(p.x + R + 2) + '" y="' + r1(p.y - R + 2) + '">' + txt + '</text>');
      }
    });
    out.push('</svg>');
    return out.join('');
  }

  function matrixHTML(G, opts) {
    opts = opts || {};
    var M = opts.weighted ? GR.weightMatrix(G, { zeroDiag: opts.zeroDiag !== false }) : GR.adjMatrix(G);
    var h = '<table class="gf-matrix"><thead><tr><th></th>' +
      G.vertices.map(function (v) { return '<th>' + esc(v) + '</th>'; }).join('') + '</tr></thead><tbody>';
    M.forEach(function (row, i) {
      h += '<tr><th>' + esc(G.vertices[i]) + '</th>';
      row.forEach(function (x, j) {
        var on = opts.plain ? false : (opts.weighted ? (x !== Infinity && i !== j) : x > 0);
        var hl = opts.hl && opts.hl.i === i && opts.hl.j === j ? ' hl' : '';
        h += '<td class="' + (on ? 'on' : '') + hl + '" data-i="' + i + '" data-j="' + j + '">' + (opts.weighted ? fmtW(x) : x) + '</td>';
      });
      h += '</tr>';
    });
    return h + '</tbody></table>';
  }
  function listsHTML(G) {
    var L = GR.adjLists(G);
    return '<table class="gf-lists"><tbody>' + G.vertices.map(function (v) {
      var cells = L[v].map(function (x) { return '<span class="cell">' + esc(x) + '</span>'; }).join('<span class="lnk">→</span>');
      return '<tr><th>' + esc(v) + '</th><td>' + (cells || '<span class="nil">∅</span>') + '</td></tr>';
    }).join('') + '</tbody></table>';
  }
  function degreeTableHTML(G) {
    var h = '<table class="gf-deg-table"><thead><tr><th>Sommet</th>';
    if (G.directed) h += '<th>d⁺</th><th>d⁻</th><th>d</th>'; else h += '<th>d(v)</th>';
    h += '</tr></thead><tbody>';
    G.vertices.forEach(function (v) {
      h += '<tr><th>' + esc(v) + '</th>';
      if (G.directed) h += '<td>' + GR.outDeg(G, v) + '</td><td>' + GR.inDeg(G, v) + '</td><td>' + GR.degree(G, v) + '</td>';
      else h += '<td>' + GR.degree(G, v) + '</td>';
      h += '</tr>';
    });
    return h + '</tbody></table>';
  }
  return { svg: svg, matrixHTML: matrixHTML, listsHTML: listsHTML, degreeTableHTML: degreeTableHTML, esc: esc, fmtW: fmtW, layout: layout };
});

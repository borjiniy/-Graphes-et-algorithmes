/* editor.js — éditeur interactif de graphes (outil de visualisation) + analyse expliquée.
 * Rendu via GF.render.svg ; événements pointeur (souris et tactile). Aucune dépendance.
 */
(function (root) {
  'use strict';
  var GF = root.GF = root.GF || {};
  var GR = GF.graph, RD = GF.render, esc = GF.u.esc;

  /* ---------- analyse : texte expliqué, mathématiquement fondé sur graphlib ---------- */
  function analyse(G, sel) {
    var out = [], n = GR.n(G), m = GR.m(G), set = GF.u.set;
    out.push({ t: 'Ordre et taille', h: 'n = |V| = ' + n + ' sommet(s), m = ' + m + (G.directed ? ' arc(s)' : ' arête(s)') + '.' });
    if (!n) return out;
    var simple = GR.isSimple(G);
    out.push({ t: 'Graphe simple ?', h: simple ? 'Oui : ni boucle, ni ' + (G.directed ? 'arcs multiples.' : 'arêtes multiples.') : 'Non : il y a une boucle ou des liaisons multiples. La formule de densité et les théorèmes du cours supposent un graphe simple (ou précisent la convention).' });

    if (!G.directed) {
      var ds = GR.degrees(G), sum = GR.sumDegrees(G);
      out.push({ t: 'Somme des degrés', h: 'Σ d(v) = ' + sum + ' = 2|E| = 2 × ' + m + ' (théorème de la somme des degrés, une boucle comptant 2). Sommets de degré impair : ' + set(GR.oddVertices(G)) + ' — leur nombre (' + GR.oddVertices(G).length + ') est pair, comme le dit le corollaire.' });
      var reg = GR.regularity(G);
      out.push({ t: 'Régularité', h: reg.regular ? 'Tous les sommets ont le même degré : le graphe est ' + reg.k + '-régulier.' : 'Degrés différents : non régulier. Degré du graphe (maximum) : ' + GR.maxDegree(G) + '.' });
      var dens = GR.density(G);
      out.push({ t: 'Densité', h: dens === null ? 'Non définie ici : la formule D = 2m / (n(n − 1)) du cours suppose un graphe simple non orienté d’ordre n ≥ 2.' : 'D = 2m / (n(n − 1)) = ' + (2 * m) + ' / ' + (n * (n - 1)) + ' ≈ ' + (Math.round(dens * 1000) / 1000) + (GR.isComplete(G) ? ' — le graphe est complet.' : '.') });
      var comps = GR.components(G);
      out.push({ t: 'Connexité', h: comps.length === 1 ? 'Connexe : une seule composante.' : 'Non connexe : ' + comps.length + ' composantes connexes : ' + comps.map(set).join(' ; ') + '.' });
      if (comps.length === 1 && n <= 12) out.push({ t: 'Diamètre', h: 'Plus longue des distances entre deux sommets : ' + GR.diameter(G) + '.' });
      var e = GR.euler(G);
      var eh = '';
      if (m === 0) eh = 'Aucune arête : question sans objet.';
      else if (!e.connected) eh = 'Le graphe n’est pas connexe : les théorèmes d’Euler du cours (qui supposent G connexe) ne s’appliquent pas, et on ne peut pas tout parcourir d’un seul tenant' + (e.edgesConnected ? ' (ici, seuls des sommets isolés le rendent non connexe : le cours ne traite pas ce cas).' : '.');
      else if (e.kind === 'cycle') eh = 'Connexe et 0 sommet de degré impair : il existe un <b>cycle eulérien</b>, par exemple ' + e.walk.join(' – ') + '.';
      else if (e.kind === 'chain') eh = 'Connexe et exactement 2 sommets de degré impair (' + e.odd.join(', ') + ') : il existe une <b>chaîne eulérienne</b> (pas de cycle), par exemple ' + e.walk.join(' – ') + '.';
      else eh = 'Connexe, mais ' + e.odd.length + ' sommets de degré impair : <b>ni cycle ni chaîne eulérienne</b>.';
      out.push({ t: 'Eulérien ?', h: eh });
      var hm = GR.hamilton(G);
      var hh;
      if (hm.tooBig) hh = 'Graphe trop grand pour la vérification exhaustive de l’application (' + hm.limit + ' sommets maximum).';
      else if (n < 3) hh = 'Pour un cycle hamiltonien il faut en général n ≥ 3 sommets. Chaîne hamiltonienne : ' + (hm.path ? hm.path.join(' – ') : 'aucune') + '.';
      else if (hm.cycle) hh = 'Hamiltonien : le cycle ' + hm.cycle.join(' – ') + ' passe une seule fois par chaque sommet.';
      else hh = 'Pas de cycle hamiltonien' + (hm.path ? ' (mais une chaîne hamiltonienne : ' + hm.path.join(' – ') + ')' : ' ni de chaîne hamiltonienne') + '. Vérification exhaustive faite par l’application.';
      out.push({ t: 'Hamiltonien ?', h: hh });
      var hc = GR.hamiltonConditions(G);
      if (hc.applicable) out.push({ t: 'Conditions suffisantes', h: 'Condition d(u) + d(v) ≥ n pour toute paire non adjacente (diapo 27) : ' + (hc.ore ? 'vérifiée, donc G est hamiltonien.' : 'non vérifiée (' + hc.oreFail.join(' et ') + '), ce qui ne permet pas de conclure : c’est une condition suffisante, non nécessaire.') + (hc.degreeOne.length ? ' Un sommet de degré 1 (' + hc.degreeOne.join(', ') + ') empêche un cycle hamiltonien.' : '') });
    } else {
      var rows = G.vertices.map(function (v) { return v + ' : d⁺ = ' + GR.outDeg(G, v) + ', d⁻ = ' + GR.inDeg(G, v) + ', d = ' + GR.degree(G, v); });
      out.push({ t: 'Demi-degrés', h: rows.join('<br>') + '<br>Vérification : Σ d⁺ = Σ d⁻ = |A| = ' + m + '.' });
      var cf = GR.scc(G);
      out.push({ t: 'Composantes', h: 'Composantes connexes (orientation ignorée) : ' + GR.components(G).map(set).join(' ; ') + '. Composantes fortement connexes : ' + cf.map(set).join(' ; ') + '.' });
      out.push({ t: 'Eulérien / hamiltonien', h: 'Les critères d’Euler du cours concernent les graphes non orientés ; cette application ne les évalue pas pour un graphe orienté.' });
    }
    if (sel && sel.length === 2) {
      var d = GR.distance(G, sel[0], sel[1]), ch = GR.shortestChain(G, sel[0], sel[1]);
      out.push({ t: 'δ(' + sel[0] + ', ' + sel[1] + ')', h: d === Infinity ? 'Aucune ' + (G.directed ? 'chemin' : 'chaîne') + ' : δ = ∞ (convention hors cours).' : 'Distance = ' + d + ' ; ' + (G.directed ? 'chemin' : 'chaîne') + ' la plus courte : ' + ch.join(' – ') + '.' });
    }
    return out;
  }

  /* ---------- éditeur ---------- */
  function Editor(host, opts) {
    opts = opts || {};
    var self = this;
    this.host = host;
    this.G = GR.make({ vertices: [], edges: [] });
    this.mode = 'move';       // 'move' | 'vertex' | 'edge' | 'delete'
    this.selected = [];       // sommets sélectionnés (max 2) pour la distance
    this.pending = null;      // sommet de départ d'une arête en cours
    this.onChange = opts.onChange || function () {};
    this.W = 640; this.H = 400;
    this.hist = [];
    this.nextLabel = 0;
    host.classList.add('gf-editor');
    host.innerHTML = '<svg class="gf-ed-svg" viewBox="0 0 ' + this.W + ' ' + this.H + '" role="application" aria-label="Zone de dessin du graphe" tabindex="0"></svg>';
    this.svg = host.querySelector('svg');
    this._bind();
    this.render();
  }
  var P = Editor.prototype;
  P.snapshot = function () { this.hist.push(JSON.stringify({ G: this.G, next: this.nextLabel })); if (this.hist.length > 60) this.hist.shift(); };
  P.undo = function () {
    if (!this.hist.length) return;
    var s = JSON.parse(this.hist.pop());
    this.G = GR.make({ directed: s.G.directed, weighted: s.G.weighted, vertices: s.G.vertices, edges: s.G.edges, pos: s.G.pos });
    this.nextLabel = s.next; this.pending = null; this.selected = [];
    this.render(); this.onChange(this.G);
  };
  P.labelFor = function (i) {
    var L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return i < 26 ? L.charAt(i) : L.charAt(i % 26) + Math.floor(i / 26);
  };
  P.freshLabel = function () {
    var l;
    do { l = this.labelFor(this.nextLabel++); } while (this.G.vertices.indexOf(l) >= 0);
    return l;
  };
  P.setGraph = function (G) {
    this.snapshot();
    this.G = GR.clone(G);
    if (!Object.keys(this.G.pos || {}).length || this.G.vertices.some(function (v) { return !G.pos[v]; })) this.G.pos = GR.layoutCircle(this.G.vertices, this.W / 2, this.H / 2, Math.min(this.W, this.H) / 2 - 50);
    else this._fit();
    this.nextLabel = this.G.vertices.length;
    this.pending = null; this.selected = [];
    this.render(); this.onChange(this.G);
  };
  P._fit = function () { // recadre les positions dans la zone
    var G = this.G, minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    G.vertices.forEach(function (v) { var p = G.pos[v]; minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); });
    if (!G.vertices.length) return;
    var w = Math.max(maxX - minX, 1), h = Math.max(maxY - minY, 1), s = Math.min((this.W - 120) / w, (this.H - 120) / h, 2.2);
    var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, self = this;
    G.vertices.forEach(function (v) { var p = G.pos[v]; G.pos[v] = { x: self.W / 2 + (p.x - cx) * s, y: self.H / 2 + (p.y - cy) * s }; });
  };
  P.setMode = function (m) { this.mode = m; this.pending = null; this.render(); };
  P.setDirected = function (d) { this.snapshot(); this.G.directed = !!d; this.render(); this.onChange(this.G); };
  P.setWeighted = function (w) {
    this.snapshot(); this.G.weighted = !!w;
    this.G.edges.forEach(function (e) { if (w && (e.w === undefined || e.w === null)) e.w = 1; if (!w) delete e.w; });
    this.render(); this.onChange(this.G);
  };
  P.clear = function () { this.snapshot(); this.G = GR.make({ directed: this.G.directed, weighted: this.G.weighted, vertices: [], edges: [] }); this.nextLabel = 0; this.pending = null; this.selected = []; this.render(); this.onChange(this.G); };
  P.toPoint = function (ev) {
    var r = this.svg.getBoundingClientRect(), sx = this.W / r.width, sy = this.H / r.height;
    return { x: (ev.clientX - r.left) * sx, y: (ev.clientY - r.top) * sy };
  };
  P.vertexAt = function (pt) {
    var G = this.G, best = null, bd = 26 * 26;
    G.vertices.forEach(function (v) { var p = G.pos[v], d = (p.x - pt.x) * (p.x - pt.x) + (p.y - pt.y) * (p.y - pt.y); if (d <= bd) { bd = d; best = v; } });
    return best;
  };
  P.edgeAt = function (ev) {
    var el = root.document.elementFromPoint(ev.clientX, ev.clientY);
    var id = el && el.getAttribute && el.getAttribute('data-e');
    return id ? Number(id) : null;
  };
  P.addEdge = function (u, v) {
    var G = this.G;
    if (!G.directed && G.edges.some(function (e) { return (e.u === u && e.v === v) || (e.u === v && e.v === u); }) && u !== v) {
      this.note = 'Cette arête existe déjà : un graphe simple n’a qu’une arête par paire. (Vous pouvez en ajouter une seconde en cliquant de nouveau : le graphe ne sera plus simple.)';
    }
    this.snapshot();
    var id = G.edges.reduce(function (a, e) { return Math.max(a, e.id); }, 0) + 1, e = { u: u, v: v, id: id };
    if (G.weighted) { var w = root.prompt ? root.prompt('Poids de ' + (G.directed ? 'l’arc (' : 'l’arête {') + u + ', ' + v + (G.directed ? ')' : '}') + ' :', '1') : '1'; var x = parseFloat(String(w).replace(',', '.')); e.w = isNaN(x) ? 1 : x; }
    G.edges.push(e);
  };
  P._bind = function () {
    var self = this, svg = this.svg, drag = null;
    svg.addEventListener('pointerdown', function (ev) {
      var pt = self.toPoint(ev), v = self.vertexAt(pt), G = self.G;
      self.note = '';
      if (self.mode === 'vertex') {
        if (v === null) { self.snapshot(); var l = self.freshLabel(); G.vertices.push(l); G.pos[l] = { x: pt.x, y: pt.y }; self.render(); self.onChange(G); }
        return;
      }
      if (self.mode === 'delete') {
        if (v !== null) { self.snapshot(); G.vertices = G.vertices.filter(function (x) { return x !== v; }); G.edges = G.edges.filter(function (e) { return e.u !== v && e.v !== v; }); delete G.pos[v]; self.selected = self.selected.filter(function (x) { return x !== v; }); }
        else { var eid = self.edgeAt(ev); if (eid !== null) { self.snapshot(); G.edges = G.edges.filter(function (e) { return e.id !== eid; }); } else return; }
        self.render(); self.onChange(G); return;
      }
      if (self.mode === 'edge') {
        if (v === null) { self.pending = null; self.render(); return; }
        if (self.pending === null) { self.pending = v; self.render(); }
        else { self.addEdge(self.pending, v); self.pending = null; self.render(); self.onChange(G); }
        return;
      }
      /* mode déplacement / sélection */
      if (v !== null) {
        drag = { v: v, moved: false, sx: pt.x, sy: pt.y };
        try { svg.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ }
        self.snapshotPending = true;
      } else { self.selected = []; self.render(); self.onChange(G); }
    });
    svg.addEventListener('pointermove', function (ev) {
      if (!drag) return;
      var pt = self.toPoint(ev);
      if (!drag.moved && Math.abs(pt.x - drag.sx) + Math.abs(pt.y - drag.sy) < 4) return;
      if (!drag.moved) { self.snapshot(); drag.moved = true; }
      self.G.pos[drag.v] = { x: Math.max(20, Math.min(self.W - 20, pt.x)), y: Math.max(20, Math.min(self.H - 20, pt.y)) };
      self.render(true);
    });
    function up() {
      if (!drag) return;
      if (!drag.moved) { // simple clic : sélection pour la distance
        var i = self.selected.indexOf(drag.v);
        if (i >= 0) self.selected.splice(i, 1); else { self.selected.push(drag.v); if (self.selected.length > 2) self.selected.shift(); }
      }
      drag = null; self.render(); self.onChange(self.G);
    }
    svg.addEventListener('pointerup', up);
    svg.addEventListener('pointercancel', up);
  };
  P.render = function (light) {
    var G = this.G, hl = {}, self = this;
    this.selected.forEach(function (v) { hl[v] = 'cur'; });
    if (this.pending) hl[this.pending] = 'hl';
    /* repère fixe W×H pour que le glisser-déposer reste exact */
    if (!G.vertices.length) { this.svg.innerHTML = '<text class="gf-hint" x="' + this.W / 2 + '" y="' + this.H / 2 + '" text-anchor="middle">Choisissez « Sommet » puis cliquez ici pour poser des sommets</text>'; return; }
    this.svg.setAttribute('viewBox', '0 0 ' + this.W + ' ' + this.H);
    var wrapped = RD.svg(G, { hlV: hl, showDeg: true, hit: true, alt: 'Graphe en cours d’édition', fixedBox: [0, 0, this.W, this.H] });
    this.svg.innerHTML = wrapped.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  };

  GF.editor = { Editor: Editor, analyse: analyse };
  if (typeof module === 'object' && module.exports) module.exports = GF.editor;
})(typeof self !== 'undefined' ? self : (typeof global !== 'undefined' ? global : this));

/* app-practice.js — rendu des questions, exercices, révision espacée, révision rapide, examen. */
(function (root) {
  'use strict';
  var GF = root.GF, GR = GF.graph, RD = GF.render, U = GF.u, X = GF.ex, S = GF.store, C = GF.content, A = GF.app, esc = U.esc;
  var doc = root.document, uid = 0;

  A.cleanups = [];
  A.onLeave = function (fn) { A.cleanups.push(fn); };
  A.runCleanups = function () { var c = A.cleanups; A.cleanups = []; c.forEach(function (f) { try { f(); } catch (e) { /* ignore */ } }); };

  /* ================= montage d'une question =================
   * mountQ(q, el) -> { get(): réponse | undefined, lock(), reveal(): pour 'text' }  */
  function mountQ(q, el) {
    var id = 'q' + (++uid), type = q.type, h = '', self = { };
    function inputName() { return id + 'n'; }
    if (type === 'choice') {
      h = q.options.map(function (o, i) { return '<label class="opt"><input type="radio" name="' + inputName() + '" value="' + i + '"><span>' + o + '</span></label>'; }).join('');
      el.innerHTML = '<div role="radiogroup">' + h + '</div>';
      self.get = function () { var r = A.$('input:checked', el); return r ? +r.value : undefined; };
    } else if (type === 'multi') {
      h = q.options.map(function (o, i) { return '<label class="opt"><input type="checkbox" name="' + inputName() + '" value="' + i + '"><span>' + o + '</span></label>'; }).join('');
      el.innerHTML = '<p class="sub">Plusieurs réponses possibles.</p>' + h;
      self.get = function () { return A.$$('input:checked', el).map(function (r) { return +r.value; }); };
    } else if (type === 'tf') {
      h = '<div role="radiogroup" aria-label="Vrai ou faux"><label class="opt"><input type="radio" name="' + inputName() + 'v" value="1"><span>Vrai</span></label><label class="opt"><input type="radio" name="' + inputName() + 'v" value="0"><span>Faux</span></label></div>';
      if (q.justOptions) h += '<p><b>Justification :</b></p>' + q.justOptions.map(function (o, i) { return '<label class="opt"><input type="radio" name="' + inputName() + 'j" value="' + i + '"><span>' + o + '</span></label>'; }).join('');
      el.innerHTML = h;
      self.get = function () {
        var v = A.$('input[name=' + inputName() + 'v]:checked', el), j = A.$('input[name=' + inputName() + 'j]:checked', el);
        if (!v) return undefined;
        if (q.justOptions && !j) return undefined;
        return { v: v.value === '1', j: j ? +j.value : null };
      };
    } else if (type === 'num') {
      el.innerHTML = '<input type="text" inputmode="decimal" autocomplete="off" aria-label="Votre réponse numérique" size="14"> ' + esc(q.unit || '');
      self.get = function () { var v = A.$('input', el).value.trim(); return v === '' ? undefined : v; };
    } else if (type === 'set') {
      el.innerHTML = '<input type="text" autocomplete="off" aria-label="Sommets séparés par des virgules" placeholder="ex. A, C, D  (ou « aucun »)" size="26">';
      self.get = function () { var v = A.$('input', el).value.trim(); return v === '' ? undefined : v; };
    } else if (type === 'walk') {
      el.innerHTML = '<input type="text" autocomplete="off" aria-label="Suite de sommets" placeholder="ex. A-B-C-A" size="30"><p class="sub">Sommets séparés par des tirets.</p>';
      self.get = function () { var v = A.$('input', el).value.trim(); return v === '' ? undefined : v; };
    } else if (type === 'edges') {
      el.innerHTML = '<textarea aria-label="Liste des arêtes" placeholder="ex. A-B, A-C, B-C' + (q.graph && q.graph.directed ? '  (A-B désigne l’arc (A, B))' : '') + '" style="min-height:4rem"></textarea>';
      self.get = function () { var v = A.$('textarea', el).value.trim(); return v === '' ? undefined : v; };
    } else if (type === 'matrix') {
      var N = q.vertices.length, st = []; for (var i = 0; i < N; i++) { st.push([]); for (var j = 0; j < N; j++) st[i].push(0); }
      h = '<div class="mx"><table class="gf-matrix"><thead><tr><th></th>' + q.vertices.map(function (v) { return '<th>' + esc(v) + '</th>'; }).join('') + '</tr></thead><tbody>';
      for (i = 0; i < N; i++) { h += '<tr><th>' + esc(q.vertices[i]) + '</th>'; for (j = 0; j < N; j++) h += '<td class="cell-btn"><button type="button" class="small ghost" data-i="' + i + '" data-j="' + j + '" aria-label="Ligne ' + esc(q.vertices[i]) + ', colonne ' + esc(q.vertices[j]) + ' : 0">0</button></td>'; h += '</tr>'; }
      el.innerHTML = h + '</tbody></table></div><p class="sub">Cliquez sur une case pour la faire passer de 0 à 1.</p>';
      A.$$('button[data-i]', el).forEach(function (b) {
        b.onclick = function () {
          var a = +b.getAttribute('data-i'), c = +b.getAttribute('data-j'); st[a][c] = st[a][c] ? 0 : 1;
          b.textContent = st[a][c]; b.setAttribute('aria-label', 'Ligne ' + q.vertices[a] + ', colonne ' + q.vertices[c] + ' : ' + st[a][c]);
          b.parentNode.className = 'cell-btn' + (st[a][c] ? ' on' : '');
        };
      });
      self.get = function () { return st; };
    } else if (type === 'wmatrix') {
      var N2 = q.vertices.length;
      h = '<div class="mx"><table class="gf-matrix"><thead><tr><th></th>' + q.vertices.map(function (v) { return '<th>' + esc(v) + '</th>'; }).join('') + '</tr></thead><tbody>';
      for (var a = 0; a < N2; a++) { h += '<tr><th>' + esc(q.vertices[a]) + '</th>'; for (var b2 = 0; b2 < N2; b2++) h += '<td><input type="text" inputmode="decimal" data-i="' + a + '" data-j="' + b2 + '" aria-label="Ligne ' + esc(q.vertices[a]) + ', colonne ' + esc(q.vertices[b2]) + '"></td>'; h += '</tr>'; }
      el.innerHTML = h + '</tbody></table></div><p class="sub">Écrivez <span class="kbd">inf</span> (ou ∞) quand il n’y a pas d’arête ou d’arc.</p>';
      self.get = function () {
        var m = [], i2, j2, any = false;
        for (i2 = 0; i2 < N2; i2++) { m.push([]); for (j2 = 0; j2 < N2; j2++) { var v = A.$('input[data-i="' + i2 + '"][data-j="' + j2 + '"]', el).value.trim(); if (v) any = true; m[i2].push(v); } }
        return any ? m : undefined;
      };
    } else if (type === 'lists') {
      h = '<div class="lists-in">' + q.vertices.map(function (v) { return '<label for="' + id + 'l' + esc(v) + '">' + esc(v) + ' →</label><input type="text" id="' + id + 'l' + esc(v) + '" data-v="' + esc(v) + '" autocomplete="off" placeholder="voisins séparés par des virgules">'; }).join('') + '</div>';
      el.innerHTML = h;
      self.get = function () { var o = {}, any = false; A.$$('input[data-v]', el).forEach(function (i3) { o[i3.getAttribute('data-v')] = i3.value; if (i3.value.trim()) any = true; }); return any ? o : {}; };
    } else if (type === 'composite') {
      var subs = [];
      el.innerHTML = q.parts.map(function (p, k) { return '<div class="card" data-part="' + k + '"><h5>Partie ' + (k + 1) + '</h5><div class="pp"></div><div class="pb"></div></div>'; }).join('');
      q.parts.forEach(function (p, k) {
        var host = A.$('[data-part="' + k + '"]', el);
        A.$('.pp', host).innerHTML = p.prompt;
        subs.push(mountQ(p, A.$('.pb', host)));
      });
      self.get = function () { return subs.map(function (s) { return s.get(); }); };
      self.lock = function () { subs.forEach(function (s) { if (s.lock) s.lock(); }); };
    } else if (type === 'text') {
      el.innerHTML = '<textarea aria-label="Votre réponse rédigée" placeholder="Rédigez votre réponse avec vos mots…"></textarea><div class="selfgrade"></div>';
      var revealed = false;
      self.reveal = function () {
        if (revealed) return;
        revealed = true;
        A.$('.selfgrade', el).innerHTML = '<div class="hint"><b>Réponse type</b>' + q.model + '</div><p><b>Auto-évaluation :</b> cochez les critères que votre réponse remplit réellement.</p>' + q.rubric.map(function (r, i) { return '<label class="opt"><input type="checkbox" data-r="' + i + '"><span>' + r + '</span></label>'; }).join('');
      };
      self.isRevealed = function () { return revealed; };
      self.get = function () { if (!revealed) return undefined; return A.$$('input[data-r]:checked', el).length; };
      self.hasText = function () { return A.$('textarea', el).value.trim().length > 0; };
    }
    if (!self.lock) self.lock = function () { A.$$('input,textarea,button', el).forEach(function (n2) { n2.disabled = true; }); };
    self.type = type;
    return self;
  }
  A.mountQ = mountQ;

  function qFigures(q) {
    var h = '';
    if (q.graph) h += A.fig(q.graph, q.gopts, q.caption && !q.graph2 ? q.caption : '');
    if (q.graph2) h = '<div class="figs">' + '<figure>' + RD.svg(q.graph, q.gopts || {}) + '<figcaption>G</figcaption></figure><figure>' + RD.svg(q.graph2, q.gopts2 || {}) + '<figcaption>H</figcaption></figure></div>' + (q.caption ? '<p class="sub">' + q.caption + '</p>' : '');
    return h;
  }

  function altExplanation(q, n) {
    var nn = C.byId[q.notion], alts = nn && nn.alt ? nn.alt : [];
    var steps = alts.map(function (a) { return '<p><b>Autre façon de voir :</b></p>' + a; });
    if (q.graph) {
      var G = q.graph;
      steps.push('<p><b>Autre représentation du même graphe :</b> degrés et ' + (G.directed ? 'listes d’adjacence' : 'matrice d’adjacence') + '.</p>' + A.fig(G, { show: ['deg', G.directed ? 'lists' : 'matrix'] }));
    }
    if (!steps.length) steps.push('<p>Reprenez la définition de la notion dans l’onglet « Cours », puis essayez la question sur un graphe très petit (3 ou 4 sommets) pour voir ce qui se passe.</p>');
    return steps[n % steps.length];
  }

  /* ================= une question complète =================
   * opts : { onDone(res), noRecord, label } */
  function runOne(q, host, opts) {
    opts = opts || {};
    if (!q) { host.innerHTML = '<div class="notice">Question indisponible.</div>'; return null; }
    var lv = q.level, nt = A.notion(q.notion), hintN = 0, altN = 0, recorded = false, finished = false, tries = 0;
    host.innerHTML = '<div class="card qcard"><div class="row"><span class="chip">' + (opts.label || (q.notion.toUpperCase() + ' · ' + esc(nt.short))) + '</span><span class="chip">Niveau ' + lv + '</span>' + (q.challenge ? '<span class="chip">Mini-défi</span>' : '') + (q.raw && q.raw.transfer ? '<span class="chip">Transfert</span>' : '') + (q.raw && q.raw.src === 'course' ? '<span class="chip">Question du cours</span>' : '') + '</div><div class="qp">' + q.prompt + '</div>' + qFigures(q) + '<div class="qb"></div><div class="qh"></div><div class="row qbtns" style="margin-top:.6rem"><button class="pri" data-a="check">Vérifier</button><button class="ghost" data-a="hint">Indice</button><button class="ghost" data-a="alt">Expliquer autrement</button><button class="ghost" data-a="sol">Voir la correction</button></div><div class="qf" aria-live="polite"></div></div>';
    var m = mountQ(q, A.$('.qb', host)), fb = A.$('.qf', host), hh = A.$('.qh', host);
    var bHint = A.$('[data-a=hint]', host), bCheck = A.$('[data-a=check]', host);
    if (!(q.hints && q.hints.length) || opts.noHints) bHint.hidden = true;
    if (opts.noHints) { A.$('[data-a=alt]', host).hidden = true; }
    function done(res) { if (finished) return; finished = true; m.lock(); bCheck.disabled = true; A.$('[data-a=sol]', host).disabled = true; if (opts.onDone) opts.onDone(res); }
    function rec(score) { if (recorded || opts.noRecord) return; recorded = true; S.record(q, score); }
    bHint.onclick = function () {
      if (hintN >= q.hints.length) { hh.insertAdjacentHTML('beforeend', '<div class="hint">Vous avez vu tous les indices. Essayez de répondre, ou affichez la correction.</div>'); return; }
      hh.insertAdjacentHTML('beforeend', '<div class="hint"><b>Indice ' + (hintN + 1) + ' :</b> ' + q.hints[hintN] + '</div>');
      hintN++; if (hintN >= 1 && hintN < q.hints.length) bHint.textContent = 'Indice supplémentaire'; if (hintN >= q.hints.length) bHint.disabled = true;
    };
    A.$('[data-a=alt]', host).onclick = function () { hh.insertAdjacentHTML('beforeend', '<div class="hint">' + altExplanation(q, altN++) + '</div>'); };
    A.$('[data-a=sol]', host).onclick = function () {
      if (!recorded) rec(0);
      var s = q.solution ? q.solution() : '';
      fb.innerHTML = '<div class="fb half"><b>Correction</b>' + s + '<p class="sub">Cette question est comptée comme « à revoir » : elle reviendra dans vos révisions.</p></div>';
      done({ ok: false, score: 0, revealed: true });
    };
    bCheck.onclick = function () {
      if (q.type === 'text') {
        if (!m.isRevealed()) { if (!m.hasText()) { fb.innerHTML = '<div class="fb half">Rédigez d’abord votre réponse, puis comparez-la à la réponse type.</div>'; return; } m.reveal(); bCheck.textContent = 'Valider mon auto-évaluation'; fb.innerHTML = ''; return; }
      }
      var ans = m.get();
      if (ans === undefined) { fb.innerHTML = '<div class="fb half">Répondez d’abord (tous les champs nécessaires).</div>'; return; }
      var res = q.check(ans); tries++;
      rec(res.score);
      if (res.ok) {
        fb.innerHTML = '<div class="fb ok"><b>Correct.</b>' + (tries > 1 ? ' (après ' + tries + ' essais)' : '') + (res.msg ? ' ' + res.msg : '') + '<details><summary>Voir l’explication détaillée</summary>' + (q.solution ? q.solution() : '') + '</details></div>';
        done({ ok: true, score: res.score, tries: tries });
      } else {
        fb.innerHTML = '<div class="fb bad"><b>' + (res.score > 0 ? 'Partiellement juste.' : 'Pas tout à fait.') + '</b>' + (res.msg ? ' ' + esc(res.msg) : '') + '<p class="sub">Corrigez et vérifiez à nouveau, demandez un indice, ou affichez la correction.</p></div>';
        bCheck.textContent = 'Vérifier à nouveau';
      }
    };
    return m;
  }
  A.runOne = runOne;

  /* ================= série de questions ================= */
  function runSession(host, qs, o) {
    o = o || {};
    var i = 0, results = [];
    host.innerHTML = '<div class="card"><div class="row"><div class="grow"><b id="sp"></b></div></div><div class="bar" style="margin-top:.4rem"><i id="spb" style="width:0"></i></div></div><div id="sq"></div><div id="sn"></div>';
    function show() {
      if (i >= qs.length) return summary();
      A.$('#sp', host).textContent = (o.title || 'Série') + ' — question ' + (i + 1) + ' / ' + qs.length;
      A.$('#spb', host).style.width = Math.round(100 * i / qs.length) + '%';
      A.$('#sn', host).innerHTML = '';
      var q = qs[i];
      runOne(q, A.$('#sq', host), { onDone: function (res) {
        results.push({ q: q, res: res });
        A.$('#sn', host).innerHTML = '<p><button class="pri" id="nx">' + (i + 1 >= qs.length ? 'Voir le bilan' : 'Question suivante') + '</button></p>';
        A.$('#nx', host).onclick = function () { i++; show(); };
        A.$('#nx', host).focus();
      } });
    }
    function summary() {
      var ok = results.filter(function (r) { return r.res.ok; }).length, tot = results.length;
      var wrong = results.filter(function (r) { return !r.res.ok; });
      var byN = {}; wrong.forEach(function (r) { byN[r.q.notion] = (byN[r.q.notion] || 0) + 1; });
      var tags = {}; wrong.forEach(function (r) { if (r.q.tag) tags[r.q.tag] = 1; });
      A.$('#sp', host).textContent = 'Bilan';
      A.$('#spb', host).style.width = '100%';
      A.$('#sq', host).innerHTML = '<div class="card"><div class="stat"><div><b>' + ok + ' / ' + tot + '</b>réussies</div><div><b>' + (tot ? Math.round(100 * ok / tot) : 0) + ' %</b>de réussite</div></div>' +
        (Object.keys(byN).length ? '<h3>Notions à revoir</h3><ul>' + Object.keys(byN).map(function (k) { return '<li><a href="#/n/' + k + '">' + k.toUpperCase() + ' — ' + esc(A.notion(k).title) + '</a> (' + byN[k] + ' erreur' + (byN[k] > 1 ? 's' : '') + ')</li>'; }).join('') + '</ul>' : '<p class="ok"><b>Tout est juste.</b> Ces notions seront espacées dans vos révisions.</p>') +
        (Object.keys(tags).length ? '<h3>Erreurs à surveiller</h3><ul>' + Object.keys(tags).map(function (t) { return '<li>' + esc(A.tagLabel(t)) + '</li>'; }).join('') + '</ul>' : '') + '</div>';
      A.$('#sn', host).innerHTML = '<p class="row">' + (o.again ? '<button class="pri" id="again">Nouvelle série</button>' : '') + '<a class="btn" href="#/">Tableau de bord</a></p>';
      if (o.again) A.$('#again', host).onclick = o.again;
    }
    show();
  }
  A.runSession = runSession;

  /* construit une série de révision */
  A.buildSession = function (ids, count, o) {
    o = o || {};
    var out = [], seen = {}, d = S.data(), now = Date.now();
    function push(q) { if (q && !seen[q.key]) { seen[q.key] = 1; out.push(q); return true; } return false; }
    /* 1) reposer les questions ratées (exactement les mêmes) */
    if (!o.noWrong) ids.forEach(function (id) {
      var n = d.notions[id]; if (!n) return;
      Object.keys(n.done).filter(function (k) { return !n.done[k].ok && k.indexOf('soc:') !== 0 && k.indexOf('fey:') !== 0; }).sort(function (a, b) { return n.done[a].at - n.done[b].at; }).slice(0, 2).forEach(function (k) { if (out.length < Math.ceil(count / 2)) { var q; try { q = X.fromKey(k); } catch (e) { q = null; } push(q); } });
    });
    /* 2) compléter avec des variantes, en tournant sur les notions */
    var tries = 0, rr = 0;
    while (out.length < count && tries < count * 12 && ids.length) {
      var id2 = ids[rr++ % ids.length], lv = o.level || Math.min(3, Math.max(1, S.level(id2) + (tries % 5 === 4 ? 1 : 0)));
      if (!A.hasQuestions(id2)) { tries++; continue; }
      push(X.pick1(id2, lv, { exclude: seen }) || X.pick1(id2, 1, { exclude: seen }));
      tries++;
    }
    return out;
  };

  /* ================= exercices ================= */
  A.handlers.pratique = function (id, mode) {
    if (!id) {
      var h = '<h1>Exercices</h1><p class="sub">Choisissez une notion. Les questions sont tirées au hasard à chaque fois (graphes différents), avec des corrections calculées.</p><div class="grid">';
      A.ids.forEach(function (i) { var n = A.notion(i); h += '<a class="tile" href="#/pratique/' + i + '"><small>' + i.toUpperCase() + ' · niveau ' + S.level(i) + '</small><h3>' + esc(n.title) + '</h3>' + A.chip(i) + A.bar(S.mastery(i)) + '</a>'; });
      return A.set(h + '</div>');
    }
    var n = A.notion(id);
    if (!A.ids.length || A.ids.indexOf(id) < 0) return A.set('<p>Notion inconnue.</p>');
    var hd = '<p><a href="#/pratique">← Toutes les notions</a> · <a href="#/n/' + id + '">Fiche de cours</a></p><h1>' + id.toUpperCase() + ' — ' + esc(n.title) + '</h1>';
    if (!A.hasQuestions(id)) return A.set(hd + '<div class="notice">Pas encore d’exercices pour cette notion.</div>');
    if (!mode) {
      return A.set(hd + '<div class="grid"><div class="card"><strong>Adaptatif</strong><p class="sub">Le niveau monte si vous réussissez (actuellement : niveau ' + S.level(id) + ').</p><a class="btn pri" href="#/pratique/' + id + '/adaptatif">Lancer</a></div><div class="card"><strong>Série progressive</strong><p class="sub">6 questions, du niveau 1 au niveau 3.</p><a class="btn pri" href="#/pratique/' + id + '/serie">Lancer</a></div><div class="card"><strong>Définitions à expliquer</strong><p class="sub">Réponses rédigées, auto-évaluées.</p><a class="btn" href="#/pratique/' + id + '/definitions">Lancer</a></div></div>');
    }
    A.set(hd + '<div id="run"></div>');
    var host = A.$('#run');
    if (mode === 'serie') {
      var go = function () { runSession(host, X.progressive(id, 2), { title: 'Série progressive', again: go }); }; go();
    } else if (mode === 'definitions') {
      var specs = X.textSpecs(id);
      if (!specs.length) return host.innerHTML = '<div class="notice">Pas encore de définition à expliquer pour cette notion.</div>';
      var go2 = function () { runSession(host, specs.map(function (s) { return X.fromKey(s.id); }), { title: 'Définitions à expliquer', again: go2 }); }; go2();
    } else {
      /* adaptatif : une question à la fois, niveau tiré du stockage */
      var seen = {}, count = 0;
      var next = function () {
        var lvl = S.level(id), q = X.pick1(id, lvl, { exclude: seen }) || X.pick1(id, 1, { exclude: seen });
        if (!q) return host.innerHTML = '<div class="notice">Vous avez fait le tour des questions de ce niveau : repassez plus tard.</div>';
        seen[q.key] = 1; count++;
        host.innerHTML = '<div class="card"><b>Question ' + count + '</b> · niveau actuel ' + lvl + ' · maîtrise ' + Math.round(100 * S.mastery(id)) + ' %</div><div id="aq"></div><div id="an"></div>';
        runOne(q, A.$('#aq', host), { onDone: function (res) {
          var nl = S.level(id);
          A.$('#an', host).innerHTML = '<p>' + (nl > lvl ? '<b class="ok">Niveau supérieur : ' + nl + '.</b> ' : nl < lvl ? 'On revient au niveau ' + nl + ' pour consolider. ' : '') + '<button class="pri" id="nx">Question suivante</button> <a class="btn" href="#/pratique/' + id + '">Terminer</a></p>';
          A.$('#nx', host).onclick = next; A.$('#nx', host).focus();
        } });
      };
      next();
    }
  };

  /* ================= révision espacée ================= */
  A.handlers.revision = function () {
    var ids = A.ids.filter(A.hasQuestions), d = S.data(), due = S.dueList(ids), weak = S.weakTags(6);
    var started = ids.filter(function (i) { return d.notions[i] && d.notions[i].attempts > 0; });
    var h = '<h1>Révision</h1><p class="sub">Les questions ratées reviennent tout de suite ; les réussites reviennent après 1, 3, 7, 14 puis 30 jours (système de boîtes de Leitner). Les questions sont variées à chaque fois.</p>';
    h += '<div class="grid"><div class="card"><strong>À réviser maintenant</strong><p class="sub">' + (due.length ? due.map(function (i) { return i.toUpperCase(); }).join(', ') : 'Rien d’échu pour le moment.') + '</p><button class="pri" id="rdue" ' + (due.length ? '' : 'disabled') + '>Lancer (8 questions)</button></div>';
    h += '<div class="card"><strong>Un chapitre précis</strong><p><select id="rsel" aria-label="Notion">' + ids.map(function (i) { return '<option value="' + i + '">' + i.toUpperCase() + ' — ' + esc(A.notion(i).short) + '</option>'; }).join('') + '</select></p><button class="pri" id="rone">Lancer (8 questions)</button></div>';
    h += '<div class="card"><strong>Tout le cours</strong><p class="sub">15 questions réparties sur toutes les notions.</p><button class="pri" id="rall">Lancer</button></div>';
    h += '<div class="card"><strong>Test de synthèse</strong><p class="sub">Une question par notion (niveau 2 ou plus), sans indice à l’écran : pour vous tester honnêtement, utilisez plutôt le mode Examen.</p><button class="pri" id="rsyn">Lancer</button></div></div><div id="run"></div>';
    h += '<h2>Bilan de vos lacunes</h2>';
    if (!started.length) h += '<div class="card"><p class="sub">Aucune donnée pour l’instant : faites quelques exercices et ce bilan se remplira de lui-même (sans données de démonstration).</p></div>';
    else {
      h += '<div class="card"><h3>Erreurs récurrentes</h3>' + (weak.length ? weak.map(function (w) { return '<div class="mist"><div class="w">✗ ' + esc(A.tagLabel(w.tag)) + ' <small class="sub">(' + w.n + ' fois)</small></div><button class="small" data-tag="' + esc(w.tag) + '">Reposer des questions sur ce point</button></div>'; }).join('') : '<p class="sub">Aucune erreur récurrente.</p>') + '</div>';
      var todo = A.ids.filter(function (i) { var s = S.status(i); return s !== 'mastered'; }), nextN = [];
      todo.forEach(function (i) { var n = A.notion(i), pre = (n.prereqs || []).filter(function (p) { return S.status(p) !== 'mastered'; }); if (nextN.length < 4) nextN.push({ id: i, pre: pre }); });
      h += '<div class="card"><h3>Prochaines notions à travailler</h3><ul>' + nextN.map(function (x) { return '<li><a href="#/n/' + x.id + '">' + x.id.toUpperCase() + ' — ' + esc(A.notion(x.id).title) + '</a> ' + A.chip(x.id) + (x.pre.length ? ' <small class="sub">· d’abord : ' + x.pre.map(function (p) { return p.toUpperCase(); }).join(', ') + '</small>' : '') + '</li>'; }).join('') + '</ul></div>';
    }
    A.set(h);
    var host = A.$('#run');
    function launch(qs, title) { if (!qs.length) { host.innerHTML = '<div class="notice">Pas assez de questions disponibles.</div>'; return; } host.scrollIntoView({ block: 'start' }); runSession(host, qs, { title: title }); }
    A.$('#rdue').onclick = function () { launch(A.buildSession(due, 8), 'À réviser'); };
    A.$('#rone').onclick = function () { launch(A.buildSession([A.$('#rsel').value], 8), 'Révision du chapitre'); };
    A.$('#rall').onclick = function () { launch(A.buildSession(ids, 15), 'Tout le cours'); };
    A.$('#rsyn').onclick = function () { launch(ids.map(function (i) { return X.pick1(i, Math.max(2, S.level(i))) || X.pick1(i, 1); }).filter(Boolean), 'Test de synthèse'); };
    A.$$('[data-tag]').forEach(function (b) {
      b.onclick = function () {
        var tag = b.getAttribute('data-tag'), qs = [];
        X.gens.filter(function (g) { return g.tag === tag; }).forEach(function (g) { g.levels.forEach(function (l) { if (qs.length < 6) qs.push(X.fresh(g.id, l)); }); });
        C.notions.forEach(function (n) { (n.qs || []).forEach(function (s) { if (s.tag === tag && s.type !== 'text' && qs.length < 8) qs.push(X.fromKey(s.id)); }); });
        launch(qs, 'Erreur : ' + A.tagLabel(tag));
      };
    });
  };

  /* ================= révision rapide ================= */
  A.handlers.rapide = function (tab) {
    tab = tab || 'fiches';
    var h = '<h1>Révision rapide</h1><p class="sub">Définitions, théorèmes, formules, questions courtes et erreurs fréquentes. Pour approfondir une réponse, ouvrez la correction détaillée.</p><div class="tabs">' + [['fiches', 'Fiches'], ['questions', 'Questions courtes'], ['erreurs', 'Erreurs fréquentes']].map(function (t) { return '<button data-t="' + t[0] + '" class="' + (t[0] === tab ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') + '</div>';
    var withContent = C.notions.map(function (n) { return n.id; });
    h += '<p><label>Périmètre : <select id="scope"><option value="all">Tout le cours</option>' + A.ids.map(function (i) { return '<option value="' + i + '">' + i.toUpperCase() + ' — ' + esc(A.notion(i).short) + '</option>'; }).join('') + '</select></label></p><div id="rq"></div>';
    A.set(h);
    A.$$('.tabs button').forEach(function (b) { b.onclick = function () { A.go('#/rapide/' + b.getAttribute('data-t')); }; });
    var sel = A.$('#scope'), saved = ''; try { saved = root.sessionStorage.getItem('rq-scope') || ''; } catch (e) { saved = ''; }
    if (saved) sel.value = saved;
    function ids() { return sel.value === 'all' ? A.ids : [sel.value]; }
    function render() {
      try { root.sessionStorage.setItem('rq-scope', sel.value); } catch (e) { /* ignore */ }
      var box = A.$('#rq'), L = ids();
      if (tab === 'fiches') {
        var cards = [];
        L.forEach(function (i) { var n = C.byId[i]; if (!n) return; n.recap.defs.forEach(function (d) { cards.push({ f: 'Définition : ' + d.t, b: d.d + (d.slide ? ' <span class="slide-ref">diapo ' + esc(d.slide) + '</span>' : ''), n: i }); }); (n.recap.thms || []).forEach(function (t) { cards.push({ f: 'Théorème : ' + t.t, b: t.s + '<p class="sub">Conditions : ' + t.cond + '</p>', n: i }); }); (n.recap.formulas || []).forEach(function (f) { cards.push({ f: 'Formule : ' + f.t, b: '<span class="mth">' + f.f + '</span>', n: i }); }); });
        if (!cards.length) return box.innerHTML = '<div class="notice">Les fiches de synthèse ne sont pas encore rédigées pour ce périmètre (notions déjà rédigées : ' + (withContent.map(function (x) { return x.toUpperCase(); }).join(', ') || 'aucune') + ').</div>';
        var k = 0, flip = false, order = X.shuffle(X.mulberry32(Date.now() % 1e9), cards), known = 0;
        var draw = function () {
          if (k >= order.length) return box.innerHTML = '<div class="card"><p><b>Paquet terminé.</b> ' + known + ' / ' + order.length + ' fiches sues du premier coup.</p><button class="pri" id="rs">Recommencer</button></div>', A.$('#rs', box).onclick = function () { k = 0; known = 0; draw(); };
          var c = order[k];
          box.innerHTML = '<div class="card"><small class="sub">Fiche ' + (k + 1) + ' / ' + order.length + ' · ' + c.n.toUpperCase() + '</small><h2>' + esc(c.f) + '</h2><div id="back" ' + (flip ? '' : 'hidden') + '>' + c.b + '</div><p class="row"><button class="pri" id="fl">' + (flip ? 'Masquer' : 'Retourner') + '</button><button id="fok" ' + (flip ? '' : 'disabled') + '>Je savais</button><button id="fko" ' + (flip ? '' : 'disabled') + '>À revoir</button></p></div>';
          A.$('#fl', box).onclick = function () { flip = !flip; draw(); };
          A.$('#fok', box).onclick = function () { known++; k++; flip = false; draw(); };
          A.$('#fko', box).onclick = function () { order.push(c); k++; flip = false; draw(); };
        }; draw();
      } else if (tab === 'questions') {
        var qs = A.buildSession(L.filter(A.hasQuestions), 8, { level: 1, noWrong: true });
        if (!qs.length) return box.innerHTML = '<div class="notice">Pas de question disponible pour ce périmètre.</div>';
        var again = function () { runSession(box, A.buildSession(L.filter(A.hasQuestions), 8, { level: 1, noWrong: true }), { title: 'Questions courtes', again: again }); }; again();
      } else {
        var mine = S.weakTags(5), html = '';
        if (mine.length) html += '<h2>Vos erreurs les plus fréquentes</h2>' + mine.map(function (w) { return '<div class="mist"><div class="w">✗ ' + esc(A.tagLabel(w.tag)) + '</div></div>'; }).join('');
        var any = false;
        L.forEach(function (i) { var n = C.byId[i]; if (!n) return; any = true; html += '<h2>' + i.toUpperCase() + ' — ' + esc(n.short) + '</h2>' + n.mistakes.map(function (m) { return '<div class="mist"><div class="w">✗ ' + m.wrong + '</div><div class="r">✓ ' + m.right + '</div></div>'; }).join(''); });
        box.innerHTML = any ? html : '<div class="notice">Les erreurs fréquentes ne sont pas encore rédigées pour ce périmètre.</div>' + html;
      }
    }
    sel.onchange = render; render();
  };

  /* ================= examen ================= */
  A.handlers.examen = function () {
    var ids = A.ids.filter(A.hasQuestions), ex = S.exams();
    var h = '<h1>Mode examen</h1><div class="notice info">Série sans indice ni correction immédiate : vous répondez à tout, puis vous corrigez. <b>Ce n’est pas le format d’un vrai examen</b> : les documents fournis ne le précisent pas. C’est un entraînement honnête sur le contenu du cours.</div>';
    h += '<div class="card"><h3>Chapitres concernés</h3><div class="grid">' + ids.map(function (i) { return '<label class="opt"><input type="checkbox" class="ck" value="' + i + '" checked><span><b>' + i.toUpperCase() + '</b> ' + esc(A.notion(i).short) + '</span></label>'; }).join('') + '</div><p class="row"><button class="small" id="ca">Tout cocher</button><button class="small" id="cn">Tout décocher</button></p>';
    h += '<p><label>Nombre de questions : <select id="cnt"><option>5</option><option selected>10</option><option>15</option><option>20</option></select></label> <label>Durée : <select id="dur"><option value="0">sans limite</option><option value="15">15 min</option><option value="30">30 min</option><option value="45">45 min</option></select></label></p><button class="pri" id="go">Commencer l’examen</button></div><div id="run"></div>';
    if (ex.length) h += '<h2>Vos tentatives</h2><div class="card"><table class="cmp"><thead><tr><th>Date</th><th>Questions</th><th>Résultat</th></tr></thead><tbody>' + ex.slice(-8).reverse().map(function (e) { return '<tr><td>' + A.stamp(e.at) + '</td><td>' + e.n + '</td><td>' + e.pct + ' %</td></tr>'; }).join('') + '</tbody></table></div>';
    A.set(h);
    A.$('#ca').onclick = function () { A.$$('.ck').forEach(function (c) { c.checked = true; }); };
    A.$('#cn').onclick = function () { A.$$('.ck').forEach(function (c) { c.checked = false; }); };
    A.$('#go').onclick = function () {
      var chosen = A.$$('.ck').filter(function (c) { return c.checked; }).map(function (c) { return c.value; });
      if (!chosen.length) { A.$('#run').innerHTML = '<div class="notice">Choisissez au moins un chapitre.</div>'; return; }
      var count = +A.$('#cnt').value, mins = +A.$('#dur').value, qs = [], seen = {}, t = 0, tries = 0;
      while (qs.length < count && tries < count * 20) {
        var id = chosen[t % chosen.length], lv = 1 + ((t + Math.floor(t / chosen.length)) % 3);
        var q = X.pick1(id, lv, { exclude: seen }) || X.pick1(id, 1, { exclude: seen });
        if (q && !seen[q.key]) { seen[q.key] = 1; qs.push(q); }
        t++; tries++;
      }
      startExam(qs, mins);
    };
  };
  function startExam(qs, mins) {
    var host = A.$('#run'), left = mins * 60, timer = null;
    host.innerHTML = '<div class="card" style="position:sticky;top:3.2rem;z-index:3"><div class="row"><b id="prog"></b><span class="grow"></span>' + (mins ? '<b id="tm"></b>' : '') + '<button class="pri" id="fin">Terminer et corriger</button></div></div><div id="qs"></div>';
    var mounts = qs.map(function (q, i) {
      var d = doc.createElement('div'); d.className = 'card';
      d.innerHTML = '<div class="row"><span class="chip">Question ' + (i + 1) + ' / ' + qs.length + '</span><span class="chip">Niveau ' + q.level + '</span></div><div class="qp">' + q.prompt + '</div>' + qFigures(q) + '<div class="qb"></div>';
      A.$('#qs', host).appendChild(d);
      return mountQ(q, A.$('.qb', d));
    });
    function answered() { return mounts.filter(function (m, i) { var a = m.get(); return a !== undefined && !(Array.isArray(a) && !a.length && qs[i].type === 'multi'); }).length; }
    function upd() { var p = A.$('#prog', host); if (p) p.textContent = answered() + ' / ' + qs.length + ' répondues'; }
    host.addEventListener('input', upd); host.addEventListener('click', upd);
    upd();
    if (mins) { var show = function () { var m = Math.floor(left / 60), s = left % 60; A.$('#tm', host).textContent = '⏱ ' + m + ':' + (s < 10 ? '0' : '') + s; }; show(); timer = root.setInterval(function () { left--; show(); if (left <= 0) finish(); }, 1000); A.onLeave(function () { root.clearInterval(timer); }); }
    A.$('#fin', host).onclick = function () { if (answered() < qs.length && !root.confirm((qs.length - answered()) + ' question(s) sans réponse. Terminer quand même ?')) return; finish(); };
    var over = false;
    function finish() {
      if (over) return; over = true; if (timer) root.clearInterval(timer);
      var tot = 0, rows = [], byN = {};
      qs.forEach(function (q, i) {
        var a = mounts[i].get(), res;
        if (q.type === 'text') res = { ok: false, score: 0 };
        else if (a === undefined) res = { ok: false, score: 0, msg: 'Pas de réponse.' };
        else res = q.check(a);
        S.record(q, res.score);
        tot += res.score; rows.push({ q: q, res: res });
        if (res.score < 0.75) byN[q.notion] = (byN[q.notion] || 0) + 1;
        mounts[i].lock();
      });
      var pct = Math.round(100 * tot / qs.length);
      S.addExam({ at: Date.now(), n: qs.length, pct: pct, notions: Object.keys(byN) });
      var h = '<div class="card"><h2>Résultat</h2><div class="stat"><div><b>' + (Math.round(tot * 10) / 10) + ' / ' + qs.length + '</b>points</div><div><b>' + pct + ' %</b>de réussite</div></div>' +
        (Object.keys(byN).length ? '<h3>Notions à revoir avant une nouvelle tentative</h3><ul>' + Object.keys(byN).map(function (k) { return '<li><a href="#/n/' + k + '">' + k.toUpperCase() + ' — ' + esc(A.notion(k).title) + '</a> (' + byN[k] + ')</li>'; }).join('') + '</ul>' : '<p class="ok"><b>Aucune notion à revoir.</b></p>') + '<p><a class="btn pri" href="#/examen">Nouvelle tentative</a></p></div><h2>Correction détaillée</h2>';
      rows.forEach(function (r, i) {
        h += '<div class="card"><div class="row"><span class="chip">Question ' + (i + 1) + '</span><b class="' + (r.res.score >= 0.75 ? 'ok' : r.res.score > 0 ? '' : 'bad') + '">' + (r.res.score >= 0.75 ? '✓ juste' : r.res.score > 0 ? '≈ partiel' : '✗ faux') + '</b></div><div class="qp">' + r.q.prompt + '</div>' + (r.res.msg ? '<p class="sub">' + esc(r.res.msg) + '</p>' : '') + '<details open><summary>Correction</summary>' + (r.q.solution ? r.q.solution() : '') + '</details></div>';
      });
      host.insertAdjacentHTML('beforeend', h);
      A.$('#fin', host).disabled = true;
      host.scrollIntoView({ block: 'start' });
    }
  }
})(typeof self !== 'undefined' ? self : this);

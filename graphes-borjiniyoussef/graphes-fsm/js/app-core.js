/* app-core.js — utilitaires d'interface, tableau de bord, page d'une notion (cours, guidé, socratique, Feynman, synthèse). */
(function (root) {
  'use strict';
  var GF = root.GF, GR = GF.graph, RD = GF.render, U = GF.u, X = GF.ex, S = GF.store, C = GF.content, esc = U.esc;
  var A = GF.app = { handlers: {} };
  var doc = root.document;

  /* ---------- petits outils DOM ---------- */
  A.$ = function (sel, el) { return (el || doc).querySelector(sel); };
  A.$$ = function (sel, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(sel)); };
  A.el = function (html) { var d = doc.createElement('div'); d.innerHTML = html; return d.firstElementChild; };
  A.view = function () { return doc.getElementById('view'); };
  A.set = function (html) { var v = A.view(); v.innerHTML = html; return v; };
  A.go = function (hash) { root.location.hash = hash; };
  A.stamp = function (ts) { try { return new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); } catch (e) { return ''; } };

  /* ---------- notions : contenu réel ou fiche provisoire ---------- */
  var META = {
    n01: ['Graphe : définition et types de graphes', '3–5, 8–9, 11'], n02: ['Graphe simple non orienté : ordre et taille', '10'],
    n03: ['Terminologie : adjacence, incidence, degré', '12'], n04: ['Somme des degrés et degrés impairs', '13–14'],
    n05: ['Degré dans un graphe orienté', '15'], n06: ['Degré d’un graphe et graphes réguliers', '16'],
    n07: ['Densité', '17'], n08: ['Chaînes, chemins, cycles et circuits', '18'], n09: ['Distance, diamètre et connexité', '19'],
    n10: ['Graphes complets et cliques', '20'], n11: ['Composantes connexes et fortement connexes', '21'],
    n12: ['Graphe partiel et sous-graphe', '22'], n13: ['Problème eulérien', '23–25'], n14: ['Problème hamiltonien', '26–28'],
    n15: ['Matrice d’adjacence', '29'], n16: ['Matrice de poids', '30'], n17: ['Listes d’adjacence', '31'],
    n18: ['Coûts des représentations', '32'], n19: ['Application aux graphes orientés', '33']
  };
  A.ids = Object.keys(META);
  A.notion = function (id) {
    var n = C.byId[id];
    if (n) return n;
    var m = META[id] || [id, ''];
    return { id: id, title: m[0], short: m[0].slice(0, 28), slides: m[1], prereqs: [], soon: true };
  };
  A.hasContent = function (id) { return !!C.byId[id]; };
  A.hasQuestions = function (id) {
    return X.gens.some(function (g) { return g.notion === id; }) || (A.hasContent(id) && (C.byId[id].qs || []).length > 0);
  };
  A.statusLabel = { 'new': 'Non commencée', progress: 'En cours', review: 'À revoir', mastered: 'Maîtrisée' };
  A.chip = function (id) { var s = S.status(id); return '<span class="chip ' + s + '">' + A.statusLabel[s] + '</span>'; };
  A.bar = function (p) { return '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(p * 100) + '"><i style="width:' + Math.round(p * 100) + '%"></i></div>'; };
  A.partProgress = function (ids) { var t = 0; ids.forEach(function (i) { t += S.mastery(i); }); return ids.length ? t / ids.length : 0; };

  /* ---------- figures ---------- */
  A.fig = function (g, go, caption) {
    if (!g) return '';
    var G = C.graph(g), o = {}, k;
    go = go || {};
    for (k in go) if (k !== 'show') o[k] = go[k];
    var h = '<figure>' + RD.svg(G, o) + (caption ? '<figcaption>' + caption + '</figcaption>' : '') + '</figure>';
    var panels = '', sh = go.show || [];
    if (sh.indexOf('deg') >= 0) panels += '<div><h6>Degrés</h6>' + RD.degreeTableHTML(G) + '</div>';
    if (sh.indexOf('matrix') >= 0) panels += '<div><h6>Matrice d’adjacence</h6><div class="mx">' + RD.matrixHTML(G) + '</div></div>';
    if (sh.indexOf('wmatrix') >= 0) panels += '<div><h6>Matrice de poids</h6><div class="mx">' + RD.matrixHTML(G, { weighted: true }) + '</div></div>';
    if (sh.indexOf('lists') >= 0) panels += '<div><h6>Listes d’adjacence</h6>' + RD.listsHTML(G) + '</div>';
    return '<div class="figs">' + h + '</div>' + (panels ? '<div class="panels">' + panels + '</div>' : '');
  };

  /* ---------- navigation ---------- */
  var NAV = [['#/', 'Tableau de bord'], ['#/cours', 'Cours'], ['#/pratique', 'Exercices'], ['#/revision', 'Révision'], ['#/rapide', 'Révision rapide'], ['#/examen', 'Examen'], ['#/outil', 'Outil graphes'], ['#/notes', 'Notes'], ['#/apropos', 'À propos']];
  A.buildNav = function () {
    var n = doc.getElementById('nav');
    n.innerHTML = NAV.map(function (x) { return '<a href="' + x[0] + '" data-h="' + x[0] + '">' + x[1] + '</a>'; }).join('');
  };
  A.markNav = function (route) {
    A.$$('#nav a').forEach(function (a) {
      var h = a.getAttribute('data-h').slice(1);
      var on = (route === '/' && h === '/') || (h !== '/' && route.indexOf(h) === 0) || (route.indexOf('/n/') === 0 && h === '/cours');
      a.className = on ? 'on' : '';
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  };

  /* ---------- tableau de bord ---------- */
  A.handlers.dashboard = function () {
    var ids = A.ids, d = S.data(), now = Date.now();
    var attempts = 0, correct = 0;
    ids.forEach(function (i) { var n = d.notions[i]; if (n) { attempts += n.attempts; correct += n.correct; } });
    var mastered = ids.filter(function (i) { return S.status(i) === 'mastered'; }).length;
    var due = S.dueList(ids);
    var last = S.last(), h = '<h1>Tableau de bord</h1>';
    h += '<p class="sub">Chapitre 1 — Graphes et algorithmes (H. Haj Mohamed, FSM · 2026–2027)</p>';
    /* reprendre */
    if (last && A.notion(last.notion)) {
      var ln = A.notion(last.notion);
      h += '<div class="card"><div class="row"><div class="grow"><strong>Reprendre là où vous vous êtes arrêté</strong><br>' + esc(ln.id.toUpperCase()) + ' — ' + esc(ln.title) + ' <small class="sub">(le ' + A.stamp(last.at) + ')</small></div><a class="btn pri" href="#/n/' + ln.id + '">Reprendre</a></div></div>';
    } else {
      h += '<div class="card"><div class="row"><div class="grow"><strong>Bienvenue.</strong> Aucune activité enregistrée pour l’instant : tout est « non commencé ». Le cours suit l’ordre réel du PDF, en commençant par la définition d’un graphe.</div><a class="btn pri" href="#/n/n01">Commencer par n01</a></div></div>';
    }
    h += '<div class="stat"><div><b>' + mastered + ' / ' + ids.length + '</b>notions maîtrisées</div><div><b>' + attempts + '</b>questions traitées</div><div><b>' + (attempts ? Math.round(100 * correct / attempts) + ' %' : '—') + '</b>de réussite</div><div><b>' + due.length + '</b>à réviser aujourd’hui</div></div>';
    /* activité */
    var act = S.activity(28), mx = Math.max.apply(null, act.map(function (a) { return a.n; }).concat([1]));
    h += '<div class="card"><strong>Activité des 4 dernières semaines</strong><div class="spark" aria-hidden="true">' + act.map(function (a) { return '<i class="' + (a.n ? '' : 'z') + '" style="height:' + Math.max(4, Math.round(100 * a.n / mx)) + '%" title="' + A.stamp(a.day) + ' : ' + a.n + ' question(s)"></i>'; }).join('') + '</div><small class="sub">' + (S.data().log.length ? act.reduce(function (s, a) { return s + a.n; }, 0) + ' question(s) sur 28 jours' : 'Rien d’enregistré pour l’instant.') + '</small></div>';
    /* révision du jour */
    if (due.length) h += '<div class="card"><div class="row"><div class="grow"><strong>À réviser maintenant :</strong> ' + due.map(function (i) { return '<a href="#/n/' + i + '">' + i.toUpperCase() + '</a>'; }).join(', ') + '</div><a class="btn pri" href="#/revision">Lancer la révision</a></div></div>';
    /* points forts / difficultés */
    var strong = ids.filter(function (i) { return S.mastery(i) >= 0.7; }), weak = S.weakTags(5);
    if (attempts) {
      h += '<div class="grid"><div class="card"><strong>Points forts</strong><p class="sub">' + (strong.length ? strong.map(function (i) { return esc(A.notion(i).short); }).join(' · ') : 'Pas encore de notion solide : continuez les exercices.') + '</p></div>';
      h += '<div class="card"><strong>Difficultés récurrentes</strong>' + (weak.length ? '<ul>' + weak.map(function (w) { return '<li>' + esc(A.tagLabel(w.tag)) + ' <small class="sub">(' + w.n + ' erreur' + (w.n > 1 ? 's' : '') + ')</small></li>'; }).join('') + '</ul>' : '<p class="sub">Aucune erreur récurrente détectée.</p>') + '</div></div>';
    }
    /* plan du cours */
    C.parts.forEach(function (p) {
      h += '<h2>Partie ' + p.id + ' — ' + esc(p.title) + '</h2>' + A.bar(A.partProgress(p.notions)) + '<div class="grid" style="margin-top:.6rem">';
      p.notions.forEach(function (id) {
        var n = A.notion(id);
        h += '<a class="tile ' + (n.soon ? 'soon' : '') + '" href="#/n/' + id + '"><small>' + id.toUpperCase() + ' · diapo ' + esc(n.slides) + '</small><h3>' + esc(n.title) + '</h3>' + A.chip(id) + A.bar(S.mastery(id)) + (n.soon ? '<small>Exercices disponibles · fiche de cours en cours de rédaction</small>' : '') + '</a>';
      });
      h += '</div>';
    });
    A.set(h);
  };
  A.tagLabel = function (tag) {
    var r = tag;
    C.notions.forEach(function (n) { (n.mistakes || []).forEach(function (m) { if (m.tag === tag && r === tag) r = m.wrong.replace(/<[^>]+>/g, ''); }); });
    return r === tag ? tag.replace(/-/g, ' ') : 'Erreur fréquente : ' + r;
  };

  /* ---------- liste du cours ---------- */
  A.handlers.cours = function () {
    var h = '<h1>Cours</h1><p class="sub">Dans l’ordre réel du PDF (diapos 1 à 33 du support). Le regroupement en parties est proposé par l’application : le PDF n’a pas de sections numérotées.</p>';
    C.parts.forEach(function (p) {
      h += '<h2>Partie ' + p.id + ' — ' + esc(p.title) + '</h2><div class="card"><table class="cmp"><tbody>';
      p.notions.forEach(function (id) {
        var n = A.notion(id);
        h += '<tr><td>' + id.toUpperCase() + '</td><td><a href="#/n/' + id + '">' + esc(n.title) + '</a></td><td>diapo ' + esc(n.slides) + '</td><td>' + A.chip(id) + '</td></tr>';
      });
      h += '</tbody></table></div>';
    });
    A.set(h);
  };

  /* ---------- page d'une notion ---------- */
  var TABS = [['cours', 'Cours'], ['guide', 'Compréhension guidée'], ['socratique', 'Mode socratique'], ['feynman', 'Mode Feynman'], ['exos', 'Exercices'], ['synthese', 'À retenir']];
  A.handlers.notion = function (id, tab) {
    var n = A.notion(id);
    if (!META[id]) return A.set('<div class="card"><p>Notion inconnue.</p><a href="#/">Retour</a></div>');
    tab = tab || 'cours';
    if (n.soon && (tab === 'guide' || tab === 'socratique' || tab === 'feynman' || tab === 'synthese')) tab = 'cours';
    if (!n.soon) S.markSeen(id);
    var h = '<p><a href="#/">← Tableau de bord</a></p><div class="row"><div class="grow"><h1>' + id.toUpperCase() + ' — ' + esc(n.title) + '</h1><p class="sub">Diapo ' + esc(n.slides) + ' · ' + A.chip(id) + '</p></div><button class="ghost noprint" id="bm">' + (S.isBookmarked(id) ? '★ Marque-page' : '☆ Marque-page') + '</button></div>';
    var prev = ids_prev(id), next = ids_next(id);
    if (n.prereqs && n.prereqs.length) h += '<p class="sub">À connaître avant : ' + n.prereqs.map(function (p) { return '<a href="#/n/' + p + '">' + p.toUpperCase() + ' (' + esc(A.notion(p).short) + ')</a> ' + A.chip(p); }).join(' · ') + '</p>';
    h += '<div class="tabs" role="tablist">' + TABS.map(function (t) {
      var dis = n.soon && (t[0] === 'guide' || t[0] === 'socratique' || t[0] === 'feynman' || t[0] === 'synthese');
      return '<button role="tab" data-tab="' + t[0] + '" class="' + (t[0] === tab ? 'on' : '') + '"' + (dis ? ' disabled title="Pas encore rédigé"' : '') + '>' + t[1] + '</button>';
    }).join('') + '</div><div id="tabbody"></div>';
    h += '<div class="row noprint" style="margin-top:1rem;justify-content:space-between">' + (prev ? '<a class="btn" href="#/n/' + prev + '">← ' + prev.toUpperCase() + '</a>' : '<span></span>') + (next ? '<a class="btn" href="#/n/' + next + '">' + next.toUpperCase() + ' →</a>' : '') + '</div>';
    A.set(h);
    A.$('#bm').onclick = function () { this.textContent = S.toggleBookmark(id) ? '★ Marque-page' : '☆ Marque-page'; };
    A.$$('.tabs button').forEach(function (b) { b.onclick = function () { A.go('#/n/' + id + '/' + b.getAttribute('data-tab')); }; });
    var body = A.$('#tabbody');
    ({ cours: tabCours, guide: tabGuide, socratique: tabSocratic, feynman: tabFeynman, exos: tabExos, synthese: tabSynth }[tab] || tabCours)(n, body);
  };
  function ids_prev(id) { var i = A.ids.indexOf(id); return i > 0 ? A.ids[i - 1] : null; }
  function ids_next(id) { var i = A.ids.indexOf(id); return i < A.ids.length - 1 ? A.ids[i + 1] : null; }

  var LAB = { def: 'Définition', thm: 'Théorème / corollaire', proof: 'Preuve', rem: 'Remarque du cours', q: 'Question posée par le cours', extra: 'Ajout hors PDF — ne figure pas dans le cours', warn: 'Point ambigu ou incohérent du PDF' };
  function tabCours(n, body) {
    var h = '';
    if (n.soon) {
      h += '<div class="notice">La fiche de cours détaillée de cette notion (définitions diapo par diapo, étapes guidées, mode socratique, Feynman, synthèse) est en cours de rédaction. Les <b>exercices</b> de cette notion sont déjà disponibles, avec corrections calculées. Les diapos concernées : ' + esc(n.slides) + '.</div>';
      var amb = C.ambiguitiesFor(n.id);
      if (amb.length) h += '<h3>Points à noter sur le PDF</h3>' + amb.map(function (a) { return '<div class="blk warn"><div class="lab">' + LAB.warn + '<span class="slide-ref">diapo ' + esc(a.slide) + '</span></div><b>' + esc(a.title) + '</b><p>' + a.text + '</p></div>'; }).join('');
      h += '<p><a class="btn pri" href="#/pratique/' + n.id + '">S’exercer sur cette notion</a></p>';
      body.innerHTML = h; return;
    }
    h += '<div class="card"><strong>Objectifs d’apprentissage</strong><ul>' + n.objectives.map(function (o) { return '<li>' + o + '</li>'; }).join('') + '</ul></div>';
    h += '<div class="notice info">Code couleur : bleu = définition · vert = théorème · violet = ajout <b>hors PDF</b> · jaune = point ambigu du PDF.</div>';
    n.course.forEach(function (b) {
      h += '<div class="blk ' + b.k + '"><div class="lab">' + LAB[b.k] + (b.slide ? '<span class="slide-ref">diapo ' + esc(b.slide) + '</span>' : '') + '</div><b>' + esc(b.t) + '</b>' + b.h + (b.g ? A.fig(b.g, b.go) : '') + '</div>';
    });
    h += '<p><button class="ghost" id="mkfav">☆ Ajouter la synthèse aux favoris</button></p>';
    body.innerHTML = h;
    var fb = A.$('#mkfav', body);
    if (fb) fb.onclick = function () { (n.recap.defs || []).forEach(function (d) { S.addFav({ t: d.t, d: d.d, notion: n.id }); }); (n.recap.formulas || []).forEach(function (f) { S.addFav({ t: f.t, d: f.f, notion: n.id }); }); fb.textContent = '★ Ajoutées aux favoris (page Notes)'; };
  }

  function tabGuide(n, body) {
    var h = '<h2>Compréhension guidée</h2><p class="sub">Une étape à la fois : réfléchissez à la question avant de découvrir la réponse.</p>';
    n.guided.forEach(function (g, i) {
      h += '<div class="card">' + g.h + (g.g ? A.fig(g.g, g.go) : '');
      if (g.ask) h += '<p><b>À vous :</b> ' + g.ask + '</p><button class="small" data-rv="' + i + '">Voir la réponse</button><div class="hint" id="rv' + i + '" hidden>' + g.reveal + '</div>';
      h += '</div>';
    });
    h += '<h2>Exemples et contre-exemples</h2>';
    n.examples.forEach(function (e) { h += '<div class="card"><b>' + (e.counter ? '<span class="bad">Contre-exemple · </span>' : '') + esc(e.t) + '</b>' + e.h + (e.g ? A.fig(e.g, e.go) : '') + '</div>'; });
    (n.compare || []).forEach(function (c) {
      h += '<h2>À ne pas confondre : ' + esc(c.t) + '</h2><div class="card mx"><table class="cmp"><thead><tr>' + c.cols.map(function (x) { return '<th>' + esc(x) + '</th>'; }).join('') + '</tr></thead><tbody>' + c.rows.map(function (r) { return '<tr>' + r.map(function (x, k) { return (k ? '<td>' : '<th>') + x + (k ? '</td>' : '</th>'); }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
    });
    h += '<h2>Erreurs fréquentes</h2>' + n.mistakes.map(function (m) { return '<div class="mist"><div class="w">✗ ' + m.wrong + '</div><div class="r">✓ ' + m.right + '</div></div>'; }).join('');
    h += '<h2>Expliquer autrement</h2><div class="card"><div id="alt">' + n.alt[0] + '</div><button class="small" id="altb">Autre explication</button></div>';
    body.innerHTML = h;
    A.$$('[data-rv]', body).forEach(function (b) { b.onclick = function () { A.$('#rv' + b.getAttribute('data-rv'), body).hidden = false; b.hidden = true; }; });
    var ai = 0; A.$('#altb', body).onclick = function () { ai = (ai + 1) % n.alt.length; A.$('#alt', body).innerHTML = n.alt[ai]; };
  }

  function tabSynth(n, body) {
    var r = n.recap, h = '<h2>À retenir</h2><div class="card"><ul>' + r.key.map(function (k) { return '<li>' + k + '</li>'; }).join('') + '</ul></div>';
    if (r.defs.length) h += '<h3>Définitions</h3><div class="card">' + r.defs.map(function (d) { return '<p><b>' + esc(d.t) + '</b>' + (d.slide ? '<span class="slide-ref">diapo ' + esc(d.slide) + '</span>' : '') + ' — ' + d.d + '</p>'; }).join('') + '</div>';
    if ((r.thms || []).length) h += '<h3>Théorèmes et conditions d’application</h3><div class="card">' + r.thms.map(function (t) { return '<p><b>' + esc(t.t) + '</b> — ' + t.s + '<br><small class="sub">Conditions : ' + t.cond + '</small></p>'; }).join('') + '</div>';
    if ((r.formulas || []).length) h += '<h3>Formules</h3><div class="card">' + r.formulas.map(function (f) { return '<p><b>' + esc(f.t) + '</b> : <span class="mth">' + f.f + '</span></p>'; }).join('') + '</div>';
    var st = S.status(n.id);
    h += '<div class="card"><strong>Votre état sur cette notion :</strong> ' + A.chip(n.id) + A.bar(S.mastery(n.id)) + '<p class="sub">' + (st === 'new' ? 'Pas encore d’exercice fait : lancez une série pour savoir où vous en êtes.' : st === 'mastered' ? 'Notion maîtrisée : elle reviendra dans vos révisions espacées.' : st === 'review' ? 'À retravailler : refaites le mode socratique ou des exercices guidés.' : 'En cours : encore quelques exercices réussis pour la valider.') + '</p><a class="btn pri" href="#/pratique/' + n.id + '">S’exercer</a></div>';
    body.innerHTML = h;
  }

  /* ---------- mode socratique ---------- */
  function tabSocratic(n, body) {
    var so = n.socratic, steps = [so.warm].concat(so.steps), idx = 0, fails = 0, hintN = 0, shown = false;
    var h = '<h2>Mode socratique</h2><div class="notice info">Une seule question à la fois. Pas de réponse toute faite : un contre-exemple après un premier échec, puis des indices progressifs ; après trois échecs (ou si vous cliquez « Je ne sais pas »), une explication directe, suivie d’une question de vérification. Les réponses rédigées sont <b>auto-évaluées</b> par vous, sur une grille : aucune analyse automatique n’est faite.</div><div id="soc"></div>';
    body.innerHTML = h;
    var box = A.$('#soc', body);
    var ctx = box;
    function say(who, html) { var m = doc.createElement('div'); m.className = 'msg ' + who; m.innerHTML = html; ctx.querySelector('.chat').appendChild(m); m.scrollIntoView({ block: 'nearest' }); return m; }
    function answerOf(s) { if (typeof s.answer === 'function') return s.answer(C.graph(s.g)); return s.answer; }
    function begin() {
      ctx.innerHTML = '<div class="chat" aria-live="polite"></div><div id="ctrl"></div>';
      step();
    }
    function step() {
      if (idx >= steps.length) return verify();
      var s = steps[idx]; fails = 0; hintN = 0;
      var m = say('t', '<b>Question ' + (idx + 1) + ' / ' + steps.length + '</b><br>' + s.q + (s.g ? A.fig(s.g, s.go) : ''));
      ask(s);
    }
    function ask(s) {
      var c = A.$('#ctrl', ctx), t = s.type, h2 = '';
      if (t === 'choice') h2 = s.options.map(function (o, i) { return '<label class="opt"><input type="radio" name="so" value="' + i + '"><span>' + o + '</span></label>'; }).join('');
      else if (t === 'num') h2 = '<input type="text" id="soin" inputmode="decimal" aria-label="Votre réponse" size="12">';
      else if (t === 'set') h2 = '<input type="text" id="soin" aria-label="Sommets séparés par des virgules" placeholder="ex. A, B, C" size="22">';
      else h2 = '<textarea id="soin" aria-label="Votre réponse rédigée" placeholder="Écrivez votre réponse avec vos mots…"></textarea>';
      c.innerHTML = '<div class="card">' + h2 + '<div class="row" style="margin-top:.5rem"><button class="pri" id="sok">' + (t === 'text' ? 'Envoyer ma réponse' : 'Répondre') + '</button><button class="ghost" id="shint">Indice</button><button class="ghost" id="sidk">Je ne sais pas</button></div></div>';
      A.$('#sok', c).onclick = function () { submit(s); };
      A.$('#shint', c).onclick = function () { hint(s); };
      A.$('#sidk', c).onclick = function () { say('u', 'Je ne sais pas.'); explain(s); };
      var inp = A.$('#soin', c); if (inp && t !== 'text') inp.onkeydown = function (e) { if (e.key === 'Enter') submit(s); };
      if (inp) inp.focus();
    }
    function hint(s) {
      if (hintN >= s.hints.length) { say('t', '<p>Vous avez vu tous les indices. Vous pouvez répondre, ou cliquer « Je ne sais pas » pour une explication.</p>'); return; }
      say('t', '<b>Indice ' + (hintN + 1) + '</b>' + s.hints[hintN++]);
      var b = A.$('#shint', ctx); if (b && hintN >= 1 && hintN < s.hints.length) b.textContent = 'Indice supplémentaire';
    }
    function submit(s) {
      var c = A.$('#ctrl', ctx), t = s.type, ok = false, given = '';
      if (t === 'choice') { var r = A.$('input[name=so]:checked', c); if (!r) return; given = s.options[+r.value]; say('u', given); ok = (+r.value === answerOf(s)); }
      else if (t === 'num') { var v = X.parseNum(A.$('#soin', c).value); if (isNaN(v)) { say('t', '<p>Entrez un nombre.</p>'); return; } say('u', esc(A.$('#soin', c).value)); ok = v === answerOf(s); }
      else if (t === 'set') { var raw = A.$('#soin', c).value; say('u', esc(raw) || '∅'); ok = X.sameStrSet(X.parseVSet(raw), answerOf(s)); }
      else {
        var txt = A.$('#soin', c).value.trim(); if (!txt) return;
        say('u', esc(txt).replace(/\n/g, '<br>'));
        return selfGrade(s, txt);
      }
      resolve(s, ok);
    }
    function selfGrade(s, txt) {
      var c = A.$('#ctrl', ctx);
      c.innerHTML = '<div class="card"><p><b>Auto-évaluation.</b> Relisez votre réponse et cochez les idées clés que vous avez réellement écrites :</p>' + s.expect.map(function (e, i) { return '<label class="opt"><input type="checkbox" data-k="' + i + '"><span>' + e + '</span></label>'; }).join('') + '<button class="pri" id="sgo">Valider</button></div>';
      A.$('#sgo', c).onclick = function () { var k = A.$$('input:checked', c).length; resolve(s, k / s.expect.length >= 0.75, k / s.expect.length); };
    }
    function resolve(s, ok, sc) {
      var q = { key: 'soc:' + s.id, notion: n.id, level: 2, tag: null };
      if (ok) {
        if (fails === 0) S.record(q, sc === undefined ? 1 : sc);
        say('t', '<b class="ok">Oui.</b> ' + s.ok);
        idx++; nextBtn(false);
      } else {
        fails++;
        if (fails === 1) { say('t', s.type === 'text' ? '<p>Il manque encore des éléments. Voici une piste :</p>' + s.counter : s.counter); }
        else if (fails === 2) { say('t', '<b>Indice</b>' + s.hints[Math.min(hintN, s.hints.length - 1)]); hintN = Math.max(hintN, 1); }
        else return explain(s);
        ask(s);
      }
    }
    function explain(s) {
      var q = { key: 'soc:' + s.id, notion: n.id, level: 2, tag: null };
      S.record(q, 0);
      say('t', '<b>Explication directe</b>' + s.explain + '<p><b>À vous :</b></p>' + s.restate);
      idx++; nextBtn(true);
    }
    function nextBtn(restate) {
      var c = A.$('#ctrl', ctx);
      c.innerHTML = '<div class="card">' + (restate ? '<textarea id="rest" aria-label="Votre reformulation" placeholder="Reformulez avec vos mots (facultatif)…"></textarea>' : '') + '<button class="pri" id="snext">' + (idx >= steps.length ? 'Passer à la question de vérification' : 'Question suivante') + '</button></div>';
      A.$('#snext', c).onclick = function () { var r = A.$('#rest', c); if (r && r.value.trim()) say('u', esc(r.value.trim()).replace(/\n/g, '<br>')); step(); };
    }
    function verify() {
      var c = A.$('#ctrl', ctx), v = so.verify, q = null;
      if (v.gen) q = X.fresh(v.gen, v.level); else if (v.q) q = X.fromKey(v.q);
      say('t', '<b>Pour vérifier que c’est bien compris</b> — une question différente :');
      c.innerHTML = '<div id="vq"></div>';
      A.runOne(q, A.$('#vq', c), { onDone: function (res) { say('t', res.ok ? '<p>Bravo : vous avez transféré la notion à un cas nouveau. Vous pouvez maintenant raconter la notion en mode Feynman.</p>' : '<p>Pas encore tout à fait. Relisez la correction, puis refaites une série d’exercices sur cette notion.</p>'); c.insertAdjacentHTML('beforeend', '<p class="row"><a class="btn pri" href="#/n/' + n.id + '/feynman">Mode Feynman</a><a class="btn" href="#/pratique/' + n.id + '">Exercices</a><button id="again">Recommencer le dialogue</button></p>'); A.$('#again', c).onclick = function () { idx = 0; begin(); }; } });
    }
    begin();
  }

  /* ---------- mode Feynman ---------- */
  function tabFeynman(n, body) {
    var f = n.feynman, h = '<h2>Mode Feynman : expliquez pour enseigner</h2><div class="notice info">Vous êtes le professeur. Rédigez librement, sans regarder le cours. Ensuite, <b>vous</b> évaluez votre explication sur une grille (éléments attendus, pièges), vous répondez aux questions d’un débutant curieux, puis vous reformulez. L’application ne juge pas votre texte automatiquement : elle vous donne les critères et un modèle pour vous corriger honnêtement.</div>';
    h += '<div class="card" id="f1"><p><b>Sujet :</b> ' + esc(f.topic) + '</p><p>' + f.prompt + '</p><textarea id="ftxt" aria-label="Votre explication" placeholder="Expliquez comme à un débutant…"></textarea><p><button class="pri" id="fgo">J’ai fini : évaluer mon explication</button></p></div><div id="f2"></div>';
    body.innerHTML = h;
    var draft = ''; try { draft = root.sessionStorage.getItem('fx-' + n.id) || ''; } catch (e) { draft = ''; }
    var ta = A.$('#ftxt', body); ta.value = draft; ta.oninput = function () { try { root.sessionStorage.setItem('fx-' + n.id, ta.value); } catch (e) { /* ignore */ } };
    A.$('#fgo', body).onclick = function () {
      if (ta.value.trim().length < 20) { A.$('#f2', body).innerHTML = '<div class="notice">Écrivez d’abord une vraie explication (au moins une ou deux phrases).</div>'; return; }
      var h2 = '<div class="card"><h3>1. Éléments attendus</h3><p class="sub">Cochez ce que votre explication contient réellement :</p>' + f.must.map(function (m, i) { return '<label class="opt"><input type="checkbox" data-m="' + i + '"><span>' + m + '</span></label>'; }).join('');
      h2 += '<h3>2. Pièges</h3><p class="sub">Cochez ceux dans lesquels vous êtes tombé :</p>' + f.pitfalls.map(function (m, i) { return '<label class="opt"><input type="checkbox" data-p="' + i + '"><span>' + m + '</span></label>'; }).join('');
      h2 += '<h3>3. Le débutant curieux demande…</h3>' + f.beginner.map(function (b, i) { return '<p><b>« ' + b + ' »</b></p><textarea aria-label="Votre réponse au débutant" placeholder="Votre réponse…" style="min-height:3.5rem"></textarea>'; }).join('');
      h2 += '<p><button class="pri" id="fev">Terminer l’évaluation</button></p></div>';
      A.$('#f2', body).innerHTML = h2;
      A.$('#fev', body).onclick = function () {
        var m = A.$$('[data-m]:checked', body).length, p = A.$$('[data-p]:checked', body).length, sc = m / f.must.length;
        S.record({ key: 'fey:' + n.id, notion: n.id, level: 2, tag: p ? 'feynman-pieges' : null }, sc);
        var miss = f.must.filter(function (x, i) { return !A.$('[data-m="' + i + '"]', body).checked; });
        A.$('#f2', body).insertAdjacentHTML('beforeend', '<div class="card"><h3>Bilan</h3><p>Éléments présents : <b>' + m + ' / ' + f.must.length + '</b>' + (p ? ' · pièges relevés : ' + p : '') + '.</p>' + (miss.length ? '<p><b>À ajouter à votre explication :</b></p><ul>' + miss.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' : '<p class="ok">Votre explication couvre tous les éléments attendus.</p>') + '<h3>Explication modèle</h3><div class="hint">' + f.model + '</div><h3>Reformulez (deuxième essai)</h3><textarea id="ftxt2" aria-label="Deuxième reformulation" placeholder="Reformulez en mots simples, sans perdre la précision…"></textarea><p class="sub">Un exemple concret ou un contre-exemple aide toujours : ' + (n.examples.filter(function (e) { return e.counter; })[0] ? 'essayez avec « ' + esc(n.examples.filter(function (e) { return e.counter; })[0].t) + ' ».' : 'choisissez un petit graphe de 4 sommets.') + '</p></div>');
        this.disabled = true;
      };
    };
  }

  /* ---------- exercices d'une notion ---------- */
  function tabExos(n, body) {
    var h = '<h2>Exercices</h2><div class="grid"><div class="card"><strong>Adaptatif</strong><p class="sub">Questions au niveau que vous avez atteint, qui montent si vous réussissez.</p><a class="btn pri" href="#/pratique/' + n.id + '/adaptatif">Lancer</a></div><div class="card"><strong>Série progressive</strong><p class="sub">6 questions, du niveau 1 (compréhension) au niveau 3 (raisonnement).</p><a class="btn pri" href="#/pratique/' + n.id + '/serie">Lancer</a></div><div class="card"><strong>Définitions à expliquer</strong><p class="sub">Réponses rédigées, auto-évaluées sur une grille.</p><a class="btn" href="#/pratique/' + n.id + '/definitions">Lancer</a></div></div>';
    if (!A.hasQuestions(n.id)) h += '<div class="notice">Pas encore d’exercices pour cette notion.</div>';
    body.innerHTML = h;
  }
})(typeof self !== 'undefined' ? self : this);

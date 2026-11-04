/* app-tools.js — outil de visualisation de graphes, notes et fiche imprimable, page « À propos ». */
(function (root) {
  'use strict';
  var GF = root.GF, GR = GF.graph, RD = GF.render, U = GF.u, S = GF.store, C = GF.content, GS = GF.graphs, A = GF.app, esc = U.esc;
  var doc = root.document;

  /* ================= outil graphes ================= */
  A.handlers.outil = function () {
    var examples = GS.ids.filter(function (i) { return GS.all[i].meta && GS.all[i].meta.label; });
    var h = '<h1>Outil graphes</h1><p class="sub">Construisez un graphe, déplacez les sommets, modifiez-le, et observez les propriétés se mettre à jour. Chaque affirmation est calculée par le moteur de l’application, puis expliquée avec les définitions du cours.</p>';
    h += '<div class="tools noprint" role="toolbar" aria-label="Outils de dessin">' +
      [['move', 'Déplacer / sélectionner'], ['vertex', 'Sommet'], ['edge', 'Arête / arc'], ['delete', 'Supprimer']].map(function (m) { return '<button data-m="' + m[0] + '" class="' + (m[0] === 'move' ? 'on' : '') + '">' + m[1] + '</button>'; }).join('') +
      '<label class="opt" style="margin:0"><input type="checkbox" id="dir"><span>Orienté</span></label><label class="opt" style="margin:0"><input type="checkbox" id="wt"><span>Pondéré</span></label><button id="undo">Annuler</button><button id="clr">Tout effacer</button></div>';
    h += '<p class="sub" id="modehelp"></p><div id="ed"></div><p class="sub">Astuce : en mode « Déplacer », un clic sur deux sommets affiche la distance entre eux.</p>';
    h += '<div class="card noprint"><div class="row"><label>Charger un graphe du cours : <select id="ex"><option value="">— choisir —</option>' + examples.map(function (i) { return '<option value="' + i + '">' + esc(GS.all[i].meta.label) + ' (diapo ' + esc(GS.all[i].meta.slide) + ')</option>'; }).join('') + '</select></label></div>';
    h += '<details><summary>Construire à partir d’un texte</summary><p class="sub">Une liaison par ligne ou séparée par des virgules, par exemple <span class="kbd">A-B, B-C, C-A</span> ; avec poids <span class="kbd">A-B:5</span> ; sommet seul <span class="kbd">D</span>. Cochez « Orienté » pour que A-B soit l’arc (A, B).</p><textarea id="txt" style="min-height:4rem" aria-label="Liste des liaisons"></textarea><p><button id="build">Construire</button></p><div id="txterr"></div></details></div>';
    h += '<div class="grid"><div class="card"><h3>Analyse</h3><dl class="analysis" id="an"></dl></div><div><div class="card"><h3>Degrés</h3><div id="degs"></div></div><div class="card"><h3 id="mxt">Matrice d’adjacence</h3><div id="mx" class="mx"></div></div><div class="card"><h3>Listes d’adjacence</h3><div id="ls"></div></div></div></div>';
    h += '<div class="card"><h3>Explorer un parcours</h3><p class="sub">Écrivez une suite de sommets (ex. <span class="kbd">A-B-C-A</span>) : l’application dit si c’est une ' + '<b>chaîne</b> (ou un <b>chemin</b>), si elle est simple, élémentaire, fermée, et si c’est un cycle (circuit).</p><div class="row"><input type="text" id="seq" aria-label="Suite de sommets" placeholder="A-B-C" size="26"><button id="chk">Analyser</button><button id="eul">Montrer un parcours eulérien</button><button id="ham">Montrer un cycle hamiltonien</button></div><div id="wres"></div><div id="wfig"></div></div>';
    A.set(h);
    var E = new GF.editor.Editor(A.$('#ed'), { onChange: refresh });
    var helps = { move: 'Faites glisser un sommet pour le déplacer.', vertex: 'Cliquez dans la zone pour poser un sommet.', edge: 'Cliquez sur un sommet de départ, puis sur un sommet d’arrivée (deux fois le même sommet crée une boucle).', 'delete': 'Cliquez sur un sommet ou une arête pour la supprimer.' };
    A.$('#modehelp').textContent = helps.move;
    A.$$('.tools button[data-m]').forEach(function (b) { b.onclick = function () { E.setMode(b.getAttribute('data-m')); A.$$('.tools button[data-m]').forEach(function (x) { x.className = x === b ? 'on' : ''; }); A.$('#modehelp').textContent = helps[b.getAttribute('data-m')]; }; });
    A.$('#dir').onchange = function () { E.setDirected(this.checked); };
    A.$('#wt').onchange = function () { E.setWeighted(this.checked); };
    A.$('#undo').onclick = function () { E.undo(); sync(); };
    A.$('#clr').onclick = function () { E.clear(); };
    function sync() { A.$('#dir').checked = E.G.directed; A.$('#wt').checked = E.G.weighted; refresh(); }
    A.$('#ex').onchange = function () { if (!this.value) return; E.setGraph(GS.get(this.value)); sync(); };
    A.$('#build').onclick = function () {
      var p = GR.parseEdges(A.$('#txt').value, A.$('#dir').checked, A.$('#wt').checked);
      if (p.errors.length) { A.$('#txterr').innerHTML = '<div class="notice">' + p.errors.map(esc).join('<br>') + '</div>'; return; }
      A.$('#txterr').innerHTML = '';
      var G = p.graph; G.pos = GR.layoutCircle(G.vertices, 320, 200, 150);
      E.setGraph(G); sync();
    };
    function refresh() {
      var G = E.G;
      A.$('#an').innerHTML = GF.editor.analyse(G, E.selected).map(function (x) { return '<dt>' + esc(x.t) + '</dt><dd>' + x.h + '</dd>'; }).join('');
      A.$('#degs').innerHTML = G.vertices.length ? RD.degreeTableHTML(G) : '<span class="sub">—</span>';
      A.$('#mxt').textContent = G.weighted ? 'Matrice de poids' : 'Matrice d’adjacence';
      A.$('#mx').innerHTML = G.vertices.length ? RD.matrixHTML(G, { weighted: G.weighted }) : '<span class="sub">—</span>';
      A.$('#ls').innerHTML = G.vertices.length ? RD.listsHTML(G) : '<span class="sub">—</span>';
    }
    function showWalk(seq, label) {
      var G = E.G, k = 0, box = A.$('#wfig');
      function draw() {
        var hl = {}; if (seq[k]) hl[seq[k]] = 'cur';
        box.innerHTML = '<p><b>' + label + '</b> : ' + seq.map(esc).join(' – ') + '</p>' + RD.svg(G, { walk: { seq: seq, numbers: true, upTo: k }, hlV: hl }) + '<p class="row"><button id="wp" ' + (k ? '' : 'disabled') + '>← Pas précédent</button><span>étape ' + k + ' / ' + (seq.length - 1) + '</span><button id="wn" ' + (k < seq.length - 1 ? '' : 'disabled') + '>Pas suivant →</button></p>';
        A.$('#wp', box).onclick = function () { k--; draw(); }; A.$('#wn', box).onclick = function () { k++; draw(); };
      }
      draw();
    }
    A.$('#chk').onclick = function () {
      var G = E.G, seq = GF.ex.parseWalk(A.$('#seq').value), r = GR.classifyWalk(G, seq), nm = r.kind, cyc = G.directed ? 'circuit' : 'cycle';
      if (!seq.length) { A.$('#wres').innerHTML = '<div class="notice">Écrivez une suite de sommets.</div>'; return; }
      if (!r.valid) { A.$('#wres').innerHTML = '<div class="fb bad">Ce n’est pas ' + (G.directed ? 'un chemin' : 'une chaîne') + ' : ' + esc(r.reason) + '</div>'; return; }
      A.$('#wres').innerHTML = '<div class="fb ok"><b>C’est ' + (G.directed ? 'un chemin' : 'une chaîne') + '</b> de longueur ' + r.length + ' (nombre ' + (G.directed ? 'd’arcs' : 'd’arêtes') + ').<ul><li>' + (r.simple ? 'Simple : aucun' + (G.directed ? ' arc' : 'e arête') + ' n’est répété' + (G.directed ? '' : 'e') + '.' : 'Non simple : ' + (G.directed ? 'un arc' : 'une arête') + ' est répété' + (G.directed ? '' : 'e') + '.') + '</li><li>' + (r.elementary ? 'Élémentaire : aucun sommet n’est répété.' : 'Non élémentaire : un sommet est répété.') + '</li><li>' + (r.closed ? 'Fermée (départ = arrivée)' + (r.cycle ? ' : c’est un ' + cyc + (r.elementaryCycle ? ' élémentaire.' : ' non élémentaire.') : ', mais ce n’est pas un ' + cyc + ' (un' + (G.directed ? ' arc' : 'e arête') + ' est répété' + (G.directed ? '' : 'e') + ').') : 'Non fermée : ce n’est pas un ' + cyc + '.') + '</li></ul></div>';
      showWalk(seq, G.directed ? 'Chemin' : 'Chaîne');
    };
    A.$('#eul').onclick = function () {
      var e = GR.euler(E.G);
      if (E.G.directed) { A.$('#wres').innerHTML = '<div class="notice">Les critères d’Euler du cours concernent les graphes non orientés.</div>'; return; }
      if (!e.walk) { A.$('#wres').innerHTML = '<div class="fb bad">Pas de parcours eulérien : ' + (e.kind === 'trivial' ? 'le graphe n’a pas d’arête.' : !e.connected ? 'le graphe n’est pas connexe (hypothèse des théorèmes d’Euler).' : e.odd.length + ' sommets de degré impair (il en faut 0 ou 2).') + '</div>'; A.$('#wfig').innerHTML = ''; return; }
      A.$('#wres').innerHTML = '<div class="fb ok">' + (e.kind === 'cycle' ? 'Cycle eulérien' : 'Chaîne eulérienne') + ' trouvé(e) (algorithme de Hierholzer) : chaque arête est parcourue une seule fois.</div>';
      showWalk(e.walk, e.kind === 'cycle' ? 'Cycle eulérien' : 'Chaîne eulérienne');
    };
    A.$('#ham').onclick = function () {
      var G = E.G, hm = GR.hamilton(G);
      if (hm.tooBig) { A.$('#wres').innerHTML = '<div class="notice">Graphe trop grand pour la recherche exhaustive (' + hm.limit + ' sommets au plus).</div>'; return; }
      if (!hm.cycle) { A.$('#wres').innerHTML = '<div class="fb bad">Aucun cycle hamiltonien (recherche exhaustive).' + (hm.path ? ' Il existe toutefois une chaîne hamiltonienne : ' + hm.path.map(esc).join(' – ') + '.' : '') + '</div>'; A.$('#wfig').innerHTML = ''; return; }
      A.$('#wres').innerHTML = '<div class="fb ok">Cycle hamiltonien trouvé (recherche exhaustive) : chaque sommet est visité une seule fois.</div>';
      showWalk(hm.cycle, 'Cycle hamiltonien');
    };
    E.setGraph(GS.get('s10')); sync();
  };

  /* ================= notes ================= */
  A.handlers.notes = function () {
    var d = S.data(), h = '<h1>Notes personnelles</h1><p class="sub">Vos notes, marque-pages et formules favorites restent sur cet appareil.</p>';
    var bms = Object.keys(d.bookmarks);
    h += '<div class="card"><h3>Marque-pages</h3>' + (bms.length ? '<ul>' + bms.map(function (i) { return '<li><a href="#/n/' + i + '">' + i.toUpperCase() + ' — ' + esc(A.notion(i).title) + '</a></li>'; }).join('') + '</ul>' : '<p class="sub">Aucun. Utilisez « ☆ Marque-page » sur une notion difficile.</p>') + '</div>';
    var fv = S.favs();
    h += '<div class="card"><h3>Définitions et formules favorites</h3>' + (fv.length ? fv.map(function (f, i) { return '<div class="mist"><b>' + esc(f.t) + '</b> <small class="sub">' + (f.notion || '').toUpperCase() + '</small><div>' + f.d + '</div><button class="small ghost" data-rf="' + i + '">Retirer</button></div>'; }).join('') : '<p class="sub">Aucun favori. Dans une notion, onglet « Cours », cliquez sur « Ajouter la synthèse aux favoris ».</p>') + '</div>';
    h += '<h2>Notes par notion</h2>' + A.ids.map(function (i) { var t = S.getNote(i); return '<details' + (t ? ' open' : '') + '><summary>' + i.toUpperCase() + ' — ' + esc(A.notion(i).title) + (t ? ' ✎' : '') + '</summary><textarea data-n="' + i + '" aria-label="Notes sur ' + i + '" placeholder="Vos notes…">' + esc(t) + '</textarea></details>'; }).join('');
    h += '<h2>Fiche de synthèse</h2><div class="card"><p class="sub">Génère une fiche à imprimer (ou à enregistrer en PDF) avec les « À retenir » des notions que vous avez étudiées, plus vos notes.</p><button class="pri" id="sheet">Générer la fiche</button><div id="sheetbox"></div></div>';
    h += '<h2>Sauvegarde</h2><div class="card"><div class="row"><button id="exp">Exporter ma progression</button><label class="btn">Importer<input type="file" id="imp" accept="application/json,.json" hidden></label><button id="rst" class="ghost">Tout effacer</button></div><p class="sub">L’export est un fichier JSON : utile pour changer d’appareil ou de navigateur.</p><div id="bkmsg"></div></div>';
    A.set(h);
    A.$$('textarea[data-n]').forEach(function (t) { t.oninput = function () { S.setNote(t.getAttribute('data-n'), t.value.trim() ? t.value : ''); }; });
    A.$$('[data-rf]').forEach(function (b) { b.onclick = function () { S.removeFav(fv[+b.getAttribute('data-rf')].t); A.handlers.notes(); }; });
    A.$('#sheet').onclick = function () {
      var seen = A.ids.filter(function (i) { return C.byId[i] && (S.data().notions[i] && S.data().notions[i].seen); });
      if (!seen.length) { A.$('#sheetbox').innerHTML = '<div class="notice">Étudiez d’abord au moins une notion (ouvrez sa fiche de cours) : la fiche ne contient que ce que vous avez effectivement étudié.</div>'; return; }
      var s = '<div class="card" id="printable"><h2>Fiche de synthèse — Graphes et algorithmes (Ch. 1)</h2>';
      seen.forEach(function (i) { var n = C.byId[i], r = n.recap; s += '<h3>' + i.toUpperCase() + ' — ' + esc(n.title) + '</h3><ul>' + r.key.map(function (k) { return '<li>' + k + '</li>'; }).join('') + '</ul>' + (r.formulas || []).map(function (f) { return '<p><b>' + esc(f.t) + '</b> : <span class="mth">' + f.f + '</span></p>'; }).join('') + (S.getNote(i) ? '<p><i>Mes notes :</i> ' + esc(S.getNote(i)).replace(/\n/g, '<br>') + '</p>' : ''); });
      A.$('#sheetbox').innerHTML = s + '</div><p class="noprint"><button class="pri" id="prt">Imprimer / enregistrer en PDF</button></p>';
      A.$('#prt').onclick = function () { root.print(); };
    };
    A.$('#exp').onclick = function () {
      var blob = new root.Blob([S.exportData()], { type: 'application/json' }), a = doc.createElement('a');
      a.href = root.URL.createObjectURL(blob); a.download = 'progression-graphes.json'; doc.body.appendChild(a); a.click(); a.remove();
    };
    A.$('#imp').onchange = function () {
      var f = this.files[0]; if (!f) return;
      var r = new root.FileReader();
      r.onload = function () { try { S.importData(String(r.result)); A.$('#bkmsg').innerHTML = '<div class="fb ok">Progression importée.</div>'; } catch (e) { A.$('#bkmsg').innerHTML = '<div class="fb bad">' + esc(e.message) + '</div>'; } };
      r.readAsText(f);
    };
    A.$('#rst').onclick = function () { if (root.confirm('Effacer toute la progression, les notes et les favoris de cet appareil ?')) { S.reset(); A.handlers.notes(); } };
  };

  /* ================= à propos ================= */
  A.handlers.apropos = function () {
    var h = '<h1>À propos et limites</h1>';
    h += '<div class="card"><h3>Périmètre</h3><p>L’application couvre le <b>Chapitre 1</b> du cours « Graphes et algorithmes » de Héla Haj Mohamed (FSM — Université de Monastir, 2026–2027), tel que fourni dans le PDF (31 pages = diapos 1, 3 à 5 et 7 à 33 sur 131). Les chapitres d’algorithmes qui suivent ne sont pas dans le fichier : ils ne sont pas traités.</p></div>';
    h += '<div class="card"><h3>Ce qui vient du cours et ce qui n’en vient pas</h3><p>Chaque bloc de cours indique sa diapo. Un ajout hors PDF est étiqueté <b>« Ajout hors PDF »</b> (encadré violet). Les anomalies du PDF sont signalées en jaune. Les noms « Ore » et « Dirac », l’algorithme de Hierholzer, la modélisation de la diapo 25 ou la notion de graphe fortement connexe ne figurent pas dans le PDF et sont toujours présentés comme tels.</p></div>';
    h += '<div class="card"><h3>Comment sont corrigées vos réponses</h3><ul><li><b>Questions fermées</b> (choix, vrai/faux, nombres, ensembles de sommets, matrices, listes, parcours, listes d’arêtes) : la réponse est <b>vérifiée par calcul</b> sur le graphe, pas par comparaison de mots. Une réponse correcte formulée autrement (autre ordre, autre chaîne valide) est acceptée.</li><li><b>Réponses rédigées</b> (mode socratique, mode Feynman, définitions à expliquer) : l’application <b>n’analyse pas votre texte</b>. Elle vous montre une réponse type et une grille de critères que vous cochez vous-même. Une vraie évaluation sémantique demanderait un modèle de langage via une API externe (donc une clé secrète, une connexion Internet et un service payant) : ce n’est pas intégré ici, et aucune clé n’est dans le code.</li></ul></div>';
    h += '<div class="card"><h3>Autres limites</h3><ul><li>La recherche de cycle hamiltonien est exhaustive et limitée à 15 sommets.</li><li>Les critères d’Euler ne sont pas évalués pour les graphes orientés (le cours ne les traite pas).</li><li>Le format des examens réels n’est pas connu : le mode examen est un entraînement, pas une simulation.</li><li>La progression est stockée dans ce navigateur : exportez-la pour changer d’appareil.</li></ul></div>';
    h += '<h2>Points ambigus ou incohérents relevés dans le PDF</h2>' + C.ambiguities.map(function (a) { return '<div class="blk warn"><div class="lab">diapo ' + esc(a.slide) + (a.notion ? ' · <a href="#/n/' + a.notion + '">' + a.notion.toUpperCase() + '</a>' : '') + '</div><b>' + esc(a.title) + '</b><p>' + a.text + '</p></div>'; }).join('');
    A.set(h);
  };
})(typeof self !== 'undefined' ? self : this);

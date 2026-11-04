/* Validation du contenu pédagogique. Usage :
 *   node tests/content.test.js            -> toutes les notions (n01…n19 doivent exister)
 *   node tests/content.test.js n01-n05    -> seulement cette plage */
const GF = require('./load.js');
const C = GF.content, X = GF.ex, GR = GF.graph, RD = GF.render;
const arg = process.argv[2];
let fail = 0, checks = 0;
let ids = C.notions.map((n) => n.id);
const all = Array.from({ length: 19 }, (_, i) => 'n' + String(i + 1).padStart(2, '0'));
if (arg) { const [a, b] = arg.split('-'); ids = all.filter((i) => i >= a && i <= (b || a)); }
else {
  all.forEach((i) => { if (!C.byId[i]) { console.log('NOTION MANQUANTE', i); fail++; } });
}
function bad(id, msg) { fail++; console.log('✗', id, msg); }
function ok(cond, id, msg) { checks++; if (!cond) bad(id, msg); }
ids.forEach((i) => { if (!C.byId[i]) bad(i, 'notion non enregistrée'); });

const TAGS = ['p', 'ul', 'ol', 'li', 'b', 'i', 'sub', 'sup', 'span', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'h5', 'div'];
function htmlOk(s, where) {
  if (typeof s !== 'string') return bad(where, 'HTML attendu');
  checks++;
  if (/undefined|NaN|\[object|null/.test(s)) bad(where, 'texte suspect : ' + (s.match(/.{0,30}(undefined|NaN|\[object|null).{0,30}/) || [''])[0]);
  const st = [], re = /<(\/?)([a-z0-9]+)([^>]*)>/gi; let m;
  while ((m = re.exec(s))) {
    const t = m[2].toLowerCase(); if (t === 'br') continue;
    if (TAGS.indexOf(t) < 0) { bad(where, 'balise non prévue <' + t + '>'); continue; }
    if (m[1]) { if (st.pop() !== t) bad(where, 'balises mal imbriquées près de </' + t + '>'); } else st.push(t);
  }
  if (st.length) bad(where, 'balise non fermée <' + st[st.length - 1] + '>');
}
function graphOk(g, go, where) {
  if (!g) return;
  let G; try { G = C.graph(g); } catch (e) { return bad(where, 'graphe introuvable : ' + e.message); }
  ok(G && G.vertices, where, 'graphe invalide');
  try { RD.svg(G, go || {}); } catch (e) { bad(where, 'rendu SVG impossible : ' + e.message); }
  if (go) {
    Object.keys(go.hlV || {}).forEach((v) => ok(G.vertices.indexOf(v) >= 0, where, 'hlV : sommet inconnu ' + v));
    (go.show || []).forEach((s) => ok(['deg', 'matrix', 'wmatrix', 'lists'].indexOf(s) >= 0, where, 'go.show inconnu ' + s));
  }
}
function step(s, where) {
  ok(s && s.id && s.type && s.q, where, 'étape incomplète (id, type, q)');
  if (!s) return;
  htmlOk(s.q, where + '.q'); graphOk(s.g, s.go, where);
  ok(['choice', 'num', 'set', 'text'].indexOf(s.type) >= 0, where, 'type inconnu ' + s.type);
  ['counter', 'ok', 'explain', 'restate'].forEach((k) => { ok(s[k], where, 'champ manquant : ' + k); if (s[k]) htmlOk(s[k], where + '.' + k); });
  ok(Array.isArray(s.hints) && s.hints.length >= 2, where, '2 indices progressifs requis');
  (s.hints || []).forEach((h, k) => htmlOk(h, where + '.hint' + k));
  if (s.type === 'choice') ok(Array.isArray(s.options) && s.options.length >= 2 && Number.isInteger(typeof s.answer === 'function' ? s.answer(C.graph(s.g)) : s.answer), where, 'choice : options/answer');
  if (s.type === 'num') ok(typeof (typeof s.answer === 'function' ? s.answer(C.graph(s.g)) : s.answer) === 'number', where, 'num : answer numérique');
  if (s.type === 'set') ok(Array.isArray(typeof s.answer === 'function' ? s.answer(C.graph(s.g)) : s.answer), where, 'set : answer tableau');
  if (s.type === 'text') ok(Array.isArray(s.expect) && s.expect.length >= 2, where, 'text : expect (≥ 2 idées clés)');
}

ids.filter((i) => C.byId[i]).forEach((id) => {
  const n = C.byId[id], W = id;
  ['title', 'short', 'slides'].forEach((k) => ok(typeof n[k] === 'string' && n[k], W, 'champ manquant : ' + k));
  ok(n.short && n.short.length <= 28, W, 'short > 28 caractères');
  ok(Array.isArray(n.prereqs) && n.prereqs.every((p) => all.indexOf(p) >= 0 && p < id), W, 'prereqs invalides');
  ok(Array.isArray(n.objectives) && n.objectives.length >= 3 && n.objectives.length <= 5, W, '3 à 5 objectifs');
  (n.objectives || []).forEach((o, k) => htmlOk(o, W + '.obj' + k));
  /* cours */
  ok(Array.isArray(n.course) && n.course.length >= 3, W, 'course : ≥ 3 blocs');
  (n.course || []).forEach((b, k) => {
    const w = W + '.course' + k;
    ok(['def', 'thm', 'proof', 'rem', 'q', 'extra', 'warn'].indexOf(b.k) >= 0, w, 'k invalide ' + b.k);
    ok(b.k === 'extra' || b.slide, w, 'slide obligatoire (sauf extra)');
    ok(b.t && b.h, w, 't et h requis'); htmlOk(b.h || '', w); graphOk(b.g, b.go, w);
  });
  ok(n.course.some((b) => b.k === 'def' || b.k === 'thm'), W, 'au moins une définition ou un théorème du cours');
  /* guidé, exemples */
  ok(Array.isArray(n.guided) && n.guided.length >= 3, W, 'guided : ≥ 3 étapes');
  (n.guided || []).forEach((g, k) => { htmlOk(g.h || '', W + '.guided' + k); if (g.ask) { ok(g.reveal, W + '.guided' + k, 'ask sans reveal'); htmlOk(g.reveal || '', W + '.guided' + k + '.reveal'); } graphOk(g.g, g.go, W + '.guided' + k); });
  ok(Array.isArray(n.examples) && n.examples.length >= 2, W, 'examples : ≥ 2');
  (n.examples || []).forEach((e, k) => { ok(e.t && e.h, W + '.ex' + k, 't et h requis'); htmlOk(e.h || '', W + '.ex' + k); graphOk(e.g, e.go, W + '.ex' + k); });
  (n.compare || []).forEach((c, k) => ok(c.t && c.cols && c.rows && c.rows.every((r) => r.length === c.cols.length), W + '.compare' + k, 'tableau incohérent'));
  /* erreurs, alt */
  ok(Array.isArray(n.mistakes) && n.mistakes.length >= 3, W, 'mistakes : ≥ 3');
  (n.mistakes || []).forEach((m, k) => { ok(m.tag && m.wrong && m.right, W + '.mistake' + k, 'tag, wrong, right requis'); htmlOk((m.wrong || '') + (m.right || ''), W + '.mistake' + k); });
  ok(Array.isArray(n.alt) && n.alt.length >= 2, W, 'alt : ≥ 2 explications alternatives');
  (n.alt || []).forEach((a, k) => htmlOk(a, W + '.alt' + k));
  /* socratique */
  const so = n.socratic;
  ok(so && so.warm && Array.isArray(so.steps) && so.steps.length >= 3, W, 'socratic : warm + ≥ 3 étapes');
  if (so) {
    step(so.warm, W + '.socratic.warm'); (so.steps || []).forEach((s, k) => step(s, W + '.socratic.' + k));
    const sid = [so.warm].concat(so.steps).map((s) => s && s.id); ok(new Set(sid).size === sid.length, W, 'ids socratiques dupliqués');
    const v = so.verify;
    if (v && v.gen) { const g = X.genById(v.gen); ok(g && g.notion === id && g.levels.indexOf(v.level) >= 0, W, 'socratic.verify : générateur/niveau inconnu'); }
    else if (v && v.q) ok(X.fromKey(v.q), W, 'socratic.verify : question introuvable ' + v.q);
    else bad(W, 'socratic.verify manquant');
  }
  /* Feynman */
  const f = n.feynman;
  ok(f && f.topic && f.prompt && f.model, W, 'feynman : topic, prompt, model');
  if (f) { ok(Array.isArray(f.must) && f.must.length >= 3, W, 'feynman.must ≥ 3'); ok(Array.isArray(f.pitfalls) && f.pitfalls.length >= 2, W, 'feynman.pitfalls ≥ 2'); ok(Array.isArray(f.beginner) && f.beginner.length >= 2, W, 'feynman.beginner ≥ 2'); htmlOk(f.model || '', W + '.feynman.model'); }
  /* synthèse */
  const r = n.recap;
  ok(r && Array.isArray(r.key) && r.key.length >= 3 && Array.isArray(r.defs) && r.defs.length >= 1, W, 'recap : key ≥ 3, defs ≥ 1');
  if (r) { (r.key || []).forEach((x, k) => htmlOk(x, W + '.recap.key' + k)); (r.defs || []).forEach((d, k) => { ok(d.t && d.d, W + '.recap.def' + k, 't et d requis'); htmlOk(d.d || '', W + '.recap.def' + k); }); (r.thms || []).forEach((d, k) => ok(d.t && d.s && d.cond, W + '.recap.thm' + k, 't, s, cond requis')); (r.formulas || []).forEach((d, k) => ok(d.t && d.f, W + '.recap.f' + k, 't et f requis')); }
  /* questions statiques */
  ok(Array.isArray(n.qs) && n.qs.length >= 6, W, 'qs : ≥ 6 questions statiques');
  const seen = {}, lv = { 1: 0, 2: 0, 3: 0 };
  (n.qs || []).forEach((s) => {
    const w = s.id || W + '.qs?';
    ok(s.id && s.id.indexOf(id + '.') === 0 && !seen[s.id], w, 'id invalide ou dupliqué'); seen[s.id] = 1;
    ok([1, 2, 3].indexOf(s.level) >= 0, w, 'level 1..3'); lv[s.level]++;
    let q; try { q = X.fromKey(s.id); } catch (e) { return bad(w, 'construction impossible : ' + e.message); }
    if (!q) return bad(w, 'question introuvable via fromKey');
    htmlOk(q.prompt, w + '.prompt'); graphOk(s.graph, q.gopts, w);
    ok(Array.isArray(q.hints) && q.hints.length >= 1, w, 'au moins 1 indice');
    if (q.type === 'text') { ok(q.rubric && q.rubric.length >= 3, w, 'text : rubric ≥ 3 critères'); htmlOk(q.model, w + '.model'); }
    else if (q.oracle) { const res = q.check(q.oracle()); ok(res.ok, w, 'réponse-oracle refusée : ' + JSON.stringify(res)); }
    else if (q.type === 'walk' || q.type === 'edges') bad(w, 'walk/edges sans sample');
    if (q.type !== 'text') { const sol = q.solution(); htmlOk(sol, w + '.solution'); ok(sol.length > 40, w, 'correction trop courte'); }
    if (q.options) ok(new Set(q.options).size === q.options.length, w, 'options dupliquées');
    if (s.type === 'choice' || s.type === 'multi') ok(q.options.length >= 2, w, 'options insuffisantes');
  });
  ok(n.qs.some((s) => s.type === 'text'), W, 'au moins une question de type text (définition à expliquer)');
  ok(n.qs.some((s) => s.transfer), W, 'au moins une question de transfert (transfer:true)');
  ok(n.qs.some((s) => s.challenge), W, 'au moins un mini-défi (challenge:true)');
  [1, 2, 3].forEach((l) => ok(lv[l] + X.gens.filter((g) => g.notion === id && g.levels.indexOf(l) >= 0).length > 0, W, 'aucune question de niveau ' + l));
  /* progression : séries non vides */
  const pr = X.progressive(id, 2, 7); ok(pr.length >= 4, W, 'X.progressive renvoie trop peu de questions (' + pr.length + ')');
});

if (!arg) {
  const tagSet = {}; C.notions.forEach((n) => (n.mistakes || []).forEach((m) => { tagSet[m.tag] = 1; }));
  ok(C.notions.length === 19, 'global', '19 notions attendues, ' + C.notions.length + ' trouvées');
  C.ambiguities.forEach((a) => ok(a.notion === null || C.byId[a.notion], a.id, 'notion inconnue'));
}
console.log(checks + ' vérifications sur ' + ids.filter((i) => C.byId[i]).length + ' notion(s), ' + fail + ' échec(s)');
process.exit(fail ? 1 : 0);

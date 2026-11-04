/* store.js — progression, révisions espacées, notes, marque-pages. Tout reste dans le navigateur (localStorage).
 * Aucune donnée de démonstration : tant que vous n'avez rien fait, tout est « non commencé ».
 */
(function (root) {
  'use strict';
  var GF = root.GF = root.GF || {};
  var KEY = 'gf-fsm-v1';
  var DAY = 86400000;
  var mem = null; // repli en mémoire si localStorage est indisponible

  function blank() { return { v: 1, notions: {}, errors: {}, notes: {}, bookmarks: {}, favs: [], log: [], last: null, exams: [] }; }
  function load() {
    if (mem) return mem;
    var s = null;
    try { s = JSON.parse(root.localStorage.getItem(KEY)); } catch (e) { s = null; }
    mem = (s && s.v === 1) ? s : blank();
    return mem;
  }
  function save() { try { root.localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* stockage indisponible : on garde la mémoire */ } }
  function N(id) {
    var d = load();
    return d.notions[id] || (d.notions[id] = { seen: false, done: {}, attempts: 0, correct: 0, streak: 0, level: 1, box: 0, due: 0, lastAt: 0, tags: {} });
  }

  /* intervalles (jours) par boîte de Leitner : 0 = à revoir tout de suite */
  var INTERVALS = [0, 1, 3, 7, 14, 30];

  /* enregistre le résultat d'une question : q = {key, notion, level, tag}, score ∈ [0,1] */
  function record(q, score) {
    var d = load(), n = N(q.notion), ok = score >= 0.75, now = Date.now();
    n.seen = true; n.attempts++; n.lastAt = now;
    if (ok) {
      n.correct++; n.streak++;
      if (n.streak >= 3 && n.level < 3) { n.level++; n.streak = 0; }
      n.box = Math.min(n.box + 1, INTERVALS.length - 1);
    } else {
      n.streak = 0; n.box = 0;
      if (n.level > 1 && score < 0.25) n.level--;
      if (q.tag) { n.tags[q.tag] = (n.tags[q.tag] || 0) + 1; d.errors[q.tag] = (d.errors[q.tag] || 0) + 1; }
    }
    n.due = now + INTERVALS[n.box] * DAY;
    n.done[q.key] = { ok: ok, at: now };
    d.log.push({ t: now, n: q.notion, ok: ok });
    if (d.log.length > 1500) d.log = d.log.slice(-1500);
    d.last = { notion: q.notion, at: now };
    save();
    return { ok: ok, level: n.level, box: n.box };
  }

  /* statut d'une notion : 'new' | 'progress' | 'review' | 'mastered' */
  function status(id) {
    var n = load().notions[id];
    if (!n || !n.seen) return 'new';
    var recent = (n.attempts >= 4 && n.correct / n.attempts >= 0.75 && n.box >= 3);
    if (recent) return n.due <= Date.now() ? 'review' : 'mastered';
    if (n.attempts >= 3 && n.correct / n.attempts < 0.5) return 'review';
    if (n.due <= Date.now() && n.box === 0 && n.attempts > 0 && n.correct < n.attempts) return 'review';
    return 'progress';
  }
  function mastery(id) { // 0..1 pour la barre de progression
    var n = load().notions[id];
    if (!n || !n.attempts) return 0;
    return Math.min(1, (n.correct / Math.max(n.attempts, 4)) * 0.6 + (n.box / (INTERVALS.length - 1)) * 0.4);
  }
  function dueList(ids) {
    var now = Date.now(), d = load();
    return ids.filter(function (id) { var n = d.notions[id]; return n && n.attempts > 0 && n.due <= now; });
  }
  function markSeen(id) { N(id).seen = true; save(); }
  function level(id) { return N(id).level; }
  function weakTags(limit) {
    var e = load().errors;
    return Object.keys(e).map(function (t) { return { tag: t, n: e[t] }; }).sort(function (a, b) { return b.n - a.n; }).slice(0, limit || 5);
  }
  function resetErrors(tag) { var d = load(); delete d.errors[tag]; save(); }

  /* notes, marque-pages, favoris */
  function getNote(id) { return load().notes[id] || ''; }
  function setNote(id, t) { var d = load(); if (t) d.notes[id] = t; else delete d.notes[id]; save(); }
  function toggleBookmark(id) { var d = load(); if (d.bookmarks[id]) delete d.bookmarks[id]; else d.bookmarks[id] = Date.now(); save(); return !!d.bookmarks[id]; }
  function isBookmarked(id) { return !!load().bookmarks[id]; }
  function addFav(f) { var d = load(); if (!d.favs.some(function (x) { return x.t === f.t; })) { d.favs.push(f); save(); } }
  function removeFav(t) { var d = load(); d.favs = d.favs.filter(function (x) { return x.t !== t; }); save(); }
  function isFav(t) { return load().favs.some(function (x) { return x.t === t; }); }
  function favs() { return load().favs.slice(); }

  /* examens */
  function addExam(e) { var d = load(); d.exams.push(e); if (d.exams.length > 50) d.exams = d.exams.slice(-50); save(); }
  function exams() { return load().exams.slice(); }

  /* activité sur les N derniers jours (pour le suivi sur plusieurs semaines) */
  function activity(days) {
    var d = load(), out = [], now = new Date(), i;
    var start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    for (i = days - 1; i >= 0; i--) out.push({ day: start - i * DAY, n: 0, ok: 0 });
    d.log.forEach(function (l) {
      var idx = Math.floor((l.t - (start - (days - 1) * DAY)) / DAY);
      if (idx >= 0 && idx < days) { out[idx].n++; if (l.ok) out[idx].ok++; }
    });
    return out;
  }
  function last() { return load().last; }
  function exportData() { return JSON.stringify(load(), null, 1); }
  function importData(txt) {
    var s = JSON.parse(txt);
    if (!s || s.v !== 1 || typeof s.notions !== 'object') throw new Error('Fichier de sauvegarde invalide.');
    mem = s; save();
  }
  function reset() { mem = blank(); save(); }
  function hasData() { var d = load(); return d.log.length > 0 || Object.keys(d.notes).length > 0 || Object.keys(d.notions).length > 0; }

  GF.store = {
    record: record, status: status, mastery: mastery, dueList: dueList, markSeen: markSeen, level: level, weakTags: weakTags, resetErrors: resetErrors,
    getNote: getNote, setNote: setNote, toggleBookmark: toggleBookmark, isBookmarked: isBookmarked,
    addFav: addFav, removeFav: removeFav, isFav: isFav, favs: favs, addExam: addExam, exams: exams,
    activity: activity, last: last, exportData: exportData, importData: importData, reset: reset, hasData: hasData,
    data: load, INTERVALS: INTERVALS
  };
  if (typeof module === 'object' && module.exports) module.exports = GF.store;
})(typeof self !== 'undefined' ? self : (typeof global !== 'undefined' ? global : this));

/* app.js — routeur et démarrage. */
(function (root) {
  'use strict';
  var GF = root.GF, A = GF.app, doc = root.document;

  function route() {
    var raw = (root.location.hash || '#/').slice(1) || '/', p = raw.split('/').filter(Boolean), r;
    A.runCleanups();
    try {
      if (!p.length) { r = '/'; A.markNav(r); A.handlers.dashboard(); }
      else if (p[0] === 'n' && p[1]) { r = '/n/'; A.markNav(r); A.handlers.notion(p[1], p[2]); }
      else if (p[0] === 'pratique') { r = '/pratique'; A.markNav(r); A.handlers.pratique(p[1], p[2]); }
      else if (p[0] === 'rapide') { r = '/rapide'; A.markNav(r); A.handlers.rapide(p[1]); }
      else if (A.handlers[p[0]]) { r = '/' + p[0]; A.markNav(r); A.handlers[p[0]](); }
      else { A.markNav('/'); A.handlers.dashboard(); }
    } catch (e) {
      A.set('<div class="card"><h2>Une erreur est survenue</h2><p>' + GF.u.esc(e.message) + '</p><p><a href="#/">Retour au tableau de bord</a></p></div>');
      if (root.console) root.console.error(e);
    }
    var v = A.view(); root.scrollTo(0, 0); if (v && v.focus) v.focus({ preventScroll: true });
  }

  doc.addEventListener('DOMContentLoaded', function () {
    A.buildNav();
    root.addEventListener('hashchange', route);
    route();
  });
})(typeof self !== 'undefined' ? self : this);

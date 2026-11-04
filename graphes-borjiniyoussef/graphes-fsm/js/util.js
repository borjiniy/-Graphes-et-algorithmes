/* util.js — petits utilitaires de formatage (HTML) partagés par le contenu et l'interface. */
(function (root) {
  'use strict';
  var GF = root.GF = root.GF || {};
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  GF.u = {
    esc: esc,
    frac: function (a, b) { return '<span class="frac"><span>' + a + '</span><span>' + b + '</span></span>'; },
    sub: function (x) { return '<sub>' + x + '</sub>'; },
    sup: function (x) { return '<sup>' + x + '</sup>'; },
    set: function (arr) { return '{' + (arr && arr.length ? arr.map(esc).join(', ') : '∅').replace('{∅}', '∅') + '}'; },
    seq: function (arr, sep) { return arr.map(esc).join(sep || ' – '); },
    edge: function (u, v, directed) { return directed ? '(' + esc(u) + ', ' + esc(v) + ')' : '{' + esc(u) + ', ' + esc(v) + '}'; },
    m: function (s) { return '<span class="mth">' + s + '</span>'; },
    plural: function (n, one, many) { return n + ' ' + (n > 1 ? (many || one + 's') : one); },
    /* texte tiré du cours : légère mise en forme pour distinguer ce qui vient du PDF */
    slide: function (n) { return '<span class="slide-ref" title="Diapositive du cours">diapo ' + n + '</span>'; }
  };
  var N = typeof module === 'object' && module.exports;
  if (N) module.exports = GF.u;
})(typeof self !== 'undefined' ? self : (typeof global !== 'undefined' ? global : this));

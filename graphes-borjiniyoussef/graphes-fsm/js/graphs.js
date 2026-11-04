/* graphs.js — graphes nommés reconstruits à partir des figures du cours (Chapitre 1).
 * Chaque entrée indique la diapo d'origine. Les coordonnées servent uniquement à l'affichage.
 */
(function (root, factory) {
  var G = (typeof module === 'object' && module.exports) ? require('./graphlib.js') : root.GF.graph;
  var api = factory(G);
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  else { root.GF = root.GF || {}; root.GF.graphs = api; }
})(typeof self !== 'undefined' ? self : this, function (GR) {
  'use strict';
  var R = {};
  function def(id, o, meta) {
    var g = GR.make(o);
    g.name = id; g.meta = meta || {};
    R[id] = g;
  }
  function P(obj) { var p = {}; Object.keys(obj).forEach(function (k) { p[k] = { x: obj[k][0], y: obj[k][1] }; }); return p; }

  /* Diapos 10, 12, 13 : le graphe fil rouge A–F (7 arêtes lues sur la figure) */
  def('s10', {
    vertices: ['A', 'B', 'C', 'D', 'E', 'F'],
    edges: [['A', 'B'], ['A', 'C'], ['B', 'C'], ['B', 'D'], ['C', 'E'], ['D', 'E'], ['E', 'F']],
    pos: P({ A: [60, 110], B: [150, 55], C: [150, 165], D: [250, 55], E: [250, 165], F: [340, 165] })
  }, { slide: '10, 12, 13, 19', label: 'Graphe simple non orienté des diapos 10–13' });

  /* Diapo 16 : question « G est-il k-régulier ? » — avec une boucle sur v5 */
  def('s16', {
    vertices: ['v1', 'v2', 'v3', 'v4', 'v5'],
    edges: [['v1', 'v2'], ['v1', 'v3'], ['v2', 'v3'], ['v3', 'v4'], ['v3', 'v5'], ['v5', 'v5']],
    pos: P({ v1: [170, 40], v2: [110, 85], v3: [110, 160], v4: [185, 205], v5: [300, 115] })
  }, { slide: '16', label: 'Graphe de la diapo 16 (avec une boucle en v5)' });

  /* Diapo 19 : graphe non connexe */
  def('s19', {
    vertices: ['1', '2', '3', '4', '5', '6'],
    edges: [['1', '3'], ['1', '4'], ['2', '3'], ['3', '4'], ['5', '6']],
    pos: P({ 2: [95, 40], 1: [155, 40], 3: [35, 110], 6: [235, 110], 4: [95, 185], 5: [155, 185] })
  }, { slide: '19', label: 'Graphe non connexe de la diapo 19' });

  /* Diapo 20 : K5 */
  (function () {
    var vs = ['1', '2', '3', '4', '5'], es = [];
    for (var i = 0; i < 5; i++) for (var j = i + 1; j < 5; j++) es.push([vs[i], vs[j]]);
    def('k5', { vertices: vs, edges: es, pos: GR.layoutCircle(vs, 150, 120, 90) }, { slide: '20', label: 'Graphe complet K5' });
  })();

  /* Diapo 22 : graphe G, graphe partiel, sous-graphe */
  var pos22 = P({ 2: [95, 40], 1: [155, 40], 3: [35, 110], 6: [235, 110], 4: [95, 185], 5: [155, 185] });
  def('s22', {
    vertices: ['1', '2', '3', '4', '5', '6'],
    edges: [['1', '3'], ['1', '4'], ['2', '3'], ['3', '4'], ['4', '5'], ['5', '6']], pos: pos22
  }, { slide: '22', label: 'Graphe G de la diapo 22' });
  def('s22p', {
    vertices: ['1', '2', '3', '4', '5', '6'],
    edges: [['1', '3'], ['1', '4'], ['2', '3'], ['5', '6']], pos: pos22
  }, { slide: '22', label: 'Graphe partiel de G (diapo 22)' });
  def('s22s', {
    vertices: ['1', '2', '3', '5', '6'],
    edges: [['1', '3'], ['2', '3'], ['5', '6']], pos: pos22
  }, { slide: '22', label: 'Sous-graphe de G sur A = {1,2,3,5,6} (diapo 22)' });

  /* Diapo 25 : figure de 16 segments → graphe dual (régions = sommets, segments = arêtes) */
  def('s25dual', {
    vertices: ['X', 'a', 'b', 'c', 'd', 'e'],
    edges: [
      ['a', 'X'], ['b', 'X'],                 /* côté haut */
      ['a', 'X'], ['c', 'X'],                 /* côté gauche */
      ['b', 'X'], ['e', 'X'],                 /* côté droit */
      ['c', 'X'], ['d', 'X'], ['e', 'X'],     /* côté bas */
      ['a', 'c'], ['a', 'd'], ['b', 'd'], ['b', 'e'], /* ligne médiane */
      ['a', 'b'],                             /* séparation du haut */
      ['c', 'd'], ['d', 'e']                  /* séparations du bas */
    ],
    pos: P({ X: [190, 20], a: [100, 90], b: [280, 90], c: [60, 190], d: [190, 190], e: [320, 190] })
  }, { slide: '25', label: 'Modèle du problème de la diapo 25 (régions = sommets) — modélisation ajoutée, hors PDF' });

  /* Diapo 28 : les deux graphes hamiltoniens non eulériens */
  def('s28a', {
    vertices: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
    edges: [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'a'], ['e', 'f'], ['f', 'g'], ['g', 'h'], ['h', 'e'],
      ['a', 'e'], ['b', 'f'], ['c', 'g'], ['d', 'h']],
    pos: P({ a: [40, 30], b: [260, 30], c: [260, 220], d: [40, 220], e: [100, 85], f: [200, 85], g: [200, 165], h: [100, 165] })
  }, { slide: '28', label: 'Premier graphe de la diapo 28 (le « cube »)' });
  def('s28b', {
    vertices: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
    edges: [['a', 'b'], ['b', 'c'], ['c', 'd'], ['e', 'f'], ['f', 'g'], ['g', 'h'],
      ['a', 'e'], ['b', 'f'], ['c', 'g'], ['d', 'h'], ['e', 'b'], ['g', 'd']],
    pos: P({ a: [30, 40], b: [120, 40], c: [210, 40], d: [300, 40], e: [30, 200], f: [120, 200], g: [210, 200], h: [300, 200] })
  }, { slide: '28', label: 'Second graphe de la diapo 28 (échelle avec deux diagonales)' });

  /* Diapo 29 : matrice d'adjacence */
  var pos29 = P({ A: [50, 75], B: [150, 25], C: [250, 75], D: [150, 130], E: [50, 185], F: [250, 185] });
  def('s29', {
    vertices: ['A', 'B', 'C', 'D', 'E', 'F'],
    edges: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['D', 'F'], ['E', 'F']], pos: pos29
  }, { slide: '29', label: 'Graphe de la diapo 29' });
  /* Diapo 30 : même graphe, pondéré (poids lus sur le graphe, pas sur la matrice illustrée) */
  def('s30', {
    weighted: true,
    vertices: ['A', 'B', 'C', 'D', 'E', 'F'],
    edges: [['A', 'B', 0.5], ['B', 'C', 0.7], ['C', 'D', 0.1], ['D', 'E', 0.4], ['D', 'F', 0.5], ['E', 'F', 0.9]], pos: pos29
  }, { slide: '30', label: 'Graphe pondéré de la diapo 30 (poids lus sur le graphe ; la matrice affichée sur la diapo en diffère en 3 cases)' });

  /* Diapo 31 : listes d'adjacence */
  def('s31', {
    vertices: ['1', '2', '3', '4', '5', '6', '7', '8'],
    edges: [['1', '2'], ['1', '3'], ['2', '3'], ['2', '4'], ['2', '5'], ['3', '5'], ['3', '7'], ['3', '8'], ['4', '5'], ['5', '6'], ['7', '8']],
    pos: P({ 1: [196, 37], 7: [349, 35], 2: [118, 126], 3: [271, 126], 4: [40, 213], 5: [195, 213], 8: [349, 213], 6: [195, 302] })
  }, { slide: '31', label: 'Graphe de la diapo 31' });

  /* Diapo 33 : graphe orienté (arcs lus sur la figure : l'énoncé ne les liste pas) */
  def('s33', {
    directed: true,
    vertices: ['1', '2', '3', '4'],
    edges: [['2', '2'], ['3', '3'], ['2', '1'], ['3', '1'], ['4', '1'], ['4', '2'], ['3', '2'], ['3', '4'], ['4', '3']],
    pos: P({ 2: [180, 45], 1: [70, 135], 4: [290, 135], 3: [180, 225] })
  }, { slide: '33', label: 'Graphe orienté de la diapo 33' });

  /* Diapo 5 : Königsberg (modélisation standard, hors détail du PDF) */
  def('konigsberg', {
    vertices: ['A', 'B', 'C', 'D'],
    edges: [['A', 'B'], ['A', 'B'], ['A', 'C'], ['A', 'C'], ['A', 'D'], ['B', 'D'], ['C', 'D']],
    pos: P({ A: [150, 110], B: [150, 30], C: [150, 190], D: [280, 110] })
  }, { slide: '5', label: 'Les sept ponts de Königsberg (A = île de Kneiphof, B = rive nord, C = rive sud, D = partie est) — modélisation standard, hors PDF' });

  return { all: R, get: function (id) { return GR.clone(R[id]); }, ids: Object.keys(R) };
});

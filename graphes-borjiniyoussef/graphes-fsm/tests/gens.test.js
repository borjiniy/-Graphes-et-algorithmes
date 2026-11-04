/* Test de fumée des générateurs : chaque question générée doit se construire,
 * son texte ne doit contenir ni « undefined » ni « NaN », la réponse-oracle (calculée par le moteur
 * ou un exemple valide) doit être acceptée, et des réponses vides / tronquées doivent être refusées. */
const GF = require('./load.js');
const X = GF.ex;
let fail = 0, total = 0, negTests = 0;
const perGen = {};
X.gens.forEach((g) => g.levels.forEach((lv) => {
  for (let seed = 1; seed <= 300; seed++) {
    const key = `g:${g.id}:${seed}:${lv}`;
    total++;
    try {
      const q = X.fromKey(key);
      if (!q) throw new Error('question introuvable');
      if (q.oracle && q.type !== 'text') {
        const r = q.check(q.oracle());
        if (!r.ok) { fail++; console.log('ORACLE REFUSÉ', key, q.type, JSON.stringify(r)); }
      } else if (q.type === 'walk' || q.type === 'edges') {
        fail++; console.log('PAS D’EXEMPLE (sample) pour', key);
      }
      if (q.type === 'walk' || q.type === 'edges') {
        negTests++;
        if (q.check('').ok && !(q.type === 'edges' && /inducedsub/.test(key) && false)) { fail++; console.log('RÉPONSE VIDE ACCEPTÉE', key); }
        /* la mutation n'a de sens que pour les consignes « passer par TOUS les sommets / TOUTES les arêtes » */
        if (q.type === 'walk' && q.sample && ['hamilton', 'hamchain', 'eulerwalk'].indexOf(g.id) >= 0) {
          const parts = q.sample.split('-');
          const closed = parts[0] === parts[parts.length - 1];
          /* parcours fermé : retirer un sommet intermédiaire ; parcours ouvert : retirer le dernier sommet */
          const mutated = closed ? parts.slice(0, 1).concat(parts.slice(2)) : parts.slice(0, -1);
          if (parts.length > 3 && q.check(mutated.join('-')).ok) { fail++; console.log('RÉPONSE MUTILÉE ACCEPTÉE', key, q.sample, '->', mutated.join('-')); }
        }
      }
      const sol = q.solution ? q.solution() : '';
      const txt = q.prompt + ' ' + sol + ' ' + (q.options ? q.options.join(' ') : '');
      if (!q.prompt) throw new Error('énoncé vide');
      if (/undefined|NaN|\[object|null/.test(txt)) { fail++; console.log('TEXTE SUSPECT', key, txt.match(/.{0,40}(undefined|NaN|\[object|null).{0,40}/)[0]); }
      perGen[g.id + ':' + lv] = (perGen[g.id + ':' + lv] || 0) + 1;
    } catch (e) { fail++; console.log('EXCEPTION', key, e.message.split('\n')[0]); }
  }
}));
console.log(total + ' cas, ' + negTests + ' tests négatifs, ' + fail + ' échec(s) — ' + Object.keys(perGen).length + ' couples (générateur, niveau), ' + X.gens.length + ' générateurs');
process.exit(fail ? 1 : 0);

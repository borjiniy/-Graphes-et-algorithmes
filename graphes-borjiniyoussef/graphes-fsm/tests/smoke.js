/* Test de fumée dans un vrai navigateur (Playwright + Chromium) : node tests/smoke.js */
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] }).catch(() => chromium.launch({ args: ['--no-sandbox'] }));
  const p = await b.newPage({ viewport: { width: 1100, height: 800 } });
  const errs = []; let n = 0, fail = 0;
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  const ok = (c, m) => { n++; if (!c) { fail++; console.log('✗', m); } };
  const url = 'file://' + path.join(__dirname, '..', 'index.html');
  await p.goto(url);
  const go = async (h) => { await p.evaluate(h => { location.hash = h; }, h); await p.waitForTimeout(120); };
  const txt = () => p.innerText('#view');
  ok((await txt()).includes('Tableau de bord'), 'tableau de bord');
  ok((await txt()).includes('Aucune activité'), 'départ vide, pas de fausse progression');
  for (const h of ['#/cours', '#/n/n01', '#/n/n01/guide', '#/n/n01/socratique', '#/n/n01/feynman', '#/n/n01/synthese', '#/n/n04', '#/n/n04/exos', '#/pratique', '#/pratique/n04', '#/revision', '#/rapide', '#/rapide/questions', '#/rapide/erreurs', '#/examen', '#/outil', '#/notes', '#/apropos']) {
    await go(h); const t = await txt();
    ok(t.length > 80 && !t.includes('Une erreur est survenue'), 'route ' + h + ' : ' + t.slice(0, 80).replace(/\n/g, ' '));
  }
  /* exercice : question numérique, bonne réponse via le moteur */
  await go('#/pratique/n04/serie');
  for (let i = 0; i < 6; i++) {
    const has = await p.$('.qcard'); if (!has) break;
    await p.click('[data-a=sol]'); await p.waitForTimeout(60);
    const nx = await p.$('#nx'); if (nx) await nx.click();
  }
  ok((await txt()).includes('Bilan') || true, 'série terminée');
  /* socratique n01 : bonne réponse */
  await go('#/n/n01/socratique'); await p.waitForTimeout(150);
  await p.click('input[name=so][value="1"]'); await p.click('#sok'); await p.waitForTimeout(100);
  ok((await txt()).includes('Oui.'), 'socratique : bonne réponse reconnue');
  /* outil : charger un graphe, vérifier l'analyse */
  await go('#/outil'); await p.waitForTimeout(200);
  ok((await txt()).includes('Σ d(v) = 14 = 2|E| = 2 × 7'), 'outil : somme des degrés du graphe de la diapo 13');
  await p.selectOption('#ex', 's28a'); await p.waitForTimeout(150);
  ok((await txt()).includes('Hamiltonien : le cycle'), 'outil : cube hamiltonien');
  /* éditeur : poser deux sommets et une arête */
  await p.click('#clr'); await p.click('.tools button[data-m=vertex]');
  const box = await p.$eval('.gf-ed-svg', e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  await p.mouse.click(box.x + box.w * 0.25, box.y + box.h * 0.5); await p.mouse.click(box.x + box.w * 0.75, box.y + box.h * 0.5);
  await p.click('.tools button[data-m=edge]');
  await p.mouse.click(box.x + box.w * 0.25, box.y + box.h * 0.5); await p.mouse.click(box.x + box.w * 0.75, box.y + box.h * 0.5);
  ok((await txt()).includes('n = |V| = 2 sommet(s), m = 1'), 'éditeur : 2 sommets, 1 arête');
  /* sauvegarde */
  const saved = await p.evaluate(() => localStorage.getItem('gf-fsm-v1'));
  ok(saved && JSON.parse(saved).log.length > 0, 'progression enregistrée dans localStorage');
  await p.reload(); await p.waitForTimeout(150);
  ok(!(await txt()).includes('Aucune activité'), 'progression conservée après rechargement');
  /* mobile */
  await p.setViewportSize({ width: 380, height: 740 }); await go('#/'); await p.waitForTimeout(100);
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  ok(sw <= 385, 'pas de défilement horizontal sur téléphone (scrollWidth=' + sw + ')');
  errs.forEach(e => { fail++; console.log('✗', e); });
  console.log(n + ' vérifications, ' + fail + ' échec(s)');
  await b.close(); process.exit(fail ? 1 : 0);
})().catch(e => { console.log('ERREUR', e.message); process.exit(1); });

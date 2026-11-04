/* Charge les modules de l'application dans Node (même ordre que index.html). */
const path = require('path');
const fs = require('fs');
const J = (p) => path.join(__dirname, '..', 'js', p);
global.GF = global.GF || {};
GF.u = require(J('util.js'));
GF.graph = require(J('graphlib.js'));
GF.graphs = require(J('graphs.js'));
GF.render = require(J('render.js'));
GF.ex = require(J('exercises.js'));
require(J('gens.js'));
require(J('gens2.js'));
if (fs.existsSync(J('content-core.js'))) {
  require(J('content-core.js'));
  fs.readdirSync(path.join(__dirname, '..', 'js')).filter((f) => /^content-\d+.*\.js$/.test(f)).sort().forEach((f) => require(J(f)));
}
module.exports = GF;

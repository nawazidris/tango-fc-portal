const fs = require('fs');
const p = 'src/server/db.json';
let t = fs.readFileSync(p, 'utf8');
t = t.replace(/}\r?\n    {/g, '},\n    {');
fs.writeFileSync(p, t, 'utf8');
console.log('fixed');

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const files = [
  'frontend/victims.html',
  'frontend/index.html',
  'frontend/humbledzlogin.html',
  'frontend/changepassword.html',
  'frontend/js/toast.js',
  'frontend/js/particles.js'
];

let bad = 0;
for (const f of files) {
  const src = fs.readFileSync(path.join(__dirname, f), 'utf8');
  const blocks = f.endsWith('.js')
    ? [{ code: src, line: 1 }]
    : [...src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => ({
      code: m[1],
      line: src.slice(0, m.index).split('\n').length
    }));

  blocks.forEach((b, i) => {
    try {
      new vm.Script(b.code, { filename: f });
      console.log(`OK   ${f} block#${i} (line ~${b.line})`);
    } catch (e) {
      bad++;
      console.log(`FAIL ${f} block#${i} (line ~${b.line}): ${e.message}`);
    }
  });
}
process.exit(bad ? 1 : 0);

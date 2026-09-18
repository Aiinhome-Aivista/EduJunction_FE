const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replaceRules = [
  { regex: /bg-emerald-600 text-white/g, replacement: 'bg-yellow-400 text-stone-900' },
  { regex: /bg-emerald-500 hover:bg-emerald-600 text-white/g, replacement: 'bg-yellow-400 hover:bg-yellow-500 text-stone-900' },
  { regex: /bg-emerald-600 hover:bg-emerald-700 text-white/g, replacement: 'bg-yellow-400 hover:bg-yellow-500 text-stone-900' },
  { regex: /bg-emerald-600/g, replacement: 'bg-yellow-400' },
  { regex: /text-emerald-600/g, replacement: 'text-yellow-600' },
  { regex: /text-emerald-700/g, replacement: 'text-yellow-700' },
  { regex: /text-emerald-800/g, replacement: 'text-yellow-800' },
  { regex: /text-emerald-900/g, replacement: 'text-yellow-900' },
  { regex: /bg-emerald-50/g, replacement: 'bg-yellow-50' },
  { regex: /bg-emerald-100/g, replacement: 'bg-yellow-100' },
  { regex: /border-emerald-100/g, replacement: 'border-yellow-200' },
  { regex: /border-emerald-200/g, replacement: 'border-yellow-300' },
  { regex: /border-emerald-600/g, replacement: 'border-yellow-400' },
  { regex: /shadow-emerald-100/g, replacement: 'shadow-yellow-100' },
  { regex: /shadow-emerald-200/g, replacement: 'shadow-yellow-200' },
  { regex: /shadow-emerald-500\/25/g, replacement: 'shadow-yellow-500/25' },
  { regex: /shadow-emerald-500\/30/g, replacement: 'shadow-yellow-500/30' },
  { regex: /shadow-emerald-900\/20/g, replacement: 'shadow-yellow-900/20' },
  { regex: /shadow-emerald-900\/40/g, replacement: 'shadow-yellow-900/40' },
  { regex: /shadow-emerald-500/g, replacement: 'shadow-yellow-500' },
  { regex: /shadow-emerald-600/g, replacement: 'shadow-yellow-400' },
  { regex: /from-emerald-50/g, replacement: 'from-yellow-50' },
  { regex: /from-emerald-600/g, replacement: 'from-yellow-500' },
  { regex: /from-emerald-950/g, replacement: 'from-yellow-950' },
  { regex: /to-emerald-50/g, replacement: 'to-yellow-50' },
  { regex: /to-emerald-600/g, replacement: 'to-yellow-500' },
  { regex: /emerald/g, replacement: 'yellow' }
];

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    replaceRules.forEach(rule => {
      content = content.replace(rule.regex, rule.replacement);
    });
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});

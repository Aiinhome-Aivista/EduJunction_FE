const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let newContent = content;
  
  // Color replacements
  newContent = newContent.replace(/indigo-/g, 'emerald-');
  newContent = newContent.replace(/slate-/g, 'stone-');
  newContent = newContent.replace(/purple-/g, 'amber-');
  newContent = newContent.replace(/blue-/g, 'teal-');
  newContent = newContent.replace(/bg-\[\#f3f5f9\]/g, 'bg-stone-50');
  newContent = newContent.replace(/bg-\[\#0a0a0e\]/g, 'bg-[#1c1917]'); // stone-900ish

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

traverseDir(srcDir);
console.log('Done.');

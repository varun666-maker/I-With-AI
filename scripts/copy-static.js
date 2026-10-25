/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const standaloneDir = path.join(projectRoot, '.next', 'standalone');
const nextStaticDir = path.join(projectRoot, '.next', 'static');
const publicDir = path.join(projectRoot, 'public');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const targetStaticDir = path.join(standaloneDir, '.next', 'static');
if (fs.existsSync(nextStaticDir)) {
  fs.mkdirSync(path.dirname(targetStaticDir), { recursive: true });
  copyDir(nextStaticDir, targetStaticDir);
}
if (fs.existsSync(publicDir)) {
  fs.mkdirSync(standaloneDir, { recursive: true });
  copyDir(publicDir, path.join(standaloneDir, 'public'));
}

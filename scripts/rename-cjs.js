/**
 * Post-processes the CJS build output:
 * 1. Renames .js → .cjs and .d.ts → .d.cts
 * 2. Rewrites internal require("./foo.js") → require("./foo.cjs")
 */

import { readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CJS_DIR = new URL('../dist/cjs', import.meta.url).pathname;

/** Rewrite .js extensions in require() calls to .cjs */
function rewriteRequires(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  content = content.replace(/require\("([^"]+)\.js"\)/g, 'require("$1.cjs")');
  writeFileSync(filePath, content, 'utf-8');
}

/** Rewrite .js extensions in import()/from references inside .d.cts files to .cjs */
function rewriteDeclarationRefs(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  // Handles: import("./foo.js"), from "./foo.js", from './foo.js'
  content = content.replace(/(from\s+['"])([^'"]+)\.js(['"])/g, '$1$2.cjs$3');
  content = content.replace(/(import\(\s*['"])([^'"]+)\.js(['"])/g, '$1$2.cjs$3');
  writeFileSync(filePath, content, 'utf-8');
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (entry.endsWith('.js')) {
      rewriteRequires(full);
      renameSync(full, full.replace(/\.js$/, '.cjs'));
    } else if (entry.endsWith('.d.ts')) {
      const newPath = full.replace(/\.d\.ts$/, '.d.cts');
      renameSync(full, newPath);
      rewriteDeclarationRefs(newPath);
    }
  }
}

walk(CJS_DIR);

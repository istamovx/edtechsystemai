#!/usr/bin/env node
// Watch + auto-push: fayl o'zgarishini kuzatib, har 60 soniyada
// avtomatik commit + push qiladi (developmentda qulay)
// Ishga tushirish: npm run watch:push

import { execSync } from "node:child_process";
import { watch } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DEBOUNCE_MS = 60_000; // 1 daqiqa

let timer = null;
let pendingChanges = false;

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", cwd: ROOT }).trim();
  } catch (e) {
    return null;
  }
}

function pushNow() {
  pendingChanges = false;
  const status = run("git status --porcelain");
  if (!status) return;

  const ts = new Date().toISOString().replace("T", " ").slice(0, 16);
  const msg = `auto-watch: ${ts}`;
  const branch = run("git rev-parse --abbrev-ref HEAD");

  console.log(`\x1b[36m[${ts}] O'zgarishlar topildi, push qilinmoqda...\x1b[0m`);
  run("git add -A");
  run(`git commit -m "${msg}"`);
  const out = run(`git push origin ${branch}`);
  if (out !== null) {
    console.log("\x1b[32m✅ Push muvaffaqiyatli\x1b[0m");
  } else {
    console.log("\x1b[31m❌ Push xato\x1b[0m");
  }
}

function schedule() {
  pendingChanges = true;
  if (timer) clearTimeout(timer);
  timer = setTimeout(pushNow, DEBOUNCE_MS);
}

console.log(`\x1b[35m👀 Watch + auto-push faolligi: ${ROOT}\x1b[0m`);
console.log(`\x1b[35m   Har bir o'zgarishdan ${DEBOUNCE_MS / 1000}s keyin push qilinadi\x1b[0m`);

const IGNORE = /node_modules|\.next|\.git|\.env/;
watch(ROOT, { recursive: true }, (event, filename) => {
  if (!filename || IGNORE.test(filename)) return;
  console.log(`\x1b[33m  ↳ ${event}: ${filename}\x1b[0m`);
  schedule();
});

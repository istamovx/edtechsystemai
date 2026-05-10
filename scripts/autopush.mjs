#!/usr/bin/env node
// Auto-push: o'zgarishlarni avtomatik commit va push qiladi
// Ishga tushirish: npm run push   (yoki: npm run push -- "commit xabari")

import { execSync } from "node:child_process";

function run(cmd, opts = {}) {
  console.log(`\x1b[36m$ ${cmd}\x1b[0m`);
  return execSync(cmd, { stdio: "inherit", ...opts });
}

function runQuiet(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

try {
  // 1. O'zgarishlar bormi?
  const status = runQuiet("git status --porcelain");
  if (!status) {
    console.log("\x1b[33m✓ Hech qanday o'zgarish yo'q. Push qilinmadi.\x1b[0m");
    process.exit(0);
  }

  // 2. Commit xabari
  const customMsg = process.argv.slice(2).join(" ").trim();
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 16);
  const message = customMsg || `auto: update ${timestamp}`;

  // 3. Branch nomini olish
  const branch = runQuiet("git rev-parse --abbrev-ref HEAD");
  console.log(`\x1b[35m📦 Branch: ${branch}\x1b[0m`);

  // 4. Stage + commit + push
  run("git add -A");
  run(`git commit -m "${message.replace(/"/g, '\\"')}"`);
  run(`git push origin ${branch}`);

  console.log("\x1b[32m✅ Muvaffaqiyatli push qilindi! Render avtomatik deploy boshlaydi.\x1b[0m");
} catch (err) {
  console.error("\x1b[31m❌ Xatolik:\x1b[0m", err.message);
  process.exit(1);
}

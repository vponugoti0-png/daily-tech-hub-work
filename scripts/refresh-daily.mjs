#!/usr/bin/env node
/**
 * Updates content/digest.json timestamps for "today".
 *
 * By default: preserves curated headline/blurb/featured* arrays (no clobber).
 * Pass --rotate to also rotate featured picks (deterministic by date).
 *
 * Usage: node scripts/refresh-daily.mjs
 *        node scripts/refresh-daily.mjs --rotate
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const contentRoot = path.join(root, "content");
const rotate = process.argv.includes("--rotate");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(contentRoot, rel), "utf8"));
}

function writeJson(rel, data) {
  fs.writeFileSync(path.join(contentRoot, rel), JSON.stringify(data, null, 2) + "\n");
}

function todayParts(d = new Date()) {
  // Local civil date — UTC slice() is a day behind in US evening timezones.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return { date: `${y}-${m}-${day}`, lastUpdated: d.toISOString() };
}

function hashDate(dateStr) {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) h = (h * 31 + dateStr.charCodeAt(i)) >>> 0;
  return h;
}

function pickRotated(items, count, seed) {
  if (!items.length) return [];
  const start = seed % items.length;
  const out = [];
  for (let i = 0; i < Math.min(count, items.length); i++) {
    out.push(items[(start + i) % items.length]);
  }
  return out;
}

function main() {
  const { date, lastUpdated } = todayParts();
  const prev = readJson("digest.json");

  const digest = {
    ...prev,
    date,
    lastUpdated,
  };

  if (rotate) {
    const seed = hashDate(date);
    const news = readJson("news/items.json");
    const releases = readJson("releases/items.json");
    const shortcuts = readJson("shortcuts/items.json");
    const lessonSlugs = [];
    const tracks = fs.readdirSync(path.join(contentRoot, "training")).filter((d) =>
      fs.statSync(path.join(contentRoot, "training", d)).isDirectory(),
    );
    for (const track of tracks) {
      const dir = path.join(contentRoot, "training", track);
      for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
        const raw = fs.readFileSync(path.join(dir, file), "utf8");
        const m = raw.match(/^slug:\s*(.+)$/m);
        if (m) lessonSlugs.push(m[1].trim());
      }
    }
    digest.featuredNewsSlugs = pickRotated(news, 4, seed).map((n) => n.slug);
    digest.featuredLessonSlugs = pickRotated(lessonSlugs, 4, seed + 7);
    digest.featuredReleaseSlugs = pickRotated(releases, 3, seed + 13).map((r) => r.slug);
    digest.featuredShortcutSlugs = pickRotated(shortcuts, 4, seed + 19).map((s) => s.slug);
    const blurbs = [
      "Snowflake governance updates, Databricks serverless wins, PySpark pattern refresher, and prompt-engineering drills — 100% free.",
      "Today’s mix: warehouse SQL tips, AI assistant shortcuts, and release notes worth skimming before you upgrade runtimes.",
      "Fresh picks across the DE stack — Dynamic Tables, Copilot/Claude/Grok packs, and daily Git hygiene.",
      "A compact digest: curated news, AI learner tracks, release briefs, and cheat sheets you can open mid-standup.",
    ];
    digest.blurb = blurbs[seed % blurbs.length];
  }

  writeJson("digest.json", digest);
  console.log(`✓ Updated content/digest.json for ${date}${rotate ? " (rotated featured)" : " (preserved curated featured)"}`);
  console.log(`  lastUpdated: ${lastUpdated}`);
  console.log(`  featured news: ${digest.featuredNewsSlugs.join(", ")}`);
  console.log(`  featured lessons: ${digest.featuredLessonSlugs.join(", ")}`);
  console.log(`  featured releases: ${digest.featuredReleaseSlugs.join(", ")}`);
  console.log(`  featured shortcuts: ${digest.featuredShortcutSlugs.join(", ")}`);
}

main();

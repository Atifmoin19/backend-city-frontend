#!/usr/bin/env node
/**
 * Copies the shared Python harness from the backend repo into public/harness/ and writes
 * public/harness/manifest.json (file list the Pyodide worker loads).
 *
 * Source resolution:
 *   1. HARNESS_LOCAL_PATH or ../backend/harness exists  -> copy (local dev)
 *   2. otherwise download the commit pinned in harness.lock from GitHub (CI / Vercel)
 */
import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dest = join(root, "public", "harness");
// An empty env var (e.g. an unset field in a hosting dashboard) means "not set".
const localPath = resolve(root, process.env.HARNESS_LOCAL_PATH?.trim() || "../backend/harness");

// Only runtime Python files are shipped; requirements.txt stays in the backend.
function harnessFiles(dir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".py"))
    .sort();
}

function fromGitHub() {
  const lock = JSON.parse(readFileSync(join(root, "harness.lock"), "utf8"));
  const url = `https://codeload.github.com/${lock.repo}/tar.gz/${lock.commit}`;
  const tmp = mkdtempSync(join(tmpdir(), "bc-harness-"));
  console.log(`[sync-harness] downloading ${lock.repo}@${lock.commit.slice(0, 7)}`);
  execFileSync("sh", ["-c", `curl -fsSL "${url}" | tar -xz -C "${tmp}" --strip-components=1`]);
  return {
    dir: join(tmp, "harness"),
    cleanup: () => rmSync(tmp, { recursive: true, force: true }),
    ref: lock.commit,
  };
}

function main() {
  // Use the local checkout only if it really is the harness; otherwise download the pinned commit.
  const source = existsSync(join(localPath, "__init__.py"))
    ? { dir: localPath, cleanup: () => {}, ref: "local" }
    : fromGitHub();
  try {
    rmSync(dest, { recursive: true, force: true });
    const files = harnessFiles(source.dir);
    if (!files.includes("__init__.py")) throw new Error(`No harness found in ${source.dir}`);
    cpSync(source.dir, join(dest, "harness"), {
      recursive: true,
      filter: (src) => !src.includes("__pycache__") && (src === source.dir || src.endsWith(".py")),
    });
    const version = /HARNESS_VERSION = "([^"]+)"/.exec(
      readFileSync(join(source.dir, "__init__.py"), "utf8"),
    )?.[1];
    writeFileSync(
      join(dest, "manifest.json"),
      JSON.stringify({ version, ref: source.ref, files }, null, 2),
    );
    console.log(
      `[sync-harness] ${files.length} files (v${version}, ${source.ref}) -> public/harness/`,
    );
  } finally {
    source.cleanup();
  }
}

main();

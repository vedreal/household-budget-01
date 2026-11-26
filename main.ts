/**
 * HomeLedger — entry point for the make.fun household-budget bounty.
 *
 * Copies the static site (app/) and its screenshots (screenshots/) from
 * beside this file into the output directory, then writes dossier.json
 * using the kit's buildDossier helper. Node 22+, standard library only.
 */

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

// Directory that holds this file (the repo root when run from the repo).
const HERE = fileURLToPath(new URL(".", import.meta.url));

// The grader sets MAKEFUN_OUTPUT_DIR; /output is the default.
const OUT = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

function copySite(): void {
  mkdirSync(OUT, { recursive: true });
  for (const dir of ["app", "screenshots"]) {
    const src = join(HERE, dir);
    if (existsSync(src)) {
      cpSync(src, join(OUT, dir), { recursive: true });
    }
  }
}

function writeDossier(): void {
  const dossier = buildDossier(OUT, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  });
  writeFileSync(join(OUT, "dossier.json"), dossier);
}

copySite();
writeDossier();

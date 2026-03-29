#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const tsx = resolve(projectRoot, "node_modules", ".bin", "tsx");
const entry = resolve(projectRoot, "src", "index.ts");

execFileSync(tsx, [entry], { stdio: "inherit", cwd: projectRoot });

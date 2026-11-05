import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
export const REPOSITORY_ROOT = fileURLToPath(new URL("../../", import.meta.url));
export const TOOL_DIRECTORY = resolve(REPOSITORY_ROOT, "scripts/release/tools");
export const VERCEL_ENTRY = resolve(TOOL_DIRECTORY, "node_modules/vercel/dist/vc.js");

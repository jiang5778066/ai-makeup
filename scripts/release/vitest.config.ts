import { defineConfig } from "vitest/config";
export default defineConfig({ test: { environment: "node", fileParallelism: false, include: ["scripts/release/**/*.test.ts", "scripts/db/**/*.test.ts"] } });

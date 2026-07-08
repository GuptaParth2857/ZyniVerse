import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["src/__tests__/setup.ts"],
    testTimeout: 15000,
    hookTimeout: 15000,
    coverage: {
      provider: "v8",
      include: ["src/lib/*.ts"],
      exclude: ["src/lib/anilist.ts", "src/lib/prisma.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

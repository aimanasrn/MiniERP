import { defineConfig } from "vitest/config";

const config = defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});

export default config;

import { defineConfig } from "vitest/config";
import { sharedVitestConfig } from "../../vitest.shared";

export default defineConfig({
  test: {
    ...sharedVitestConfig,
    name: "ui",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});

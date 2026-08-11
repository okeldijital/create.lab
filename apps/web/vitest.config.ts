import { defineConfig } from "vitest/config";
import { sharedVitestConfig } from "../../vitest.shared";

export default defineConfig({
  test: {
    ...sharedVitestConfig,
    name: "web",
    include: [
      "app/**/*.{test,spec}.ts",
      "components/**/*.{test,spec}.ts",
      "lib/**/*.{test,spec}.ts",
      "actions/**/*.{test,spec}.ts",
      "hooks/**/*.{test,spec}.ts",
    ],
  },
});

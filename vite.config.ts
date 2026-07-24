import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  // Project Pages needs /simplepad/; local dev stays on /
  base: command === "build" ? "/simplepad/" : "/",
  plugins: [vue()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
}));

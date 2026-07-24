import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

function vendorChunk(id: string): string | undefined {
  if (!id.includes("node_modules")) {
    return;
  }

  if (id.includes("@phosphor-icons")) {
    return "phosphor";
  }

  if (
    id.includes("@tiptap") ||
    id.includes("prosemirror") ||
    id.includes("orderedmap") ||
    id.includes("rope-sequence") ||
    id.includes("w3c-keyname")
  ) {
    return "tiptap";
  }

  if (id.includes("vue") || id.includes("@vue")) {
    return "vue";
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  // Root base for Vercel (simplepad.patriarxis.com)
  base: "/",
  plugins: [vue()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: vendorChunk,
      },
    },
  },
});

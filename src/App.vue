<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from "vue";
import { useTheme } from "./composables/useTheme";
import {
  flushNotes,
  getLatestNotes,
  saveNotes,
} from "./composables/useNotes";
import {
  downloadMarkdown,
  htmlToMarkdown,
} from "./utils/htmlToMarkdown";
import { markdownToHtml } from "./utils/markdownToHtml";

const NoteEditor = defineAsyncComponent(
  () => import("./components/NoteEditor.vue"),
);
const MarkdownSource = defineAsyncComponent(
  () => import("./components/MarkdownSource.vue"),
);

type ViewMode = "preview" | "markdown";

const { isDark, toggleTheme } = useTheme();
const viewMode = ref<ViewMode>("preview");
const markdownDraft = ref("");
const isMarkdown = computed(() => viewMode.value === "markdown");

function toggleViewMode() {
  flushNotes();

  if (viewMode.value === "preview") {
    markdownDraft.value = htmlToMarkdown(getLatestNotes());
    viewMode.value = "markdown";
    return;
  }

  saveNotes(markdownToHtml(markdownDraft.value));
  viewMode.value = "preview";
}

function onDownloadMd() {
  flushNotes();

  if (viewMode.value === "markdown") {
    downloadMarkdown(markdownDraft.value || "");
    return;
  }

  downloadMarkdown(htmlToMarkdown(getLatestNotes()) || "");
}
</script>

<template>
  <div class="app">
    <div class="app-actions">
      <button
        type="button"
        class="action-btn"
        :title="isMarkdown ? 'Switch to preview' : 'Switch to Markdown'"
        :aria-label="isMarkdown ? 'Switch to preview' : 'Switch to Markdown'"
        :aria-pressed="isMarkdown"
        @click="toggleViewMode"
      >
        <!-- Preview mode: show code icon to enter MD -->
        <svg
          v-if="!isMarkdown"
          class="action-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M8.5 8 5 12l3.5 4M15.5 8 19 12l-3.5 4M13 7l-2 10"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <!-- Markdown mode: show preview/doc icon to return -->
        <svg v-else class="action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M4 5h16v14H4z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />
          <path
            d="M8 9h8M8 12h8M8 15h5"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      </button>

      <button
        type="button"
        class="action-btn"
        title="Download Markdown"
        aria-label="Download Markdown"
        @click="onDownloadMd"
      >
        <svg class="action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <button
        type="button"
        class="action-btn"
        :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="toggleTheme"
      >
        <svg
          v-if="isDark"
          class="action-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
        <svg v-else class="action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>

    <NoteEditor v-if="viewMode === 'preview'" />
    <MarkdownSource v-else v-model="markdownDraft" />
  </div>
</template>

<style scoped>
.app {
  width: 100%;
  height: 100%;
  position: relative;
}

.app-actions {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.action-btn {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.action-btn:hover {
  background-color: var(--neutral-2);
}

.action-btn:focus-visible {
  outline: 2px solid var(--red-1);
  outline-offset: 2px;
}

.action-icon {
  width: 1.25rem;
  height: 1.25rem;
  display: block;
}
</style>

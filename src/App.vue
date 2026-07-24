<script setup lang="ts">
import { useTheme } from "./composables/useTheme";
import NoteEditor from "./components/NoteEditor.vue";

const { isDark, toggleTheme } = useTheme();
</script>

<template>
  <div class="app">
    <button
      type="button"
      class="theme-toggle"
      :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      @click="toggleTheme"
    >
      <svg
        v-if="isDark"
        class="theme-icon"
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
      <svg v-else class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z"
          fill="currentColor"
        />
      </svg>
    </button>

    <NoteEditor />
  </div>
</template>

<style scoped>
.app {
  width: 100%;
  height: 100%;
  position: relative;
}

.theme-toggle {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 20;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.theme-toggle:hover {
  background-color: var(--neutral-2);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--red-1);
  outline-offset: 2px;
}

.theme-icon {
  width: 1.25rem;
  height: 1.25rem;
}
</style>

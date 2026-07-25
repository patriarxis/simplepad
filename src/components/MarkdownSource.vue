<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import {
  flushNotes,
  onSaveResult,
  saveNotesDebounced,
} from "../composables/useNotes";
import { markdownToHtml } from "../utils/markdownToHtml";

defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const saveError = ref(false);
let hideErrorTimer: ReturnType<typeof setTimeout> | null = null;
let unsubscribeSave: (() => void) | null = null;
const textarea = ref<HTMLTextAreaElement | null>(null);

function onInput(event: Event) {
  const value = (event.target as HTMLTextAreaElement).value;
  emit("update:modelValue", value);
  saveNotesDebounced(markdownToHtml(value));
}

onMounted(() => {
  unsubscribeSave = onSaveResult((ok) => {
    if (ok) {
      saveError.value = false;
      return;
    }
    saveError.value = true;
    if (hideErrorTimer) {
      clearTimeout(hideErrorTimer);
    }
    hideErrorTimer = setTimeout(() => {
      saveError.value = false;
    }, 4000);
  });

  textarea.value?.focus();
});

onBeforeUnmount(() => {
  flushNotes();
  unsubscribeSave?.();
  if (hideErrorTimer) {
    clearTimeout(hideErrorTimer);
  }
});
</script>

<template>
  <div class="md-shell">
    <textarea
      ref="textarea"
      class="md-editor"
      :value="modelValue"
      spellcheck="false"
      aria-label="Markdown source"
      placeholder="# Write in Markdown..."
      @input="onInput"
    />

    <div
      v-if="saveError"
      class="save-toast"
      role="status"
      aria-live="polite"
    >
      Couldn’t save — browser storage is full or blocked.
    </div>
  </div>
</template>

<style scoped>
.md-shell {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.md-editor {
  box-sizing: border-box;
  display: block;
  width: min(80rem, 94vw);
  min-height: 100vh;
  margin: 0 auto;
  padding: 4.5rem 1.5rem 30vh;
  border: none;
  resize: none;
  background: transparent;
  color: var(--text-color);
  caret-color: var(--text-color);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.95rem;
  line-height: 1.55;
  outline: none;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.md-editor::placeholder {
  color: var(--placeholder-color);
}

.save-toast {
  position: fixed;
  left: 50%;
  bottom: 1.25rem;
  z-index: 80;
  transform: translateX(-50%);
  max-width: min(92vw, 28rem);
  padding: 0.7rem 1rem;
  border-radius: 999px;
  background: var(--page-bg);
  border: 1px solid var(--toolbar-border);
  color: var(--text-color);
  font-size: 0.85rem;
  text-align: center;
}
</style>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import EditorToolbar from "./EditorToolbar.vue";
import {
  flushNotes,
  loadNotes,
  onSaveResult,
  saveNotesDebounced,
} from "../composables/useNotes";

const saveError = ref(false);
let hideErrorTimer: ReturnType<typeof setTimeout> | null = null;
let unsubscribeSave: (() => void) | null = null;

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      },
    }),
    Placeholder.configure({
      placeholder: "Write something...",
    }),
  ],
  content: loadNotes() || "<p></p>",
  editorProps: {
    attributes: {
      class: "note-editor",
      "aria-label": "Note editor",
      spellcheck: "true",
    },
  },
  onUpdate: ({ editor: current }) => {
    saveNotesDebounced(current.getHTML());
  },
});

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
});

onBeforeUnmount(() => {
  flushNotes();
  unsubscribeSave?.();
  if (hideErrorTimer) {
    clearTimeout(hideErrorTimer);
  }
  editor.value?.destroy();
});
</script>

<template>
  <div class="editor-shell">
    <EditorToolbar v-if="editor" :editor="editor" />
    <EditorContent :editor="editor" class="editor-surface" />

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
.editor-shell {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.editor-surface {
  width: 100%;
  min-height: 100%;
}

.editor-surface :deep(.note-editor) {
  box-sizing: border-box;
  width: min(80rem, 94vw);
  min-height: 100vh;
  margin: 0 auto;
  padding: 4.5rem 1.5rem 30vh;
  color: var(--text-color);
  outline: none;
  overflow-wrap: anywhere;
  word-break: break-word;
  cursor: text;
}

.editor-surface :deep(.note-editor p.is-editor-empty:first-child::before),
.editor-surface :deep(.note-editor .is-empty::before) {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  color: var(--placeholder-color);
  pointer-events: none;
}

.editor-surface :deep(.note-editor h1),
.editor-surface :deep(.note-editor h2),
.editor-surface :deep(.note-editor h3) {
  line-height: 1.2;
  margin: 1.2em 0 0.4em;
  font-weight: 600;
}

.editor-surface :deep(.note-editor h1) {
  font-size: 2rem;
}

.editor-surface :deep(.note-editor h2) {
  font-size: 1.5rem;
}

.editor-surface :deep(.note-editor h3) {
  font-size: 1.2rem;
}

.editor-surface :deep(.note-editor p) {
  margin: 0.35em 0;
}

.editor-surface :deep(.note-editor ul),
.editor-surface :deep(.note-editor ol) {
  padding-left: 1.4em;
  margin: 0.5em 0;
}

.editor-surface :deep(.note-editor li) {
  margin: 0.2em 0;
}

.editor-surface :deep(.note-editor blockquote) {
  margin: 0.8em 0;
  padding-left: 1em;
  border-left: 3px solid var(--red-1);
  color: var(--neutral-6);
}

.editor-surface :deep(.note-editor code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9em;
  padding: 0.1em 0.35em;
  border-radius: 0.3em;
  background: var(--neutral-2);
}

.editor-surface :deep(.note-editor a) {
  color: var(--red-1);
  text-decoration: underline;
  text-underline-offset: 0.15em;
}

.editor-surface :deep(.note-editor hr) {
  border: none;
  border-top: 1px solid var(--border);
  margin: 1.5em 0;
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

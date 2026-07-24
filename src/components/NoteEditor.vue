<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
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
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Image.configure({
      allowBase64: true,
      HTMLAttributes: {
        class: "note-image",
      },
    }),
    Superscript,
    Subscript,
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Highlight.configure({
      multicolor: false,
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

.editor-surface :deep(.note-editor ul[data-type="taskList"]) {
  list-style: none;
  padding-left: 0;
  margin: 0.5em 0;
}

.editor-surface :deep(.note-editor ul[data-type="taskList"] li) {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0.35em 0;
}

.editor-surface :deep(.note-editor ul[data-type="taskList"] li > label) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
  line-height: 0;
  cursor: pointer;
}

.editor-surface
  :deep(.note-editor ul[data-type="taskList"] input[type="checkbox"]) {
  appearance: none;
  -webkit-appearance: none;
  width: 1rem;
  height: 1rem;
  margin: 0;
  border: 1.5px solid var(--neutral-5);
  border-radius: 0.25rem;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
  display: grid;
  place-content: center;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.editor-surface
  :deep(
    .note-editor ul[data-type="taskList"] input[type="checkbox"]::before
  ) {
  content: "";
  width: 0.55rem;
  height: 0.55rem;
  transform: scale(0);
  transition: transform 0.12s ease;
  background-color: #0d0d0d;
  clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
}

.editor-surface
  :deep(
    .note-editor
      ul[data-type="taskList"]
      input[type="checkbox"]:checked
  ) {
  background: var(--red-1);
  border-color: var(--red-1);
}

.editor-surface
  :deep(
    .note-editor
      ul[data-type="taskList"]
      input[type="checkbox"]:checked::before
  ) {
  transform: scale(1);
}

.editor-surface
  :deep(
    .note-editor ul[data-type="taskList"] li[data-checked="true"] > div
  ) {
  text-decoration: line-through;
  color: var(--neutral-5);
}

.editor-surface :deep(.note-editor ul[data-type="taskList"] li > div) {
  flex: 1;
  min-width: 0;
  line-height: 1.5;
}

.editor-surface :deep(.note-editor ul[data-type="taskList"] li > div > p) {
  margin: 0;
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

.editor-surface :deep(.note-editor pre) {
  margin: 0.8em 0;
  padding: 0.85em 1em;
  border-radius: 0.5rem;
  background: var(--neutral-2);
  overflow-x: auto;
}

.editor-surface :deep(.note-editor pre code) {
  padding: 0;
  background: transparent;
}

.editor-surface :deep(.note-editor mark) {
  background: color-mix(in srgb, var(--red-1) 35%, transparent);
  color: inherit;
  border-radius: 0.15em;
  padding: 0 0.1em;
}

.editor-surface :deep(.note-editor .note-image) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0.9em 0;
  border-radius: 0.4rem;
  border: 0 solid transparent;
  box-shadow: 0 0 0 0 transparent;
  transition: box-shadow 0.15s ease;
}

.editor-surface :deep(.note-editor .note-image.ProseMirror-selectednode) {
  outline: none;
  box-shadow: 0 0 0 2px var(--red-1);
}

.editor-surface :deep(.note-editor [style*="text-align: left"]),
.editor-surface :deep(.note-editor [style*="text-align: center"]),
.editor-surface :deep(.note-editor [style*="text-align: right"]),
.editor-surface :deep(.note-editor [style*="text-align: justify"]) {
  text-wrap: pretty;
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

.editor-surface :deep(.note-editor sup),
.editor-surface :deep(.note-editor sub) {
  font-size: 0.75em;
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

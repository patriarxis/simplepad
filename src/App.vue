<template>
  <div class="container">
    <div class="theme-controls">
      <button
        class="theme-toggle"
        @click="toggleTheme"
        :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        {{ isDark ? "☀️" : "🌙" }}
      </button>
    </div>
    <div
      class="textarea"
      ref="editorRef"
      contenteditable
      @input="handleInput"
      @paste="handlePaste"
      @keydown="handleKeydown"
      v-html="content"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useTheme } from "./composables/useTheme";

const editorRef = ref(null);
const content = ref("");
const { isDark, toggleTheme } = useTheme();

onMounted(() => {
  const storedNotes = localStorage.getItem("notes");
  if (storedNotes) {
    content.value = storedNotes;
  }
});

const handleInput = () => {
  if (editorRef.value) {
    localStorage.setItem("notes", editorRef.value.innerHTML);
  }
};

const handlePaste = (e) => {
  e.preventDefault();
  const text = e.clipboardData
    ? (e.originalEvent || e).clipboardData.getData("text/plain")
    : window.clipboardData
    ? window.clipboardData.getData("Text")
    : "";

  if (document.queryCommandSupported("insertText")) {
    document.execCommand("insertText", false, text);
  } else {
    const range = document.getSelection().getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    range.selectNodeContents(textNode);
    range.collapse(false);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

const handleKeydown = (event) => {
  if (event.ctrlKey) {
    switch (event.key) {
      case "b":
        event.preventDefault();
        document.execCommand("bold", false, null);
        break;
      case "i":
        event.preventDefault();
        document.execCommand("italic", false, null);
        break;
      case "k":
        event.preventDefault();
        const url = window.prompt("Add hyperlink", "https://example.com");
        if (url) {
          document.execCommand("createLink", false, url);
        }
        break;
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
  height: 100%;
  overflow: auto;
  position: relative;
}

.theme-controls {
  position: fixed;
  top: 2rem;
  right: 2rem;
  display: flex;
  gap: 0.5rem;
  z-index: 10;
}

.theme-toggle,
.system-theme-button {
  padding: 0.5rem;
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.theme-toggle:hover,
.system-theme-button:hover {
  background-color: var(--neutral-2);
}

[data-theme="dark"] .theme-toggle:hover,
[data-theme="dark"] .system-theme-button:hover {
  background-color: var(--neutral-8);
}

.textarea[contenteditable]:empty::before {
  content: "Write something...";
  color: var(--placeholder-color);
}

.textarea {
  box-sizing: content-box;
  display: block;
  color: var(--text-color);
  flex-grow: 1;
  max-width: 1000px;
  min-height: max-content;
  padding: 20vh 20vw;
  cursor: text;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  user-select: text;
  transition: color 0.3s ease;
}

.textarea a {
  color: var(--red-1);
}
</style>

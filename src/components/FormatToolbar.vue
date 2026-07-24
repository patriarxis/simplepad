<script setup lang="ts">
import { computed } from "vue";
import type { Editor } from "@tiptap/vue-3";

const props = defineProps<{
  editor: Editor;
}>();

const emit = defineEmits<{
  "open-link": [];
}>();

const is = (name: string, attrs?: Record<string, unknown>) =>
  computed(() => {
    void props.editor.state.selection;
    return props.editor.isActive(name, attrs);
  });

const isBold = is("bold");
const isItalic = is("italic");
const isUnderline = is("underline");
const isStrike = is("strike");
const isH1 = is("heading", { level: 1 });
const isH2 = is("heading", { level: 2 });
const isH3 = is("heading", { level: 3 });
const isBullet = is("bulletList");
const isOrdered = is("orderedList");
const isQuote = is("blockquote");
const isCode = is("code");
const isLink = is("link");
</script>

<template>
  <div class="toolbar" role="toolbar" aria-label="Text formatting">
    <button
      type="button"
      class="tool"
      :class="{ active: isBold }"
      title="Bold"
      aria-label="Bold"
      :aria-pressed="isBold"
      @mousedown.prevent
      @click="editor.chain().focus().toggleBold().run()"
    >
      <strong>B</strong>
    </button>
    <button
      type="button"
      class="tool"
      :class="{ active: isItalic }"
      title="Italic"
      aria-label="Italic"
      :aria-pressed="isItalic"
      @mousedown.prevent
      @click="editor.chain().focus().toggleItalic().run()"
    >
      <em>I</em>
    </button>
    <button
      type="button"
      class="tool"
      :class="{ active: isUnderline }"
      title="Underline"
      aria-label="Underline"
      :aria-pressed="isUnderline"
      @mousedown.prevent
      @click="editor.chain().focus().toggleUnderline().run()"
    >
      <span class="underline-label">U</span>
    </button>
    <button
      type="button"
      class="tool"
      :class="{ active: isStrike }"
      title="Strikethrough"
      aria-label="Strikethrough"
      :aria-pressed="isStrike"
      @mousedown.prevent
      @click="editor.chain().focus().toggleStrike().run()"
    >
      <span class="strike-label">S</span>
    </button>

    <span class="divider" aria-hidden="true" />

    <button
      type="button"
      class="tool"
      :class="{ active: isH1 }"
      title="Heading 1"
      aria-label="Heading 1"
      :aria-pressed="isH1"
      @mousedown.prevent
      @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
    >
      H1
    </button>
    <button
      type="button"
      class="tool"
      :class="{ active: isH2 }"
      title="Heading 2"
      aria-label="Heading 2"
      :aria-pressed="isH2"
      @mousedown.prevent
      @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
    >
      H2
    </button>
    <button
      type="button"
      class="tool"
      :class="{ active: isH3 }"
      title="Heading 3"
      aria-label="Heading 3"
      :aria-pressed="isH3"
      @mousedown.prevent
      @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
    >
      H3
    </button>

    <span class="divider" aria-hidden="true" />

    <button
      type="button"
      class="tool"
      :class="{ active: isBullet }"
      title="Bullet list"
      aria-label="Bullet list"
      :aria-pressed="isBullet"
      @mousedown.prevent
      @click="editor.chain().focus().toggleBulletList().run()"
    >
      •
    </button>
    <button
      type="button"
      class="tool"
      :class="{ active: isOrdered }"
      title="Numbered list"
      aria-label="Numbered list"
      :aria-pressed="isOrdered"
      @mousedown.prevent
      @click="editor.chain().focus().toggleOrderedList().run()"
    >
      1.
    </button>
    <button
      type="button"
      class="tool"
      :class="{ active: isQuote }"
      title="Quote"
      aria-label="Quote"
      :aria-pressed="isQuote"
      @mousedown.prevent
      @click="editor.chain().focus().toggleBlockquote().run()"
    >
      “
    </button>
    <button
      type="button"
      class="tool"
      :class="{ active: isCode }"
      title="Inline code"
      aria-label="Inline code"
      :aria-pressed="isCode"
      @mousedown.prevent
      @click="editor.chain().focus().toggleCode().run()"
    >
      &lt;/&gt;
    </button>

    <span class="divider" aria-hidden="true" />

    <button
      type="button"
      class="tool"
      :class="{ active: isLink }"
      title="Link"
      aria-label="Link"
      :aria-pressed="isLink"
      @mousedown.prevent
      @click="emit('open-link')"
    >
      <svg class="link-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M10 13a5 5 0 0 0 7.54.54l1.92-1.92a5 5 0 0 0-7.07-7.07l-1.1 1.1"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M14 11a5 5 0 0 0-7.54-.54L4.54 12.38a5 5 0 0 0 7.07 7.07l1.1-1.1"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 0.15rem;
  padding: 0.35rem;
  border-radius: 999px;
  background: var(--page-bg);
  border: 1px solid var(--toolbar-border);
  overflow-x: auto;
  max-width: min(94vw, 42rem);
}

.tool {
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.45rem;
  border-radius: 999px;
  color: var(--text-color);
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.tool:hover {
  background: var(--neutral-2);
}

.tool:focus-visible {
  outline: 2px solid var(--red-1);
  outline-offset: 1px;
}

.tool.active {
  background: var(--red-1);
  color: var(--neutral-0);
}

.tool.active:hover {
  background: color-mix(in srgb, var(--red-1) 85%, black);
}

.divider {
  width: 1px;
  height: 1.25rem;
  margin: 0 0.2rem;
  background: var(--toolbar-border);
  flex-shrink: 0;
}

.underline-label {
  text-decoration: underline;
  text-underline-offset: 0.15em;
}

.strike-label {
  text-decoration: line-through;
}

.link-icon {
  width: 0.95rem;
  height: 0.95rem;
  display: block;
}
</style>

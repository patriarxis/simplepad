<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import {
  NodeViewContent,
  NodeViewWrapper,
  nodeViewProps,
} from "@tiptap/vue-3";
import { CODE_LANGUAGE_OPTIONS } from "../extensions/highlightedCodeBlock";

const props = defineProps(nodeViewProps);

const open = ref(false);
const root = ref<HTMLElement | null>(null);

const language = computed(
  () => props.node.attrs.language || "plaintext",
);

const selectedName = computed(() => {
  const match = CODE_LANGUAGE_OPTIONS.find(
    (option) => option.value === language.value,
  );
  return match?.label ?? language.value;
});

const options = computed(() => {
  if (!CODE_LANGUAGE_OPTIONS.some((option) => option.value === language.value)) {
    return [
      { value: language.value, label: language.value },
      ...CODE_LANGUAGE_OPTIONS,
    ];
  }
  return CODE_LANGUAGE_OPTIONS;
});

function toggleMenu(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  open.value = !open.value;
}

function selectLanguage(value: string) {
  props.updateAttributes({
    language: value || "plaintext",
  });
  open.value = false;
}

function onDocumentPointer(event: Event) {
  const target = event.target as Node | null;
  if (!root.value || !target || root.value.contains(target)) {
    return;
  }
  open.value = false;
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    open.value = false;
  }
}

onMounted(() => {
  document.addEventListener("mousedown", onDocumentPointer, true);
  document.addEventListener("keydown", onKeydown, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onDocumentPointer, true);
  document.removeEventListener("keydown", onKeydown, true);
});
</script>

<template>
  <NodeViewWrapper class="code-block" as="div">
    <div ref="root" class="lang-anchor" contenteditable="false">
      <button
        type="button"
        class="lang-name"
        :aria-expanded="open"
        aria-haspopup="listbox"
        :aria-label="`Language: ${selectedName}`"
        @mousedown.stop
        @click="toggleMenu"
      >
        {{ selectedName }}
        <svg class="chevron" :class="{ open }" viewBox="0 0 12 12" aria-hidden="true">
          <path
            d="M2.5 4.25 6 7.75 9.5 4.25"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <div v-if="open" class="lang-menu" role="listbox" @mousedown.stop>
        <div class="lang-menu-scroll">
          <button
            v-for="option in options"
            :key="option.value"
            type="button"
            role="option"
            class="lang-item"
            :class="{ active: option.value === language }"
            :aria-selected="option.value === language"
            @click="selectLanguage(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <pre spellcheck="false"><code
      :class="`language-${language}`"
      ><NodeViewContent as="span" /></code
    ></pre>
  </NodeViewWrapper>
</template>

<style scoped>
.code-block {
  position: relative;
  margin: 0.8em 0;
  border-radius: 0.5rem;
  background: var(--neutral-2);
  overflow: visible;
}

.lang-anchor {
  position: absolute;
  top: 0.45rem;
  right: 0.65rem;
  z-index: 5;
}

.lang-name {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  box-shadow: none;
  color: var(--text-color);
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  opacity: 0.72;
}

.lang-name:hover,
.lang-name[aria-expanded="true"] {
  opacity: 1;
}

.lang-name:focus-visible {
  outline: 2px solid var(--red-1);
  outline-offset: 3px;
  border-radius: 0.2rem;
}

.chevron {
  width: 0.75rem;
  height: 0.75rem;
  flex-shrink: 0;
  transition: transform 0.15s ease;
}

.chevron.open {
  transform: rotate(180deg);
}

.lang-menu {
  position: absolute;
  top: calc(100% + 0.4rem);
  right: 0;
  z-index: 30;
  min-width: 9rem;
  margin: 0;
  padding: 0;
  /* Rounded shell that crops the inner scrollbar */
  border-radius: 0.65rem;
  overflow: hidden;
  background: var(--page-bg);
  border: 1px solid var(--toolbar-border);
}

.lang-menu-scroll {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  height: 12rem;
  padding: 0.35rem;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.lang-item {
  display: block;
  width: 100%;
  margin: 0;
  padding: 0.4rem 0.55rem;
  border: 0;
  border-radius: 0.45rem;
  background: transparent;
  color: var(--text-color);
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1.2;
  text-align: left;
  cursor: pointer;
}

.lang-item:hover {
  background: var(--neutral-2);
}

.lang-item.active {
  background: var(--red-1);
  color: var(--neutral-0);
}

.lang-item.active:hover {
  background: color-mix(in srgb, var(--red-1) 85%, black);
}

.lang-item:focus-visible {
  outline: 2px solid var(--red-1);
  outline-offset: 1px;
}

pre {
  margin: 0;
  padding: 0.85em 1em;
  padding-top: 1.95rem;
  overflow-x: auto;
  border-radius: 0.5rem;
}

code {
  display: block;
  padding: 0;
  background: transparent;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9em;
  color: inherit;
  white-space: pre;
}
</style>

<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import type { Editor } from "@tiptap/vue-3";

const props = defineProps<{
  editor: Editor;
  range: { from: number; to: number } | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const url = ref("https://");
const inputRef = ref<HTMLInputElement | null>(null);
const canRemove = ref(false);

const restoreSelection = () => {
  if (!props.range) {
    return;
  }
  const maxPos = props.editor.state.doc.content.size;
  const from = Math.max(0, Math.min(props.range.from, maxPos));
  const to = Math.max(0, Math.min(props.range.to, maxPos));
  props.editor.chain().setTextSelection({ from, to }).run();
};

const applyLink = () => {
  const href = url.value.trim();
  restoreSelection();

  if (!href || href === "https://") {
    emit("close");
    return;
  }

  const { empty } = props.editor.state.selection;

  if (empty) {
    props.editor
      .chain()
      .focus()
      .insertContent({
        type: "text",
        text: href,
        marks: [{ type: "link", attrs: { href } }],
      })
      .run();
  } else {
    props.editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href })
      .run();
  }

  emit("close");
};

const removeLink = () => {
  restoreSelection();
  props.editor.chain().focus().extendMarkRange("link").unsetLink().run();
  emit("close");
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    emit("close");
  }
  if (event.key === "Enter") {
    event.preventDefault();
    event.stopPropagation();
    applyLink();
  }
};

onMounted(async () => {
  if (props.range) {
    restoreSelection();
  }
  canRemove.value = props.editor.isActive("link");
  const existing = props.editor.getAttributes("link").href as
    | string
    | undefined;
  url.value = existing || "https://";
  await nextTick();
  inputRef.value?.focus();
  inputRef.value?.select();
});
</script>

<template>
  <div class="link-toolbar" role="dialog" aria-label="Add link">
    <input
      ref="inputRef"
      v-model="url"
      class="link-input"
      type="url"
      placeholder="https://"
      aria-label="URL"
      @mousedown.stop
      @keydown="onKeydown"
    />
    <button
      type="button"
      class="link-action primary"
      @mousedown.prevent
      @click="applyLink"
    >
      Apply
    </button>
    <button
      v-if="canRemove"
      type="button"
      class="link-action"
      @mousedown.prevent
      @click="removeLink"
    >
      Remove
    </button>
    <button
      type="button"
      class="link-action"
      @mousedown.prevent
      @click="emit('close')"
    >
      Cancel
    </button>
  </div>
</template>

<style scoped>
.link-toolbar {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.5rem;
  border-radius: 0.65rem;
  background: var(--page-bg);
  border: 1px solid var(--toolbar-border);
  max-width: min(94vw, 32rem);
}

.link-input {
  width: min(56vw, 16rem);
  min-width: 10rem;
  height: 2rem;
  padding: 0 0.75rem;
  border: 1px solid var(--toolbar-border);
  border-radius: 0.45rem;
  background: var(--page-bg);
  color: var(--text-color);
  font: inherit;
  font-size: 0.85rem;
  outline: none;
}

.link-input:focus {
  border-color: var(--red-1);
}

.link-action {
  height: 2rem;
  padding: 0 0.7rem;
  border-radius: 0.45rem;
  color: var(--text-color);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.link-action:hover {
  background: var(--neutral-2);
}

.link-action.primary {
  background: var(--red-1);
  color: var(--neutral-0);
}

.link-action.primary:hover {
  background: color-mix(in srgb, var(--red-1) 85%, black);
}

.link-action:focus-visible,
.link-input:focus-visible {
  outline: 2px solid var(--red-1);
  outline-offset: 1px;
}
</style>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { Editor } from "@tiptap/vue-3";
import {
  PhArrowClockwise,
  PhArrowCounterClockwise,
  PhCode,
  PhCodeBlock,
  PhHighlighter,
  PhImage,
  PhLink,
  PhListBullets,
  PhListChecks,
  PhListNumbers,
  PhQuotes,
  PhTextAlignCenter,
  PhTextAlignJustify,
  PhTextAlignLeft,
  PhTextAlignRight,
  PhTextB,
  PhTextHOne,
  PhTextHThree,
  PhTextHTwo,
  PhTextItalic,
  PhTextStrikethrough,
  PhTextSubscript,
  PhTextSuperscript,
  PhTextUnderline,
} from "@phosphor-icons/vue";
import ToolButton from "./ToolButton.vue";

const props = defineProps<{
  editor: Editor;
}>();

defineEmits<{
  "open-link": [];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const iconSize = 16;

const is = (name: string, attrs?: Record<string, unknown>) =>
  computed(() => {
    void props.editor.state.selection;
    return props.editor.isActive(name, attrs);
  });

const isBold = is("bold");
const isItalic = is("italic");
const isUnderline = is("underline");
const isStrike = is("strike");
const isCode = is("code");
const isCodeBlock = is("codeBlock");
const isH1 = is("heading", { level: 1 });
const isH2 = is("heading", { level: 2 });
const isH3 = is("heading", { level: 3 });
const isBullet = is("bulletList");
const isOrdered = is("orderedList");
const isTask = is("taskList");
const isQuote = is("blockquote");
const isLink = is("link");
const isHighlight = is("highlight");
const isSuperscript = is("superscript");
const isSubscript = is("subscript");

const alignLeft = computed(() => {
  void props.editor.state.selection;
  return props.editor.isActive({ textAlign: "left" });
});
const alignCenter = computed(() => {
  void props.editor.state.selection;
  return props.editor.isActive({ textAlign: "center" });
});
const alignRight = computed(() => {
  void props.editor.state.selection;
  return props.editor.isActive({ textAlign: "right" });
});
const alignJustify = computed(() => {
  void props.editor.state.selection;
  return props.editor.isActive({ textAlign: "justify" });
});

const canUndo = computed(() => {
  void props.editor.state;
  return props.editor.can().undo();
});

const canRedo = computed(() => {
  void props.editor.state;
  return props.editor.can().redo();
});

const pickImage = () => {
  fileInput.value?.click();
};

const onImageSelected = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !file.type.startsWith("image/")) {
    return;
  }

  if (file.size > 1_200_000) {
    window.alert("Image is too large. Please use an image under ~1.2MB.");
    input.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const src = reader.result;
    if (typeof src === "string") {
      props.editor.chain().focus().setImage({ src }).run();
    }
  };
  reader.readAsDataURL(file);
  input.value = "";
};
</script>

<template>
  <div class="toolbar" role="toolbar" aria-label="Text formatting">
    <input
      ref="fileInput"
      class="file-input"
      type="file"
      accept="image/*"
      @change="onImageSelected"
    />

    <ToolButton
      label="Undo"
      :disabled="!canUndo"
      @click="editor.chain().focus().undo().run()"
    >
      <PhArrowCounterClockwise :size="iconSize" weight="bold" />
    </ToolButton>
    <ToolButton
      label="Redo"
      :disabled="!canRedo"
      @click="editor.chain().focus().redo().run()"
    >
      <PhArrowClockwise :size="iconSize" weight="bold" />
    </ToolButton>

    <span class="divider" aria-hidden="true" />

    <ToolButton
      label="Heading 1"
      :active="isH1"
      :pressed="isH1"
      @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
    >
      <PhTextHOne :size="iconSize" weight="bold" />
    </ToolButton>
    <ToolButton
      label="Heading 2"
      :active="isH2"
      :pressed="isH2"
      @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
    >
      <PhTextHTwo :size="iconSize" weight="bold" />
    </ToolButton>
    <ToolButton
      label="Heading 3"
      :active="isH3"
      :pressed="isH3"
      @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
    >
      <PhTextHThree :size="iconSize" weight="bold" />
    </ToolButton>

    <span class="divider" aria-hidden="true" />

    <ToolButton
      label="Bullet list"
      :active="isBullet"
      :pressed="isBullet"
      @click="editor.chain().focus().toggleBulletList().run()"
    >
      <PhListBullets :size="iconSize" weight="bold" />
    </ToolButton>
    <ToolButton
      label="Ordered list"
      :active="isOrdered"
      :pressed="isOrdered"
      @click="editor.chain().focus().toggleOrderedList().run()"
    >
      <PhListNumbers :size="iconSize" weight="bold" />
    </ToolButton>
    <ToolButton
      label="Task list"
      :active="isTask"
      :pressed="isTask"
      @click="editor.chain().focus().toggleTaskList().run()"
    >
      <PhListChecks :size="iconSize" weight="bold" />
    </ToolButton>
    <ToolButton
      label="Quote"
      :active="isQuote"
      :pressed="isQuote"
      @click="editor.chain().focus().toggleBlockquote().run()"
    >
      <PhQuotes :size="iconSize" weight="bold" />
    </ToolButton>
    <ToolButton
      label="Code block"
      :active="isCodeBlock"
      :pressed="isCodeBlock"
      @click="editor.chain().focus().toggleCodeBlock().run()"
    >
      <PhCodeBlock :size="iconSize" weight="bold" />
    </ToolButton>

    <span class="divider" aria-hidden="true" />

    <ToolButton
      label="Bold"
      :active="isBold"
      :pressed="isBold"
      @click="editor.chain().focus().toggleBold().run()"
    >
      <PhTextB :size="iconSize" weight="bold" />
    </ToolButton>
    <ToolButton
      label="Italic"
      :active="isItalic"
      :pressed="isItalic"
      @click="editor.chain().focus().toggleItalic().run()"
    >
      <PhTextItalic :size="iconSize" weight="bold" />
    </ToolButton>
    <ToolButton
      label="Strikethrough"
      :active="isStrike"
      :pressed="isStrike"
      @click="editor.chain().focus().toggleStrike().run()"
    >
      <PhTextStrikethrough :size="iconSize" weight="bold" />
    </ToolButton>
    <ToolButton
      label="Inline code"
      :active="isCode"
      :pressed="isCode"
      @click="editor.chain().focus().toggleCode().run()"
    >
      <PhCode :size="iconSize" weight="bold" />
    </ToolButton>
    <ToolButton
      label="Underline"
      :active="isUnderline"
      :pressed="isUnderline"
      @click="editor.chain().focus().toggleUnderline().run()"
    >
      <PhTextUnderline :size="iconSize" weight="bold" />
    </ToolButton>
    <ToolButton
      label="Highlight"
      :active="isHighlight"
      :pressed="isHighlight"
      @click="editor.chain().focus().toggleHighlight().run()"
    >
      <PhHighlighter :size="iconSize" weight="bold" />
    </ToolButton>
    <ToolButton
      label="Link"
      :active="isLink"
      :pressed="isLink"
      @click="$emit('open-link')"
    >
      <PhLink :size="iconSize" weight="bold" />
    </ToolButton>

    <span class="divider" aria-hidden="true" />

    <ToolButton
      label="Superscript"
      :active="isSuperscript"
      :pressed="isSuperscript"
      @click="editor.chain().focus().toggleSuperscript().run()"
    >
      <PhTextSuperscript :size="iconSize" weight="bold" />
    </ToolButton>
    <ToolButton
      label="Subscript"
      :active="isSubscript"
      :pressed="isSubscript"
      @click="editor.chain().focus().toggleSubscript().run()"
    >
      <PhTextSubscript :size="iconSize" weight="bold" />
    </ToolButton>

    <span class="divider" aria-hidden="true" />

    <ToolButton
      label="Align left"
      :active="alignLeft"
      :pressed="alignLeft"
      @click="editor.chain().focus().setTextAlign('left').run()"
    >
      <PhTextAlignLeft :size="iconSize" weight="bold" />
    </ToolButton>
    <ToolButton
      label="Align center"
      :active="alignCenter"
      :pressed="alignCenter"
      @click="editor.chain().focus().setTextAlign('center').run()"
    >
      <PhTextAlignCenter :size="iconSize" weight="bold" />
    </ToolButton>
    <ToolButton
      label="Align right"
      :active="alignRight"
      :pressed="alignRight"
      @click="editor.chain().focus().setTextAlign('right').run()"
    >
      <PhTextAlignRight :size="iconSize" weight="bold" />
    </ToolButton>
    <ToolButton
      label="Align justify"
      :active="alignJustify"
      :pressed="alignJustify"
      @click="editor.chain().focus().setTextAlign('justify').run()"
    >
      <PhTextAlignJustify :size="iconSize" weight="bold" />
    </ToolButton>

    <span class="divider" aria-hidden="true" />

    <ToolButton label="Add image" @click="pickImage">
      <PhImage :size="iconSize" weight="bold" />
      <span class="add-label">Add</span>
    </ToolButton>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.12rem;
  padding: 0.35rem 0.5rem;
  border-radius: 0.65rem;
  background: var(--page-bg);
  border: 1px solid var(--toolbar-border);
  max-width: min(96vw, 68rem);
}

.file-input {
  display: none;
}

.divider {
  width: 1px;
  height: 1.25rem;
  margin: 0 0.2rem;
  background: var(--toolbar-border);
  flex-shrink: 0;
}

.add-label {
  font-size: 0.75rem;
  font-weight: 500;
}
</style>

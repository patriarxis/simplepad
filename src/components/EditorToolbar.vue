<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { Editor } from "@tiptap/vue-3";
import FormatToolbar from "./FormatToolbar.vue";
import LinkToolbar from "./LinkToolbar.vue";

const props = defineProps<{
  editor: Editor;
}>();

type Mode = "format" | "link";

const mode = ref<Mode>("format");
const visible = ref(false);
const linkRange = ref<{ from: number; to: number } | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const style = ref<Record<string, string>>({
  top: "0px",
  left: "0px",
});

let syncToken = 0;

const isEmptyBlock = (editor: Editor) => {
  const { empty, $anchor } = editor.state.selection;
  if (!empty) {
    return false;
  }
  const node = $anchor.parent;
  return node.isTextblock && node.content.size === 0;
};

const hasTextSelection = (editor: Editor) => {
  const { from, to, empty } = editor.state.selection;
  return !empty && from !== to;
};

const getAnchorRect = (from: number, to: number) => {
  const { view, state } = props.editor;
  const maxPos = state.doc.content.size;
  const safeFrom = Math.max(0, Math.min(from, maxPos));
  const safeTo = Math.max(0, Math.min(to, maxPos));

  try {
    const start = view.coordsAtPos(safeFrom);
    const end = view.coordsAtPos(safeTo);
    return {
      top: Math.min(start.top, end.top),
      bottom: Math.max(start.bottom, end.bottom),
      left: Math.min(start.left, end.left),
    };
  } catch {
    return null;
  }
};

const positionPanel = (from: number, to: number) => {
  const anchor = getAnchorRect(from, to);
  if (!anchor) {
    return;
  }

  const panel = panelRef.value;
  const margin = 12;
  const panelWidth = panel?.offsetWidth ?? 420;
  const panelHeight = panel?.offsetHeight ?? 44;

  let left = anchor.left;
  left = Math.min(
    Math.max(left, margin),
    window.innerWidth - margin - panelWidth
  );

  const spaceBelow = window.innerHeight - anchor.bottom;
  const placeBelow =
    spaceBelow >= panelHeight + margin || anchor.top < panelHeight + margin;

  style.value = {
    top: placeBelow
      ? `${anchor.bottom + 8}px`
      : `${Math.max(margin, anchor.top - panelHeight - 8)}px`,
    left: `${left}px`,
  };
};

const sync = async () => {
  const token = ++syncToken;
  const editor = props.editor;

  if (mode.value === "link" && linkRange.value) {
    visible.value = true;
    await nextTick();
    if (token !== syncToken) {
      return;
    }
    positionPanel(linkRange.value.from, linkRange.value.to);
    return;
  }

  if (!editor.isEditable) {
    visible.value = false;
    return;
  }

  if (hasTextSelection(editor) || isEmptyBlock(editor)) {
    const { from, to } = editor.state.selection;
    visible.value = true;
    await nextTick();
    if (token !== syncToken) {
      return;
    }
    positionPanel(from, to);
    return;
  }

  visible.value = false;
};

const openLink = async () => {
  const { from, to } = props.editor.state.selection;
  linkRange.value = { from, to };
  mode.value = "link";
  visible.value = true;
  await nextTick();
  positionPanel(from, to);
};

const closeLink = async () => {
  const range = linkRange.value;
  mode.value = "format";
  linkRange.value = null;

  if (range) {
    props.editor.chain().focus().setTextSelection(range).run();
  } else {
    props.editor.commands.focus();
  }

  await nextTick();
  void sync();
};

const onScrollOrResize = () => {
  if (visible.value) {
    void sync();
  }
};

const onBlur = ({ event }: { event: FocusEvent }) => {
  const next = event.relatedTarget as Node | null;
  if (panelRef.value && next && panelRef.value.contains(next)) {
    return;
  }

  if (mode.value === "link") {
    return;
  }

  window.setTimeout(() => {
    if (!props.editor.isFocused && mode.value !== "link") {
      visible.value = false;
    }
  }, 0);
};

const onPointerDown = (event: PointerEvent) => {
  if (mode.value !== "link" || !visible.value) {
    return;
  }
  const target = event.target as Node | null;
  if (panelRef.value && target && panelRef.value.contains(target)) {
    return;
  }
  void closeLink();
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && mode.value === "link") {
    event.preventDefault();
    void closeLink();
  }
};

const bindEditor = (editor: Editor) => {
  editor.on("selectionUpdate", sync);
  editor.on("transaction", sync);
  editor.on("focus", sync);
  editor.on("blur", onBlur);
};

const unbindEditor = (editor: Editor) => {
  editor.off("selectionUpdate", sync);
  editor.off("transaction", sync);
  editor.off("focus", sync);
  editor.off("blur", onBlur);
};

onMounted(() => {
  bindEditor(props.editor);
  window.addEventListener("resize", onScrollOrResize);
  window.addEventListener("scroll", onScrollOrResize, true);
  window.addEventListener("pointerdown", onPointerDown, true);
  window.addEventListener("keydown", onKeydown);
  void sync();
});

onBeforeUnmount(() => {
  unbindEditor(props.editor);
  window.removeEventListener("resize", onScrollOrResize);
  window.removeEventListener("scroll", onScrollOrResize, true);
  window.removeEventListener("pointerdown", onPointerDown, true);
  window.removeEventListener("keydown", onKeydown);
});

watch(
  () => props.editor,
  (editor, oldEditor) => {
    if (oldEditor) {
      unbindEditor(oldEditor);
    }
    bindEditor(editor);
    void sync();
  }
);

const showFormat = computed(() => mode.value === "format");
</script>

<template>
  <Teleport to="body">
    <div
      v-show="visible"
      ref="panelRef"
      class="editor-toolbar-shell"
      :style="style"
    >
      <FormatToolbar
        v-if="showFormat"
        :editor="editor"
        @open-link="openLink"
      />
      <LinkToolbar
        v-else
        :editor="editor"
        :range="linkRange"
        @close="closeLink"
      />
    </div>
  </Teleport>
</template>

<style scoped>
.editor-toolbar-shell {
  position: fixed;
  z-index: 50;
  pointer-events: auto;
}
</style>

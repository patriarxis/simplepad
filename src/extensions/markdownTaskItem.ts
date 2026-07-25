import { InputRule, wrappingInputRule } from "@tiptap/core";
import TaskItem from "@tiptap/extension-task-item";

/** `[ ]`, `[]`, `[x]` / `[X]` */
const checkboxMarker = String.raw`\[(?: |x|X)?\]`;

/** GitHub-style: type `[ ] ` / `[] ` / `[x] ` at the start of a line */
export const taskCheckboxInputRegex = new RegExp(
  `^\\s*(${checkboxMarker})\\s$`,
);

/** Full markdown prefix: `- [ ]`, `-[ ]`, `-[]`, `-[x]`, etc. */
export const markdownTaskInputRegex = new RegExp(
  `^\\s*[-*+]\\s*(${checkboxMarker})\\s$`,
);

function isCheckedMarker(marker: string) {
  return /\[x\]/i.test(marker);
}

/**
 * Task items that also convert GitHub-style `- [ ]` / `- [x]`
 * (including after a bullet list has already been created from `- `).
 */
export const MarkdownTaskItem = TaskItem.extend({
  addInputRules() {
    return [
      new InputRule({
        find: taskCheckboxInputRegex,
        handler: ({ state, chain, range, match }) => {
          // wrappingInputRule can't wrap when already inside a bullet/ordered list
          const $from = state.selection.$from;
          let inPlainList = false;
          for (let depth = $from.depth; depth > 0; depth -= 1) {
            const name = $from.node(depth).type.name;
            if (name === "bulletList" || name === "orderedList") {
              inPlainList = true;
              break;
            }
          }

          if (!inPlainList) {
            return null;
          }

          const checked = isCheckedMarker(match[1] ?? "");
          chain()
            .deleteRange(range)
            .toggleTaskList()
            .updateAttributes("taskItem", { checked })
            .run();
        },
      }),
      wrappingInputRule({
        find: taskCheckboxInputRegex,
        type: this.type,
        getAttributes: (match) => ({
          checked: isCheckedMarker(match[1] ?? ""),
        }),
      }),
      new InputRule({
        find: markdownTaskInputRegex,
        handler: ({ chain, range, match }) => {
          const checked = isCheckedMarker(match[1] ?? "");
          chain()
            .deleteRange(range)
            .toggleTaskList()
            .updateAttributes("taskItem", { checked })
            .run();
        },
      }),
    ];
  },
});

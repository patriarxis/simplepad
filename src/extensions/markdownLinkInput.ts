import { Extension, InputRule } from "@tiptap/core";

/**
 * Markdown link shortcut: type `[label](https://example.com)` to create a link.
 */
export const MarkdownLinkInput = Extension.create({
  name: "markdownLinkInput",

  addInputRules() {
    return [
      new InputRule({
        find: /\[([^\]]+)\]\(([^)\s]+)\)$/,
        handler: ({ range, match, chain }) => {
          const label = match[1];
          const href = match[2];
          if (!label || !href) {
            return null;
          }

          chain()
            .deleteRange(range)
            .insertContent({
              type: "text",
              text: label,
              marks: [
                {
                  type: "link",
                  attrs: {
                    href,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  },
                },
              ],
            })
            .run();
        },
      }),
    ];
  },
});

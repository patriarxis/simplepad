import { Marked, type Tokens } from "marked";

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

const marked = new Marked();

marked.use({
  gfm: true,
  breaks: false,
  renderer: {
    heading({ tokens, depth }: Tokens.Heading) {
      const level = Math.min(Math.max(depth, 1), 3);
      const text = this.parser.parseInline(tokens);
      return `<h${level}>${text}</h${level}>`;
    },
    list(token: Tokens.List) {
      const isTask = token.items.some((item) => item.task);
      const body = token.items.map((item) => this.listitem(item)).join("");

      if (isTask) {
        return `<ul data-type="taskList">${body}</ul>`;
      }

      if (token.ordered) {
        const start =
          token.start !== "" && token.start !== 1
            ? ` start="${token.start}"`
            : "";
        return `<ol${start}>${body}</ol>`;
      }

      return `<ul>${body}</ul>`;
    },
    listitem(item: Tokens.ListItem) {
      let body = this.parser.parse(item.tokens, !!item.loose).trim();
      if (!body) {
        body = "<p></p>";
      } else if (!/^<(p|ul|ol|pre|blockquote|h[1-6])\b/i.test(body)) {
        body = `<p>${body}</p>`;
      }

      if (item.task) {
        const checked = item.checked === true;
        return `<li data-type="taskItem" data-checked="${checked}">${body}</li>`;
      }

      return `<li>${body}</li>`;
    },
    checkbox() {
      // TipTap renders its own checkbox UI from data-checked
      return "";
    },
    table(token: Tokens.Table) {
      const header = token.header
        .map((cell) => this.tablecell(cell))
        .join("");
      const body = token.rows
        .map((row) => {
          const cells = row.map((cell) => this.tablecell(cell)).join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");

      return `<table class="note-table"><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
    },
    image({ href, title, text }: Tokens.Image) {
      const src = href ? escapeAttr(href) : "";
      const alt = escapeAttr(text || "");
      const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
      return `<img class="note-image" src="${src}" alt="${alt}"${titleAttr}>`;
    },
  },
});

/** Convert `==highlight==` that our exporter uses (not standard GFM). */
function applyHighlight(html: string): string {
  return html.replace(/==([^=\n]+?)==/g, "<mark>$1</mark>");
}

export function markdownToHtml(markdown: string): string {
  const trimmed = markdown.trim();
  if (!trimmed) {
    return "<p></p>";
  }

  const parsed = marked.parse(trimmed, { async: false });
  const html = typeof parsed === "string" ? parsed.trim() : "";
  return applyHighlight(html) || "<p></p>";
}

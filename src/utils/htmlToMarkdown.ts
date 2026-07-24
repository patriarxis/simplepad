function escapeMd(text: string): string {
  return text.replace(/([\\`*_{}[\]()#+\-.!|>])/g, "\\$1");
}

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ");
}

function isElement(node: Node): node is HTMLElement {
  return node.nodeType === Node.ELEMENT_NODE;
}

function isTaskList(el: HTMLElement): boolean {
  return (
    el.getAttribute("data-type") === "taskList" ||
    el.classList.contains("task-list")
  );
}

function convertInline(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeMd(collapseWhitespace(node.textContent ?? ""));
  }

  if (!isElement(node)) {
    return "";
  }

  const el = node;
  const children = () => Array.from(el.childNodes).map(convertInline).join("");

  switch (el.tagName.toLowerCase()) {
    case "br":
      return "  \n";
    case "strong":
    case "b":
      return `**${children()}**`;
    case "em":
    case "i":
      return `*${children()}*`;
    case "s":
    case "del":
    case "strike":
      return `~~${children()}~~`;
    case "u":
      return children();
    case "code":
      return `\`${(el.textContent ?? "").replace(/`/g, "\\`")}\``;
    case "mark":
      return `==${children()}==`;
    case "a": {
      const href = el.getAttribute("href") ?? "";
      const label = children() || href;
      return href ? `[${label}](${href})` : label;
    }
    case "img": {
      const src = el.getAttribute("src") ?? "";
      const alt = el.getAttribute("alt") ?? "";
      return src ? `![${alt}](${src})` : "";
    }
    case "sup":
      return `^${children()}^`;
    case "sub":
      return `~${children()}~`;
    case "span":
    case "label":
    case "div":
    case "p":
      return children();
    default:
      return children();
  }
}

function convertBlocks(nodes: NodeListOf<ChildNode> | Node[], listCtx?: {
  ordered: boolean;
  task: boolean;
  index: number;
}): string {
  const parts: string[] = [];

  for (const node of Array.from(nodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = collapseWhitespace(node.textContent ?? "").trim();
      if (text) {
        parts.push(escapeMd(text));
      }
      continue;
    }

    if (!isElement(node)) {
      continue;
    }

    const el = node;
    const tag = el.tagName.toLowerCase();

    if (tag === "p") {
      const inline = Array.from(el.childNodes).map(convertInline).join("").trim();
      if (listCtx) {
        parts.push(formatListItem(inline, listCtx));
        listCtx.index += 1;
      } else if (inline) {
        parts.push(inline);
      }
      continue;
    }

    if (tag === "h1" || tag === "h2" || tag === "h3") {
      const level = Number(tag[1]);
      const inline = Array.from(el.childNodes).map(convertInline).join("").trim();
      parts.push(`${"#".repeat(level)} ${inline}`);
      continue;
    }

    if (tag === "blockquote") {
      const inner = convertBlocks(el.childNodes).trim();
      parts.push(
        inner
          .split("\n")
          .map((line) => `> ${line}`)
          .join("\n"),
      );
      continue;
    }

    if (tag === "pre") {
      const code = el.querySelector("code");
      const text = (code ?? el).textContent ?? "";
      parts.push(`\`\`\`\n${text.replace(/\n$/, "")}\n\`\`\``);
      continue;
    }

    if (tag === "hr") {
      parts.push("---");
      continue;
    }

    if (tag === "ul" || tag === "ol") {
      const task = isTaskList(el);
      const ordered = tag === "ol" && !task;
      const items = Array.from(el.children).filter(isElement);
      const nested: string[] = [];
      let index = 1;

      for (const item of items) {
        if (item.tagName.toLowerCase() !== "li") {
          continue;
        }

        const checked = item.getAttribute("data-checked") === "true";
        const contentNodes = task
          ? Array.from(item.childNodes).filter((child) => {
              if (!isElement(child)) {
                return true;
              }
              const childTag = child.tagName.toLowerCase();
              return childTag !== "label" && childTag !== "input";
            })
          : Array.from(item.childNodes);

        // Prefer the content div TipTap wraps around task text
        const contentRoot =
          contentNodes.find(
            (child) => isElement(child) && child.tagName.toLowerCase() === "div",
          ) ?? item;

        const blockChildren = isElement(contentRoot)
          ? Array.from(contentRoot.childNodes)
          : contentNodes;

        const inlineParts: string[] = [];
        const nestedBlocks: Node[] = [];

        for (const child of blockChildren) {
          if (
            isElement(child) &&
            (child.tagName.toLowerCase() === "ul" ||
              child.tagName.toLowerCase() === "ol")
          ) {
            nestedBlocks.push(child);
          } else if (isElement(child) && child.tagName.toLowerCase() === "p") {
            inlineParts.push(
              Array.from(child.childNodes).map(convertInline).join("").trim(),
            );
          } else {
            inlineParts.push(convertInline(child).trim());
          }
        }

        const line = inlineParts.filter(Boolean).join(" ").trim();
        const prefix = task
          ? `- [${checked ? "x" : " "}] `
          : ordered
            ? `${index}. `
            : `- `;

        nested.push(`${prefix}${line}`);

        for (const nestedList of nestedBlocks) {
          const nestedMd = convertBlocks([nestedList])
            .trim()
            .split("\n")
            .map((l) => `  ${l}`)
            .join("\n");
          if (nestedMd) {
            nested.push(nestedMd);
          }
        }

        index += 1;
      }

      parts.push(nested.join("\n"));
      continue;
    }

    if (tag === "li") {
      // Should be handled by ul/ol; flatten as a paragraph fallback
      const inline = Array.from(el.childNodes).map(convertInline).join("").trim();
      if (inline) {
        parts.push(inline);
      }
      continue;
    }

    if (tag === "img") {
      parts.push(convertInline(el));
      continue;
    }

    const nested = convertBlocks(el.childNodes, listCtx).trim();
    if (nested) {
      parts.push(nested);
    }
  }

  return parts.filter(Boolean).join("\n\n");
}

function formatListItem(
  text: string,
  ctx: { ordered: boolean; task: boolean; index: number },
): string {
  if (ctx.task) {
    return `- [ ] ${text}`;
  }
  if (ctx.ordered) {
    return `${ctx.index}. ${text}`;
  }
  return `- ${text}`;
}

export function htmlToMarkdown(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) {
    return "";
  }

  const doc = new DOMParser().parseFromString(
    `<div id="root">${trimmed}</div>`,
    "text/html",
  );
  const root = doc.getElementById("root");
  if (!root) {
    return "";
  }

  return convertBlocks(root.childNodes).replace(/\n{3,}/g, "\n\n").trim();
}

export function downloadMarkdown(markdown: string, filename = "simplepad.md") {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

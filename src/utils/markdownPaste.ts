const TASK_LINE =
  /^\s*[-*+]\s*\[([ xX]?)\]\s+(.*)$/;
const TASK_LINE_EMPTY =
  /^\s*[-*+]\s*\[([ xX]?)\]\s*$/;
const TABLE_SEP = /^\s*\|?[\s:|-]+\|[\s:|-]*\|?\s*$/;
const TABLE_ROW = /^\s*\|?.+\|.+\|?\s*$/;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseTaskLine(
  line: string,
): { checked: boolean; text: string } | null {
  const match = line.match(TASK_LINE) ?? line.match(TASK_LINE_EMPTY);
  if (!match) {
    return null;
  }
  return {
    checked: match[1].toLowerCase() === "x",
    text: (match[2] ?? "").trim(),
  };
}

function splitTableCells(line: string): string[] {
  let trimmed = line.trim();
  if (trimmed.startsWith("|")) {
    trimmed = trimmed.slice(1);
  }
  if (trimmed.endsWith("|")) {
    trimmed = trimmed.slice(0, -1);
  }
  return trimmed.split("|").map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  if (!TABLE_SEP.test(line)) {
    return false;
  }
  return /\|/.test(line) && /-{1,}/.test(line);
}

function isTableRow(line: string): boolean {
  return TABLE_ROW.test(line) && line.includes("|");
}

function tableToHtml(lines: string[]): string {
  if (lines.length < 2 || !isTableSeparator(lines[1])) {
    return "";
  }

  const header = splitTableCells(lines[0]);
  const bodyRows = lines.slice(2).filter(isTableRow).map(splitTableCells);

  const thead = `<thead><tr>${header
    .map((cell) => `<th>${escapeHtml(cell)}</th>`)
    .join("")}</tr></thead>`;

  const tbody = bodyRows.length
    ? `<tbody>${bodyRows
        .map(
          (row) =>
            `<tr>${header
              .map((_, i) => `<td>${escapeHtml(row[i] ?? "")}</td>`)
              .join("")}</tr>`,
        )
        .join("")}</tbody>`
    : "";

  return `<table>${thead}${tbody}</table>`;
}

function tasksToHtml(
  items: { checked: boolean; text: string }[],
): string {
  const lis = items
    .map(
      (item) =>
        `<li data-type="taskItem" data-checked="${item.checked}"><label><input type="checkbox"${
          item.checked ? " checked" : ""
        }><span></span></label><div><p>${escapeHtml(item.text)}</p></div></li>`,
    )
    .join("");
  return `<ul data-type="taskList">${lis}</ul>`;
}

function paragraphHtml(text: string): string {
  if (!text.trim()) {
    return "<p></p>";
  }
  return `<p>${escapeHtml(text)}</p>`;
}

/**
 * Convert pasted plain-text markdown fragments (task lists + tables) to HTML.
 * Returns null when the clipboard doesn't look like either.
 */
export function markdownClipboardToHtml(text: string): string | null {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  const nonEmpty = lines.filter((line) => line.trim().length > 0);

  if (nonEmpty.length === 0) {
    return null;
  }

  const allTasks = nonEmpty.every((line) => parseTaskLine(line) !== null);
  if (allTasks) {
    const items = nonEmpty
      .map((line) => parseTaskLine(line))
      .filter((item): item is { checked: boolean; text: string } => item !== null);
    return tasksToHtml(items);
  }

  // Pure markdown table (header + separator + optional body)
  if (
    nonEmpty.length >= 2 &&
    isTableRow(nonEmpty[0]) &&
    isTableSeparator(nonEmpty[1]) &&
    nonEmpty.slice(2).every((line) => isTableRow(line) || isTableSeparator(line))
  ) {
    const html = tableToHtml(nonEmpty);
    return html || null;
  }

  // Mixed content: convert consecutive task/table blocks, leave the rest as paragraphs
  let hasConvertible = false;
  const parts: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    // Table block
    if (
      i + 1 < lines.length &&
      isTableRow(line) &&
      isTableSeparator(lines[i + 1])
    ) {
      const tableLines = [line, lines[i + 1]];
      i += 2;
      while (i < lines.length && isTableRow(lines[i])) {
        tableLines.push(lines[i]);
        i += 1;
      }
      const html = tableToHtml(tableLines);
      if (html) {
        parts.push(html);
        hasConvertible = true;
      }
      continue;
    }

    // Consecutive task lines
    if (parseTaskLine(line)) {
      const items: { checked: boolean; text: string }[] = [];
      while (i < lines.length) {
        const task = parseTaskLine(lines[i]);
        if (!task) {
          break;
        }
        items.push(task);
        i += 1;
      }
      parts.push(tasksToHtml(items));
      hasConvertible = true;
      continue;
    }

    parts.push(paragraphHtml(line));
    i += 1;
  }

  if (!hasConvertible) {
    return null;
  }

  return parts.join("");
}

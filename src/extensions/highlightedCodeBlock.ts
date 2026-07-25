import { textblockTypeInputRule } from "@tiptap/core";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { VueNodeViewRenderer } from "@tiptap/vue-3";
import { common, createLowlight } from "lowlight";
import CodeBlockView from "../components/CodeBlockView.vue";

const lowlight = createLowlight(common);

/** Map common aliases / casing to lowlight language ids. */
const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  md: "markdown",
  html: "xml",
  htm: "xml",
  yml: "yaml",
  vue: "xml",
  svg: "xml",
};

/** Curated languages shown in the code-block dropdown. */
export const CODE_LANGUAGE_OPTIONS: { value: string; label: string }[] = [
  { value: "plaintext", label: "Plain text" },
  { value: "bash", label: "Bash" },
  { value: "c", label: "C" },
  { value: "csharp", label: "C#" },
  { value: "css", label: "CSS" },
  { value: "go", label: "Go" },
  { value: "xml", label: "HTML" },
  { value: "java", label: "Java" },
  { value: "javascript", label: "JavaScript" },
  { value: "json", label: "JSON" },
  { value: "kotlin", label: "Kotlin" },
  { value: "markdown", label: "Markdown" },
  { value: "php", label: "PHP" },
  { value: "python", label: "Python" },
  { value: "ruby", label: "Ruby" },
  { value: "rust", label: "Rust" },
  { value: "sql", label: "SQL" },
  { value: "swift", label: "Swift" },
  { value: "typescript", label: "TypeScript" },
  { value: "yaml", label: "YAML" },
];

export function normalizeCodeLanguage(
  language?: string | null,
): string | null {
  if (!language) {
    return "plaintext";
  }

  const key = language.trim().toLowerCase();
  if (!key || key === "plain" || key === "text" || key === "plaintext") {
    return "plaintext";
  }

  const resolved = LANGUAGE_ALIASES[key] ?? key;
  return lowlight.registered(resolved) ? resolved : key;
}

/** ``` / ```js / ```HTML + space or Enter */
export const backtickInputRegex = /^```([a-zA-Z0-9_+-]*)?[\s\n]$/;
/** ~~~ / ~~~js + space or Enter */
export const tildeInputRegex = /^~~~([a-zA-Z0-9_+-]*)?[\s\n]$/;

export const HighlightedCodeBlock = CodeBlockLowlight.extend({
  addInputRules() {
    return [
      textblockTypeInputRule({
        find: backtickInputRegex,
        type: this.type,
        getAttributes: (match) => ({
          language: normalizeCodeLanguage(match[1]),
        }),
      }),
      textblockTypeInputRule({
        find: tildeInputRegex,
        type: this.type,
        getAttributes: (match) => ({
          language: normalizeCodeLanguage(match[1]),
        }),
      }),
    ];
  },

  addNodeView() {
    return VueNodeViewRenderer(CodeBlockView);
  },
}).configure({
  lowlight,
  languageClassPrefix: "language-",
  // Avoid highlightAuto fallback (colors plain blocks)
  defaultLanguage: "plaintext",
});

import type { ReactNode } from "react";

const TOKEN =
  /("[^"]*"|\/\/.*$|#.*$|\b(?:const|await|async|def|class|return|from|import)\b|\b\d+\b|\b[A-Z][A-Za-z]+\b)/g;

/** Tiny highlighter for the relay's fixed snippets, colored from the editor tokens. */
export function CodeLine({ text }: { text: string }): ReactNode {
  if (!text) return " ";
  return text.split(TOKEN).map((part, i) => {
    if (!part) return null;
    const color = part.startsWith('"')
      ? "var(--bc-code-string)"
      : part.startsWith("//") || part.startsWith("#")
        ? "var(--bc-code-comment)"
        : /^\d+$/.test(part)
          ? "var(--bc-code-number)"
          : /^(const|await|async|def|class|return|from|import)$/.test(part)
            ? "var(--bc-code-keyword)"
            : /^[A-Z]/.test(part)
              ? "var(--bc-code-class)"
              : undefined;
    return color ? (
      <span key={i} style={{ color }}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    );
  });
}

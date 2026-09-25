import { cn } from "@/lib/cn";

/** Static, calm code sample with optional highlighted lines (1-based). */
export function CodeSample({
  file,
  source,
  highlight = [],
}: {
  file: string;
  source: string;
  highlight?: number[];
}) {
  return (
    <figure className="overflow-hidden rounded-lg border border-line bg-editor">
      <figcaption className="border-b border-line px-4 py-2 font-mono text-xs text-text-2">
        {file}
      </figcaption>
      <pre className="overflow-x-auto py-3 font-mono text-[0.76rem] leading-6 sm:text-[0.84rem] sm:leading-7">
        {source.split("\n").map((line, i) => (
          <div
            key={i}
            className={cn(
              "px-4",
              highlight.includes(i + 1)
                ? "border-l-2 border-cyan bg-cyan/[0.08] pl-[14px] text-text-1"
                : "text-text-2",
            )}
          >
            {line || " "}
          </div>
        ))}
      </pre>
    </figure>
  );
}

import React from "react";

export interface Citation {
  n: number;
  authors?: string;
  title: string;
  year: number;
  journal?: string;
  url: string;
}

export function renderBoldText(text: string): React.ReactNode {
  if (!text || !text.includes("**")) return text;

  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function renderRichText(text: string, sources?: Citation[]): React.ReactNode {
  if (!text) return text;

  const hasBold = text.includes("**");
  const hasCitation = /\[\d+\]/.test(text);
  if (!hasBold && !hasCitation) return text;

  const parts = text.split(/(\*\*[^*]+?\*\*|\[\d+\])/g);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    const citeMatch = part.match(/^\[(\d+)\]$/);
    if (citeMatch && sources?.length) {
      const n = parseInt(citeMatch[1], 10);
      const src = sources.find(s => s.n === n);
      if (src) {
        return (
          <a
            key={i}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-semibold text-primary hover:underline align-super px-0.5"
            aria-label={`Citation ${n}: ${src.title}`}
          >
            [{n}]
          </a>
        );
      }
    }
    return part;
  });
}

export function SourcesBlock({ sources }: { sources?: Citation[] }) {
  if (!sources || sources.length === 0) return null;
  const ordered = [...sources].sort((a, b) => a.n - b.n);
  return (
    <div className="mt-4 pt-3 border-t border-border/40">
      <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Sources
      </h4>
      <ol className="space-y-2">
        {ordered.map((src) => (
          <li key={src.n} className="flex items-start gap-2">
            <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0 mt-0.5 min-w-[16px]">
              [{src.n}]
            </span>
            <a
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-primary hover:underline leading-relaxed break-words"
            >
              {src.authors ? `${src.authors} ` : ""}
              ({src.year}). {src.title}
              {src.journal ? `. ${src.journal}` : ""}.
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

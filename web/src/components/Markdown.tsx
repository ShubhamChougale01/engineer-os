"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Mermaid } from "./Mermaid";

/**
 * Markdown renderer for skill content. GFM (tables, task lists) enabled.
 * ```mermaid fences render as live diagrams via the Mermaid component.
 *
 * memo() is load-bearing: parsing 50 sections of markdown is expensive, and
 * without it every progress toggle / scroll-spy update re-parsed the entire
 * page. With it, a section re-renders only when its content string changes
 * (i.e. never, after first render).
 */
export const Markdown = memo(function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-aeos">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code(props) {
            const { className, children: kids, ...rest } = props;
            const match = /language-(\w+)/.exec(className ?? "");
            if (match?.[1] === "mermaid") {
              return <Mermaid chart={String(kids).trim()} />;
            }
            return (
              <code className={className} {...rest}>
                {kids}
              </code>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
});

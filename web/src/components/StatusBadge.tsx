import type { ContentStatus } from "@/data/catalog";

const STYLES: Record<ContentStatus, { label: string; cls: string; glow: string }> = {
  done: { label: "Ready", cls: "bg-emerald-500/15 text-emerald-500", glow: "rgb(16 185 129 / 0.35)" },
  "in-progress": {
    label: "In progress",
    cls: "bg-amber-500/15 text-amber-500",
    glow: "rgb(245 158 11 / 0.35)",
  },
  todo: { label: "Coming soon", cls: "bg-zinc-500/15 text-ink-faint", glow: "rgb(113 113 122 / 0.3)" },
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  const s = STYLES[status];
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${s.cls}`}
      style={{
        boxShadow: `0 1px 2px ${s.glow}, inset 0 1px 0 rgb(255 255 255 / 0.15), inset 0 -1px 1px rgb(0 0 0 / 0.08)`,
      }}
    >
      {s.label}
    </span>
  );
}

import type { ContentStatus } from "@/data/catalog";

const STYLES: Record<ContentStatus, { label: string; cls: string }> = {
  done: { label: "Ready", cls: "bg-emerald-500/15 text-emerald-500" },
  "in-progress": { label: "In progress", cls: "bg-amber-500/15 text-amber-500" },
  todo: { label: "Coming soon", cls: "bg-zinc-500/15 text-ink-faint" },
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  const s = STYLES[status];
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}

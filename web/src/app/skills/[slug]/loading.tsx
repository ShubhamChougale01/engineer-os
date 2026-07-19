/**
 * Route-level skeleton: paints instantly on navigation while the skill page
 * loads (and while dev mode compiles the route), so clicks feel immediate.
 */
export default function SkillLoading() {
  return (
    <div className="flex gap-10" aria-busy="true" aria-label="Loading skill page">
      <div className="min-w-0 flex-1">
        <div className="mb-3 h-3 w-40 animate-pulse rounded bg-line" />
        <div className="mb-2 h-9 w-64 animate-pulse rounded-lg bg-line" />
        <div className="mb-6 h-4 w-96 max-w-full animate-pulse rounded bg-line" />
        <div className="mb-10 h-1.5 w-full animate-pulse rounded-full bg-line" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="mb-10">
            <div className="mb-3 h-5 w-48 animate-pulse rounded bg-line" />
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-line" />
              <div className="h-3 w-11/12 animate-pulse rounded bg-line" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-line" />
              <div className="mt-4 h-32 w-full animate-pulse rounded-xl bg-line" />
            </div>
          </div>
        ))}
      </div>
      <div className="hidden w-56 shrink-0 lg:block">
        <div className="space-y-2 pt-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-3 w-full animate-pulse rounded bg-line" />
          ))}
        </div>
      </div>
    </div>
  );
}

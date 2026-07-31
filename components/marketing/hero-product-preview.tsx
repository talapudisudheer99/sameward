/** Decorative product preview for the marketing hero — not interactive. */
export function HeroProductPreview() {
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-border bg-card shadow-[0_16px_40px_rgba(16,24,40,0.1)]"
      aria-hidden
    >
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-5 py-3.5">
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="ml-3 text-xs text-muted-foreground">
          acme.teamhub.ai
        </span>
      </div>

      <div className="grid min-h-[300px] grid-cols-[120px_1fr] sm:min-h-[380px] sm:grid-cols-[160px_1fr] lg:min-h-[420px] xl:min-h-[460px]">
        <aside className="border-r border-border bg-sidebar p-4">
          <div className="mb-5 h-3.5 w-24 rounded bg-foreground/15" />
          <div className="space-y-2.5">
            <div className="h-9 rounded-[var(--radius)] bg-secondary" />
            <div className="h-9 rounded-[var(--radius)] bg-transparent" />
            <div className="h-9 rounded-[var(--radius)] bg-transparent" />
          </div>
          <div className="mt-8 space-y-2.5">
            <div className="h-2.5 w-20 rounded bg-muted-foreground/25" />
            <div className="h-8 rounded-[var(--radius)] bg-muted" />
            <div className="h-8 rounded-[var(--radius)] bg-muted" />
            <div className="h-8 rounded-[var(--radius)] bg-muted" />
            <div className="h-8 rounded-[var(--radius)] bg-muted" />
          </div>
        </aside>

        <div className="flex flex-col bg-background p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="h-3.5 w-32 rounded bg-foreground/20" />
            <div className="h-9 w-full max-w-[200px] rounded-[var(--radius)] border border-border bg-card" />
          </div>

          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <div className="rounded-[var(--radius)] border border-border bg-card p-4">
              <div className="mb-4 h-3 w-16 rounded bg-primary/80" />
              <div className="space-y-2.5">
                <div className="h-2.5 w-full rounded bg-muted" />
                <div className="h-2.5 w-11/12 rounded bg-muted" />
                <div className="h-2.5 w-4/5 rounded bg-muted" />
                <div className="h-2.5 w-3/4 rounded bg-muted" />
              </div>
            </div>
            <div className="rounded-[var(--radius)] border border-border bg-card p-4">
              <div className="mb-4 flex gap-2">
                <div className="h-7 flex-1 rounded-[var(--radius)] bg-muted" />
                <div className="h-7 flex-1 rounded-[var(--radius)] bg-secondary" />
                <div className="h-7 flex-1 rounded-[var(--radius)] bg-muted" />
              </div>
              <div className="space-y-2.5">
                <div className="h-9 rounded-[var(--radius)] border border-border bg-background" />
                <div className="h-9 rounded-[var(--radius)] border border-border bg-background" />
                <div className="h-9 rounded-[var(--radius)] border border-border bg-background" />
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[var(--radius)] border border-primary/20 bg-secondary/80 px-4 py-3">
            <div className="h-2.5 w-28 rounded bg-primary/70" />
            <div className="mt-2.5 h-2.5 w-full rounded bg-primary/20" />
          </div>
        </div>
      </div>
    </div>
  )
}

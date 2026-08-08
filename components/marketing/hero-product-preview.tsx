/** Decorative product preview for the marketing hero — not interactive. */
export function HeroProductPreview() {
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-border bg-card shadow-[0_16px_40px_rgba(16,24,40,0.12)] ring-1 ring-primary/5"
      aria-hidden
    >
      {/* Thin brand accent line across the very top */}
      <div className="h-1 w-full bg-linear-to-r from-(--brand-a) via-primary to-(--brand-b)" />

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
            <div className="relative h-9 rounded-[var(--radius)] bg-secondary">
              <span className="absolute top-1/2 left-0 h-4 w-1 -translate-y-1/2 rounded-full bg-linear-to-b from-primary to-(--brand-a)" />
            </div>
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
            <div className="flex items-center gap-3">
              <div className="hidden h-9 w-35 rounded-[var(--radius)] border border-border bg-card sm:block" />
              <div className="flex -space-x-2">
                <span className="size-7 rounded-full bg-linear-to-br from-(--brand-a) to-primary ring-2 ring-background" />
                <span className="size-7 rounded-full bg-linear-to-br from-primary to-(--brand-b) ring-2 ring-background" />
                <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-[9px] font-semibold text-secondary-foreground ring-2 ring-background">
                  +3
                </span>
              </div>
            </div>
          </div>

          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <div className="rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm">
              <div className="mb-4 h-3 w-16 rounded bg-linear-to-r from-primary to-(--brand-a)" />
              <div className="space-y-2.5">
                <div className="h-2.5 w-full rounded bg-muted" />
                <div className="h-2.5 w-11/12 rounded bg-muted" />
                <div className="h-2.5 w-4/5 rounded bg-muted" />
                <div className="h-2.5 w-3/4 rounded bg-muted" />
              </div>
            </div>
            <div className="rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm">
              <div className="mb-4 flex gap-2">
                <div className="h-7 flex-1 rounded-[var(--radius)] bg-muted" />
                <div className="h-7 flex-1 rounded-[var(--radius)] bg-linear-to-r from-primary to-(--brand-a)" />
                <div className="h-7 flex-1 rounded-[var(--radius)] bg-muted" />
              </div>
              <div className="space-y-2.5">
                <div className="h-9 rounded-[var(--radius)] border border-border bg-background" />
                <div className="h-9 rounded-[var(--radius)] border border-border bg-background" />
                <div className="h-9 rounded-[var(--radius)] border border-border bg-background" />
              </div>
            </div>
          </div>

          <div className="bg-brand-wash mt-4 flex items-center gap-3 rounded-[var(--radius)] border border-primary/20 bg-secondary/70 px-4 py-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-(--brand-a) to-(--brand-b) text-[10px] font-bold text-white">
              AI
            </span>
            <div className="min-w-0 flex-1">
              <div className="h-2.5 w-28 rounded bg-linear-to-r from-primary to-(--brand-b)" />
              <div className="mt-2.5 h-2.5 w-full rounded bg-primary/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

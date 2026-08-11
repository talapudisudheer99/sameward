"use client"

import { useMemo, useState } from "react"
import { Clock3, Search } from "lucide-react"

import {
  EMOJI_CATEGORIES,
  searchEmojiCatalog,
  type EmojiCategoryId,
  type EmojiItem,
} from "@/lib/channels/emoji-catalog"
import {
  pushRecentEmoji,
  readRecentEmoji,
} from "@/lib/channels/emoji-recent"
import { cn } from "@/lib/utils"

type EmojiPickerProps = {
  onSelect: (emoji: string) => void
  className?: string
  /** Accessible name for the panel */
  label?: string
}

type TabId = "recent" | EmojiCategoryId

/**
 * Slack/WhatsApp-style picker: search · categories · recently used · scrollable grid.
 * Custom curated catalog (no emoji-mart).
 */
export default function EmojiPicker({
  onSelect,
  className,
  label = "Choose emoji",
}: EmojiPickerProps) {
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<TabId>("recent")
  const [recent, setRecent] = useState<string[]>(() => readRecentEmoji())

  const searching = query.trim().length > 0

  const items: EmojiItem[] = useMemo(() => {
    if (searching) return searchEmojiCatalog(query).slice(0, 120)
    if (tab === "recent") {
      return recent.map((emoji) => ({ emoji, name: emoji }))
    }
    return EMOJI_CATEGORIES.find((c) => c.id === tab)?.items ?? []
  }, [query, searching, tab, recent])

  function pick(emoji: string) {
    setRecent(pushRecentEmoji(emoji))
    onSelect(emoji)
  }

  return (
    <div
      role="dialog"
      aria-label={label}
      className={cn(
        "flex w-[20.5rem] shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg ring-1 ring-foreground/5",
        className
      )}
    >
      <div className="border-b border-border p-2">
        <label className="relative block">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search emoji…"
            autoComplete="off"
            className="h-8 w-full rounded-lg border border-border bg-background pr-2.5 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </label>
      </div>

      {!searching ? (
        <div
          className="flex gap-0.5 overflow-x-auto border-b border-border px-1.5 py-1"
          role="tablist"
          aria-label="Emoji categories"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "recent"}
            title="Recently used"
            onClick={() => setTab("recent")}
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-md text-sm transition-colors",
              tab === "recent"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Clock3 className="size-3.5" aria-hidden />
            <span className="sr-only">Recent</span>
          </button>
          {EMOJI_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={tab === cat.id}
              title={cat.label}
              onClick={() => setTab(cat.id)}
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-md text-base leading-none transition-colors",
                tab === cat.id
                  ? "bg-primary/10"
                  : "hover:bg-muted"
              )}
            >
              <span aria-hidden>{cat.icon}</span>
              <span className="sr-only">{cat.label}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="max-h-56 overflow-y-auto p-1.5">
        {!searching && tab === "recent" ? (
          <p className="px-1.5 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Recently used
          </p>
        ) : null}
        {searching ? (
          <p className="px-1.5 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {items.length === 0 ? "No matches" : "Search results"}
          </p>
        ) : null}
        {items.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            Try another search
          </p>
        ) : (
          <div
            role="listbox"
            aria-label={searching ? "Search results" : "Emoji list"}
            className="grid grid-cols-8 gap-0.5"
          >
            {items.map((item) => (
              <button
                key={`${item.emoji}-${item.name}`}
                type="button"
                role="option"
                title={item.name}
                className="flex size-9 items-center justify-center rounded-lg text-xl leading-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                onClick={() => pick(item.emoji)}
                aria-label={item.name}
              >
                {item.emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

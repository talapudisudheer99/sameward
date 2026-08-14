"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAxiosError } from "axios"
import { Laptop, Loader2, MonitorSmartphone } from "lucide-react"
import { toast } from "sonner"

import { LogoutButton } from "@/components/layout/logout-button"
import { LogoutAllDevicesButton } from "@/components/layout/logout-all-devices-button"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api/axios"
import { cn } from "@/lib/utils"

type SessionRow = {
  id: string
  deviceLabel: string
  ip: string | null
  createdAt: string
  expiresAt: string
  current: boolean
}

type SessionsResponse = {
  sessions: SessionRow[]
  maxSessions: number
}

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

/** Skip loopback noise (local `npm run dev`); show real client IPs only. */
function formatIp(ip: string | null): string | null {
  if (!ip) return null
  const t = ip.trim().toLowerCase()
  if (t === "::1" || t === "127.0.0.1" || t === "localhost") return null
  return ip
}

/**
 * Active device sessions (max 2) + revoke + logout helpers.
 */
export default function SessionSettings() {
  const router = useRouter()
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [maxSessions, setMaxSessions] = useState(2)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setLoadError(false)
      const { data } = await api.get<SessionsResponse>("/api/auth/sessions")
      setSessions(data.sessions)
      setMaxSessions(data.maxSessions)
    } catch {
      setLoadError(true)
      setSessions([])
      toast.error("Could not load sessions")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function revoke(session: SessionRow) {
    try {
      setRevokingId(session.id)
      const { data } = await api.delete<{ message?: string; current?: boolean }>(
        `/api/auth/sessions/${session.id}`
      )
      if (data.current) {
        toast.success("Signed out")
        router.replace("/login")
        router.refresh()
        return
      }
      toast.success("Session ended")
      await load()
    } catch (error) {
      let message = "Could not end session"
      if (isAxiosError(error)) {
        message = error.response?.data?.message ?? message
      }
      toast.error(message)
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        You can stay signed in on up to{" "}
        <span className="font-medium text-foreground">{maxSessions} devices</span>
        . Signing in on another device ends the oldest session automatically.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading sessions…
        </div>
      ) : loadError ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Couldn’t load your sessions.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void load()}
          >
            Try again
          </Button>
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active sessions.</p>
      ) : (
        <ul className="space-y-2">
          {sessions.map((s) => {
            const ipLabel = formatIp(s.ip)
            return (
            <li
              key={s.id}
              className={cn(
                "flex items-start gap-3 rounded-xl border border-border bg-background px-3 py-2.5",
                s.current && "border-primary/30 bg-primary/5"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                  s.current ? "brand-tile" : "bg-muted text-muted-foreground"
                )}
                aria-hidden
              >
                {s.current ? (
                  <Laptop className="size-4" />
                ) : (
                  <MonitorSmartphone className="size-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    {s.deviceLabel}
                  </p>
                  {s.current ? (
                    <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      This device
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Signed in {formatWhen(s.createdAt)}
                  {ipLabel ? ` · ${ipLabel}` : ""}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant={s.current ? "outline" : "ghost"}
                disabled={revokingId === s.id}
                className={cn(
                  "shrink-0",
                  !s.current && "text-destructive hover:text-destructive"
                )}
                onClick={() => void revoke(s)}
              >
                {revokingId === s.id
                  ? "…"
                  : s.current
                    ? "Sign out"
                    : "End"}
              </Button>
            </li>
            )
          })}
        </ul>
      )}

      <div className="border-t border-border pt-3">
        <p className="mb-2 text-xs text-muted-foreground">
          Or end every session at once. Changing your password also signs out
          other devices.
        </p>
        <LogoutButton />
        <LogoutAllDevicesButton />
      </div>
    </div>
  )
}

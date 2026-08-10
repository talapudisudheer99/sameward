"use client"

import { ExternalLink, Loader2 } from "lucide-react"

import UserAvatar from "@/components/profile/user-avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useGetWorkspaceProfileQuery } from "@/store/api/profile/profile-api"

type ProfileCardDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  userId: string | null
  /** Optional hint while loading */
  fallbackName?: string
}

/**
 * Teammate professional card — workspace-scoped fetch.
 */
export default function ProfileCardDialog({
  open,
  onOpenChange,
  workspaceId,
  userId,
  fallbackName,
}: ProfileCardDialogProps) {
  const { data, isLoading, isError } = useGetWorkspaceProfileQuery(
    { workspaceId, userId: userId ?? "" },
    { skip: !open || !userId || !workspaceId }
  )

  const profile = data?.profile

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-4 border-border bg-card p-4 shadow-xl sm:max-w-sm">
        <DialogHeader className="gap-3 pr-8 text-left">
          <div className="flex items-center gap-3">
            <UserAvatar
              name={profile?.fullName ?? fallbackName ?? "?"}
              avatarUrl={profile?.avatarUrl}
              size="lg"
            />
            <div className="min-w-0">
              <DialogTitle className="truncate font-heading text-lg">
                {profile?.fullName ?? fallbackName ?? "Member"}
              </DialogTitle>
              {profile?.title ? (
                <DialogDescription className="text-sm text-muted-foreground">
                  {profile.title}
                </DialogDescription>
              ) : (
                <DialogDescription className="sr-only">
                  Teammate profile
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-6 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : null}

        {isError ? (
          <p className="text-sm text-muted-foreground">
            Couldn’t load this profile. They may not be in this workspace.
          </p>
        ) : null}

        {profile ? (
          <div className="space-y-3 text-sm">
            {profile.bio ? (
              <p className="leading-relaxed text-foreground/90">{profile.bio}</p>
            ) : null}

            <dl className="space-y-2 text-xs">
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="truncate font-medium">{profile.email}</dd>
              </div>
              {profile.timezone ? (
                <div>
                  <dt className="text-muted-foreground">Timezone</dt>
                  <dd className="font-medium">{profile.timezone}</dd>
                </div>
              ) : null}
            </dl>

            {profile.links.length > 0 ? (
              <ul className="flex flex-col gap-1.5 border-t border-border/60 pt-3">
                {profile.links.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary hover:underline"
                    >
                      {link.label}
                      <ExternalLink className="size-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useMemo, useRef, useState } from "react"
import { Loader2, Plus, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"

import UserAvatar from "@/components/profile/user-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import updateProfileSchema from "@/lib/schemas/profile/update-profile-schema"
import { putFileToS3 } from "@/lib/storage/upload-client"
import type { ProfileLink } from "@/lib/types/profile/profile-types"
import { useGetCurrentUserQuery } from "@/store/api/auth/auth-api"
import {
  usePresignAvatarMutation,
  useUpdateMyProfileMutation,
} from "@/store/api/profile/profile-api"

const AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const AVATAR_MAX = 2 * 1024 * 1024

type ProfileSnapshot = {
  fullName: string
  title: string
  bio: string
  timezone: string
  links: ProfileLink[]
  avatarUrl: string | null
}

function normalizeLinks(links: ProfileLink[]): ProfileLink[] {
  return links
    .map((l) => ({ label: l.label.trim(), url: l.url.trim() }))
    .filter((l) => l.label || l.url)
}

function linksEqual(a: ProfileLink[], b: ProfileLink[]): boolean {
  if (a.length !== b.length) return false
  return a.every((link, i) => link.label === b[i]?.label && link.url === b[i]?.url)
}

/**
 * Edit own Profile v1 fields + avatar upload.
 */
export default function EditProfileForm() {
  const { data, isLoading } = useGetCurrentUserQuery()
  const user = data?.user

  const [fullName, setFullName] = useState("")
  const [title, setTitle] = useState("")
  const [bio, setBio] = useState("")
  const [timezone, setTimezone] = useState("")
  const [links, setLinks] = useState<ProfileLink[]>([])
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  /** Local blob preview while a new file is pending save */
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  /** undefined = unchanged · null = clear · string = new canonical S3 URL */
  const [pendingCanonical, setPendingCanonical] = useState<
    string | null | undefined
  >(undefined)
  const [initialSnapshot, setInitialSnapshot] = useState<ProfileSnapshot | null>(
    null
  )
  const [hydrated, setHydrated] = useState(false)
  const [linkErrors, setLinkErrors] = useState<Record<number, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const [updateProfile, { isLoading: saving }] = useUpdateMyProfileMutation()
  const [presignAvatar, { isLoading: uploading }] = usePresignAvatarMutation()
  const fileRef = useRef<HTMLInputElement>(null)

  // Hydrate once when me arrives (adjust state during render — React pattern)
  if (user && !hydrated) {
    setHydrated(true)
    setFullName(user.fullName ?? "")
    setTitle(user.title ?? "")
    setBio(user.bio ?? "")
    setTimezone(user.timezone ?? "")
    setLinks(user.links ?? [])
    setAvatarUrl(user.avatarUrl ?? null)
    setInitialSnapshot({
      fullName: user.fullName ?? "",
      title: user.title ?? "",
      bio: user.bio ?? "",
      timezone: user.timezone ?? "",
      links: user.links ?? [],
      avatarUrl: user.avatarUrl ?? null,
    })
  }

  const trimmedFullName = fullName.trim()
  const normalizedLinks = useMemo(() => normalizeLinks(links), [links])

  const hasChanges = useMemo(() => {
    if (!initialSnapshot) return false
    if (trimmedFullName !== initialSnapshot.fullName.trim()) return true
    if (title.trim() !== initialSnapshot.title.trim()) return true
    if (bio.trim() !== initialSnapshot.bio.trim()) return true
    if (timezone.trim() !== initialSnapshot.timezone.trim()) return true
    if (!linksEqual(normalizedLinks, normalizeLinks(initialSnapshot.links))) {
      return true
    }
    if (pendingCanonical !== undefined) {
      return pendingCanonical !== initialSnapshot.avatarUrl
    }
    return false
  }, [
    initialSnapshot,
    trimmedFullName,
    title,
    bio,
    timezone,
    normalizedLinks,
    pendingCanonical,
  ])

  function validateClient(): boolean {
    setFormError(null)
    const nextLinkErrors: Record<number, string> = {}
    let hasInvalid = false

    links.forEach((l, i) => {
      const label = l.label.trim()
      const url = l.url.trim()
      if (!label && !url) return
      if (!label || !url) {
        nextLinkErrors[i] = "Add both label and URL"
        hasInvalid = true
        return
      }
      const parsed = updateProfileSchema.shape.links
        ?.unwrap()
        .element.safeParse({ label, url })
      if (!parsed?.success) {
        nextLinkErrors[i] = "Enter a valid http(s) URL"
        hasInvalid = true
      }
    })

    setLinkErrors(nextLinkErrors)
    if (!trimmedFullName) {
      setFormError("Display name is required")
      hasInvalid = true
    }
    return !hasInvalid
  }

  async function onPickAvatar(file: File | null) {
    if (!file) return
    if (!AVATAR_TYPES.has(file.type)) {
      toast.error("Use JPEG, PNG, or WebP")
      return
    }
    if (file.size > AVATAR_MAX) {
      toast.error("Avatar must be 2 MB or less")
      return
    }
    try {
      const { upload } = await presignAvatar({
        name: file.name,
        mime: file.type,
        sizeBytes: file.size,
      }).unwrap()
      await putFileToS3(upload, file)
      if (localPreview) URL.revokeObjectURL(localPreview)
      setLocalPreview(URL.createObjectURL(file))
      setPendingCanonical(upload.url)
      toast.success("Avatar ready — save to apply")
    } catch {
      toast.error("Could not upload avatar")
    } finally {
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  async function onSave() {
    if (!hasChanges) return
    if (!validateClient()) return

    try {
      const body: {
        fullName: string
        title: string
        bio: string
        timezone: string
        links: ProfileLink[]
        avatarUrl?: string | null
      } = {
        fullName: trimmedFullName,
        title: title.trim(),
        bio: bio.trim(),
        timezone: timezone.trim(),
        links: normalizedLinks.filter((l) => l.label && l.url),
      }
      if (pendingCanonical !== undefined) {
        body.avatarUrl = pendingCanonical
      }
      const result = await updateProfile(body).unwrap()
      setPendingCanonical(undefined)
      if (localPreview) {
        URL.revokeObjectURL(localPreview)
        setLocalPreview(null)
      }
      setAvatarUrl(result.user.avatarUrl ?? null)
      setInitialSnapshot({
        fullName: result.user.fullName ?? "",
        title: result.user.title ?? "",
        bio: result.user.bio ?? "",
        timezone: result.user.timezone ?? "",
        links: result.user.links ?? [],
        avatarUrl: result.user.avatarUrl ?? null,
      })
      setLinkErrors({})
      setFormError(null)
      toast.success("Profile saved")
    } catch {
      toast.error("Could not save profile")
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex justify-center py-16 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <UserAvatar
          name={fullName || user.fullName}
          avatarUrl={localPreview ?? avatarUrl}
          size="lg"
        />
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => void onPickAvatar(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="gap-1.5"
          >
            {uploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            Upload photo
          </Button>
          {localPreview || avatarUrl ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                if (localPreview) {
                  URL.revokeObjectURL(localPreview)
                  setLocalPreview(null)
                }
                setAvatarUrl(null)
                setPendingCanonical(null)
              }}
            >
              Remove
            </Button>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Display name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            maxLength={50}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="title">Title / role</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Backend engineer"
            maxLength={80}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio">Short bio</Label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="One or two lines about how you work on this team"
            maxLength={280}
            rows={3}
            className="w-full min-w-0 resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            placeholder="e.g. Asia/Kolkata"
            maxLength={64}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Links</Label>
            {links.length < 2 ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="gap-1"
                onClick={() =>
                  setLinks((prev) => [...prev, { label: "", url: "" }])
                }
              >
                <Plus className="size-3.5" />
                Add
              </Button>
            ) : null}
          </div>
          {links.map((link, i) => (
            <div key={i} className="space-y-1">
              <div className="flex gap-2">
                <Input
                  value={link.label}
                  placeholder="Label"
                  className="w-28 shrink-0"
                  maxLength={40}
                  onChange={(e) => {
                    const next = [...links]
                    next[i] = { ...link, label: e.target.value }
                    setLinks(next)
                    if (linkErrors[i]) {
                      setLinkErrors((prev) => {
                        const clone = { ...prev }
                        delete clone[i]
                        return clone
                      })
                    }
                  }}
                />
                <Input
                  value={link.url}
                  placeholder="https://"
                  className="min-w-0 flex-1"
                  maxLength={500}
                  onChange={(e) => {
                    const next = [...links]
                    next[i] = { ...link, url: e.target.value }
                    setLinks(next)
                    if (linkErrors[i]) {
                      setLinkErrors((prev) => {
                        const clone = { ...prev }
                        delete clone[i]
                        return clone
                      })
                    }
                  }}
                />
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Remove link"
                  onClick={() => setLinks((prev) => prev.filter((_, j) => j !== i))}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              {linkErrors[i] ? (
                <p className="text-xs text-destructive">{linkErrors[i]}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {formError ? (
        <p className="text-sm text-destructive">{formError}</p>
      ) : null}

      <Button
        type="button"
        onClick={() => void onSave()}
        disabled={saving || !trimmedFullName || !hasChanges}
        className="btn-brand-gradient self-start gap-2"
      >
        {saving ? <Loader2 className="size-3.5 animate-spin" /> : null}
        Save profile
      </Button>
    </div>
  )
}

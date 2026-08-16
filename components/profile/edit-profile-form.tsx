"use client"

import { useMemo, useRef, useState, type ReactNode } from "react"
import { Loader2, Plus, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"

import ProfilePreviewCard from "@/components/profile/profile-preview-card"
import UserAvatar from "@/components/profile/user-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  detectTimezone,
  groupTimezones,
  isValidTimezone,
  listTimezones,
  timezoneCityLabel,
} from "@/lib/profile/timezones"
import updateProfileSchema from "@/lib/schemas/profile/update-profile-schema"
import { putFileToS3 } from "@/lib/storage/upload-client"
import type { ProfileLink } from "@/lib/types/profile/profile-types"
import { cn } from "@/lib/utils"
import { useGetCurrentUserQuery } from "@/store/api/auth/auth-api"
import {
  usePresignAvatarMutation,
  useUpdateMyProfileMutation,
} from "@/store/api/profile/profile-api"

const AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const AVATAR_MAX = 2 * 1024 * 1024
const BIO_MAX = 280
const MAX_LINKS = 2

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

/** One titled group of fields — keeps a long form scannable. */
function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-border/70 bg-card/50 p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="font-heading text-sm font-semibold tracking-tight">
          {title}
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </section>
  )
}

/**
 * Edit own Profile v1 fields + avatar upload, with a live preview of the card
 * teammates actually see and a save bar that only appears when something changed.
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
  const [savedOnce, setSavedOnce] = useState(false)

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

  const zoneGroups = useMemo(() => groupTimezones(listTimezones()), [])
  /** Legacy free-text values (e.g. "India") must stay selectable, not vanish. */
  const zoneRecognized = useMemo(() => {
    const zone = timezone.trim()
    if (!zone) return true
    return isValidTimezone(zone)
  }, [timezone])

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

  function updateLink(index: number, patch: Partial<ProfileLink>) {
    setLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, ...patch } : link))
    )
    if (linkErrors[index]) {
      setLinkErrors((prev) => {
        const clone = { ...prev }
        delete clone[index]
        return clone
      })
    }
  }

  function onDiscard() {
    if (!initialSnapshot) return
    setFullName(initialSnapshot.fullName)
    setTitle(initialSnapshot.title)
    setBio(initialSnapshot.bio)
    setTimezone(initialSnapshot.timezone)
    setLinks(initialSnapshot.links)
    setAvatarUrl(initialSnapshot.avatarUrl)
    if (localPreview) {
      URL.revokeObjectURL(localPreview)
      setLocalPreview(null)
    }
    setPendingCanonical(undefined)
    setLinkErrors({})
    setFormError(null)
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
      setSavedOnce(true)
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

  const shownAvatar = localPreview ?? avatarUrl

  let saveStatus = ""
  if (saving) saveStatus = "Saving profile"
  else if (savedOnce && !hasChanges) saveStatus = "Profile saved"

  return (
    <div className="w-full">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-8">
        <div className="min-w-0 space-y-4 sm:space-y-5">
          <FormSection
            title="Photo"
            description="A face makes you easier to spot in channels. JPEG, PNG, or WebP up to 2 MB."
          >
            <div className="flex flex-wrap items-center gap-4">
              <UserAvatar
                name={fullName || user.fullName}
                avatarUrl={shownAvatar}
                size="md"
                className="ring-2 ring-border"
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
                  {shownAvatar ? "Replace photo" : "Upload photo"}
                </Button>
                {shownAvatar ? (
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
          </FormSection>

          <FormSection
            title="Identity"
            description="The two lines teammates read first on your card."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Display name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  maxLength={50}
                  aria-invalid={!trimmedFullName}
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
            </div>
          </FormSection>

          <FormSection
            title="About you"
            description="How you work, what you own, or what to ask you about."
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="bio">Short bio</Label>
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    bio.length > BIO_MAX - 30
                      ? "text-foreground/70"
                      : "text-muted-foreground"
                  )}
                >
                  {bio.length}/{BIO_MAX}
                </span>
              </div>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="One or two lines about how you work on this team"
                maxLength={BIO_MAX}
                rows={3}
                className="w-full min-w-0 resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
          </FormSection>

          <FormSection
            title="Working hours"
            description="Your timezone helps teammates pick a reasonable time to reach you."
          >
            <div className="space-y-1.5">
              <Label htmlFor="timezone">Timezone</Label>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={timezone}
                  onValueChange={(next) => setTimezone(String(next ?? ""))}
                >
                  <SelectTrigger
                    id="timezone"
                    className="min-w-0 flex-1 basis-56"
                  >
                    <SelectValue>
                      {(value) =>
                        value ? (
                          String(value)
                        ) : (
                          <span className="text-muted-foreground">
                            Select your timezone
                          </span>
                        )
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {!zoneRecognized ? (
                      <SelectGroup>
                        <SelectLabel>Current value</SelectLabel>
                        <SelectItem value={timezone}>{timezone}</SelectItem>
                      </SelectGroup>
                    ) : null}
                    {zoneGroups.map((group) => (
                      <SelectGroup key={group.region}>
                        <SelectLabel>{group.region}</SelectLabel>
                        {group.zones.map((zone) => (
                          <SelectItem key={zone} value={zone}>
                            {timezoneCityLabel(zone)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setTimezone(detectTimezone())}
                >
                  Use my device timezone
                </Button>
              </div>
              {!zoneRecognized ? (
                <p className="text-xs text-muted-foreground">
                  “{timezone}” isn’t a recognized timezone, so teammates won’t
                  see your local time. Pick one from the list.
                </p>
              ) : null}
            </div>
          </FormSection>

          <FormSection
            title="Links"
            description={`Up to ${MAX_LINKS} places teammates can find your work.`}
          >
            <div className="space-y-2.5">
              {links.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No links yet — a portfolio or GitHub profile works well.
                </p>
              ) : null}

              {links.map((link, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex gap-2">
                    <Input
                      value={link.label}
                      placeholder="Label"
                      aria-label={`Link ${i + 1} label`}
                      className="w-28 shrink-0"
                      maxLength={40}
                      onChange={(e) => updateLink(i, { label: e.target.value })}
                    />
                    <Input
                      value={link.url}
                      placeholder="https://"
                      aria-label={`Link ${i + 1} URL`}
                      className="min-w-0 flex-1"
                      maxLength={500}
                      aria-invalid={Boolean(linkErrors[i])}
                      onChange={(e) => updateLink(i, { url: e.target.value })}
                    />
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Remove link ${i + 1}`}
                      onClick={() =>
                        setLinks((prev) => prev.filter((_, j) => j !== i))
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                  {linkErrors[i] ? (
                    <p className="text-xs text-destructive">{linkErrors[i]}</p>
                  ) : null}
                </div>
              ))}

              {links.length < MAX_LINKS ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() =>
                    setLinks((prev) => [...prev, { label: "", url: "" }])
                  }
                >
                  <Plus className="size-3.5" />
                  Add link
                </Button>
              ) : null}
            </div>
          </FormSection>
        </div>

        <aside className="lg:sticky lg:top-0 lg:self-start">
          <ProfilePreviewCard
            fullName={fullName}
            email={user.email}
            title={title}
            bio={bio}
            timezone={timezone}
            links={links}
            avatarUrl={shownAvatar}
          />
        </aside>
      </div>

      <p aria-live="polite" className="sr-only">
        {saveStatus}
      </p>

      {hasChanges ? (
        <div className="sticky bottom-0 z-20 mt-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-lg ring-1 ring-primary/10 backdrop-blur">
            <div className="min-w-0">
              <p className="text-sm font-medium">Unsaved changes</p>
              {formError ? (
                <p className="text-xs text-destructive">{formError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Your preview is ahead of what teammates see.
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDiscard}
                disabled={saving}
              >
                Discard
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => void onSave()}
                disabled={saving || !trimmedFullName}
                className="btn-brand-gradient gap-2"
              >
                {saving ? <Loader2 className="size-3.5 animate-spin" /> : null}
                Save profile
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

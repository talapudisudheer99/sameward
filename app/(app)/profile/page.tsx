import Link from "next/link"
import { Settings } from "lucide-react"

import EditProfileForm from "@/components/profile/edit-profile-form"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Own Profile v1 — edit display name, title, bio, timezone, links, avatar.
 */
export default function ProfilePage() {
  return (
    <section className="mx-auto w-full max-w-5xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
            Your profile
          </h1>
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">
            Teammates in shared workspaces can see this card — keep it short and
            professional.
          </p>
        </div>
        <Link
          href="/settings"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-1.5"
          )}
        >
          <Settings className="size-3.5" aria-hidden />
          Account &amp; security
        </Link>
      </header>
      <EditProfileForm />
    </section>
  )
}

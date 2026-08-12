import Link from "next/link"

import EditProfileForm from "@/components/profile/edit-profile-form"

/**
 * Own Profile v1 — edit display name, title, bio, timezone, links, avatar.
 */
export default function ProfilePage() {
  return (
    <section className="mx-auto w-full max-w-xl">
      <header className="mb-8">
        <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
          Your profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Teammates in shared workspaces can see this card — keep it short and
          professional.
        </p>
        <p className="mt-2 text-sm">
          <Link
            href="/settings"
            className="font-medium text-primary hover:underline"
          >
            Account &amp; security settings
          </Link>
        </p>
      </header>
      <EditProfileForm />
    </section>
  )
}

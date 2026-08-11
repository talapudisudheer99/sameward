import EditProfileForm from "@/components/profile/edit-profile-form"

/**
 * Own Profile v1 — edit display name, title, bio, timezone, links, avatar.
 */
export default function ProfilePage() {
  return (
    <section className="mx-auto w-full max-w-xl">
      <header className="mb-8">
        <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
          Your profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Teammates in shared workspaces can see this card — keep it short and
          professional.
        </p>
      </header>
      <EditProfileForm />
    </section>
  )
}

import Link from "next/link"
import { UserRound } from "lucide-react"

import AccountSettings from "@/components/settings/account-settings"
import AppearanceSettings from "@/components/settings/appearance-settings"
import PasswordSettings from "@/components/settings/password-settings"
import SessionSettings from "@/components/settings/session-settings"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

/**
 * Settings v1 — account + app (appearance, email, password, sessions).
 * Profile editing stays on /profile.
 */
export default function SettingsPage() {
  return (
    <section className="mx-auto w-full max-w-xl space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Appearance, account security, and sessions for your TeamHub login.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Appearance</CardTitle>
          <CardDescription>
            Choose light, dark, or follow your system preference. Press{" "}
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-medium">
              D
            </kbd>{" "}
            anywhere (when not typing) to toggle light/dark.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppearanceSettings />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Account</CardTitle>
          <CardDescription>
            Your sign-in email and verification status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccountSettings />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Password</CardTitle>
          <CardDescription>
            Update the password for this account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordSettings />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Sessions</CardTitle>
          <CardDescription>
            Active devices (max 2). A third login ends the oldest session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SessionSettings />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Profile</CardTitle>
          <CardDescription>
            Name, avatar, title, and bio that teammates see in workspaces.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <UserRound className="size-4" aria-hidden />
            Edit your profile
          </Link>
        </CardContent>
      </Card>
    </section>
  )
}

import { getCurrentUser } from "./session"
import { redirect } from "next/navigation"

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  return user
}

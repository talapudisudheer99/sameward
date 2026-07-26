import { randomBytes } from "node:crypto"

import { NextResponse } from "next/server"

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  // if (!clientId || !redirectUri) {
  //   return NextResponse.json(
  //     { message: "Google OAuth is not configured" },
  //     { status: 500 }
  //   )
  // }

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { message: "Google OAuth is not configured" },
      { status: 500 }
    )
  }

  // State protects the callback from forged OAuth requests.
  const state = randomBytes(32).toString("hex")

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  })
  const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  const response = NextResponse.redirect(googleUrl)

  // The callback will compare Google's state with this cookie.
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  })

  return response
}

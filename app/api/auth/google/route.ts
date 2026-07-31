import { randomBytes } from "node:crypto"

import { NextResponse } from "next/server"

import { logAuthEvent } from "@/lib/auth/auth-audit-logger"
import {
  getClientIp,
  rateLimit,
  tooManyRequestsResponse,
} from "@/lib/auth/rate-limit"

export async function GET(request: Request) {
  const ip = getClientIp(request)
  const limited = rateLimit({
    key: `google:${ip}`,
    limit: 20,
    windowMs: 15 * 60 * 1000,
  })

  if (!limited.ok) {
    await logAuthEvent({
      event: "rate_limit.hit",
      success: false,
      ip,
      reason: "google",
    })
    return tooManyRequestsResponse(limited.retryAfterSeconds)
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { message: "Google OAuth is not configured" },
      { status: 500 }
    )
  }

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

  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  })

  return response
}

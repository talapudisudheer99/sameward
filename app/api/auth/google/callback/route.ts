import { NextResponse } from "next/server"

import { logAuthEvent } from "@/lib/auth/audit"
import { getClientIp } from "@/lib/auth/rate-limit"
import { createSession } from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongoose"
import { User } from "@/lib/models/user"

import { cookies } from "next/headers"

type GoogleTokenResponse = {
  access_token?: string
  error?: string
}

type GoogleProfile = {
  sub: string // subject identifier unlike email which is unique for each user , a google ID is unique for each user and it is used to identify the user across different devices and applications
  email?: string
  email_verified?: boolean
  name?: string
}

function redirectToLogin(request: Request, message: string) {
  // Leading "/" = from site root → /login
  // Without it, "login" becomes /api/auth/google/login (404)
  const url = new URL("/login", request.url)
  url.searchParams.set("error", message)
  return NextResponse.redirect(url)
}

export async function GET(request: Request) {
  const ip = getClientIp(request)
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    await logAuthEvent({
      event: "google.failure",
      success: false,
      ip,
      reason: "oauth_not_configured",
    })
    return redirectToLogin(request, "Google OAuth is not configured")
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const oauthError = searchParams.get("error")

  if (oauthError) {
    await logAuthEvent({
      event: "google.failure",
      success: false,
      ip,
      reason: "cancelled",
    })
    return redirectToLogin(request, "Google sign-in was cancelled")
  }

  if (!code || !state) {
    await logAuthEvent({
      event: "google.failure",
      success: false,
      ip,
      reason: "missing_code_or_state",
    })
    return redirectToLogin(request, "Missing Google auth code")
  }

  // Compare Google's state with the cookie we set in Step 3

  const cookieStore = await cookies()
  const stateCookie = cookieStore.get("google_oauth_state")?.value

  if (!stateCookie || stateCookie !== state) {
    await logAuthEvent({
      event: "google.failure",
      success: false,
      ip,
      reason: "invalid_state",
    })
    return redirectToLogin(request, "Invalid Google sign-in state")
  }

  try {
    // 1) Trade the one-time code for an access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    const tokenData = (await tokenRes.json()) as GoogleTokenResponse

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Google token error:", tokenData)
      await logAuthEvent({
        event: "google.failure",
        success: false,
        ip,
        reason: "token_exchange_failed",
      })
      return redirectToLogin(request, "Could not verify Google account")
    }

    // 2) Ask Google who this person is
    const profileRes = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    )

    const profile = (await profileRes.json()) as GoogleProfile

    if (!profileRes.ok || !profile.sub || !profile.email) {
      console.error("Google profile error:", profile)
      await logAuthEvent({
        event: "google.failure",
        success: false,
        ip,
        reason: "profile_fetch_failed",
      })
      return redirectToLogin(request, "Could not read Google profile")
    }

    const email = profile.email.toLowerCase().trim()

    const fullName = profile.name ?? email.split("@")[0].slice(0, 50)

    //now connect to the database after getting the fullName and email
    await connectDB()

    // 3) Find existing Google user, or link by verified email, or create new
    let user = await User.findOne({ googleId: profile.sub })

    if (!user) {
      user = await User.findOne({ email })

      if (user) {
        // Only link if Google says the email is verified
        if (!profile.email_verified) {
          await logAuthEvent({
            event: "google.failure",
            success: false,
            email,
            userId: user._id.toString(),
            ip,
            reason: "google_email_not_verified",
          })
          return redirectToLogin(
            request,
            "Google email is not verified. Use email login or verify with Google."
          )
        }

        user.googleId = profile.sub
        user.emailVerified = true // Google proved the inbox
        await user.save()
      } else {
        user = await User.create({
          fullName,
          email,
          googleId: profile.sub,
          emailVerified: true,
          // no passwordHash — Approach 3
        })
      }
    }

    // 4) Same session cookie as email signup/login
    await createSession(user._id.toString())

    await logAuthEvent({
      event: "google.success",
      success: true,
      email: user.email,
      userId: user._id.toString(),
      ip,
    })

    const response = NextResponse.redirect(new URL("/workspace", request.url))

    response.cookies.delete("google_oauth_state")
    return response
  } catch (error) {
    console.error("Google callback failed:", error)
    await logAuthEvent({
      event: "google.failure",
      success: false,
      ip,
      reason: "internal_error",
    })
    return redirectToLogin(request, "Google sign-in failed")
  }
}

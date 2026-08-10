import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongoose"
import { User } from "@/lib/models/user"
import { serializeProfile } from "@/lib/profile/serialize-profile"
import updateProfileSchema from "@/lib/schemas/profile/update-profile-schema"
import {
  isManagedObjectUrl,
  isUserAvatarUrl,
} from "@/lib/storage/s3"

/**
 * GET /api/auth/me — session user + Profile v1 fields (avatar signed).
 */
export async function GET() {
  const sessionUser = await getCurrentUser()

  if (!sessionUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  await connectDB()
  const user = await User.findById(sessionUser.id)
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const profile = await serializeProfile(user)
  return NextResponse.json(
    {
      user: {
        id: profile.id,
        fullName: profile.fullName,
        email: profile.email,
        emailVerified: user.emailVerified === true,
        title: profile.title,
        bio: profile.bio,
        timezone: profile.timezone,
        links: profile.links,
        avatarUrl: profile.avatarUrl,
      },
    },
    { status: 200 }
  )
}

/**
 * PATCH /api/auth/me — update own profile fields.
 */
export async function PATCH(req: Request) {
  const sessionUser = await getCurrentUser()
  if (!sessionUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 })
  }

  const parsed = updateProfileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: "Validation failed" }, { status: 400 })
  }

  const data = parsed.data
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ message: "No changes" }, { status: 400 })
  }

  if (data.avatarUrl !== undefined && data.avatarUrl !== null) {
    if (
      !isManagedObjectUrl(data.avatarUrl) ||
      !isUserAvatarUrl(data.avatarUrl, sessionUser.id)
    ) {
      return NextResponse.json(
        { message: "Invalid avatar URL" },
        { status: 400 }
      )
    }
  }

  await connectDB()
  const user = await User.findById(sessionUser.id)
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  if (data.fullName !== undefined) user.fullName = data.fullName
  if (data.title !== undefined) user.title = data.title
  if (data.bio !== undefined) user.bio = data.bio
  if (data.timezone !== undefined) user.timezone = data.timezone
  if (data.links !== undefined) {
    user.set("links", data.links)
  }
  if (data.avatarUrl !== undefined) {
    user.avatarUrl = data.avatarUrl
  }

  await user.save()

  const profile = await serializeProfile(user)
  return NextResponse.json(
    {
      user: {
        id: profile.id,
        fullName: profile.fullName,
        email: profile.email,
        emailVerified: user.emailVerified === true,
        title: profile.title,
        bio: profile.bio,
        timezone: profile.timezone,
        links: profile.links,
        avatarUrl: profile.avatarUrl,
      },
    },
    { status: 200 }
  )
}

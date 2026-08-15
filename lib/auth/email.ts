import { readFile } from "node:fs/promises"
import path from "node:path"

import { Resend } from "resend"

import {
  EMAIL_LOGO_CID,
  passwordResetEmailHtml,
  verificationEmailHtml,
  workspaceInviteEmailHtml,
} from "@/lib/auth/email-templates"

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY")
  }
  return new Resend(apiKey)
}

/** Inline logo so Gmail can show it without a public URL (localhost fails). */
async function logoAttachment() {
  const filePath = path.join(
    process.cwd(),
    "public",
    "brand",
    "teamhub-logo.png"
  )
  const content = await readFile(filePath)

  return {
    filename: "teamhub-logo.png",
    content: content.toString("base64"),
    contentId: EMAIL_LOGO_CID,
    contentType: "image/png",
  }
}

export async function sendPasswordResetEmail(options: {
  to: string
  resetUrl: string
}) {
  const from = process.env.EMAIL_FROM
  if (!from) {
    throw new Error("Missing EMAIL_FROM")
  }

  const resend = getResend()
  const logo = await logoAttachment()

  const { error } = await resend.emails.send({
    from,
    to: options.to,
    subject: "Reset your Sameward password",
    html: passwordResetEmailHtml(options.resetUrl),
    attachments: [logo],
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function sendVerificationEmail(options: {
  to: string
  verifyUrl: string
}) {
  const from = process.env.EMAIL_FROM

  if (!from) {
    throw new Error("Missing EMAIL_FROM")
  }

  const resend = getResend()
  const logo = await logoAttachment()

  const { error } = await resend.emails.send({
    from,
    to: options.to,
    subject: "Verify your Sameward email address",
    html: verificationEmailHtml(options.verifyUrl),
    attachments: [logo],
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function sendWorkspaceInviteEmail(options: {
  to: string
  inviteUrl: string
  inviteFrom: string
  workspaceName?: string
}) {
  const from = process.env.EMAIL_FROM
  if (!from) {
    throw new Error("Missing EMAIL_FROM")
  }

  const resend = getResend()
  const logo = await logoAttachment()

  const { error } = await resend.emails.send({
    from,
    to: options.to,
    subject: `You're invited to ${options.workspaceName ?? "a Sameward workspace"}`,
    html: workspaceInviteEmailHtml({
      inviteUrl: options.inviteUrl,
      inviteFrom: options.inviteFrom,
      workspaceName: options.workspaceName,
    }),
    attachments: [logo],
  })

  if (error) {
    // Resend test mode only delivers to the account owner — expected in local/dev.
    // Keep the invite and print the accept link so you can still E2E without a domain.
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[workspace-invite] Resend blocked (dev). Open this accept link:",
        options.inviteUrl
      )
      console.warn("[workspace-invite]", {
        to: options.to,
        workspace: options.workspaceName,
        resend: error.message,
      })
      return
    }
    throw new Error(error.message)
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[workspace-invite]", {
      to: options.to,
      inviteUrl: options.inviteUrl,
      workspace: options.workspaceName,
    })
  }
}

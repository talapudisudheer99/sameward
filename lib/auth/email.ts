import { Resend } from "resend"

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY")
  }
  return new Resend(apiKey)
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

  const { error } = await resend.emails.send({
    from,
    to: options.to,
    subject: "Reset your TeamHub password",
    html: `
      <p>You asked to reset your TeamHub password.</p>
      <p><a href="${options.resetUrl}">Click here to set a new password</a></p>
      <p>This link expires in 30 minutes. If you did not ask for this, ignore this email.</p>
    `,
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

  const { error } = await resend.emails.send({
    from,
    to: options.to,
    subject: "Verify your TeamHub email address",
    html: `
      <p>Click the link below to verify your email address:</p>
      <p><a href="${options.verifyUrl}">Verify email address</a></p>
      <p>This link expires in 24 hours. If you did not create a TeamHub account, ignore this email.</p>
    `,
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

  const { error } = await resend.emails.send({
    from,
    to: options.to,
    subject: `You're invited to ${options.workspaceName ?? "a TeamHub workspace"}`,
    html: `
      <p><strong>${options.inviteFrom}</strong> invited you to join
      <strong>${options.workspaceName ?? "a workspace"}</strong> on TeamHub.</p>
      <p><a href="${options.inviteUrl}">Accept invitation</a></p>
      <p>This link expires in 7 days. If you weren’t expecting this, you can ignore it.</p>
    `,
  })

  if (error) {
    throw new Error(error.message)
  }

  // Local/dev: Resend may succeed while mail is delayed/spam —
  // log the link so you can open /invite/[token] while building accept.
  if (process.env.NODE_ENV !== "production") {
    console.info("[workspace-invite]", {
      to: options.to,
      inviteUrl: options.inviteUrl,
      workspace: options.workspaceName,
    })
  }
}

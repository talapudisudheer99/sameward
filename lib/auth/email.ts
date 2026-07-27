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

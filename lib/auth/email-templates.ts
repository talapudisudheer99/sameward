/**
 * Sameward transactional email HTML — Ocean Blue brand, table layout for clients.
 * Inline styles only (email CSS support is limited).
 *
 * Logo uses cid:teamhub-logo (attached by lib/auth/email.ts) so Gmail works
 * without a publicly hosted image URL. CID/filename kept for infrastructure
 * compatibility (Phase 4).
 */

export const EMAIL_LOGO_CID = "teamhub-logo"

const BRAND = {
  primary: "#0369A1",
  brandA: "#0EA5E9",
  /** Matches app sidebar: bg-sidebar + bg-brand-wash */
  wash: "#F1F5F9",
  washGlow: "rgba(14, 165, 233, 0.10)",
  card: "#FFFFFF",
  foreground: "#0F172A",
  muted: "#475569",
  border: "#CBD8E6",
  soft: "#94A3B8",
} as const

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function brandMarkHtml(): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 22px;">
      <tr>
        <td align="center" style="padding:0;">
          <img
            src="cid:${EMAIL_LOGO_CID}"
            width="200"
            alt="Sameward"
            style="display:block;width:200px;max-width:70%;height:auto;border:0;outline:none;"
          />
        </td>
      </tr>
    </table>
  `.trim()
}

function ctaButtonHtml(href: string, label: string): string {
  const safeHref = escapeHtml(href)
  const safeLabel = escapeHtml(label)
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" bgcolor="${BRAND.primary}" style="border-radius:10px;background-color:${BRAND.primary};">
                <a
                  href="${safeHref}"
                  style="display:inline-block;min-width:200px;padding:14px 32px;font-family:${FONT};font-size:16px;font-weight:600;line-height:1.25;color:#FFFFFF;text-decoration:none;border-radius:10px;text-align:center;"
                >${safeLabel}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `.trim()
}

function fallbackLinkHtml(href: string): string {
  const safeHref = escapeHtml(href)
  return `
    <p style="margin:18px 0 0;font-family:${FONT};font-size:12px;line-height:1.5;color:${BRAND.muted};text-align:center;">
      Or paste this link:<br />
      <a href="${safeHref}" style="color:${BRAND.primary};text-decoration:underline;word-break:break-all;">${safeHref}</a>
    </p>
  `.trim()
}

export function renderTeamHubEmail(options: {
  preheader: string
  title: string
  bodyHtml: string
  ctaHref: string
  ctaLabel: string
  expiryLabel: string
  footnote: string
}): string {
  const preheader = escapeHtml(options.preheader)
  const title = escapeHtml(options.title)
  const footnote = escapeHtml(options.footnote)
  const expiryLabel = escapeHtml(options.expiryLabel)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.wash};">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${BRAND.wash};">
    ${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.wash};background-image:radial-gradient(70% 55% at 50% -8%,${BRAND.washGlow} 0%,transparent 70%);">
    <tr>
      <td align="center" style="padding:36px 16px 28px;background-color:${BRAND.wash};background-image:radial-gradient(70% 55% at 50% -8%,${BRAND.washGlow} 0%,transparent 70%);">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;margin:0 auto;">
          <tr>
            <td align="center">
              ${brandMarkHtml()}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.card};border:1px solid ${BRAND.border};border-top:4px solid ${BRAND.brandA};border-radius:14px;">
                <tr>
                  <td style="padding:28px 28px 26px;">
                    <h1 style="margin:0 0 14px;font-family:${FONT};font-size:22px;font-weight:700;letter-spacing:-0.02em;line-height:1.25;color:${BRAND.foreground};">
                      ${title}
                    </h1>
                    <div style="font-family:${FONT};font-size:16px;line-height:1.6;color:${BRAND.muted};">
                      ${options.bodyHtml}
                    </div>
                    ${ctaButtonHtml(options.ctaHref, options.ctaLabel)}
                    <p style="margin:14px 0 0;font-family:${FONT};font-size:13px;line-height:1.4;color:${BRAND.primary};font-weight:600;text-align:center;">
                      ${expiryLabel}
                    </p>
                    ${fallbackLinkHtml(options.ctaHref)}
                  </td>
                </tr>
              </table>
              <p style="margin:18px 12px 0;font-family:${FONT};font-size:13px;line-height:1.5;color:${BRAND.muted};text-align:center;">
                ${footnote}
              </p>
              <p style="margin:8px 12px 0;font-family:${FONT};font-size:12px;line-height:1.4;color:${BRAND.soft};text-align:center;">
                Sameward · channels, catch-up, and context for your team
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function passwordResetEmailHtml(resetUrl: string): string {
  return renderTeamHubEmail({
    preheader: "Reset your Sameward password — link expires in 30 minutes.",
    title: "Reset your password",
    bodyHtml: `
      <p style="margin:0 0 12px;">You asked to reset your Sameward password.</p>
      <p style="margin:0;">Use the button below to choose a new one. If you didn’t request this, you can safely ignore this email.</p>
    `,
    ctaHref: resetUrl,
    ctaLabel: "Set a new password",
    expiryLabel: "Expires in 30 minutes",
    footnote: "For your security, this link works once and then expires.",
  })
}

export function verificationEmailHtml(verifyUrl: string): string {
  return renderTeamHubEmail({
    preheader: "Verify your email to unlock invites and trusted Sameward features.",
    title: "Verify your email",
    bodyHtml: `
      <p style="margin:0 0 12px;">Welcome to Sameward. Confirm this address so we know it’s really you.</p>
      <p style="margin:0;">Verification unlocks invites and other trusted features in your workspace.</p>
    `,
    ctaHref: verifyUrl,
    ctaLabel: "Verify email address",
    expiryLabel: "Expires in 24 hours",
    footnote: "If you didn’t create a Sameward account, you can ignore this email.",
  })
}

export function workspaceInviteEmailHtml(options: {
  inviteUrl: string
  inviteFrom: string
  workspaceName?: string
}): string {
  const from = escapeHtml(options.inviteFrom)
  const workspace = escapeHtml(options.workspaceName ?? "a workspace")

  return renderTeamHubEmail({
    preheader: `${options.inviteFrom} invited you to ${options.workspaceName ?? "a Sameward workspace"}.`,
    title: "You’re invited",
    bodyHtml: `
      <p style="margin:0 0 12px;">
        <strong style="color:${BRAND.foreground};">${from}</strong>
        invited you to join
        <strong style="color:${BRAND.foreground};">${workspace}</strong>
        on Sameward.
      </p>
      <p style="margin:0;">
        Accept to open the workspace with your team — channels, catch-up, and shared context in one place.
      </p>
    `,
    ctaHref: options.inviteUrl,
    ctaLabel: "Accept invitation",
    expiryLabel: "Invite expires in 7 days",
    footnote: "If you weren’t expecting this invite, you can ignore it.",
  })
}

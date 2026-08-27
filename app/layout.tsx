import type { Metadata } from "next"
import { Manrope, Plus_Jakarta_Sans } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ReduxProvider } from "@/components/providers/redux-provide"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const heading = Manrope({
  subsets: ["latin"],
  variable: "--font-heading",
})

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: {
    default: "Sameward",
    template: "%s · Sameward",
  },
  description:
    "A live workspace for team chat, files, and AI assistance — everything your team needs, without switching between separate tools for chat, storage, and context.",
  applicationName: "Sameward",
  metadataBase: new URL("https://sameward.com"),
  openGraph: {
    title: "Sameward",
    description:
      "A live workspace for team chat, files, and AI assistance — everything your team needs, without switching between separate tools for chat, storage, and context.",
    url: "https://sameward.com",
    siteName: "Sameward",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sameward",
    description:
      "A live workspace for team chat, files, and AI assistance — everything your team needs, without switching between separate tools for chat, storage, and context.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "scroll-smooth font-sans antialiased",
        sans.variable,
        heading.variable
      )}
    >
      <body>
        {/* Toaster must sit inside ThemeProvider so it can follow light/dark theme */}
        <ThemeProvider>
          <ReduxProvider>
            <TooltipProvider delay={300}>
              {children}
              <Toaster />
            </TooltipProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

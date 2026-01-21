import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

// Helper to ensure URL has protocol
const getSiteUrl = () => {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "feedback-sphs-2026.vercel.app"
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }
  return `https://${url}`
}

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Feedback - Biennial Exhibition of South Point School 2026",
  description: "Share your valuable feedback for the Biennial Exhibition projects at South Point School. Your voice matters!",
  keywords: ["feedback", "exhibition", "school", "south point", "biennial exhibition", "SPHS 2026"],
  authors: [{ name: "Team HackMinors" }],
  creator: "Team HackMinors",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  // Open Graph - for Facebook, WhatsApp, LinkedIn
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "SPHS Feedback System",
    title: "Feedback - Biennial Exhibition of South Point School 2026",
    description: "Share your valuable feedback for the Biennial Exhibition projects. Your voice helps us grow!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Biennial Exhibition of South Point School 2026 - Feedback System",
      },
    ],
  },
  // Twitter Card - also used by WhatsApp and others
  twitter: {
    card: "summary_large_image",
    title: "Feedback - SPHS Biennial Exhibition 2026",
    description: "Share your valuable feedback for the exhibition projects!",
    images: ["/og-image.png"],
    creator: "@teamhackminors",
  },
  // Additional meta tags
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}

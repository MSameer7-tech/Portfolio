import type { Metadata, Viewport } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
// StarBackgroundLoader is a Client Component that wraps dynamic(ssr:false) internally
import StarBackgroundLoader from "@/components/star-background-loader"
import CursorLight from "@/components/cursor-light"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" })

export const metadata: Metadata = {
  title: "Mohammad Sameer | Creative Portfolio",
  description: "Portfolio of Mohammad Sameer - AI & ML student passionate about building practical software, automation tools, and intelligent systems with Python.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

import Navbar from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <div id="theme-bloom" aria-hidden="true" />
        <ThemeProvider>
          <StarBackgroundLoader />
          <CursorLight />
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

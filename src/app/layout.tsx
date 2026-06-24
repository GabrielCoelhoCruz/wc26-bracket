import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/react"
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { LanguageProvider } from "@/components/i18n/LanguageProvider"
import { DocumentLangSync } from "@/components/i18n/DocumentLangSync"
import { ThemeProvider } from "@/components/theme/ThemeProvider"
import { CatalogProvider } from "@/components/catalog/CatalogProvider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "WC26 Bracket + Draft",
  description:
    "Build your bracket. Build your XI. Challenge your friends. | Monte seu bracket. Monte seu XI. Desafie seus amigos.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WC26",
  },
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider>
          <LanguageProvider>
            <CatalogProvider>
              <DocumentLangSync />
              <Header />
              <main className="flex flex-1 flex-col overflow-x-hidden">{children}</main>
              <Footer />
            </CatalogProvider>
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

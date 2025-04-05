import "@/app/globals.css"
import { Inter } from "next/font/google"
import { getServerSession } from "next-auth/next"
import { SessionProvider } from "@/components/session-provider"
import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Crypto Carbon Tracker",
  description: "Suivez l'empreinte carbone des cryptomonnaies",
}

export default async function RootLayout({ children }) {
  const session = await getServerSession()

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="light">
            <Navbar />
            <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">{children}</main>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}



import './globals.css'
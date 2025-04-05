"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Shield, BarChart2, Leaf, Globe, ChevronRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  // Enhanced animations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  const fadeIn = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: 0.8 },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50/50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-300 blur-3xl" />
          <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-teal-300 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-16 md:py-28 relative z-99">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-16 md:mb-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block mb-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 text-emerald-700 text-sm font-medium"
            >
              <Globe className="inline-block w-4 h-4 mr-2 align-text-bottom" />
              Pour un avenir crypto plus vert
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent leading-tight">
              Empreinte Carbone
              <br className="hidden md:block" /> des Cryptomonnaies
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Suivez l'impact environnemental de toutes les cryptomonnaies échangées et prenez des décisions éclairées
              pour votre portefeuille.
            </motion.p>
          </motion.div>

          {status === "unauthenticated" && (
            <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col items-center">
              <motion.div variants={item} className="mb-16 text-center">
                <Link href="/auth/login">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-lg shadow-emerald-200/50 h-12 px-8 rounded-full"
                  >
                    Accéder au tableau de bord
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <p className="mt-4 text-gray-600">
                  Pas encore de compte ?{" "}
                  <Link
                    href="/auth/register"
                    className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline transition-colors"
                  >
                    Créez-en un gratuitement
                  </Link>
                </p>
              </motion.div>

              {/* Feature Cards */}
              <motion.div variants={container} className="grid md:grid-cols-3 gap-6 md:gap-8 w-full max-w-5xl">
                <motion.div variants={item}>
                  <Card className="border border-emerald-100 shadow-sm hover:shadow-md transition-shadow h-full overflow-hidden group">
                    <CardContent className="p-6 md:p-8">
                      <div className="rounded-full bg-emerald-100 w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-emerald-200 transition-colors">
                        <BarChart2 className="h-7 w-7 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-gray-800">Suivez les cryptomonnaies</h3>
                      <p className="text-gray-600">
                        Accédez aux données en temps réel de centaines de cryptomonnaies et leur impact environnemental.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={item}>
                  <Card className="border border-emerald-100 shadow-sm hover:shadow-md transition-shadow h-full overflow-hidden group">
                    <CardContent className="p-6 md:p-8">
                      <div className="rounded-full bg-emerald-100 w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-emerald-200 transition-colors">
                        <Leaf className="h-7 w-7 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-gray-800">Mesurez votre impact</h3>
                      <p className="text-gray-600">
                        Calculez l'empreinte carbone de votre portefeuille crypto et prenez des décisions éclairées.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={item}>
                  <Card className="border border-emerald-100 shadow-sm hover:shadow-md transition-shadow h-full overflow-hidden group">
                    <CardContent className="p-6 md:p-8">
                      <div className="rounded-full bg-emerald-100 w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-emerald-200 transition-colors">
                        <Shield className="h-7 w-7 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-gray-800">Sauvegardez vos données</h3>
                      <p className="text-gray-600">
                        Connectez-vous pour sauvegarder votre portefeuille et suivre son évolution dans le temps.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {status === "loading" && (
            <div className="flex justify-center py-12">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                CryptoCarbon Tracker
              </h3>
              <p className="text-gray-500 mt-1">Suivez l'impact environnemental des cryptomonnaies</p>
            </div>
          </div>

          <div className="border-t border-gray-100 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>CryptoCarbon Tracker &copy; {new Date().getFullYear()} - Tous droits réservés</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


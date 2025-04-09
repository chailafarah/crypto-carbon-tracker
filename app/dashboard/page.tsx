"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { RefreshCw, ChevronLeft, ChevronRight, Search, HelpCircle, BarChart3 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CryptoTable } from "@/components/crypto-table"
import { CryptoPortfolioForm } from "@/components/crypto-portfolio-form"

type Crypto = {
  name: string
  symbol: string
  price: number
  change: number
  volume: number
  carbonFootprint: string
  color: string
  iconUrl: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cryptos, setCryptos] = useState<Crypto[]>([])
  const [filteredCryptos, setFilteredCryptos] = useState<Crypto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [showLegend, setShowLegend] = useState(false)

  const [sortConfig, setSortConfig] = useState({
    key: "volume" as keyof Crypto,
    direction: "descending" as "ascending" | "descending",
  })

  // Rediriger les utilisateurs non connectés vers la page d'accueil
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  const fetchCryptoData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/coingecko", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API response error:", response.status, errorData)
        throw new Error(`API error: ${errorData.error || response.statusText}`)
      }

      const data = await response.json()

      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error("Données invalides reçues de l'API")
      }

      console.log("Données reçues:", data.length, "cryptomonnaies")
      setCryptos(data)
      setLastUpdated(new Date())

      // Appliquer le tri initial
      sortData("volume", data)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(`Impossible de récupérer les données: ${err.message}. Veuillez réessayer plus tard.`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchCryptoData()

      // Actualisation automatique toutes les 60 secondes
      const intervalId = setInterval(fetchCryptoData, 60000)

      return () => clearInterval(intervalId)
    }
  }, [status])

  useEffect(() => {
    // Filtrer les cryptos en fonction de la recherche
    const filtered = cryptos.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    setFilteredCryptos(filtered)
    setCurrentPage(1) // Réinitialiser à la première page lors d'une recherche
  }, [searchQuery, cryptos])

  const sortData = useCallback(
    (key: keyof Crypto, data = filteredCryptos) => {
      let direction: "ascending" | "descending" = "ascending"

      if (sortConfig.key === key && sortConfig.direction === "ascending") {
        direction = "descending"
      }

      const sortedData = [...data].sort((a, b) => {
        if (a[key] < b[key]) {
          return direction === "ascending" ? -1 : 1
        }
        if (a[key] > b[key]) {
          return direction === "ascending" ? 1 : -1
        }
        return 0
      })

      setFilteredCryptos(sortedData)
      setSortConfig({ key, direction })
    },
    [filteredCryptos, sortConfig],
  )

  // Pagination
  const totalPages = Math.ceil(filteredCryptos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-teal-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"></div>
          <p className="text-emerald-700 font-medium animate-pulse">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center justify-center mb-2">
            <BarChart3 className="h-8 w-8 text-emerald-600 mr-2" />
            <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Tableau de Bord
            </h1>
          </div>
          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            Suivez l'impact environnemental de toutes les cryptomonnaies échangées en temps réel
          </p>
        </motion.div>

        {/* Formulaire de portefeuille crypto - affiché uniquement quand les données sont chargées */}
        {!loading && cryptos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <CryptoPortfolioForm cryptos={cryptos} />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="shadow-xl border-0 rounded-xl overflow-hidden mb-8 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-b">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-white">Liste des Cryptomonnaies</CardTitle>
                  <CardDescription className="text-emerald-100">
                    Comparaison des empreintes carbone par transaction
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="secondary" size="icon" onClick={() => setShowLegend(!showLegend)}>
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Afficher/masquer la légende des couleurs</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {lastUpdated && (
                    <span className="text-xs text-emerald-100 bg-emerald-700/30 px-2 py-1 rounded-md">
                      Mis à jour: {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                  <Button variant="secondary" size="sm" onClick={fetchCryptoData} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                    Actualiser
                  </Button>
                </div>
              </div>
            </CardHeader>

            <AnimatePresence>
              {showLegend && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-emerald-50 border-b"
                >
                  <h3 className="font-medium mb-2 text-emerald-800">Légende des couleurs:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <h4 className="text-sm font-medium mb-1 text-emerald-700">Couleurs des cryptomonnaies</h4>
                      <p className="text-xs text-gray-600">
                        Chaque point coloré représente la couleur officielle de la cryptomonnaie (ex: orange pour
                        Bitcoin, bleu pour Ethereum)
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <h4 className="text-sm font-medium mb-1 text-emerald-700">Variations de prix</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <span className="text-xs">Hausse</span>
                        </div>
                        <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-full ml-2">
                          <span className="text-xs">Baisse</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <h4 className="text-sm font-medium mb-1 text-emerald-700">Empreinte carbone</h4>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">Impact environnemental relatif</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-4 border-b bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Rechercher une cryptomonnaie..."
                    className="pl-8 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Afficher:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number.parseInt(value))
                      setCurrentPage(1) // Réinitialiser à la première page lors du changement d'éléments par page
                    }}
                  >
                    <SelectTrigger className="w-[80px] border-emerald-200 focus:ring-emerald-500">
                      <SelectValue placeholder="5" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <CardContent className="p-0 bg-white">
              {error ? (
                <div className="p-8 text-center">
                  <div className="bg-red-50 p-6 rounded-lg border border-red-100 inline-block">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button variant="outline" className="border-red-200 hover:bg-red-50" onClick={fetchCryptoData}>
                      Réessayer
                    </Button>
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  <CryptoTable
                    cryptos={filteredCryptos}
                    loading={loading}
                    onSort={sortData}
                    sortConfig={sortConfig}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                  />
                </AnimatePresence>
              )}
            </CardContent>

            {!loading && filteredCryptos.length > 0 && (
              <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-t bg-gray-50 gap-4">
                <div className="text-sm text-gray-500">
                  Affichage de{" "}
                  <span className="font-medium">
                    {startIndex + 1}-{Math.min(endIndex, filteredCryptos.length)}
                  </span>{" "}
                  sur <span className="font-medium">{filteredCryptos.length}</span> cryptomonnaies
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-200 hover:bg-emerald-50"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm bg-white px-3 py-1 rounded-md border">
                    Page <span className="font-medium">{currentPage}</span> sur{" "}
                    <span className="font-medium">{totalPages || 1}</span>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-200 hover:bg-emerald-50"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-10 mb-6 bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md max-w-3xl mx-auto"
        >
          <h3 className="text-emerald-700 font-medium mb-2">À propos des données</h3>
          <p className="text-sm text-gray-600 mb-2">
            Les empreintes carbone sont des estimations basées sur le type de consensus, le volume d'échange et d'autres
            facteurs environnementaux.
          </p>
          <p className="text-sm text-gray-600 mb-4">Les données sont actualisées en temps réel depuis coingecko.</p>
          <div className="inline-block bg-emerald-50 px-4 py-2 rounded-full">
            <p className="font-medium text-emerald-700">
              Total: <span className="text-emerald-600">{filteredCryptos.length}</span> cryptomonnaies
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

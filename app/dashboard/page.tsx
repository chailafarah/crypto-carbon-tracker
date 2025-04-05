"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { RefreshCw, ChevronLeft, ChevronRight, Search, HelpCircle } from "lucide-react"
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

      const response = await fetch("/api/binance", {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Tableau de Bord
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Suivez l'impact environnemental de toutes les cryptomonnaies échangées
          </p>
        </motion.div>

        {/* Formulaire de portefeuille crypto - affiché uniquement quand les données sont chargées */}
        {!loading && cryptos.length > 0 && <CryptoPortfolioForm cryptos={cryptos} />}

        <Card className="shadow-lg border-0 overflow-hidden mb-6">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Liste des Cryptomonnaies</CardTitle>
                <CardDescription>Comparaison des empreintes carbone par transaction</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={() => setShowLegend(!showLegend)}>
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Afficher/masquer la légende des couleurs</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {lastUpdated && (
                  <span className="text-xs text-gray-500">Mis à jour: {lastUpdated.toLocaleTimeString()}</span>
                )}
                <Button variant="outline" size="sm" onClick={fetchCryptoData} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                  Actualiser
                </Button>
              </div>
            </div>
          </CardHeader>

          {showLegend && (
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-medium mb-2">Légende des couleurs:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Couleurs des cryptomonnaies</h4>
                  <p className="text-xs text-gray-600">
                    Chaque point coloré représente la couleur officielle de la cryptomonnaie (ex: orange pour Bitcoin,
                    bleu pour Ethereum)
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Variations de prix</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-green-600">
                      <span className="text-xs">Hausse</span>
                    </div>
                    <div className="flex items-center text-red-600 ml-4">
                      <span className="text-xs">Baisse</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Empreinte carbone</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Impact environnemental relatif</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 border-b bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Rechercher une cryptomonnaie..."
                  className="pl-8"
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
                  <SelectTrigger className="w-[80px]">
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

          <CardContent className="p-0">
            {error ? (
              <div className="p-6 text-center text-red-500">
                <p>{error}</p>
                <Button variant="outline" className="mt-4" onClick={fetchCryptoData}>
                  Réessayer
                </Button>
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
            <CardFooter className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-gray-500">
                Affichage de {startIndex + 1}-{Math.min(endIndex, filteredCryptos.length)} sur {filteredCryptos.length}{" "}
                cryptomonnaies
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} sur {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>

        <div className="text-center text-sm text-gray-500 mt-8">
          <p>
            Note: Les empreintes carbone sont des estimations basées sur le type de consensus, le volume d'échange et
            d'autres facteurs.
          </p>
          <p>Les données sont actualisées en temps réel depuis Binance.</p>
          <p className="mt-2 font-medium">Total: {filteredCryptos.length} cryptomonnaies</p>
        </div>
      </div>
    </div>
  )
}


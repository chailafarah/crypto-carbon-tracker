"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
  PlusCircle,
  Trash2,
  Info,
  HelpCircle,
  ChevronRight,
  Check,
  ChevronsUpDown,
  Search,
  Save,
  AlertCircle,
} from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "cmdk"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

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

type PortfolioItem = {
  id: string
  symbol: string
  amount: number
}

interface CryptoPortfolioFormProps {
  cryptos: Crypto[]
}

export function CryptoPortfolioForm({ cryptos }: CryptoPortfolioFormProps) {
  const { data: session } = useSession()
  const [selectedCrypto, setSelectedCrypto] = useState("")
  const [amount, setAmount] = useState("")
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [totalValue, setTotalValue] = useState(0)
  const [totalCarbonFootprint, setTotalCarbonFootprint] = useState(0)
  const [isHelpOpen, setIsHelpOpen] = useState(true)
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Charger le portefeuille de l'utilisateur connecté
  useEffect(() => {
    if (session?.user) {
      fetchUserPortfolio()
    }
  }, [session])

  // Calculer la valeur totale et l'empreinte carbone du portefeuille
  useEffect(() => {
    // Calculer les totaux
    const value = portfolio.reduce((sum, item) => {
      const cryptoData = cryptos.find((c) => c.symbol === item.symbol)

      const price = cryptoData?.price || 0
      return sum + item.amount * price
    }, 0)

    const carbon = portfolio.reduce((sum, item) => {
      const cryptoData = cryptos.find((c) => c.symbol === item.symbol)
      const carbonFootprintValue = Number(cryptoData?.carbonFootprint.split(" ")[0])

      const carbonFootprint = carbonFootprintValue || 0
      return sum + item.amount * carbonFootprint
    }, 0)

    console.log(portfolio)
    setTotalValue(value)
    setTotalCarbonFootprint(carbon)
  }, [portfolio, cryptos])

  // Récupérer le portefeuille de l'utilisateur
  const fetchUserPortfolio = async () => {
    try {
      const response = await fetch("/api/portfolio")

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération du portefeuille")
      }

      const data = await response.json()

      if (data && Array.isArray(data)) {
        setPortfolio(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement du portefeuille:", error)
    }
  }

  // Sauvegarder le portefeuille
  const savePortfolio = async () => {
    if (!session?.user) {
      setSaveStatus({
        type: "error",
        message: "Vous devez être connecté pour sauvegarder votre portefeuille",
      })
      return
    }

    setIsSaving(true)
    setSaveStatus(null)

    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: portfolio }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde du portefeuille")
      }

      setSaveStatus({
        type: "success",
        message: "Portefeuille sauvegardé avec succès",
      })

      // Effacer le message après 3 secondes
      setTimeout(() => {
        setSaveStatus(null)
      }, 3000)
    } catch (error) {
      setSaveStatus({
        type: "error",
        message: "Erreur lors de la sauvegarde du portefeuille",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Ajouter une cryptomonnaie au portefeuille
  const handleAddCrypto = () => {
    if (!selectedCrypto || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return
    }

    const crypto = cryptos.find((c) => c.symbol === selectedCrypto)

    if (!crypto) {
      return
    }

    const newItem: PortfolioItem = {
      id: `${selectedCrypto}-${Date.now()}`,
      symbol: selectedCrypto,
      amount: Number(amount),
    }

    setPortfolio([...portfolio, newItem])
    setSelectedCrypto("")
    setAmount("")
  }

  // Supprimer une cryptomonnaie du portefeuille
  const handleRemoveCrypto = (id: string) => {
    setPortfolio(portfolio.filter((item) => item.id !== id))
  }

  // Déterminer la classe de couleur en fonction de l'empreinte carbone
  const getCarbonImpactClass = (footprint: number) => {
    if (footprint > 1000) return "bg-red-500"
    if (footprint > 500) return "bg-orange-500"
    if (footprint > 100) return "bg-yellow-500"
    return "bg-emerald-500"
  }

  // Calculer le pourcentage pour la barre de progression (max 100%)
  const getCarbonPercentage = (footprint: number) => {
    // Échelle logarithmique pour mieux visualiser les différences
    const percentage = Math.min(100, Math.log10(footprint + 1) * 25)
    return `${percentage}%`
  }

  // Obtenir le prix actuel d'une crypto
  const getCurrentPrice = (symbol: string): number => {
    const crypto = cryptos.find((c) => c.symbol === symbol)
    return crypto ? crypto.price : 0
  }

  return (
    <Card className="mb-6 border-emerald-100 shadow-md">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
        <CardTitle className="text-emerald-800">Mon Portefeuille Crypto</CardTitle>
      </CardHeader>
      <CardContent className="p-4 bg-white">
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-2">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between border-emerald-200 focus:ring-emerald-500"
                    onClick={() => setOpen(!open)}
                  >
                    {selectedCrypto
                      ? cryptos.find((crypto) => crypto.symbol === selectedCrypto)?.symbol ||
                        "Sélectionner une cryptomonnaie"
                      : "Sélectionner une cryptomonnaie"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command className="rounded-lg border shadow-md">
                    <div className="flex items-center border-b px-3">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <CommandInput
                        placeholder="Rechercher une cryptomonnaie..."
                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <CommandList>
                      <CommandEmpty>Aucune cryptomonnaie trouvée.</CommandEmpty>
                      <CommandGroup className="max-h-60 overflow-y-auto">
                        {cryptos.map((crypto) => (
                          <CommandItem
                            key={crypto.symbol}
                            value={crypto.symbol}
                            onSelect={(value) => {
                              setSelectedCrypto(value === selectedCrypto ? "" : value)
                              // Ne pas fermer le menu après la sélection
                            }}
                            className="flex items-center px-2 py-1.5 text-sm"
                          >
                            <div className="w-4 h-4 mr-2 relative">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: crypto.color }}></div>
                            </div>
                            <span>
                              {crypto.symbol} - {crypto.name}
                            </span>
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                selectedCrypto === crypto.symbol ? "opacity-100" : "opacity-0",
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Quantité"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="any"
                className="border-emerald-200 focus:ring-emerald-500"
              />
              <Button
                onClick={handleAddCrypto}
                disabled={!selectedCrypto || !amount}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>

          {portfolio.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2 text-emerald-800">Votre portefeuille:</h3>
              <div className="flex flex-wrap gap-2">
                {portfolio.map((item) => {
                  // Obtenir le prix actuel pour chaque crypto
                  const currentPrice = getCurrentPrice(item.symbol)
                  return (
                  <Badge
                    key={item.id}
                    variant="outline"
                    className="flex items-center gap-1 py-1.5 border-emerald-200 bg-emerald-50"
                  >
                    <span className="font-medium text-emerald-800">
                      {item.symbol}: {item.amount}
                    </span>
                    <span className="text-xs text-emerald-600 ml-1">
                      ($
                      {(item.amount * currentPrice).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      )
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 p-0 text-emerald-700 hover:text-red-500"
                      onClick={() => handleRemoveCrypto(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </Badge>
                )})}
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-50 p-4 rounded-md">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-emerald-800">Valeur totale:</h3>
                    <span className="text-emerald-600 font-medium">
                      ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <h3 className="text-sm font-medium mr-1 text-emerald-800">Empreinte carbone:</h3>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-5 w-5 p-0 text-emerald-700">
                              <Info className="h-3 w-3" />
                              <span className="sr-only">Info sur l'empreinte carbone</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Émissions de CO₂ estimées pour votre portefeuille</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className={`font-medium ${totalCarbonFootprint > 100 ? "text-red-600" : "text-emerald-600"}`}>
                      {totalCarbonFootprint.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg CO₂
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`${getCarbonImpactClass(totalCarbonFootprint)} h-2.5 rounded-full transition-all duration-500`}
                      style={{ width: getCarbonPercentage(totalCarbonFootprint) }}
                    />
                  </div>
                  <p className="text-xs text-emerald-700 mt-1">
                    {totalCarbonFootprint > 500
                      ? "Impact environnemental élevé"
                      : totalCarbonFootprint > 100
                        ? "Impact environnemental modéré"
                        : "Impact environnemental faible"}
                  </p>
                </div>
              </div>

              {/* Bouton de sauvegarde */}
              <div className="mt-4 flex justify-end">
                {saveStatus && (
                  <Alert variant={saveStatus.type === "success" ? "default" : "destructive"} className="mr-4">
                    {saveStatus.type === "error" && <AlertCircle className="h-4 w-4 mr-2" />}
                    <AlertDescription>{saveStatus.message}</AlertDescription>
                  </Alert>
                )}
                <Button
                  onClick={savePortfolio}
                  disabled={isSaving || !session}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSaving ? (
                    <>Sauvegarde en cours...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-4 p-3 bg-emerald-50 rounded-md border border-emerald-100 text-xs text-emerald-700">
                <p className="mb-1 font-medium">Comparaisons d'empreinte carbone:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Vol Paris-New York: ~1000 kg CO₂</li>
                  <li>Voiture sur 1000 km: ~200 kg CO₂</li>
                  <li>Production d'un smartphone: ~60 kg CO₂</li>
                </ul>
              </div>
            </div>
          )}

          {!session && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>
                Connectez-vous pour sauvegarder votre portefeuille.{" "}
                <a href="/auth/login" className="text-emerald-600 hover:underline">
                  Se connecter
                </a>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-emerald-50 border-t border-emerald-100 p-4">
        <Collapsible open={isHelpOpen} onOpenChange={setIsHelpOpen} className="w-full">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex items-center w-full justify-between text-emerald-700">
              <div className="flex items-center">
                <HelpCircle className="h-4 w-4 mr-2" />
                <span>Comment les calculs sont-ils effectués?</span>
              </div>
              <ChevronRight className={`h-4 w-4 transition-transform ${isHelpOpen ? "rotate-90" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 text-sm text-emerald-700 space-y-2">
            <p>L'empreinte carbone des cryptomonnaies est calculée en fonction de plusieurs facteurs:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                <strong>Mécanisme de consensus</strong>: Les cryptomonnaies utilisant le Proof of Work (comme Bitcoin)
                consomment beaucoup plus d'énergie que celles utilisant le Proof of Stake (comme Solana ou Cardano).
              </li>
              <li>
                <strong>Volume de transactions</strong>: Plus une blockchain traite de transactions, plus sa
                consommation énergétique est élevée.
              </li>
              <li>
                <strong>Infrastructure réseau</strong>: Le nombre et la distribution des nœuds influencent également
                l'empreinte carbone.
              </li>
            </ul>
            <p>
              Les estimations sont basées sur des études académiques et des rapports d'organisations spécialisées dans
              l'analyse de l'impact environnemental des technologies blockchain.
            </p>
            <p className="font-medium">
              Note: Ces estimations sont approximatives et peuvent varier en fonction de l'évolution des technologies et
              des sources d'énergie utilisées pour le minage et la validation des transactions.
            </p>
          </CollapsibleContent>
        </Collapsible>
      </CardFooter>
    </Card>
  )
}


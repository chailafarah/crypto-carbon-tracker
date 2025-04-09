"use client"
import { ArrowUpDown, Info, TrendingDown, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

type Crypto = {
  name: string
  symbol: string
  price: number
  change: number
  volume: number
  carbonFootprint: number
  color: string
  iconUrl: string
}

type CryptoTableProps = {
  cryptos: Crypto[]
  loading: boolean
  onSort: (key: keyof Crypto) => void
  sortConfig: {
    key: keyof Crypto
    direction: "ascending" | "descending"
  }
  itemsPerPage: number
  currentPage: number
}

export function CryptoTable({ cryptos, loading, onSort, sortConfig, itemsPerPage, currentPage }: CryptoTableProps) {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02, // Réduit pour améliorer les performances avec plus d'éléments
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 }, // Animation plus légère
    show: { opacity: 1, y: 0 },
  }

  // Calculer les indices de début et de fin pour la pagination
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCryptos = cryptos.slice(startIndex, endIndex)

  // Function to convert large numbers into human-readable format
  const convertToHumanReadable = (number) => {
    const suffixes = ["", "Thousand", "Million", "Billion", "Trillion"] // Thousand, Million, Billion, Trillion
    let magnitude = 0

    while (Math.abs(number) >= 1000 && magnitude < suffixes.length - 1) {
      magnitude += 1
      number /= 1000.0
    }

    return `${number.toFixed(2)} ${suffixes[magnitude]} CO₂`
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-gray-800">
          <TableRow>
            <TableHead className="w-[180px]">
              <Button
                variant="ghost"
                size="sort"
                className="font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => onSort("name")}
              >
                Nom <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Symbole</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sort"
                className="font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => onSort("price")}
              >
                Prix ($) <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sort"
                className="font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => onSort("change")}
              >
                Variation <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sort"
                className="font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => onSort("volume")}
              >
                Total Supply <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sort"
                  className="font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => onSort("carbonFootprint")}
                >
                  Empreinte Carbone <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Info className="h-4 w-4" />
                        <span className="sr-only">Info sur l'empreinte carbone</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Émissions de CO₂ estimées par transaction</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            // Loading skeletons
            Array(itemsPerPage)
              .fill(0)
              .map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-32" />
                  </TableCell>
                </TableRow>
              ))
          ) : currentCryptos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Aucun résultat trouvé.
              </TableCell>
            </TableRow>
          ) : (
            currentCryptos.map((crypto, index) => (
              <motion.tr
                key={crypto.symbol}
                variants={item}
                className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                whileHover={{ scale: 1.005 }} // Animation plus légère pour de meilleures performances
                custom={index}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <div className="w-6 h-6 mr-2 relative bg-white rounded-full shadow-sm overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img
                          src={crypto.iconUrl || "/placeholder.svg"}
                          alt={crypto.symbol}
                          className="w-5 h-5 object-contain"
                          onError={(e) => {
                            // Fallback si l'icône ne charge pas
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      </div>
                    </div>
                    <span className="font-medium">{crypto.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono">{crypto.symbol}</TableCell>
                <TableCell className="font-mono">
                  $
                  {crypto.price < 0.01
                    ? crypto.price.toFixed(6)
                    : crypto.price < 1
                      ? crypto.price.toFixed(4)
                      : crypto.price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                </TableCell>
                <TableCell>
                  <div
                    className={`flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      crypto.change > 0
                        ? "text-green-600 bg-green-50 dark:bg-green-900/20"
                        : "text-red-600 bg-red-50 dark:bg-red-900/20"
                    }`}
                  >
                    {crypto.change > 0 ? (
                      <TrendingUp className="mr-1 h-3 w-3" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3" />
                    )}
                    {Math.abs(crypto.change).toFixed(2)}%
                  </div>
                </TableCell>
                <TableCell className="font-mono">{(crypto.volume / 1000000).toFixed(1)}M</TableCell>
                <TableCell>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                    {convertToHumanReadable(crypto.carbonFootprint * crypto.volume)}
                  </div>
                </TableCell>
              </motion.tr>
            ))
          )}
        </TableBody>
      </Table>
    </motion.div>
  )
}

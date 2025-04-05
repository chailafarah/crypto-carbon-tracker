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
  carbonFootprint: string
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

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">
              <Button variant="ghost" className="font-medium" onClick={() => onSort("name")}>
                Nom <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Symbole</TableHead>
            <TableHead>
              <Button variant="ghost" className="font-medium" onClick={() => onSort("price")}>
                Prix ($) <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" className="font-medium" onClick={() => onSort("change")}>
                Variation <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" className="font-medium" onClick={() => onSort("volume")}>
                Volume <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <div className="flex items-center">
                <Button variant="ghost" className="font-medium" onClick={() => onSort("carbonFootprint")}>
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
                className="hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.005 }} // Animation plus légère pour de meilleures performances
                custom={index}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <div className="w-6 h-6 mr-2 relative">
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: crypto.color }}></div>
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
                    {crypto.name}
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
                  <div className={`flex items-center ${crypto.change > 0 ? "text-green-600" : "text-red-600"}`}>
                    {crypto.change > 0 ? (
                      <TrendingUp className="mr-1 h-4 w-4" />
                    ) : (
                      <TrendingDown className="mr-1 h-4 w-4" />
                    )}
                    {Math.abs(crypto.change).toFixed(2)}%
                  </div>
                </TableCell>
                <TableCell className="font-mono">${(crypto.volume / 1000000).toFixed(1)}M</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full"
                        style={{
                          width: `${Math.min(100, Number.parseInt(crypto.carbonFootprint) / 4)}%`,
                        }}
                      />
                    </div>
                    {crypto.carbonFootprint}
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


import { TrendingDown, TrendingUp } from "lucide-react"

export function ColorLegend() {
  const cryptoColors = [
    { name: "Bitcoin (BTC)", color: "#F7931A" },
    { name: "Ethereum (ETH)", color: "#627EEA" },
    { name: "Binance Coin (BNB)", color: "#F3BA2F" },
    { name: "Solana (SOL)", color: "#00FFA3" },
    { name: "Cardano (ADA)", color: "#0033AD" },
    { name: "Dogecoin (DOGE)", color: "#C2A633" },
  ]

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="font-medium mb-3">Guide des couleurs</h3>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Couleurs des cryptomonnaies</h4>
          <div className="grid grid-cols-2 gap-2">
            {cryptoColors.map((item) => (
              <div key={item.name} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                <span className="text-xs">{item.name}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Chaque cryptomonnaie a sa couleur officielle ou générée automatiquement
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Indicateurs de variation</h4>
          <div className="flex space-x-4">
            <div className="flex items-center text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-xs">Hausse de prix</span>
            </div>
            <div className="flex items-center text-red-600">
              <TrendingDown className="h-4 w-4 mr-1" />
              <span className="text-xs">Baisse de prix</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Empreinte carbone</h4>
          <div className="space-y-2">
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full w-3/4" />
              </div>
              <span className="text-xs">Empreinte élevée (ex: Bitcoin, Proof of Work)</span>
            </div>
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full w-1/4" />
              </div>
              <span className="text-xs">Empreinte faible (ex: Solana, Proof of Stake)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


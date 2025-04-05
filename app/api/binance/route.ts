import { NextResponse } from "next/server"

// Fonction pour générer une empreinte carbone estimée basée sur le volume et l'algorithme
function estimateCarbonFootprint(symbol: string, volume: number, marketCap: number): string {
  // Les cryptos Proof of Work ont généralement une empreinte plus élevée
  const powCoins = ["BTC", "BCH", "BSV", "LTC", "DOGE", "ETC", "ZEC", "XMR", "RVN", "KDA"]
  const isPoW = powCoins.some((coin) => symbol.includes(coin))

  // Consommation en TWh
  // https://ccaf.io/cbnsi/cbeci
  const consumption = isPoW ? 174 : 5.88
  // https://www.eea.europa.eu/en/analysis/maps-and-charts/co2-emission-intensity-15
  const co2PerKWh = 200;

  // Convertir la consommation de TWh en kWh
  const consumptionKWh = consumption * 1_000_000;

  const carbonEmission = consumptionKWh * co2PerKWh;

  // Convertir les émissions de CO2 en kilogrammes (1 kg = 1000 g)
  const carbonEmissionKg = carbonEmission / 1000;

  // Calcul basé sur le volume d'échange (plus le volume est élevé, plus l'empreinte est grande)
  // et la capitalisation boursière (approximation de la taille du réseau)
  const volumeFactor = Math.log10(volume + 1) / 10
  const marketCapFactor = Math.log10(marketCap + 1) / 20

  // Calcul final avec un peu de randomisation pour simuler des variations
  const carbonValue = Math.round(carbonEmissionKg * (volumeFactor + marketCapFactor))

  return `${carbonValue} kg CO₂`
}

// Fonction pour générer une couleur unique basée sur le symbole
function generateColor(symbol: string): string {
  // Couleurs prédéfinies pour certaines cryptos populaires
  const predefinedColors: Record<string, string> = {
    BTC: "#F7931A",
    ETH: "#627EEA",
    SOL: "#00FFA3",
    BNB: "#F3BA2F",
    ADA: "#0033AD",
    DOGE: "#C2A633",
    XRP: "#23292F",
    DOT: "#E6007A",
    AVAX: "#E84142",
    MATIC: "#8247E5",
    LINK: "#2A5ADA",
    UNI: "#FF007A",
    ATOM: "#2E3148",
    LTC: "#345D9D",
    NEAR: "#000000",
  }

  // Vérifier si nous avons une couleur prédéfinie
  for (const key in predefinedColors) {
    if (symbol.includes(key)) {
      return predefinedColors[key]
    }
  }

  // Sinon, générer une couleur basée sur le hash du symbole
  let hash = 0
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash)
  }

  let color = "#"
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += ("00" + value.toString(16)).substr(-2)
  }

  return color
}

// Fonction pour obtenir l'URL de l'icône d'une crypto
function getCryptoIconUrl(symbol: string): string {
  // Utiliser l'API CryptoIcons pour obtenir les icônes
  return `https://cryptoicons.org/api/icon/${symbol.toLowerCase()}/64`
}

// Fonction pour obtenir le nom complet d'une crypto
function getFullName(symbol: string): string {
  const names: Record<string, string> = {
    BTC: "Bitcoin",
    ETH: "Ethereum",
    SOL: "Solana",
    BNB: "Binance Coin",
    ADA: "Cardano",
    DOGE: "Dogecoin",
    XRP: "Ripple",
    DOT: "Polkadot",
    AVAX: "Avalanche",
    MATIC: "Polygon",
    LINK: "Chainlink",
    UNI: "Uniswap",
    ATOM: "Cosmos",
    LTC: "Litecoin",
    NEAR: "NEAR Protocol",
    SHIB: "Shiba Inu",
    TRX: "TRON",
    FTM: "Fantom",
    ALGO: "Algorand",
    MANA: "Decentraland",
    SAND: "The Sandbox",
    AAVE: "Aave",
    CRO: "Cronos",
    EGLD: "MultiversX",
    HBAR: "Hedera",
    EOS: "EOS",
    CAKE: "PancakeSwap",
    XTZ: "Tezos",
    FIL: "Filecoin",
    VET: "VeChain",
    THETA: "Theta Network",
    XLM: "Stellar",
    FLOW: "Flow",
    ICP: "Internet Computer",
    AXS: "Axie Infinity",
    NEO: "NEO",
    KCS: "KuCoin Token",
    MIOTA: "IOTA",
    BTT: "BitTorrent",
    ONE: "Harmony",
    ZIL: "Zilliqa",
    DASH: "Dash",
    XMR: "Monero",
    ENJ: "Enjin Coin",
    GALA: "Gala",
    CHZ: "Chiliz",
    BAT: "Basic Attention Token",
    HOT: "Holo",
    ZEC: "Zcash",
    QTUM: "Qtum",
  }

  return names[symbol] || symbol
}

export async function GET() {
  try {
    // Essayer de récupérer les données de l'API Binance
    try {
      // Récupérer les données de ticker 24h (endpoint public qui ne nécessite pas d'authentification)
      const tickerResponse = await fetch("https://api.binance.com/api/v3/ticker/24hr", {
        headers: {
          Accept: "application/json",
          "User-Agent": "Crypto Carbon Tracker/1.0",
        },
        cache: "no-store",
      })

      if (!tickerResponse.ok) {
        throw new Error(`Binance API error: ${tickerResponse.statusText}`)
      }

      const tickerData = await tickerResponse.json()

      // Récupérer les paires USDT uniquement et les trier par volume
      const usdtPairs = tickerData
        .filter(
          (ticker: any) =>
            ticker.symbol.endsWith("USDT") &&
            !ticker.symbol.includes("UP") &&
            !ticker.symbol.includes("DOWN") &&
            !ticker.symbol.includes("BEAR") &&
            !ticker.symbol.includes("BULL"),
        )
        .sort((a: any, b: any) => Number.parseFloat(b.quoteVolume) - Number.parseFloat(a.quoteVolume))

      // Formater les données
      const cryptoData = usdtPairs.map((ticker: any) => {
        const symbol = ticker.symbol
        const baseSymbol = symbol.replace("USDT", "")
        const volume = Number.parseFloat(ticker.quoteVolume)
        const price = Number.parseFloat(ticker.lastPrice)
        const marketCap = (price * volume) / Math.max(0.01, Math.abs(Number.parseFloat(ticker.priceChangePercent) || 1)) // Approximation avec protection contre division par zéro

        return {
          name: getFullName(baseSymbol),
          symbol: baseSymbol,
          price: price,
          change: Number.parseFloat(ticker.priceChangePercent),
          volume: volume,
          carbonFootprint: estimateCarbonFootprint(baseSymbol, volume, marketCap),
          color: generateColor(baseSymbol),
          iconUrl: getCryptoIconUrl(baseSymbol),
        }
      })

      return NextResponse.json(cryptoData)
    } catch (apiError) {
      console.warn("Error fetching from Binance API, using mock data:", apiError)
      // En cas d'erreur avec l'API, utiliser les données fictives
      return NextResponse.json(getMockData())
    }
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json({ error: "Failed to fetch cryptocurrency data" }, { status: 500 })
  }
}

function getMockData() {
  // Données fictives pour le développement
  const mockCryptos = [
    { symbol: "BTC", name: "Bitcoin", price: 65432.1, change: 2.34, volume: 25000000000 },
    { symbol: "ETH", name: "Ethereum", price: 3456.78, change: -1.23, volume: 15000000000 },
    { symbol: "SOL", name: "Solana", price: 123.45, change: 5.67, volume: 5000000000 },
    { symbol: "BNB", name: "Binance Coin", price: 567.89, change: 0.12, volume: 3000000000 },
    { symbol: "ADA", name: "Cardano", price: 0.45, change: -2.34, volume: 2000000000 },
    { symbol: "DOGE", name: "Dogecoin", price: 0.12, change: 10.45, volume: 1500000000 },
    { symbol: "XRP", name: "Ripple", price: 0.56, change: -0.78, volume: 1200000000 },
    { symbol: "DOT", name: "Polkadot", price: 6.78, change: 3.45, volume: 900000000 },
    { symbol: "AVAX", name: "Avalanche", price: 34.56, change: 7.89, volume: 800000000 },
    { symbol: "MATIC", name: "Polygon", price: 0.89, change: -4.56, volume: 700000000 },
    { symbol: "LINK", name: "Chainlink", price: 12.34, change: 3.21, volume: 650000000 },
    { symbol: "UNI", name: "Uniswap", price: 5.67, change: -2.1, volume: 600000000 },
    { symbol: "ATOM", name: "Cosmos", price: 8.9, change: 1.23, volume: 550000000 },
    { symbol: "LTC", name: "Litecoin", price: 78.9, change: -0.45, volume: 500000000 },
    { symbol: "XLM", name: "Stellar", price: 0.12, change: 0.78, volume: 450000000 },
  ]

  return mockCryptos.map((crypto) => {
    const volume = crypto.volume
    const marketCap = (crypto.price * volume) / Math.abs(crypto.change || 1)

    return {
      name: crypto.name,
      symbol: crypto.symbol,
      price: crypto.price,
      change: crypto.change,
      volume: crypto.volume,
      carbonFootprint: estimateCarbonFootprint(crypto.symbol, volume, marketCap),
      color: generateColor(crypto.symbol),
      iconUrl: getCryptoIconUrl(crypto.symbol),
    }
  })
}


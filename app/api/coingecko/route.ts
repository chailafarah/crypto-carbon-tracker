import { NextResponse } from "next/server"

import fs from 'fs';
import path from 'path';

// Fonction pour générer une empreinte carbone estimée basée sur le volume et l'algorithme
function estimateCarbonFootprint(symbol: string): number {
  // Les cryptos Proof of Work ont généralement une empreinte plus élevée
  const powCoins = ["btc", "bch", "bsv", "ltc", "doge", "etc", "zec", "xmr", "rvn", "kda"]
  const isPoW = powCoins.some((coin) => symbol.includes(coin))

  // Single Bitcoin Transaction Footprints
  // https://digiconomist.net/bitcoin-energy-consumption
  // https://digiconomist.net/ethereum-energy-consumption
  const carbonEmissionKg = isPoW ? 668.74 : 0.01;

  return carbonEmissionKg
}

// Fonction pour générer une couleur unique basée sur le symbole
function generateColor(symbol: string): string {
  // Couleurs prédéfinies pour certaines cryptos populaires
  const predefinedColors: Record<string, string> = {
    btc: "#f7931a",
    eth: "#627eea",
    sol: "#00ffa3",
    bnb: "#f3ba2f",
    ada: "#0033ad",
    doge: "#c2a633",
    xrp: "#23292f",
    dot: "#e6007a",
    avax: "#e84142",
    matic: "#8247e5",
    link: "#2a5ada",
    uni: "#ff007a",
    atom: "#2e3148",
    ltc: "#345d9d",
    near: "#000000",
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

export async function GET() {
  let tickerData = [];

  // Essayer de récupérer les données de l'API coingecko
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=false", {
      headers: {
        Accept: "application/json",
        "User-Agent": "Crypto Carbon Tracker/1.0",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`coingecko API error: ${response.statusText}`)
    }

    tickerData = await response.json()
  } catch (error) {
    tickerData = getMockData()
  }

  // Formater les données
  const cryptoData = tickerData.map((ticker: any) => {
    const volume = Number.parseFloat(ticker.total_supply)
    const price = Number.parseFloat(ticker.current_price)

    return {
      name: ticker.name,
      symbol: ticker.symbol,
      price: price,
      change: Number.parseFloat(ticker.price_change_percentage_24h),
      volume: volume,
      carbonFootprint: estimateCarbonFootprint(ticker.symbol),
      color: generateColor(ticker.symbol),
      iconUrl: ticker.image,
    }
  })
  
  return NextResponse.json(cryptoData)
}

const getMockData = () => {
  // Define the path to the markets.json file
  const filePath = path.resolve('data', 'markets.json');

  // Read the JSON file asynchronously
  const fileData = fs.readFileSync(filePath, 'utf-8');
  
  // Parse the JSON data
  const marketsData = JSON.parse(fileData);

  // Return the data as a JSON response
  return marketsData;
}
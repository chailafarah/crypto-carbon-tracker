import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import db from "@/lib/db"

// Récupérer le portefeuille de l'utilisateur
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Vous devez être connecté" }, { status: 401 })
    }

    const [portfolio] = await db.query(
      `SELECT id, user_id, symbol, amount 
      FROM portfolios 
      WHERE user_id = ?`,
         [session.user.id]
    )

    return NextResponse.json(portfolio)
  } catch (error) {
    console.error("Erreur lors de la récupération du portefeuille:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// Sauvegarder ou mettre à jour le portefeuille
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Vous devez être connecté" }, { status: 401 })
    }

    const { items } = await request.json()
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Format de données invalide" }, { status: 400 })
    }

    // Supprimer les anciens enregistrements
    await db.query("DELETE FROM portfolios WHERE user_id = ?", [session.user.id])

    // Insérer les nouvelles données
    for (const item of items) {
      await db.query(
        "INSERT INTO portfolios (user_id, symbol, amount) VALUES (?, ?, ?)",
        [session.user.id, item.symbol, item.amount]
      )
    }

    return NextResponse.json({ message: "Portefeuille mis à jour" })
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du portefeuille:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

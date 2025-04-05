import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import db from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Validation des champs
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Tous les champs sont obligatoires" }, { status: 400 })
    }

    // Vérifier si l'utilisateur existe déjà
    const [existingUsers] = await db.query("SELECT * FROM users WHERE email = ?", [email])
    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 })
    }

    // Hasher le mot de passe
    const hashedPassword = await hash(password, 10)

    // Insérer le nouvel utilisateur dans MySQL
    await db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
      name,
      email,
      hashedPassword,
    ])

    return NextResponse.json({ message: "Utilisateur créé avec succès" }, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error)
    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 })
  }
}

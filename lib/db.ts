import mysql from "mysql2/promise"

// Connexion à la base de données MySQL
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // Ajoute ton mot de passe MySQL si nécessaire
  database: "db",
})

export default db

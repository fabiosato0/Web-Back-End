import { MongoClient } from "mongodb";

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

let db;

export async function connectDB() {
  await client.connect();
  db = client.db("bancoDeImagens"); 
  console.log("Conectado ao MongoDB");
}

export function getDB() {
  return db;
}

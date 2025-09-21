import { ObjectId } from "mongodb";
import { getDB } from "../db.js";

class Usuario {
  constructor(nome, email) {
    this._id = new ObjectId();
    this.nome = nome;
    this.email = email;
  }

  async salvar() {
    const db = getDB();
    await db.collection("usuarios").insertOne(this);
  }

  static async listar() {
    const db = getDB();
    return await db.collection("usuarios").find().toArray();
  }
}

export default Usuario;

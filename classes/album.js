import { ObjectId } from "mongodb";
import { getDB } from "../db.js";

class Album {
  constructor(nome, donoId) {
    this._id = new ObjectId();
    this.nome = nome;
    this.donoId = donoId;
    this.imagens = [];
  }

  async salvar() {
    const db = getDB();
    await db.collection("albuns").insertOne(this);
  }

  static async listarPorUsuario(donoId) {
    const db = getDB();
    return await db.collection("albuns").find({ donoId }).toArray();
  }
}

export default Album;

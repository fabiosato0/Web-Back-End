import { ObjectId } from "mongodb";
import { getDB } from "../db.js";

class Imagem {
  constructor(titulo, url, donoId, albumId = null) {
    this._id = new ObjectId();
    this.titulo = titulo;
    this.url = url;
    this.donoId = donoId;
    this.albumId = albumId;
  }

  async salvar() {
    const db = getDB();
    await db.collection("imagens").insertOne(this);
  }

  static async listarPorUsuario(donoId) {
    const db = getDB();
    return await db.collection("imagens").find({ donoId }).toArray();
  }
}

export default Imagem;

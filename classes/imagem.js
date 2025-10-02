import { ObjectId } from "bson";
import { getDB } from "../db.js";

import Logger from "../logger.js";

class Imagem {
  constructor(titulo, url, donoId, albumId = null) {
    this._id = new ObjectId();
    this.titulo = titulo;
    this.url = url;
    this.donoId = donoId;
    this.albumId = albumId;
  }

  async salvar() {
    try {
      const db = getDB();
      await db.collection("imagens").insertOne(this);
    } catch (error) {
      Logger.log("Erro ao salvar imagem: " + error);
    }
  }

  static async listarPorUsuario(donoId) {
    try {
      const db = getDB();
      return await db.collection("imagens").find({ donoId }).toArray();
    } catch (error) {
      Logger.log("Erro ao listar imagens por usuário: " + error);
    }
  }

  static async buscarPorId(id) {
    try {

      const db = getDB();
      return await db.collection("imagens").findOne({ _id: new ObjectId(id) });

    } catch (error) {
      Logger.log("Erro ao buscar imagem por ID: " + error);
    }
  }

  static async listarPorAlbum(albumId) {
    try {
      const db = getDB();
      return await db.collection("imagens").find({ albumId }).toArray();

    } catch (error) {
      Logger.log("Erro ao listar imagens por álbum: " + error);
    }
  }

  static async atualizar(id, novosDados) {
    try {
      const db = getDB();
      await db.collection("imagens").updateOne(
        { _id: new ObjectId(id) },
        { $set: novosDados },
        { upsert: false }
      );
    } catch (error) {
      Logger.log("Erro ao atualizar imagem: " + error);


    }
  }

  static async deletar(id) {
    try {
      const db = getDB();
      await db.collection("imagens").deleteOne({ _id: new ObjectId(id) });
    } catch (error) {
      Logger.log("Erro ao deletar imagem: " + error);
    }
  }
}
export default Imagem;

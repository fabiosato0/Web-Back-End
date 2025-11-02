import { ObjectId } from "bson";
import { getDB } from "../db.js";
import Logger from "../logger.js";

class Album {
  constructor(nome, donoId) {
    this._id = new ObjectId();
    this.nome = nome;
    this.donoId = donoId;
    this.imagens = [];
  }

  async salvar() {
    try{
    const db = getDB();
    await db.collection("albuns").insertOne(this);
    } catch (error) {
      Logger.error("Erro ao salvar álbum: " + error);
    }
  }

  static async listarPorUsuario(donoId) {
    try{
    const db = getDB();
    return await db.collection("albuns").find({ donoId }).toArray();
    } catch (error) {
      Logger.error("Erro ao listar álbuns por usuário: " + error);
    }
}

  static async buscarPorId(id) {
    try {
      const db = getDB();
      return await db.collection("albuns").findOne({ _id: new ObjectId(id) });
    } catch (error) {
      Logger.error("Erro ao buscar álbum por ID: " + error);
    }
  }

  static async atualizar(id, novosDados) {
    try {
      const db = getDB();
      await db.collection("albuns").updateOne(
        { _id: new ObjectId(id) },
        { $set: novosDados },
        { upsert: false }
      );
    } catch (error) {
      Logger.error("Erro ao atualizar álbum: " + error);
    }
  }

  static async deletar(id) {
    try {
      const db = getDB();
      await db.collection("albuns").deleteOne({ _id: new ObjectId(id) });
    } catch (error) {
      Logger.error("Erro ao deletar álbum: " + error);
    }
  }

  static async adicionarImagem(albumId, imagemId) {
    try {
      const db = getDB();
      if (!db) { throw new Error("Conexão com o DB não está pronta."); }
      
      await db.collection("albuns").updateOne(
        { _id: new ObjectId(albumId) },
        // $addToSet: Adiciona ao array apenas se o item não existir
        { $addToSet: { imagens: new ObjectId(imagemId) } } 
      );
    } catch (error) {
      Logger.log("Erro ao adicionar imagem ao álbum: " + (error?.message || error));
    }
  }

}

export default Album;

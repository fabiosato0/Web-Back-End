import { ObjectId } from "bson";
import { getDB } from "../db.js";

import Logger from "../logger.js";

class Usuario {
  constructor(nome, email) {
    this._id = new ObjectId();
    this.nome = nome;
    this.email = email;
  }

  async salvar() {
    try{
    const db = getDB();
    await db.collection("usuarios").insertOne(this);
    } catch (error) {
      Logger.error("Erro ao salvar usuário:", error);
    }
  }

  static async listar() {
    try{
    const db = getDB();
    return await db.collection("usuarios").find().toArray();
    } catch (error) {
      Logger.error("Erro ao listar usuários:", error);
    }
  }

  static async buscarPorId(id) {
    try{
    const db = getDB();
    return await db.collection("usuarios").findOne({ _id: new ObjectId(id) });
    } catch (error) {
      Logger.error("Erro ao buscar usuário por ID:", error);
    }
  }

  static async atualizar(id, novosDados) {
    try{
    const db = getDB();
    await db.collection("usuarios").updateOne(
      { _id: new ObjectId(id) },
      { $set: novosDados },
      { upsert: false }
    );
    } catch (error) {
      Logger.error("Erro ao atualizar usuário:", error);
    }
  }

  static async deletar(id) {
    try{
    const db = getDB();
    await db.collection("usuarios").deleteOne({ _id: new ObjectId(id) });
    } catch (error) {
      Logger.error("Erro ao deletar usuário:", error);
    }
  }
}

export default Usuario;

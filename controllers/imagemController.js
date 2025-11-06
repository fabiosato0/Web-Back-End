import Imagem from "../model/imagem.js";
import Album from "../model/album.js";
import Logger from "../logger.js";
import { ObjectId } from "bson";

export async function criarImagem(req, res) {
  if (!req.session?.userId) return res.redirect("/");

  try {
    const titulo = req.body.titulo?.trim();
    const url = req.body.url?.trim();
    const donoId = req.session.userId;

    if (!titulo || !url) {
      req.flash("error_msg", "A imagem precisa de um título e uma URL.");
      return res.redirect("/home");
    }

    const novaImagem = new Imagem(titulo, url, donoId);
    await novaImagem.salvar();
    req.flash("success_msg", "Imagem salva com sucesso!");
    res.redirect("/home");
  } catch (error) {
    Logger.error(`Erro ao salvar imagem: ${error?.message || error}`);
    req.flash("error_msg", "Ocorreu um erro ao salvar a imagem.");
    res.redirect("/home");
  }
}

export async function deletarImagem(req, res) {
  if (!req.session?.userId) {
    req.flash("error_msg", "Você precisa estar logado para deletar.");
    return res.redirect("/");
  }

  try {
    const { id } = req.params;
    const donoIdDaSessao = req.session.userId;
    const imagem = await Imagem.buscarPorId(id);

    if (!imagem) {
      req.flash("error_msg", "Imagem não encontrada.");
      return res.redirect("/home");
    }

    if (imagem.donoId.toString() !== donoIdDaSessao.toString()) {
      req.flash("error_msg", "Você não tem permissão para deletar esta imagem.");
      return res.redirect("/home");
    }

    if (imagem.albumId) {
      await Album.removerImagem(imagem.albumId.toString(), id)
        .catch(() => {
          Logger.warn(`Falha ao remover imagem ${id} do álbum ${imagem.albumId}`);
        });
    }

    await Imagem.deletar(id);
    req.flash("success_msg", "Imagem deletada com sucesso!");
    res.redirect("/home");
  } catch (error) {
    Logger.error(`Erro ao deletar imagem: ${error?.message || error}`);
    req.flash("error_msg", "Erro ao deletar imagem.");
    res.redirect("/home");
  }
}

export async function renomearImagem(req, res) {
  if (!req.session?.userId) return res.redirect("/");

  try {
    const { id } = req.params;
    const novoTitulo = req.body.novoTitulo?.trim();
    const donoIdDaSessao = req.session.userId;

    if (!novoTitulo) {
      req.flash("error_msg", "O novo título não pode estar vazio.");
      return res.redirect("/home");
    }

    const imagem = await Imagem.buscarPorId(id);
    if (!imagem) {
      req.flash("error_msg", "Imagem não encontrada.");
      return res.redirect("/home");
    }

    if (imagem.donoId.toString() !== donoIdDaSessao.toString()) {
      req.flash("error_msg", "Você não tem permissão para renomear esta imagem.");
      return res.redirect("/home");
    }

    await Imagem.atualizar(id, { titulo: novoTitulo });
    req.flash("success_msg", "Imagem renomeada com sucesso!");
    res.redirect("/home");
  } catch (error) {
    Logger.error(`Erro ao renomear imagem: ${error?.message || error}`);
    req.flash("error_msg", "Ocorreu um erro ao renomear a imagem.");
    res.redirect("/home");
  }
}

export async function moverImagem(req, res) {
  if (!req.session?.userId) return res.redirect("/");

  try {
    const imagemId = req.params.id;
    const donoIdDaSessao = req.session.userId;
    const imagem = await Imagem.buscarPorId(imagemId);

    if (!imagem) {
      req.flash("error_msg", "Imagem não encontrada.");
      return res.redirect("/home");
    }

    if (imagem.donoId.toString() !== donoIdDaSessao.toString()) {
      req.flash("error_msg", "Você não tem permissão para mover esta imagem.");
      return res.redirect("/home");
    }

    const novoAlbumId = req.body.albumId?.trim() || null;
    const antigoAlbumId = imagem.albumId?.toString() || null;
    
    if (antigoAlbumId && antigoAlbumId !== novoAlbumId) {
      await Album.removerImagem(antigoAlbumId, imagemId).catch(() => {
        Logger.warn(`Falha ao remover imagem ${imagemId} do álbum antigo ${antigoAlbumId}`);
      });
    }
    if (novoAlbumId) {
      await Imagem.atualizar(imagemId, { albumId: new ObjectId(novoAlbumId) });
      await Album.adicionarImagem(novoAlbumId, imagemId);
    } else {
      await Imagem.atualizar(imagemId, { albumId: null });
    }

    req.flash("success_msg", "Imagem movida para o álbum com sucesso!");
    res.redirect("/home");
  } catch (error) {
    Logger.error(`Erro ao mover imagem: ${error?.message || error}`);
    req.flash("error_msg", "Erro ao mover a imagem.");
    res.redirect("/home");
  }
}

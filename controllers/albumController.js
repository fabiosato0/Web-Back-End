import Album from "../model/album.js";
import Imagem from "../model/imagem.js";
import Logger from "../logger.js";

export async function listarAlbuns(req, res) {
     
  if (!req.session?.userId) {
    req.flash("error_msg", "Sua sessão expirou. Faça login novamente.");
    return res.redirect("/login");
  }
  try {
    const albuns = await Album.listarPorUsuario(req.session.userId);
    res.render("album", {
      userName: req.session.login,
      albuns,
    });
  } catch (error) {
    Logger.error("Erro ao carregar /album: " + (error?.message || error));
    res.render("album", {
      userName: req.session.login,
      error: "Não foi possível carregar seus álbuns.",
    });
  }
}

export async function criarAlbum(req, res) {
  try {
    const nome = req.body.name?.trim();
    const donoId = req.session.userId;
    if (nome && donoId) {
      const novoAlbum = new Album(nome, donoId);
      await novoAlbum.salvar();
      req.flash("success_msg", "Álbum criado com sucesso!");
    } else {
      req.flash("error_msg", "O álbum precisa de um nome.");
    }
  } catch (error) {
    Logger.error(`Erro ao salvar álbum: ${error?.message || error}`);
    req.flash("error_msg", "Erro ao criar o álbum.");
  }
  res.redirect("/album");
}

export async function renomearAlbum(req, res) {
  if (!req.session?.userId) return res.redirect("/");

  try {
    const { id } = req.params;
    const novoNome = req.body.novoNome?.trim();
    const donoIdDaSessao = req.session.userId;

    if (!novoNome) {
      req.flash("error_msg", "O novo nome não pode estar vazio.");
      return res.redirect("/album");
    }

    const album = await Album.buscarPorId(id);
    if (!album) {
      req.flash("error_msg", "Álbum não encontrado.");
      return res.redirect("/album");
    }

    if (album.donoId.toString() !== donoIdDaSessao.toString()) {
      req.flash("error_msg", "Você não tem permissão para renomear este álbum.");
      return res.redirect("/album");
    }

    await Album.atualizar(id, { nome: novoNome });
    req.flash("success_msg", "Álbum renomeado com sucesso!");
    res.redirect("/album");
  } catch (error) {
    Logger.error(`Erro ao renomear álbum: ${error?.message || error}`);
    req.flash("error_msg", "Ocorreu um erro ao renomear o álbum.");
    res.redirect("/album");
  }
}

export async function deletarAlbum(req, res) {
  if (!req.session?.userId) return res.redirect("/");

  try {
    const { id } = req.params;
    const donoIdDaSessao = req.session.userId;

    const album = await Album.buscarPorId(id);
    if (!album) {
      req.flash("error_msg", "Álbum não encontrado.");
      return res.redirect("/album");
    }

    if (album.donoId.toString() !== donoIdDaSessao.toString()) {
      req.flash("error_msg", "Você não tem permissão para apagar este álbum.");
      return res.redirect("/album");
    }
    
    await Imagem.removerAlbumDeImagens(id);
    await Album.deletar(id);

    req.flash("success_msg", "Álbum apagado com sucesso!");
    res.redirect("/album");
  } catch (error) {
    Logger.error(`Erro ao apagar álbum: ${error?.message || error}`);
    req.flash("error_msg", "Ocorreu um erro ao apagar o álbum.");
    res.redirect("/album");
  }
}

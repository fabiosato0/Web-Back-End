import Usuario from "../model/usuario.js";
import Imagem from "../model/imagem.js";
import Album from "../model/album.js";
import Logger from "../logger.js";

export async function showLogin(req, res) {
  if (req.session.userId) return res.redirect("/home");
  res.render("login");
}

export async function loginUser(req, res) {
  try {
    const { name, password } = req.body;
    const usuario = await Usuario.buscaPorNome(name);
    if (usuario && usuario.senha === password) {
      req.session.userId = usuario._id;
      req.session.login = usuario.nome;
      req.flash("success_msg", "Login efetuado com sucesso!");
      return res.redirect("/home");
    }
    req.flash("error_msg", "Nome de usuário ou senha incorretos.");
    res.redirect("/login");
  } catch (error) {
    Logger.error("Erro no login: " + error);
    req.flash("error_msg", "Falha no login.");
    res.redirect("/login");
  }
}

export function logoutUser(req, res) {
  req.session.destroy(() => res.redirect("/"));
}

export function showSignup(req, res) {
  res.render("signup");
}

export async function createUser(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      req.flash("error_msg", "Todos os campos são obrigatórios.");
      return res.redirect("/signup");
    }
    const usuario = new Usuario(name, email, password);
    await usuario.salvar();
    req.session.userId = usuario._id;
    req.session.login = usuario.nome;
    req.flash("success_msg", "Cadastro realizado com sucesso!");
    res.redirect("/home");
  } catch (error) {
    Logger.error("Erro no signup: " + error);
    req.flash("error_msg", "Falha ao cadastrar.");
    res.redirect("/signup");
  }
}

export async function showHome(req, res) {
  try {
    const imagens = await Imagem.listarPorUsuario(req.session.userId);
    const albuns = await Album.listarPorUsuario(req.session.userId);
    res.render("home", {
      userName: req.session.login,
      imagens,
      albuns,
    });
  } catch (error) {
    Logger.error("Erro ao carregar home: " + error);
    res.render("home", { error: "Falha ao carregar imagens." });
  }
}

import express from "express";
import path from "path";
import session from "express-session";
import hbs from "hbs";
import { connectDB } from "./db.js";
import Logger from "./logger.js";
import Usuario from "./model/usuario.js";
import Imagem from "./model/imagem.js";
import Album from "./model/album.js";
import { fileURLToPath } from "url";
import { ObjectId } from "bson";
import flash from "connect-flash"; 

const app = express()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json())
app.set("view engine", "hbs")
app.set("views", path.join(__dirname, "view"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: "segredo_super_secreto",
  resave: false,
  saveUninitialized: false, 
  cookie: { secure: false } 
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});


app.get("/", (req, res) => {
  if (req.session && req.session.userId) {
    res.redirect("/home");
  } else {
    res.render("login");
  }
})

app.get("/login", (req, res) => {
  if (req.session && req.session.userId) {
    res.redirect("/home");
  } else {
    res.render("login");
  }
});


app.post("/login", async (req, res) => {
  try {
    const name = req.body.name ? req.body.name.trim() : null;
    const password = req.body.password ? req.body.password.trim() : null;
    const usuario = await Usuario.buscaPorNome(name);

    if (usuario && usuario.senha === password) {
      req.session.userId = usuario._id;
      req.session.login = usuario.nome;
      req.flash('success_msg', 'Login efetuado com sucesso!');
      res.redirect("/home");
    } else {
      req.flash('error_msg', 'Nome de usuário ou senha incorretos.');
      res.redirect("/login");
      console.log("Falha no login para o usuário:", name);
    }
  } catch (error) {
    console.error("Erro no /login:", error);
    req.flash('error_msg', 'Ocorreu uma falha no login.');
    res.redirect("/login");
  }

})

app.get("/signup", (req, res) => {
  res.render("signup")
})

app.post("/signup", async (req, res) => {
  try {
    const name = req.body.name ? req.body.name.trim() : null;
    const email = req.body.email ? req.body.email.trim() : null;
    const password = req.body.password ? req.body.password.trim() : null;

    if (!name || !email || !password) {
      req.flash('error_msg', 'Todos os campos são obrigatórios.');
      return res.redirect("/signup");
    }

    const usuario = new Usuario(name, email, password);

    await usuario.salvar();

    console.log("Usuário salvo:", usuario);
    req.session.userId = usuario._id;
    req.session.login = usuario.nome;
    
    req.flash('success_msg', 'Cadastro realizado com sucesso! Você já está logado.');
    res.redirect("/home");

  } catch (error) {
    console.log("Erro no /signup:", error);
    req.flash('error_msg', 'Falha ao cadastrar. Tente outro nome ou email.');
    res.redirect("/signup");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      Logger.error(`Erro ao destruir sessão: ${err?.message || err}`);
    }
    res.redirect("/");
  });
})

app.get("/home", async (req, res) => {
   try {
    const imagens = await Imagem.listarPorUsuario(req.session.userId);
    const albuns = await Album.listarPorUsuario(req.session.userId);
    console.log("Imagens encontradas para o usuário:", imagens);
    console.log("Álbuns encontrados para o usuário:", albuns);
    res.render("home", {
      userName: req.session.login,
      imagens: imagens,
      albuns: albuns
    });

  } catch (error) {
    Logger.log("Erro ao carregar /home: " + (error?.message || error));
    res.render("home", {
      userName: req.session.userName,
      error: "Não foi possível carregar suas imagens."
    });
  }
});

app.post("/imagem", async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect("/");
  }

  try {
    const titulo = req.body.titulo ? req.body.titulo.trim() : null;
    const url = req.body.url ? req.body.url.trim() : null;
    const donoId = req.session.userId;

    if (titulo && url) {
      const novaImagem = new Imagem(titulo, url, donoId);
      await novaImagem.salvar();
      req.flash('success_msg', 'Imagem salva com sucesso!');
    } else {
      Logger.log("Tentativa de salvar imagem sem título ou URL.");
      req.flash('error_msg', 'A imagem precisa de um título e uma URL.');
    }
    res.redirect("/home");

  } catch (error) {
    Logger.error(`Erro ao salvar imagem: ${error?.message || error}`);
    req.flash('error_msg', 'Ocorreu um erro ao salvar a imagem.'); 
    res.redirect("/home");
  }
});

app.post("/imagem/delete/:id", async (req, res) => {
  if (!req.session || !req.session.userId) {
    req.flash('error_msg', 'Você precisa estar logado para deletar.');
    return res.redirect("/");
  }

  try {
    const { id } = req.params;
    const donoIdDaSessao = req.session.userId;
    const imagem = await Imagem.buscarPorId(id);

    if (!imagem) {
      Logger.log(`Tentativa de deletar imagem inexistente: ${id}`);
      req.flash('error_msg', 'Imagem não encontrada.');
      return res.redirect("/home");
    }

    if (imagem.donoId.toString() !== donoIdDaSessao.toString()) {
      Logger.log(`Tentativa de deletar foto de outro usuário! User: ${donoIdDaSessao}, Imagem: ${id}`);
      req.flash('error_msg', 'Você não tem permissão para deletar esta imagem.');
      return res.redirect("/home");
    }

    await Imagem.deletar(id);
    req.flash('success_msg', 'Imagem deletada com sucesso!');
    res.redirect("/home");

  } catch (error) {
    Logger.error(`Erro ao deletar imagem: ${error?.message || error}`);
    req.flash('error_msg', 'Erro ao deletar imagem.');
    res.redirect("/home");
  }
});

app.post("/imagem/rename/:id", async (req, res) => {

  if (!req.session || !req.session.userId) {
    return res.redirect("/");
  }

  try {
    const { id } = req.params;
    const { novoTitulo } = req.body; 
    const donoIdDaSessao = req.session.userId;

    // 2. Validação: Verifica se o novo título foi enviado
    if (!novoTitulo || novoTitulo.trim().length === 0) {
      req.flash('error_msg', 'O novo título não pode estar vazio.');
      return res.redirect("/home");
    }

    // 3. Validação de Segurança: Busca a imagem
    const imagem = await Imagem.buscarPorId(id);

    if (!imagem) {
      req.flash('error_msg', 'Imagem não encontrada.');
      return res.redirect("/home");
    }

    // 4. Validação de Segurança: Verifica se o usuário é o dono
    if (imagem.donoId.toString() !== donoIdDaSessao.toString()) {
      Logger.log(`Tentativa de renomear foto de outro usuário! User: ${donoIdDaSessao}, Imagem: ${id}`);
      req.flash('error_msg', 'Você não tem permissão para renomear esta imagem.');
      return res.redirect("/home");
    }

    // 5. Execução: Atualiza a imagem no banco
    await Imagem.atualizar(id, { titulo: novoTitulo.trim() }); // Altera apenas o 'titulo'

    req.flash('success_msg', 'Imagem renomeada com sucesso!');
    res.redirect("/home"); // Redireciona de volta para a home

  } catch (error) {
    Logger.error(`Erro ao renomear imagem: ${error?.message || error}`);
    req.flash('error_msg', 'Ocorreu um erro ao renomear a imagem.');
    res.redirect("/home");
  }
});


app.post("/album", async (req, res) => {
  try {
    const nome = req.body.name ? req.body.name.trim() : null;
    const donoId = req.session.userId;
    console.log("donoId do álbum:", donoId);
    if (nome && donoId) {
      const novoAlbum = new Album(nome, donoId);
      console.log("novoAlbum:", novoAlbum);
      await novoAlbum.salvar();
      req.flash('success_msg', 'Álbum criado com sucesso!'); 
    } else {
      Logger.error("Tentativa de salvar álbum sem nome.");
      req.flash('error_msg', 'O álbum precisa de um nome.'); 
    }
  } catch (error) {
    Logger.error(`Erro ao salvar álbum: ${error?.message || error}`);
    req.flash('error_msg', 'Erro ao criar o álbum.'); 
  }
  res.redirect("/album");
});

app.get("/album", async (req, res) => {
  try {
    const albuns = await Album.listarPorUsuario(req.session.userId);
    res.render("album", {
      userName: req.session.login,
      albuns: albuns
    });

  } catch (error) {
    Logger.error("Erro ao carregar /album: " + (error?.message || error));
    res.render("album", {
      userName: req.session.login,
      error: "Não foi possível carregar seus álbuns."
    });
  }
});


app.post("/album/rename/:id", async (req, res) => {
  // 1. Proteção: Verifica se o usuário está logado
  if (!req.session || !req.session.userId) {
    return res.redirect("/");
  }

  try {
    const { id } = req.params;
    const { novoNome } = req.body;
    const donoIdDaSessao = req.session.userId;

    // 2. Validação: Verifica se o novo nome foi enviado
    if (!novoNome || novoNome.trim().length === 0) {
      req.flash('error_msg', 'O novo nome não pode estar vazio.');
      return res.redirect("/album");
    }

    // 3. Validação de Segurança: Busca o álbum
    const album = await Album.buscarPorId(id);

    if (!album) {
      req.flash('error_msg', 'Álbum não encontrado.');
      return res.redirect("/album");
    }

    // 4. Validação de Segurança: Verifica se o usuário é o dono
    if (album.donoId.toString() !== donoIdDaSessao.toString()) {
      Logger.log(`Tentativa de renomear álbum de outro usuário! User: ${donoIdDaSessao}, Álbum: ${id}`);
      req.flash('error_msg', 'Você não tem permissão para renomear este álbum.');
      return res.redirect("/album");
    }

    // 5. Execução: Atualiza o álbum no banco
    await Album.atualizar(id, { nome: novoNome.trim() });

    req.flash('success_msg', 'Álbum renomeado com sucesso!');
    res.redirect("/album");

  } catch (error) {
    Logger.error(`Erro ao renomear álbum: ${error?.message || error}`);
    req.flash('error_msg', 'Ocorreu um erro ao renomear o álbum.');
    res.redirect("/album");
  }
});

app.post("/album/delete/:id", async (req, res) => {
  // 1. Proteção: Verifica se o usuário está logado
  if (!req.session || !req.session.userId) {
    return res.redirect("/");
  }

  try {
    const { id } = req.params;
    const donoIdDaSessao = req.session.userId;

    // 2. Validação de Segurança: Busca o álbum
    const album = await Album.buscarPorId(id);

    if (!album) {
      req.flash('error_msg', 'Álbum não encontrado.');
      return res.redirect("/album");
    }

    // 3. Validação de Segurança: Verifica se o usuário é o dono
    if (album.donoId.toString() !== donoIdDaSessao.toString()) {
      Logger.log(`Tentativa de APAGAR álbum de outro usuário! User: ${donoIdDaSessao}, Álbum: ${id}`);
      req.flash('error_msg', 'Você não tem permissão para apagar este álbum.');
      return res.redirect("/album");
    }

    // 4. Limpeza: Define 'albumId = null' em todas as imagens
    await Imagem.removerAlbumDeImagens(id);

    // 5. Execução: Apaga o álbum
    await Album.deletar(id);

    req.flash('success_msg', 'Álbum apagado com sucesso!');
    res.redirect("/album");

  } catch (error) {
    Logger.error(`Erro ao apagar álbum: ${error?.message || error}`);
    req.flash('error_msg', 'Ocorreu um erro ao apagar o álbum.');
    res.redirect("/album");
  }
});

app.post("/imagem/set-album/:id", async (req, res) => {
  try {
    const imagemId = req.params.id; 
    const donoIdDaSessao = req.session.userId;
    const imagem = await Imagem.buscarPorId(imagemId);

    // 1. Verificação de Segurança
    if (!imagem) {
      Logger.log(`Tentativa de mover imagem inexistente: ${imagemId}`);
      req.flash('error_msg', 'Imagem não encontrada.'); 
      return res.redirect("/home");
    }
    if (imagem.donoId.toString() !== donoIdDaSessao.toString()) {
      Logger.log(`Tentativa de mover foto de outro usuário! User: ${donoIdDaSessao}, Imagem: ${imagemId}`);
      req.flash('error_msg', 'Você não tem permissão para mover esta imagem.'); 
      return res.redirect("/home");
    }

    // 2. Pega os IDs do formulário e da imagem
    const novoAlbumId = req.body.albumId ? req.body.albumId.trim() : null;
    const antigoAlbumId = imagem.albumId; 

    // 3. Atualiza o 'albumId' na própria Imagem
    if (novoAlbumId) {
      await Imagem.atualizar(imagemId, { albumId: new ObjectId(novoAlbumId) });
    } else {
      await Imagem.atualizar(imagemId, { albumId: null });
    }

    if (novoAlbumId && novoAlbumId !== antigoAlbumId?.toString()) {
        await Album.adicionarImagem(novoAlbumId, imagemId);
    }
    
    req.flash('success_msg', 'Imagem movida para o álbum com sucesso!'); 
    res.redirect("/home");

  } catch (error) {
    Logger.error(`Erro ao mover imagem: ${error?.message || error}`);
    req.flash('error_msg', 'Erro ao mover a imagem.');
    res.redirect("/home");
  }
});

async function startServer() {
  try {
    await connectDB();
    console.log("Conectado ao MongoDB com sucesso!");

    app.listen(3000, () => {
      console.log("Servidor rodando em http://localhost:3000");
    });
  } catch (error) {
    Logger.error(`Falha ao iniciar o servidor: ${error?.message || error}`);
    process.exit(1);
  }
}

startServer();

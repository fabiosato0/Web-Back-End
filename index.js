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
  resave:false,
  saveUninitialized: true, // verificar isso depois
  cookie: { secure:false}
}));

app.get("/", (req, res) => {
  if(req.session && req.session.userId){
    res.redirect("/home");
    }else{
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
      res.redirect("/home");
    } else {
      res.render("login", { error: "Nome de usuário ou senha incorretos." });
      console.log("Falha no login para o usuário:", name);
    }
  } catch (error) {
    console.error("Erro no /login:", error);
    res.render("login", { error: "Ocorreu uma falha no login." });
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
        return res.render("signup", { error: "Todos os campos são obrigatórios." });
    }

    const usuario = new Usuario(name, email, password);
    
    await usuario.salvar();

    console.log("Usuário salvo:", usuario);
    req.session.userId = usuario._id;
    req.session.login = usuario.nome;
    res.redirect("/home"); 

  } catch (error) {
    console.log("Erro no /signup:", error);
    res.render("signup", { error: "Falha ao cadastrar. Tente outro nome ou email." });
  }
});

app.get("/logout", (req,res) =>{
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
    } else {

      Logger.log("Tentativa de salvar imagem sem título ou URL.");
    }
    res.redirect("/home");

  } catch (error) {
    Logger.error(`Erro ao salvar imagem: ${error?.message || error}`);
    res.redirect("/home"); 
  }
});

app.post("/imagem/delete/:id", async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect("/");
  }

  try {
    const { id } = req.params;
    const donoIdDaSessao = req.session.userId;
    const imagem = await Imagem.buscarPorId(id);

    if (!imagem) {
      Logger.log(`Tentativa de deletar imagem inexistente: ${id}`);
      return res.redirect("/home");
    }

    if (imagem.donoId.toString() !== donoIdDaSessao.toString()) {
      Logger.log(`Tentativa de deletar foto de outro usuário! User: ${donoIdDaSessao}, Imagem: ${id}`);
      return res.redirect("/home");
    }

    if (imagem.albumId) {
      await Album.removerImagem(imagem.albumId, imagem._id);
    }

    await Imagem.deletar(id);

    res.redirect("/home");

  } catch (error) {
    Logger.error(`Erro ao deletar imagem: ${error?.message || error}`);
    res.redirect("/home");
  }
});

app.post("/album",async (req, res) => {
  try {
  
    const nome = req.body.name ? req.body.name.trim() : null;
    
    const donoId = req.session.userId;
    console.log("donoId do álbum:", donoId);
    if (nome && donoId) {
      const novoAlbum = new Album(nome, donoId);
      console.log("novoAlbum:", novoAlbum);
      await novoAlbum.salvar();
    } else {
      Logger.error("Tentativa de salvar álbum sem nome.");
    }
  
  } catch (error) {
    Logger.error(`Erro ao salvar álbum: ${error?.message || error}`);
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

app.post("/imagem/set-album/:id", async (req, res) => {
  try {
    const imagemId = req.params.id; // ID da Imagem
    const donoIdDaSessao = req.session.userId;
    const imagem = await Imagem.buscarPorId(imagemId);

    // 1. Verificação de Segurança (igual ao delete/update)
    if (!imagem) {
      Logger.log(`Tentativa de mover imagem inexistente: ${imagemId}`);
      return res.redirect("/home");
    }
    
    if (!imagem.donoId || imagem.donoId.toString() !== donoIdDaSessao.toString()) {
      Logger.log(`Tentativa de mover foto de outro usuário! User: ${donoIdDaSessao}, Imagem: ${imagemId}`);
      return res.redirect("/home");
    }

    // 2. Pega os IDs do formulário e da imagem
    const novoAlbumId = req.body.albumId ? req.body.albumId.trim() : null;

    // 3. Atualiza o 'albumId' na própria Imagem
    if (novoAlbumId) {
      // Se escolheu um álbum, atualiza o campo albumId da imagem
      await Imagem.atualizar(imagemId, { albumId: new ObjectId(novoAlbumId) });
    } else {
      // Se escolheu "(Sem Álbum)", define o campo albumId da imagem como null
      await Imagem.atualizar(imagemId, { albumId: null });
    }
    await Album.adicionarImagem(novoAlbumId, imagemId);

    res.redirect("/home");

  } catch (error) {
    Logger.error(`Erro ao mover imagem: ${error?.message || error}`);
    res.redirect("/home");
  }
});

app.post("/imagem/set-album/:id", async (req, res) => {
  try {
    const imagemId = req.params.id; // ID da Imagem
    const donoIdDaSessao = req.session.userId;
    const imagem = await Imagem.buscarPorId(imagemId);

    // 1. Verificação de Segurança (igual ao delete/update)
    if (!imagem) {
      Logger.log(`Tentativa de mover imagem inexistente: ${imagemId}`);
      return res.redirect("/home");
    }
    if (imagem.donoId.toString() !== donoIdDaSessao.toString()) {
      Logger.log(`Tentativa de mover foto de outro usuário! User: ${donoIdDaSessao}, Imagem: ${imagemId}`);
      return res.redirect("/home");
    }

    // 2. Pega os IDs do formulário e da imagem
    const novoAlbumId = req.body.albumId ? req.body.albumId.trim() : null;
    const antigoAlbumId = imagem.albumId; // Pega o albumId atual da imagem

    // 3. Atualiza o 'albumId' na própria Imagem
    if (novoAlbumId) {
      // Se escolheu um álbum, atualiza o campo albumId da imagem
      await Imagem.atualizar(imagemId, { albumId: new ObjectId(novoAlbumId) });
    } else {
      // Se escolheu "(Sem Álbum)", define o campo albumId da imagem como null
      await Imagem.atualizar(imagemId, { albumId: null });
    }

    // 4. Lógica para ATUALIZAR OS ARRAYS DOS ÁLBUNS
    
    // Se a imagem estava num álbum antigo E o novo álbum é diferente
    if (antigoAlbumId && antigoAlbumId.toString() !== novoAlbumId) {
        // Remove a imagem do array do álbum ANTIGO
        await Album.removerImagem(antigoAlbumId, imagemId);
    }
    
    // Se foi selecionado um NOVO álbum (e não é o mesmo que o antigo)
    if (novoAlbumId && novoAlbumId !== antigoAlbumId?.toString()) {
        // Adiciona a imagem ao array do novo álbum (como você pediu)
        await Album.adicionarImagem(novoAlbumId, imagemId);
    }

    res.redirect("/home");

  } catch (error) {
    Logger.error(`Erro ao mover imagem: ${error?.message || error}`);
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
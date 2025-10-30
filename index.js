import express from "express";
import path from "path";
import hbs from "hbs";
import { connectDB } from "./db.js";
import Usuario from "./model/usuario.js";
import { fileURLToPath } from "url";

const app = express()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json())
app.set("view engine", "hbs")
app.set("views", path.join(__dirname, "view"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("login")
})

app.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;

    const usuario = await Usuario.buscaPorNome(name);

    if (usuario && usuario.senha === password) {
      res.render("home");
    } else {
      res.render("login", { error: "Nome de usuário ou senha incorretos." });
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
    // Pega os dados do formulário de signup.hbs
    const { name, email, password } = req.body; 

    // Verifica se os campos existem
    if (!name || !email || !password) {
        return res.render("signup", { error: "Todos os campos são obrigatórios." });
    }

    // Cria um novo usuário usando a Classe
    const usuario = new Usuario(name, email, password);
    
    // Salva no banco usando o método da classe
    await usuario.salvar();

    console.log("Usuário salvo:", usuario);

    // Redireciona para a home (ou para a tela de login) após cadastrar
    res.render("home"); // Você precisa criar uma view 'home.hbs'

  } catch (error) {
    console.log("Erro no /signup:", error);
    // Se der erro, renderiza o signup de novo com uma mensagem
    res.render("signup", { error: "Falha ao cadastrar. Tente outro nome ou email." });
  }
});

app.listen(3000, () => {
  console.log("port connected");
})
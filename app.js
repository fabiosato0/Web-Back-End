import express from "express";
import path from "path";
import session from "express-session";
import hbs from "hbs";
import flash from "connect-flash";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📦 Middleware básicos
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// 🧠 Configurações do Handlebars
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "view"));

// 🧩 Adiciona helper para mostrar JSON formatado
hbs.registerHelper("json", function (context) {
  return JSON.stringify(context, null, 2);
});

// 💬 Sessão e Flash Messages
app.use(
  session({
    secret: "segredo_super_secreto",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use(flash());

// 🔁 Middleware global para mensagens
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

export default app;

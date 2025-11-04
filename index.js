import app from "./app.js";
import { connectDB } from "./db.js";
import Logger from "./logger.js";
import indexRoutes from "./routes/index.js";
import imagemRoutes from "./routes/imagem.js";
import albumRoutes from "./routes/album.js";

app.use("/", indexRoutes);
app.use("/imagem", imagemRoutes);
app.use("/album", albumRoutes);

async function startServer() {
  try {
    await connectDB();
    console.log("Conectado ao MongoDB com sucesso!");
    app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));
  } catch (error) {
    Logger.error(`Falha ao iniciar o servidor: ${error.message}`);
    process.exit(1);
  }
}

startServer();

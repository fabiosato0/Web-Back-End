import { connectDB } from "./db.js";
import Usuario from "./classes/usuario.js";
import Album from "./classes/album.js";
import Imagem from "./classes/imagem.js";

async function main() {
  await connectDB();

  const user = new Usuario("Maria", "maria@email.com");
  await user.salvar();

  const album = new Album("Viagem 2025", user._id);
  await album.salvar();

  const foto = new Imagem("Pôr do Sol", "url/foto1.jpg", user._id, album._id);
  await foto.salvar();

  console.log(await Usuario.listar());
  console.log(await Album.listarPorUsuario(user._id));
  console.log(await Imagem.listarPorUsuario(user._id));
}

main();

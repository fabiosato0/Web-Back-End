import { connectDB } from "./db.js";
import Usuario from "./classes/usuario.js";
import Album from "./classes/album.js";
import Imagem from "./classes/imagem.js";

async function main() {
  try {
    await connectDB();

    console.log("=== Testando CRUD de Album ===");

    // Criar um álbum
    const album = new Album("Viagem 2025", "user123");
    await album.salvar();
    console.log("Álbum criado com sucesso:", album);

    // Listar por usuário
    const albunsUser = await Album.listarPorUsuario("user123");
    console.log("Álbuns do usuário:", albunsUser);

    // Buscar por ID correto
    const albumEncontrado = await Album.buscarPorId(album._id);
    console.log("Álbum encontrado:", albumEncontrado);

    // Atualizar álbum
    await Album.atualizar(album._id, { nome: "Viagem Atualizada" });
    console.log("Álbum atualizado com sucesso.");

    // Buscar por ID errado (gera erro)
    const albumInvalido = await Album.buscarPorId("id_invalido");
    console.log("Álbum inválido (deveria cair no catch):", albumInvalido);

    // Adicionar imagem
    await album.adicionarImagem("foto123");
    console.log("Imagem adicionada ao álbum.");

    // Deletar álbum
    await Album.deletar(album._id);
    console.log("Álbum deletado com sucesso.");

    // Deletar novamente (não existe mais → não dá erro, mas resultado é 0)
    await Album.deletar(album._id);
    console.log("Tentativa de deletar novamente concluída.");

  } catch (error) {
    console.error("Erro inesperado no main:", error);
  }
}

main();

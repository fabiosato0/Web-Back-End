import express from "express";
import { criarImagem, deletarImagem, renomearImagem, moverImagem } from "../controllers/imagemController.js";

const router = express.Router();

router.post("/", criarImagem);
router.post("/delete/:id", deletarImagem);
router.post("/rename/:id", renomearImagem);
router.post("/set-album/:id", moverImagem);

export default router;

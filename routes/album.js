import express from "express";
import { listarAlbuns, criarAlbum, renomearAlbum, deletarAlbum } from "../controllers/albumController.js";

const router = express.Router();

router.get("/", listarAlbuns);
router.post("/", criarAlbum);
router.post("/rename/:id", renomearAlbum);
router.post("/delete/:id", deletarAlbum);

export default router;

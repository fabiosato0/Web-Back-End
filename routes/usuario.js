import express from "express";
import {
  showLogin,
  loginUser,
  logoutUser,
  showSignup,
  createUser,
  showHome,
} from "../controllers/usuarioController.js";

const router = express.Router();

router.get("/", showLogin);
router.get("/login", showLogin);
router.post("/login", loginUser);
router.get("/signup", showSignup);
router.post("/signup", createUser);
router.get("/logout", logoutUser);
router.get("/home", showHome);

export default router;

import express from "express";
import authController from "../controllers/authController";

const router = express.Router();

router.post("/register", authController.registerAdmin);
router.post("/login", authController.loginAdmin);

export default router;
import express from "express";
import authController from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", authController.registerAdmin);
router.post("/login", authController.loginAdmin);
router.post("/logout", authController.logoutAdmin);
router.get("/me", authMiddleware, authController.getLoggedInUser)

export default router;
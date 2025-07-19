import express from "express";
import authController from "../controllers/authController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";

const router = express.Router();

router.post(
  "/register",
  authMiddleware,
  checkRole("superadmin"),
  authController.registerAdmin
);
router.post("/login", authController.loginAdmin);
router.post("/logout", authController.logoutAdmin);
router.get("/me", authMiddleware, authController.getLoggedInUser);

router.use((req, res) => {
  res.status(404).json({ message: "Auth route not found" });
});

export default router;

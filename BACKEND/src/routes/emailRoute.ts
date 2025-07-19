import express from "express";
import emailController from "../controllers/emailController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/confirm/:bookingId", emailController.sendConfirmationEmail);

router.use((req, res) => {
  res.status(404).json({ message: "Email route not found" });
});
export default router;
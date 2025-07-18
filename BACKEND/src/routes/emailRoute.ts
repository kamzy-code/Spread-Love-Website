import express from "express";
import emailController from "../controllers/emailController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/confirm/:bookingId", emailController.sendConfirmationEmail);

export default router;
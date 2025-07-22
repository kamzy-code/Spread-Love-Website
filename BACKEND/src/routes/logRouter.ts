import { Router } from "express";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";
import logController from "../controllers/logController";

const router = Router();

router.get(
  "/admin",
  authMiddleware,
  checkRole("superadmin"),
  logController.getAllLogs
);

router.get(
  "/admin/:file",
  authMiddleware,
  checkRole("superadmin"),
  logController.getLogContent
);

router.post(
  "/admin/zip",
  authMiddleware,
  checkRole("superadmin"),
  logController.zipLogs
);

router.get("admin/download/:filename", authMiddleware, checkRole("superadmin"));

router.use((req, res) => {
  res.status(404).json({ message: "Booking route not found" });
});

export default router;

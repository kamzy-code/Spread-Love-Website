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
  "/admin/download/:file",
  authMiddleware,
  checkRole("superadmin"),
  logController.downloadLogs
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

router.use((req, res) => {
  res.status(404).json({ message: "Log route not found" });
});

export default router;

import express from "express";
import auditLogController from "../controllers/auditLogController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";

const router = express.Router();

// Audit trail is superadmin-only — not visible to salesrep/callrep.
router.get(
  "/admin",
  authMiddleware,
  checkRole("superadmin"),
  auditLogController.getLogsForEntity,
);

router.use((req, res) => {
  res.status(404).json({ message: "Audit log route not found" });
});

export default router;

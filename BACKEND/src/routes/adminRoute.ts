import express from "express";
import adminController from "../controllers/adminController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";

const router = express.Router();

router.get(
  "/admin",
  authMiddleware,
  checkRole("superadmin", "salesrep"),
  adminController.getAllReps
);
router.get(
  "/admin/:repId",
  authMiddleware,
  checkRole("superadmin", "salesrep", "callrep"),
  adminController.getRepById
);
router.delete(
  "/admin/:repId",
  authMiddleware,
  checkRole("superadmin"),
  adminController.deleteRepById
);
router.put(
  "/admin/:repId",
  authMiddleware,
  checkRole("superadmin", "salesrep", "callrep"),
  adminController.updateRep
);

router.use((req, res) => {
  res.status(404).json({ message: "Admin route not found" });
});

export default router;

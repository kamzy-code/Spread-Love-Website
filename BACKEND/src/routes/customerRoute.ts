import express from "express";
import customerController from "../controllers/customerController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";

const router = express.Router();

router.get(
  "/admin",
  authMiddleware,
  checkRole("superadmin", "salesrep"),
  customerController.getAllCustomers,
);

router.get(
  "/admin/export",
  authMiddleware,
  checkRole("superadmin", "salesrep"),
  customerController.exportCustomersCsv,
);

router.use((req, res) => {
  res.status(404).json({ message: "Customer route not found" });
});

export default router;

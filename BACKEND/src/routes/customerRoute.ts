import express from "express";
import customerController from "../controllers/customerController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";
import { validateQuery } from "../middlewares/validateRequest";
import {
  getAllCustomersQuerySchema,
  exportCustomersCsvQuerySchema,
} from "../validation/customerSchemas";

const router = express.Router();

router.get(
  "/admin",
  authMiddleware,
  checkRole("superadmin"),
  validateQuery(getAllCustomersQuerySchema),
  customerController.getAllCustomers,
);

router.get(
  "/admin/export",
  authMiddleware,
  checkRole("superadmin"),
  validateQuery(exportCustomersCsvQuerySchema),
  customerController.exportCustomersCsv,
);

router.use((req, res) => {
  res.status(404).json({ message: "Customer route not found" });
});

export default router;

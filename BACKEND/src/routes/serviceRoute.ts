import express from "express";
import serviceController from "../controllers/serviceController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import {
  createServiceSchema,
  updateServicePricingSchema,
  updateServiceDetailsSchema,
} from "../validation/serviceSchemas";

const router = express.Router();

// public — services page + booking form pricing
router.get("/", serviceController.getActiveServices);

// admin CRUD
router.get(
  "/admin",
  authMiddleware,
  checkRole("superadmin", "salesrep"),
  serviceController.getAllServicesForAdmin,
);

router.post(
  "/admin",
  authMiddleware,
  checkRole("superadmin", "salesrep"),
  validateRequest(createServiceSchema),
  serviceController.createService,
);

router.put(
  "/admin/:id/pricing",
  authMiddleware,
  checkRole("superadmin", "salesrep"),
  validateRequest(updateServicePricingSchema),
  serviceController.updateServicePricing,
);

router.put(
  "/admin/:id/details",
  authMiddleware,
  checkRole("superadmin", "salesrep"),
  validateRequest(updateServiceDetailsSchema),
  serviceController.updateServiceDetails,
);

router.put(
  "/admin/:id/deactivate",
  authMiddleware,
  checkRole("superadmin", "salesrep"),
  serviceController.deactivateService,
);

router.put(
  "/admin/:id/reactivate",
  authMiddleware,
  checkRole("superadmin", "salesrep"),
  serviceController.reactivateService,
);

router.use((req, res) => {
  res.status(404).json({ message: "Service route not found" });
});

export default router;

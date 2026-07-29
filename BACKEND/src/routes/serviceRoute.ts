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

// admin — mutations are superadmin-only; salesrep gets read access only
router.get(
  "/admin",
  authMiddleware,
  checkRole("superadmin", "salesrep"),
  serviceController.getAllServicesForAdmin,
);

router.get(
  "/admin/:id",
  authMiddleware,
  checkRole("superadmin", "salesrep"),
  serviceController.getServiceById,
);

router.post(
  "/admin",
  authMiddleware,
  checkRole("superadmin"),
  validateRequest(createServiceSchema),
  serviceController.createService,
);

router.put(
  "/admin/:id/pricing",
  authMiddleware,
  checkRole("superadmin"),
  validateRequest(updateServicePricingSchema),
  serviceController.updateServicePricing,
);

router.put(
  "/admin/:id/details",
  authMiddleware,
  checkRole("superadmin"),
  validateRequest(updateServiceDetailsSchema),
  serviceController.updateServiceDetails,
);

router.put(
  "/admin/:id/deactivate",
  authMiddleware,
  checkRole("superadmin"),
  serviceController.deactivateService,
);

router.put(
  "/admin/:id/reactivate",
  authMiddleware,
  checkRole("superadmin"),
  serviceController.reactivateService,
);

router.use((req, res) => {
  res.status(404).json({ message: "Service route not found" });
});

export default router;

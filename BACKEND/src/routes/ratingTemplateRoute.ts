import express from "express";
import ratingTemplateController from "../controllers/ratingTemplateController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import {
  createRatingTemplateSchema,
  updateRatingTemplateSchema,
} from "../validation/ratingTemplateSchemas";

const router = express.Router();


router.post(
  "/",
  authMiddleware,
  checkRole("superadmin"),
  validateRequest(createRatingTemplateSchema),
  ratingTemplateController.createTemplate,
);

router.get("/", authMiddleware, checkRole("superadmin"), ratingTemplateController.listTemplates);


router.get(
  "/active",
  authMiddleware,
  checkRole("superadmin", "salesrep"),
  ratingTemplateController.getActiveTemplate,
);

router.get(
  "/:id",
  authMiddleware,
  checkRole("superadmin"),
  ratingTemplateController.getTemplateById,
);

router.put(
  "/:id",
  authMiddleware,
  checkRole("superadmin"),
  validateRequest(updateRatingTemplateSchema),
  ratingTemplateController.updateTemplate,
);

router.put(
  "/:id/activate",
  authMiddleware,
  checkRole("superadmin"),
  ratingTemplateController.activateTemplate,
);

router.put(
  "/:id/deactivate",
  authMiddleware,
  checkRole("superadmin"),
  ratingTemplateController.deactivateTemplate,
);

router.use((req, res) => {
  res.status(404).json({ message: "Rating template route not found" });
});

export default router;

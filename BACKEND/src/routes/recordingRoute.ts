import express from "express";
import recordingController from "../controllers/recordingController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import { createUploadUrlSchema, confirmUploadSchema } from "../validation/recordingSchemas";

const router = express.Router();

// Upload is open to all three roles — there's no per-recipient assignment
// to check against, and tiered *visibility* (§2.7) is what actually needs
// scoping, not who's allowed to upload.
router.post(
  "/upload-url",
  authMiddleware,
  checkRole("superadmin", "salesrep", "callrep"),
  validateRequest(createUploadUrlSchema),
  recordingController.requestUploadUrl,
);

router.post(
  "/:id/confirm",
  authMiddleware,
  checkRole("superadmin", "salesrep", "callrep"),
  validateRequest(confirmUploadSchema),
  recordingController.confirmUpload,
);

router.use((req, res) => {
  res.status(404).json({ message: "Recording route not found" });
});

export default router;

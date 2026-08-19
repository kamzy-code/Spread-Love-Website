import express from "express";
import recordingController from "../controllers/recordingController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";
import { validateRequest, validateQuery } from "../middlewares/validateRequest";
import {
  createUploadUrlSchema,
  confirmUploadSchema,
  listRecordingsQuerySchema,
} from "../validation/recordingSchemas";

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

// List/detail/playback all open to all three roles at the route level —
// tiered visibility (call reps scoped to their own uploads) is enforced
// inside recordingService, not here, so it can't be bypassed per-route.
router.get(
  "/",
  authMiddleware,
  checkRole("superadmin", "salesrep", "callrep"),
  validateQuery(listRecordingsQuerySchema),
  recordingController.listRecordings,
);

router.get(
  "/:id/files/:fileId/playback-url",
  authMiddleware,
  checkRole("superadmin", "salesrep", "callrep"),
  recordingController.getPlaybackUrl,
);

router.use((req, res) => {
  res.status(404).json({ message: "Recording route not found" });
});

export default router;

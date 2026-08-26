import express from "express";
import recordingController from "../controllers/recordingController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";
import { validateRequest, validateQuery } from "../middlewares/validateRequest";
import {
  createUploadUrlSchema,
  confirmUploadSchema,
  listRecordingsQuerySchema,
  submitRatingSchema,
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

// Rate/approve are QC actions — open to salesreps and superadmins only,
router.post(
  "/:id/rate",
  authMiddleware,
  checkRole("superadmin", "salesrep"),
  validateRequest(submitRatingSchema),
  recordingController.submitRating,
);

router.put(
  "/:id/approve",
  authMiddleware,
  checkRole("superadmin", "salesrep"),
  recordingController.approveRecording,
);

router.put(
  "/:id/unapprove",
  authMiddleware,
  checkRole("superadmin", "salesrep"),
  recordingController.unapproveRecording,
);

// Open to all three roles at the route level — recordingService enforces
// who's actually allowed to delete a given recording (superadmin always,
// the uploader only before it's approved).
router.delete(
  "/:id",
  authMiddleware,
  checkRole("superadmin", "salesrep", "callrep"),
  recordingController.deleteRecording,
);

router.use((req, res) => {
  res.status(404).json({ message: "Recording route not found" });
});

export default router;

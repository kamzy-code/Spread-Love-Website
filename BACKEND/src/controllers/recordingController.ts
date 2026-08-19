import { Response, NextFunction } from "express";
import recordingService from "../services/recordingService";
import { AuthRequest } from "../middlewares/authMiddleware";

class RecordingController {
  // bookingId/recipientId/mimeType/fileSize/recordingId validated by
  // validateRequest (createUploadUrlSchema).
  async requestUploadUrl(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user!;
    try {
      const result = await recordingService.requestUploadUrl(user.userId, req.body);
      res.status(200).json(result);
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  // s3Key validated by validateRequest (confirmUploadSchema).
  async confirmUpload(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user!;
    try {
      const recording = await recordingService.confirmUpload(
        user.userId,
        req.params.id,
        req.body.s3Key,
      );
      res.status(200).json({ message: "Upload confirmed", recording });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }
}

const recordingController = new RecordingController();
export default recordingController;

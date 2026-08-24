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

  // bookingId/recipientId validated by validateQuery (listRecordingsQuerySchema).
  async listRecordings(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user!;
    try {
      const { bookingId, recipientId } = req.query as {
        bookingId?: string;
        recipientId?: string;
      };
      const recordings = await recordingService.listRecordings(user.userId, user.role, {
        bookingId,
        recipientId,
      });
      res.status(200).json({ recordings });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  async getPlaybackUrl(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user!;
    try {
      const result = await recordingService.getPlaybackUrl(
        user.userId,
        user.role,
        req.params.id,
        req.params.fileId,
      );
      res.status(200).json(result);
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  // ratingValues validated by validateRequest (submitRatingSchema); per-value
  // shape/option validation happens in recordingService against the
  // recording's pinned criteria snapshot.
  async submitRating(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user!;
    try {
      const { recording, score } = await recordingService.submitRating(
        user.userId,
        req.params.id,
        req.body.ratingValues,
      );
      res.status(200).json({ message: "Rating saved", recording, score });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  async approveRecording(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user!;
    try {
      const { recording, score } = await recordingService.approveRecording(
        user.userId,
        req.params.id,
      );
      res.status(200).json({ message: "Recording approved", recording, score });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  async unapproveRecording(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user!;
    try {
      const { recording, score } = await recordingService.unapproveRecording(
        user.userId,
        req.params.id,
      );
      res.status(200).json({ message: "Recording unapproved", recording, score });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }
}

const recordingController = new RecordingController();
export default recordingController;

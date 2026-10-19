import { Response, NextFunction } from "express";
import messageSuggestionService from "../services/messageSuggestionService";
import { AuthRequest } from "../middlewares/authMiddleware";

class MessageSuggestionController {
  // params validated by validateParams (suggestMessageParamsSchema)
  async suggestMessage(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user!;
    const { bookingId, recipientId } = req.params;

    try {
      const data = await messageSuggestionService.suggestMessage(
        user.userId,
        user.role,
        bookingId,
        recipientId,
      );
      res.status(200).json({ message: "Suggestion generated", data });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }
}

const messageSuggestionController = new MessageSuggestionController();
export default messageSuggestionController;

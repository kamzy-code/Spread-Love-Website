import { Request, Response, NextFunction } from "express";
import bookingPopupService from "../services/bookingPopupService";
import { AuthRequest } from "../middlewares/authMiddleware";

class BookingPopupController {
  // public — booking form page load
  async getPublicPopup(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await bookingPopupService.getPublic();
      res.status(200).json({ message: "Pop-up fetched successfully", data });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  async getAdminPopup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await bookingPopupService.getForAdmin();
      res.status(200).json({ message: "Pop-up fetched successfully", data });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  // body is validated by validateRequest (updateBookingPopupSchema)
  async updatePopup(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user!;
    try {
      const data = await bookingPopupService.update(req.body, user.userId);
      res.status(200).json({ message: "Pop-up updated", data });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }
}

const bookingPopupController = new BookingPopupController();
export default bookingPopupController;

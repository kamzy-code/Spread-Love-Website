import { Response, NextFunction } from "express";
import ratingTemplateService from "../services/ratingTemplateService";
import { AuthRequest } from "../middlewares/authMiddleware";
import { HttpError } from "../utils/httpError";

class RatingTemplateController {
  async createTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user!;
    try {
      const template = await ratingTemplateService.createTemplate(req.body, user.userId);
      res.status(201).json({ message: "Rating template created", template });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  async listTemplates(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const templates = await ratingTemplateService.listTemplates();
      res.status(200).json({ templates });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  async getActiveTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const template = await ratingTemplateService.getActiveTemplate();
      res.status(200).json({ template });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  async getTemplateById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const template = await ratingTemplateService.getTemplateById(req.params.id);
      if (!template) {
        next(new HttpError(404, "Rating template not found"));
        return;
      }
      res.status(200).json({ template });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  // name/criteria/passFailThreshold validated by validateRequest
  // (updateRatingTemplateSchema) — `active` is intentionally not accepted
  // here, see activateTemplate/deactivateTemplate.
  async updateTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user!;
    try {
      const template = await ratingTemplateService.updateTemplate(
        req.params.id,
        req.body,
        user.userId,
      );
      if (!template) {
        next(new HttpError(404, "Rating template not found"));
        return;
      }
      res.status(200).json({ message: "Rating template updated", template });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  async activateTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user!;
    try {
      const template = await ratingTemplateService.activateTemplate(req.params.id, user.userId);
      if (!template) {
        next(new HttpError(404, "Rating template not found"));
        return;
      }
      res.status(200).json({ message: "Rating template activated", template });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  async deactivateTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user!;
    try {
      const template = await ratingTemplateService.deactivateTemplate(req.params.id, user.userId);
      if (!template) {
        next(new HttpError(404, "Rating template not found"));
        return;
      }
      res.status(200).json({ message: "Rating template deactivated", template });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }
}

const ratingTemplateController = new RatingTemplateController();
export default ratingTemplateController;

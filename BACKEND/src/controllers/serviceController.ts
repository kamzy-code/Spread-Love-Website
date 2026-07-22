import { Request, Response, NextFunction } from "express";
import serviceService from "../services/serviceService";
import { AuthRequest } from "../middlewares/authMiddleware";
import { HttpError } from "../utils/httpError";
import { bookingLogger } from "../utils/logger";

class ServiceController {
  // public — services page + booking form
  async getActiveServices(req: Request, res: Response, next: NextFunction) {
    try {
      const services = await serviceService.listActiveServices();
      res.status(200).json({ message: "Services fetched successfully", data: services });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  async getAllServicesForAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const services = await serviceService.listAllServices();
      res.status(200).json({ message: "Services fetched successfully", data: services });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  async createService(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const service = await serviceService.createService(req.body);
      res.status(201).json({ message: "Service created", data: service });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  // price/feature edits — the audit-logged path
  async updateServicePricing(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user!;
    const { id } = req.params;

    try {
      const service = await serviceService.updateServicePricing(id, req.body, user.userId);
      if (!service) {
        next(new HttpError(404, "Service not found"));
        return;
      }
      res.status(200).json({ message: "Service pricing updated", data: service });
      return;
    } catch (error: any) {
      bookingLogger.error(`Update service pricing error: ${error.message}`, {
        userId: user.userId,
        serviceId: id,
        action: "UPDATE_SERVICE_PRICING_FAILED",
      });
      next(error);
      return;
    }
  }

  async updateServiceDetails(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const service = await serviceService.updateServiceDetails(req.params.id, req.body);
      if (!service) {
        next(new HttpError(404, "Service not found"));
        return;
      }
      res.status(200).json({ message: "Service updated", data: service });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  async deactivateService(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const service = await serviceService.deactivateService(req.params.id);
      if (!service) {
        next(new HttpError(404, "Service not found"));
        return;
      }
      res.status(200).json({ message: "Service deactivated", data: service });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  async reactivateService(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const service = await serviceService.reactivateService(req.params.id);
      if (!service) {
        next(new HttpError(404, "Service not found"));
        return;
      }
      res.status(200).json({ message: "Service reactivated", data: service });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }
}

const serviceController = new ServiceController();
export default serviceController;

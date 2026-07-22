import { Service, IService, IServicePricing } from "../models/serviceModel";
import auditLogService from "./auditLogService";
import { bookingLogger } from "../utils/logger";

type PricingUpdate = Partial<IServicePricing>;

class ServiceService {
  // Public/booking-form facing — active services only.
  async listActiveServices() {
    return Service.find({ active: true }).sort({ createdAt: 1 });
  }

  // Admin management — everything, including deactivated services.
  async listAllServices() {
    return Service.find().sort({ createdAt: 1 });
  }

  async getServiceById(id: string) {
    return Service.findById(id);
  }

  async createService(data: Partial<IService>) {
    const service = await Service.create(data);
    bookingLogger.info("Service created", {
      title: service.title,
      service: "serviceService",
      action: "CREATE_SERVICE_SUCCESS",
    });
    return service;
  }

  // Price changes go through this dedicated path (not a generic field-merge
  // update) so every price edit is diffed and audit-logged per tier/region —
  // e.g. "regular.localPrice" — rather than losing that detail in a single
  // opaque "service updated" entry.
  async updateServicePricing(
    id: string,
    updates: { regular?: PricingUpdate; special?: PricingUpdate },
    changedBy: string
  ) {
    const service = await Service.findById(id);
    if (!service) return null;

    const priceFields: ("localPrice" | "internationalPrice")[] = [
      "localPrice",
      "internationalPrice",
    ];
    const tiers: ("regular" | "special")[] = ["regular", "special"];

    for (const tier of tiers) {
      const tierUpdate = updates[tier];
      if (!tierUpdate) continue;

      for (const field of priceFields) {
        const newValue = tierUpdate[field];
        if (newValue === undefined) continue;

        const oldValue = service[tier][field];
        if (newValue !== oldValue) {
          await auditLogService.record({
            entity: "service",
            entityId: service.id,
            field: `${tier}.${field}`,
            oldValue: String(oldValue),
            newValue: String(newValue),
            changedBy,
          });
          service[tier][field] = newValue;
        }
      }

      if (tierUpdate.features !== undefined) {
        service[tier].features = tierUpdate.features;
      }
    }

    const saved = await service.save();
    bookingLogger.info("Service pricing updated", {
      serviceId: service.id,
      service: "serviceService",
      action: "UPDATE_SERVICE_PRICING_SUCCESS",
    });
    return saved;
  }

  async updateServiceDetails(
    id: string,
    updates: Partial<Pick<IService, "title" | "description" | "category" | "thumbnail" | "iconKey">>
  ) {
    return Service.findByIdAndUpdate(id, updates, { new: true });
  }

  async deactivateService(id: string) {
    return Service.findByIdAndUpdate(id, { active: false }, { new: true });
  }

  async reactivateService(id: string) {
    return Service.findByIdAndUpdate(id, { active: true }, { new: true });
  }
}

const serviceService = new ServiceService();
export default serviceService;

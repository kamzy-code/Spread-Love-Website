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

  // Server-side source of truth for what a recipient's call should cost —
  // never trust a client-submitted price. Returns null if the occasion
  // doesn't match an active service, so the caller can reject the booking
  // instead of silently defaulting to 0 or trusting client input.
  async getPriceForOccasion(
    title: string,
    callType: "regular" | "special",
    country: string
  ): Promise<number | null> {
    const service = await Service.findOne({ title, active: true });
    if (!service) return null;

    const pricing = service[callType];
    if (!pricing) return null;

    return country === "Nigeria" ? pricing.localPrice : pricing.internationalPrice;
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
        const oldFeatures = service[tier].features;
        const newFeatures = tierUpdate.features;
        if (JSON.stringify(oldFeatures) !== JSON.stringify(newFeatures)) {
          await auditLogService.record({
            entity: "service",
            entityId: service.id,
            field: `${tier}.features`,
            oldValue: oldFeatures.join(", "),
            newValue: newFeatures.join(", "),
            changedBy,
          });
          service[tier].features = newFeatures;
        }
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
    updates: Partial<Pick<IService, "title" | "description" | "category" | "thumbnail" | "iconKey">>,
    changedBy: string
  ) {
    const service = await Service.findById(id);
    if (!service) return null;

    const fields: (keyof typeof updates)[] = [
      "title",
      "description",
      "category",
      "thumbnail",
      "iconKey",
    ];
    const diffs = fields
      .filter((field) => updates[field] !== undefined)
      .map((field) => ({
        field,
        oldValue: service[field],
        newValue: updates[field],
      }));

    Object.assign(service, updates);
    const saved = await service.save();

    await auditLogService.recordDiffs("service", service.id, changedBy, diffs);

    return saved;
  }

  async deactivateService(id: string, changedBy: string) {
    const before = await Service.findById(id);
    if (!before) return null;

    const service = await Service.findByIdAndUpdate(id, { active: false }, { new: true });

    if (before.active) {
      await auditLogService.record({
        entity: "service",
        entityId: id,
        field: "status",
        oldValue: "active",
        newValue: "inactive",
        changedBy,
      });
    }

    return service;
  }

  async reactivateService(id: string, changedBy: string) {
    const before = await Service.findById(id);
    if (!before) return null;

    const service = await Service.findByIdAndUpdate(id, { active: true }, { new: true });

    if (!before.active) {
      await auditLogService.record({
        entity: "service",
        entityId: id,
        field: "status",
        oldValue: "inactive",
        newValue: "active",
        changedBy,
      });
    }

    return service;
  }
}

const serviceService = new ServiceService();
export default serviceService;

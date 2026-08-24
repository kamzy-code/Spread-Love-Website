import {
  RatingTemplate,
  IRatingCriterion,
  IRatingOption,
  TIER_WEIGHTS,
} from "../models/ratingTemplateModel";
import auditLogService from "./auditLogService";
import { recordingLogger } from "../utils/logger";

// The API never accepts `weight` directly  —
// a template author only picks a tier, the server derives the weight, so a
// tier/weight mismatch can't be submitted.
type CriterionInput = Omit<IRatingCriterion, "options"> & {
  options?: Omit<IRatingOption, "weight">[];
};

type TemplateInput = {
  name: string;
  criteria: CriterionInput[];
};

const deriveWeights = (criteria: CriterionInput[]): IRatingCriterion[] =>
  criteria.map((c) => ({
    ...c,
    options: c.options?.map((o) => ({ ...o, weight: TIER_WEIGHTS[o.tier] })),
  }));

class RatingTemplateService {
  async createTemplate(data: TemplateInput, changedBy: string) {
    const template = await RatingTemplate.create({
      ...data,
      criteria: deriveWeights(data.criteria),
      active: false,
      createdBy: changedBy,
    });

    recordingLogger.info("Rating template created", {
      templateId: template.id,
      name: template.name,
      action: "CREATE_RATING_TEMPLATE_SUCCESS",
    });

    await auditLogService.record({
      entity: "ratingTemplate",
      entityId: template.id,
      field: "status",
      oldValue: "",
      newValue: "created",
      changedBy,
    });

    return template;
  }

  async listTemplates() {
    return RatingTemplate.find().sort({ createdAt: -1 });
  }

  async getTemplateById(id: string) {
    return RatingTemplate.findById(id);
  }

  // What the QC rating UI actually renders its form against — at most
  // one template should ever match, enforced by activateTemplate below.
  async getActiveTemplate() {
    return RatingTemplate.findOne({ active: true });
  }

  // Deliberately does not accept `active` — activation only ever happens
  // through activateTemplate/deactivateTemplate, so "exactly one active
  // template" has a single code path that can flip it.
  async updateTemplate(id: string, updates: Partial<TemplateInput>, changedBy: string) {
    const template = await RatingTemplate.findById(id);
    if (!template) return null;

    const diffs: { field: string; oldValue: unknown; newValue: unknown }[] = (
      ["name"] as const
    )
      .filter((field) => updates[field] !== undefined)
      .map((field) => ({ field, oldValue: template[field], newValue: updates[field] }));

    const resolvedCriteria =
      updates.criteria !== undefined ? deriveWeights(updates.criteria) : undefined;

    if (resolvedCriteria !== undefined) {
      diffs.push({
        field: "criteria",
        oldValue: JSON.stringify(template.criteria),
        newValue: JSON.stringify(resolvedCriteria),
      });
    }

    Object.assign(template, { ...updates, criteria: resolvedCriteria ?? template.criteria });
    template.updatedBy = changedBy as any;
    const saved = await template.save();

    await auditLogService.recordDiffs("ratingTemplate", template.id, changedBy, diffs);

    recordingLogger.info("Rating template updated", {
      templateId: template.id,
      action: "UPDATE_RATING_TEMPLATE_SUCCESS",
    });

    return saved;
  }

  // Activates one template and deactivates every other — the only place
  // `active` is ever set to true, so this invariant can't be broken by a
  // stray update elsewhere.
  async activateTemplate(id: string, changedBy: string) {
    const template = await RatingTemplate.findById(id);
    if (!template) return null;

    await RatingTemplate.updateMany(
      { _id: { $ne: id }, active: true },
      { $set: { active: false } },
    );

    template.active = true;
    template.updatedBy = changedBy as any;
    const saved = await template.save();

    await auditLogService.record({
      entity: "ratingTemplate",
      entityId: template.id,
      field: "active",
      oldValue: "false",
      newValue: "true",
      changedBy,
    });

    recordingLogger.info("Rating template activated", {
      templateId: template.id,
      action: "ACTIVATE_RATING_TEMPLATE_SUCCESS",
    });

    return saved;
  }

  async deactivateTemplate(id: string, changedBy: string) {
    const template = await RatingTemplate.findById(id);
    if (!template) return null;

    const wasActive = template.active;
    template.active = false;
    template.updatedBy = changedBy as any;
    const saved = await template.save();

    if (wasActive) {
      await auditLogService.record({
        entity: "ratingTemplate",
        entityId: template.id,
        field: "active",
        oldValue: "true",
        newValue: "false",
        changedBy,
      });
    }

    recordingLogger.info("Rating template deactivated", {
      templateId: template.id,
      action: "DEACTIVATE_RATING_TEMPLATE_SUCCESS",
    });

    return saved;
  }
}

const ratingTemplateService = new RatingTemplateService();
export default ratingTemplateService;

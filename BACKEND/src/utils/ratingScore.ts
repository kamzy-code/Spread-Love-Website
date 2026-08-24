import { IRatingCriterion } from "../models/ratingTemplateModel";
import { IRatingValue } from "../models/recordingModel";

export interface IScoredCriterion {
  criterionKey: string;
  label: string;
  type: IRatingCriterion["type"];
  value?: unknown;
  // Present only for "options" criteria that received a value.
  weight?: number;
}

export interface IRatingScore {
  criteria: IScoredCriterion[];
  // Mean weight (1-4) across scored ("options") criteria that received a
  // value. Null if the template has no "options" criteria, or none were
  // answered yet.
  averageWeight: number | null;
  overallScorePercent: number | null;
}

// Pure — no DB access. Always scores against the criteria snapshot passed
// in, never a live template lookup (see recordingModel.ts's
// ratingCriteriaSnapshot for why).
export function computeRatingScore(
  criteria: IRatingCriterion[],
  ratingValues: IRatingValue[],
): IRatingScore {
  const valueByKey = new Map(ratingValues.map((rv) => [rv.criterionKey, rv.value]));

  const scoredCriteria: IScoredCriterion[] = criteria.map((criterion) => {
    const value = valueByKey.get(criterion.key);

    if (criterion.type !== "options" || value === undefined) {
      return { criterionKey: criterion.key, label: criterion.label, type: criterion.type, value };
    }

    const options = criterion.options ?? [];
    let weight: number | undefined;

    if (criterion.multiple && Array.isArray(value)) {
      const weights = value
        .map((v) => options.find((o) => o.value === v)?.weight)
        .filter((w): w is number => w !== undefined);
      if (weights.length > 0) {
        weight = Math.round(weights.reduce((sum, w) => sum + w, 0) / weights.length);
      }
    } else if (!criterion.multiple && typeof value === "string") {
      weight = options.find((o) => o.value === value)?.weight;
    }

    return { criterionKey: criterion.key, label: criterion.label, type: criterion.type, value, weight };
  });

  const weights = scoredCriteria
    .map((c) => c.weight)
    .filter((w): w is number => w !== undefined);

  const averageWeight =
    weights.length > 0
      ? Math.round((weights.reduce((sum, w) => sum + w, 0) / weights.length) * 100) / 100
      : null;

  const overallScorePercent = averageWeight !== null ? Math.round((averageWeight / 4) * 100) : null;

  return { criteria: scoredCriteria, averageWeight, overallScorePercent };
}

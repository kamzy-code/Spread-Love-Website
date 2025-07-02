import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  parseISO,
  isValid,
} from "date-fns";

export default function getDateRange(
  filterType: string,
  referenceDate?: string,
  customStartDate?: string,
  customEndDate?: string
): { start: Date; end: Date } | null {
  const now = new Date();

  switch (filterType) {
    case "daily": {
      const date = referenceDate ? parseISO(referenceDate) : now;
      return {
        start: startOfDay(date),
        end: endOfDay(date),
      };
    }

    case "weekly": {
      const date = referenceDate ? parseISO(referenceDate) : now;
      return {
        start: startOfWeek(date, { weekStartsOn: 1 }),
        end: endOfWeek(date, { weekStartsOn: 1 }),
      };
    }

    case "monthly": {
      const date = referenceDate ? parseISO(referenceDate) : now;
      return {
        start: startOfMonth(date),
        end: endOfMonth(date),
      };
    }

    case "yearly": {
      const date = referenceDate ? parseISO(referenceDate) : now;
      return {
        start: startOfYear(date),
        end: endOfYear(date),
      };
    }

    case "custom": {
      if (!customStartDate || !customEndDate) return null;

      const start = parseISO(customStartDate);
      const end = parseISO(customEndDate);

      if (!isValid(start) || !isValid(end)) return null;

      return {
        start: startOfDay(start),
        end: endOfDay(end),
      };
    }

    default:
      return null;
  }
}

import { SortOrder } from "mongoose";

export const castSortOder =  (sortOrderRaw : string) => {
const sortOrder: number | undefined =
      typeof sortOrderRaw === "string" ? parseInt(sortOrderRaw, 10) : undefined;

    let sortOrderCast: SortOrder | undefined;
    if (
      (typeof sortOrder === "number" && (sortOrder === 1 || sortOrder === -1)) ||
      (typeof sortOrder === "string" && (sortOrder === "1" || sortOrder === "-1"))
    ) {
      sortOrderCast = sortOrder as SortOrder;
    }

    return sortOrderCast;
}
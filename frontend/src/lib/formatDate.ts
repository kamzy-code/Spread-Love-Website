import { format } from "date-fns";

export function formatToYMD(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export const getDefaultDate = () => format(new Date(), "yyyy-MM-dd");
export const getDefaultWeek = () => format(new Date(), "yyyy-'W'II");
export const getDefaultMonth = () => format(new Date(), "yyyy-MM");
export const getDefaultYear = () => format(new Date(), "yyyy");

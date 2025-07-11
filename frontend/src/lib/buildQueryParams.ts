export const buildQueryParams = (filters: Record<string, any>) => {
  const searchParams = new URLSearchParams();
  for (const key in filters) {
    if (
      filters[key] !== undefined &&
      filters[key] !== null &&
      filters[key] !== ""
    ) {
      searchParams.append(key, filters[key]);
    }
  }
  console.log(searchParams.toString());
  return searchParams.toString();
};
// Minimal CSV serializer for flat admin exports — quotes any field
// containing a comma, quote, or newline and escapes embedded quotes by
// doubling them, per RFC 4180. No external dependency needed for the
// simple flat-record shapes this app exports (customers, etc.).
const escapeCsvField = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  const stringValue = value instanceof Date ? value.toISOString() : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

export const toCsv = <T>(
  rows: T[],
  columns: { key: keyof T; header: string }[]
): string => {
  const headerLine = columns.map((c) => escapeCsvField(c.header)).join(",");
  const dataLines = rows.map((row) =>
    columns.map((c) => escapeCsvField(row[c.key])).join(",")
  );
  return [headerLine, ...dataLines].join("\r\n");
};

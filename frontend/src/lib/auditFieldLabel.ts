const camelToTitle = (s: string) =>
  s.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

// Formats a raw AuditLog `field` value (e.g. "callerName",
// "recipient.<id>.occassion", "regular.localPrice") into a human-readable
// label. Generic across every entity type the audit log covers.
export function formatAuditField(field: string): string {
  const recipientMatch = field.match(/^recipient\.[^.]+\.(.+)$/);
  if (recipientMatch) {
    return `Recipient ${camelToTitle(recipientMatch[1])}`;
  }

  if (field.includes(".")) {
    const [group, sub] = field.split(".");
    return `${camelToTitle(group)} · ${camelToTitle(sub)}`;
  }

  return camelToTitle(field);
}

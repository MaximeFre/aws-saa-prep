export function categorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function prioritySlug(priority: string): string {
  const match = priority.match(/tier\s*(\d+)/i);
  return match ? `tier-${match[1]}` : "";
}

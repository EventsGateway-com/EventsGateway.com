export type Environment = "production" | "staging" | "development";

export type EventSource = "browser" | "server" | "manual_test" | "replay";

export type DateRangePreset = "15m" | "1h" | "24h" | "7d" | "30d";

export const statusColors = {
  healthy: "success",
  pending: "info",
  retrying: "warning",
  failing: "danger",
  failed: "danger",
  disabled: "subtle",
  paused: "warning",
  matched: "success",
  skipped: "subtle",
  blocked: "danger",
  active: "success",
  draft: "warning"
} as const;

export function createId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${random}`;
}

export function now(): number {
  return Date.now();
}

export function formatRelativeWindow(range: DateRangePreset): string {
  const labels: Record<DateRangePreset, string> = {
    "15m": "Last 15 minutes",
    "1h": "Last hour",
    "24h": "Last 24 hours",
    "7d": "Last 7 days",
    "30d": "Last 30 days"
  };

  return labels[range];
}

export function hashString(input: string): string {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(16);
}

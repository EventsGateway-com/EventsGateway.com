import type { IntegrationItem } from "./types";

export const counterscale: IntegrationItem = {
  slug: "counterscale",
  label: "Counterscale",
  title: "Counterscale integration",
  summary: "Add lightweight analytics without fragmenting the cleaner event model already used across the rest of your stack.",
  hero: "Use Counterscale when your team wants privacy-aware traffic reporting while keeping naming, routing, and measurement discipline consistent across marketing analytics and attribution workflows.",
  repository: "https://github.com/mackenly/counterscale-managed-component",
  points: [
    "Keep lightweight analytics aligned with broader routing decisions",
    "Reduce separate instrumentation for simple traffic reporting",
    "Reuse one event model across privacy-aware analytics and marketing analytics"
  ],
  useCases: [
    "Simple website analytics from the same event stream",
    "Privacy-aware reporting alongside paid media tracking",
    "Teams that want lighter analytics without adding fragmented setup"
  ]
};

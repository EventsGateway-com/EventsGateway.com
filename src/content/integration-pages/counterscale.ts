import type { IntegrationItem } from "./types";

export const counterscale: IntegrationItem = {
  slug: "counterscale",
  label: "Counterscale",
  title: "Counterscale Analytics Without Breaking The Shared Event Model Of Your Stack",
  summary: "Add lightweight analytics without fragmenting the cleaner event model already used across the rest of your stack.",
  hero: "Use Counterscale when your team wants privacy-aware traffic reporting while keeping naming, routing, and measurement discipline consistent across marketing analytics and attribution workflows.",
  repository: "https://github.com/mackenly/counterscale-managed-component",
  whyTitle: "Why lightweight analytics should still use disciplined event routing",
  whyDescription: "Privacy-aware analytics is most useful when it stays connected to the rest of your measurement approach. These are the reasons to keep Counterscale on the same event model.",
  useCasesTitle: "Where Counterscale adds value without adding measurement chaos",
  useCasesDescription: "These are the traffic and privacy-aware scenarios where lightweight analytics benefits most from better event consistency.",
  ctaTitle: "Add lightweight analytics without breaking the discipline of your event model.",
  ctaText: "Use Counterscale inside the same measurement system as your broader stack so privacy-aware reporting stays simple without becoming disconnected.",
  reasons: [
    {
      title: "Privacy-Friendly Consistency",
      text: "Keep lightweight analytics aligned with broader routing decisions instead of creating a separate measurement island."
    },
    {
      title: "Less Instrumentation Overhead",
      text: "Reduce separate instrumentation for simple traffic reporting."
    },
    {
      title: "Reusable Event Model",
      text: "Reuse one event model across privacy-aware analytics and marketing analytics."
    },
    {
      title: "Cleaner Stakeholder Reporting",
      text: "Give teams a simpler analytics layer that still reflects the same important event logic."
    },
    {
      title: "Lower Stack Fragmentation",
      text: "Avoid fragmenting the event model just because a tool is lightweight."
    },
    {
      title: "Better Governance",
      text: "Keep naming and measurement discipline intact even in simpler reporting environments."
    }
  ],
  useCases: [
    {
      title: "Simple Site Analytics",
      text: "Track lightweight traffic analytics from the same event stream used elsewhere."
    },
    {
      title: "Privacy-Aware Reporting",
      text: "Support teams that want a simpler analytics layer without losing consistency."
    },
    {
      title: "Content Sites",
      text: "Measure straightforward site behavior while keeping event naming in sync with marketing."
    },
    {
      title: "Lean Teams",
      text: "Give small teams useful analytics without piling on new setup complexity."
    },
    {
      title: "Hybrid Reporting",
      text: "Run Counterscale alongside broader attribution workflows without splitting definitions."
    },
    {
      title: "Governance-Focused Setups",
      text: "Keep even simple analytics inside a more disciplined measurement system."
    }
  ]
};

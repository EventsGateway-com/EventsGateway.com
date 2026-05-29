import type { IntegrationItem } from "./types";

export const segment: IntegrationItem = {
  slug: "segment",
  label: "Segment",
  title: "Segment Fed From One Cleaner Event Stream Instead Of Many Competing Ones",
  summary: "Feed Segment from one cleaner event stream and extend the same conversion truth into warehouses, tools, and automation.",
  hero: "Use Segment when your team wants one controlled source for purchase, lead, and lifecycle events before routing them deeper into warehouses, SaaS tools, and downstream automation.",
  repository: "https://github.com/managed-components/segment",
  whyTitle: "Why Segment works better when upstream events are already clean",
  whyDescription: "A CDP multiplies value only when what enters it is already trustworthy. These are the reasons to feed Segment from a cleaner event source.",
  useCasesTitle: "Where Segment gains the most from a stronger upstream event layer",
  useCasesDescription: "These are the data stack scenarios where shared event discipline usually makes Segment far more effective.",
  reasons: [
    {
      title: "Cleaner CDP Inputs",
      text: "Keep Segment inputs aligned with paid media and analytics tracking instead of sending mixed-quality events into the stack."
    },
    {
      title: "Less Duplicate Collection",
      text: "Reduce duplicate event collection logic across tools and teams."
    },
    {
      title: "Better Downstream Routing",
      text: "Make downstream routing easier to scale from one source of truth instead of many."
    },
    {
      title: "Simpler Data Governance",
      text: "Keep naming, lifecycle definitions, and business events more consistent before they spread everywhere."
    },
    {
      title: "Faster Warehouse Adoption",
      text: "Ship warehouse and SaaS destinations faster when the upstream event contract is already stable."
    },
    {
      title: "Lower Stack Complexity",
      text: "Avoid solving messy upstream data problems inside every downstream system."
    }
  ],
  useCases: [
    {
      title: "Warehouse Pipelines",
      text: "Feed data warehouses from the same purchase and lead events used by marketing."
    },
    {
      title: "SaaS Destinations",
      text: "Send shared lifecycle events into the broader SaaS stack without redefining them everywhere."
    },
    {
      title: "Automation Workflows",
      text: "Trigger downstream automation from events that are already trusted upstream."
    },
    {
      title: "Cross-Team Data Models",
      text: "Support product, growth, marketing, and operations with one shared event language."
    },
    {
      title: "Modern Data Stack",
      text: "Use Segment as an extension of a cleaner event layer, not as the place where cleanup begins."
    },
    {
      title: "Scale Programs",
      text: "Add more destinations without multiplying upstream tracking complexity."
    }
  ]
};

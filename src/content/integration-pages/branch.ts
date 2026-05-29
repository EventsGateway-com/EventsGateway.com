import type { IntegrationItem } from "./types";

export const branch: IntegrationItem = {
  slug: "branch",
  label: "Branch",
  title: "Branch Attribution That Stays Connected To Real Conversion Outcomes",
  summary: "Unify app attribution, deep links, and downstream conversions so mobile growth decisions rely on cleaner data.",
  hero: "Use Branch when install, reopen, and in-app journeys need to stay connected to the same trusted conversion events your team already uses across web and paid media.",
  repository: "https://github.com/managed-components/branch",
  whyTitle: "Why mobile teams need stronger Branch event discipline",
  whyDescription: "Mobile attribution gets expensive fast when web, app, and paid media all tell different stories. Branch becomes more useful when the underlying conversion truth is unified.",
  useCasesTitle: "Where Branch creates the most value in mobile growth",
  useCasesDescription: "These are the app and deep-link scenarios where one shared event stream usually removes the most confusion.",
  reasons: [
    {
      title: "Unified Attribution",
      text: "Keep Branch attribution closer to the same source of truth as site and app tracking instead of splitting mobile and web logic."
    },
    {
      title: "Cleaner Re-Engagement",
      text: "Reduce drift between deep-link journeys, reopen flows, and the campaign reports that depend on them."
    },
    {
      title: "Better Install Signals",
      text: "Make install and post-install conversion data easier to trust across campaigns that push users into the app."
    },
    {
      title: "Cross-Channel Clarity",
      text: "Compare app results with search, social, and web conversions without stitching data together after the fact."
    },
    {
      title: "Reusable Event Model",
      text: "Keep one purchase, signup, or activation model across app and site experiences."
    },
    {
      title: "Lower Debug Overhead",
      text: "Spend less time tracing whether broken performance comes from links, app flows, or disconnected tracking."
    }
  ],
  useCases: [
    {
      title: "App Install Campaigns",
      text: "Track installs, opens, and high-value in-app milestones for acquisition campaigns."
    },
    {
      title: "Re-Engagement Journeys",
      text: "Connect return-user campaigns to the same lifecycle events used elsewhere in growth reporting."
    },
    {
      title: "Deferred Deep Links",
      text: "Measure deep-link journeys that start in ads and complete after installation."
    },
    {
      title: "Web-To-App Funnels",
      text: "Link site intent and app completion behavior without losing attribution context."
    },
    {
      title: "Mobile Product Teams",
      text: "Give product, growth, and performance teams a shared read on activation and revenue events."
    },
    {
      title: "Cross-Platform Reporting",
      text: "Compare app and web outcomes through one event model instead of two competing definitions."
    }
  ]
};

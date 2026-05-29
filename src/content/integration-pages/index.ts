import type { IntegrationItem } from "./types";
import { bing } from "./bing";
import { branch } from "./branch";
import { facebook_pixel } from "./facebook-pixel";
import { floodlight } from "./floodlight";
import { google_ads } from "./google-ads";
import { google_analytics } from "./google-analytics";
import { google_analytics_4 } from "./google-analytics-4";
import { google_maps_rwg } from "./google-maps-rwg";
import { hubspot } from "./hubspot";
import { ihire } from "./ihire";
import { impact_radius } from "./impact-radius";
import { indeed } from "./indeed";
import { linkedin_insights } from "./linkedin-insights";
import { mixpanel } from "./mixpanel";
import { outbrain } from "./outbrain";
import { pinterest } from "./pinterest";
import { podsights } from "./podsights";
import { quora } from "./quora";
import { reddit } from "./reddit";
import { segment } from "./segment";
import { snapchat } from "./snapchat";
import { taboola } from "./taboola";
import { tatari } from "./tatari";
import { tiktok } from "./tiktok";
import { twitter } from "./twitter";
import { upward } from "./upward";
import { ziprecruiter } from "./ziprecruiter";
import { posthog } from "./posthog";
import { counterscale } from "./counterscale";

export const integrationItems = [
  bing,
  branch,
  facebook_pixel,
  floodlight,
  google_ads,
  google_analytics,
  google_analytics_4,
  google_maps_rwg,
  hubspot,
  ihire,
  impact_radius,
  indeed,
  linkedin_insights,
  mixpanel,
  outbrain,
  pinterest,
  podsights,
  quora,
  reddit,
  segment,
  snapchat,
  taboola,
  tatari,
  tiktok,
  twitter,
  upward,
  ziprecruiter,
  posthog,
  counterscale,
] as const satisfies readonly IntegrationItem[];

export type { IntegrationCard, IntegrationItem } from "./types";

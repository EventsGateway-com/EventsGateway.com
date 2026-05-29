export type IntegrationCard = {
  title: string;
  text: string;
};

export type IntegrationItem = {
  slug: string;
  label: string;
  title: string;
  summary: string;
  hero: string;
  repository: string;
  whyTitle: string;
  whyDescription: string;
  useCasesTitle: string;
  useCasesDescription: string;
  ctaTitle: string;
  ctaText: string;
  reasons: IntegrationCard[];
  useCases: IntegrationCard[];
};

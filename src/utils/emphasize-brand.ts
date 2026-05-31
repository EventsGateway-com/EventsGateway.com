const brandPattern = /EVENTS Gateway/g;

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const emphasizeBrand = (value?: string) => {
  if (!value) {
    return undefined;
  }

  return escapeHtml(value).replace(brandPattern, "<strong>EVENTS Gateway</strong>");
};

export const emphasizeBrandInHtml = (value?: string) => {
  if (!value) {
    return undefined;
  }

  return value.replace(brandPattern, "<strong>EVENTS Gateway</strong>");
};

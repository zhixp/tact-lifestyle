import sanitizeHtml from "sanitize-html";

/**
 * Sanitizes the small subset of HTML used by product descriptions and policies.
 * Content is currently bundled with the storefront, but keeping this boundary
 * means a future CMS or catalog import cannot inject executable markup.
 */
export function sanitizeRichHtml(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [
      "a",
      "blockquote",
      "br",
      "div",
      "em",
      "h2",
      "h3",
      "h4",
      "li",
      "ol",
      "p",
      "span",
      "strong",
      "ul",
    ],
    allowedAttributes: {
      a: ["href", "title"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attributes) => ({
        tagName: "a",
        attribs: {
          ...attributes,
          rel: "noopener noreferrer",
        },
      }),
    },
  });
}

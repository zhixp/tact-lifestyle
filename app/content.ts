import content from "./content.json";

export type PolicyKey = "privacy" | "shipping" | "refund";

export function cleanLiveText(value: string) {
  return value
    .replaceAll("â€“", "–")
    .replaceAll("â€”", "—")
    .replaceAll("â€™", "’")
    .replaceAll("â€œ", "“")
    .replaceAll("â€", "”")
    .replaceAll("â‚¹", "₹")
    .replaceAll("Â", "");
}

export function getPolicy(key: PolicyKey) {
  const policy = content[key];
  return {
    title: cleanLiveText(policy.title),
    html: cleanLiveText(policy.html),
  };
}

export const aboutContent = {
  title: content.about.title,
  text: cleanLiveText(content.about.text),
};

export const contactContent = {
  title: content.contact.title,
  text: cleanLiveText(content.contact.text),
};

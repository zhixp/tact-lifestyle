import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const productsSource = JSON.parse(
  await fs.readFile(path.join(root, "audit", "live-products.json"), "utf8"),
).products;
const collectionsSource = JSON.parse(
  await fs.readFile(path.join(root, "audit", "live-collections.json"), "utf8"),
).collections;
const contentSource = JSON.parse(
  await fs.readFile(path.join(root, "audit", "live-content.json"), "utf8"),
);
const collectionMemberships = JSON.parse(
  (
    await fs.readFile(
      path.join(root, "audit", "live-collection-products.json"),
      "utf8",
    )
  ).replace(/^\uFEFF/, ""),
);

const decodeEntities = (value = "") =>
  value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const stripHtml = (value = "") =>
  decodeEntities(
    value
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/p>|<\/li>|<\/h\d>/gi, " ")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/\s+/g, " ")
    .trim();

const listItems = (value = "") =>
  [...value.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((match) => stripHtml(match[1]))
    .filter(Boolean);

function categoryFor(title, tags) {
  const value = `${title} ${tags.join(" ")}`.toLowerCase();
  if (value.includes("co-ord")) return "Co-ords";
  if (value.includes("hoodie")) return "Hoodies";
  if (value.includes("jogger")) return "Joggers";
  if (value.includes("sweatshirt")) return "Sweatshirts";
  if (value.includes("short")) return "Shorts";
  if (value.includes("cropped") || value.includes("crop top")) {
    return "Cropped tops";
  }
  if (value.includes("sleeveless")) return "Sleeveless";
  if (value.includes("oversized")) return "Oversized tees";
  return "Essentials";
}

function colorFor(title) {
  const colors = [
    "Shadow Blue",
    "Olive Green",
    "Cement Blue",
    "Hot Red",
    "Snow White",
    "White/Navy",
    "Lavender",
    "Lilac",
    "Onion",
    "Mocha",
    "Beige",
    "Cream",
    "Black",
    "White",
    "Red",
    "Blue",
  ];
  return colors.find((color) =>
    title.toLowerCase().includes(color.toLowerCase()),
  ) ?? "TACT original";
}

function badgeFor(product) {
  const price = Number(product.variants[0]?.price ?? 0);
  const compareAt = Number(product.variants[0]?.compare_at_price ?? 0);
  if (compareAt > price) return "Sale";
  const published = new Date(product.published_at).getTime();
  if (published > Date.now() - 1000 * 60 * 60 * 24 * 120) return "New";
  return undefined;
}

const imageTasks = [];
const catalog = productsSource.map((product) => {
  const images = product.images.map((image, index) => {
    const relative = `/assets/products/${product.handle}/${index + 1}.webp`;
    imageTasks.push({
      source: image.src,
      destination: path.join(root, "public", relative.replace(/^\//, "")),
      label: `${product.handle}/${index + 1}`,
    });
    return relative;
  });

  const price = Number(product.variants[0]?.price ?? 0);
  const compareAt = Math.max(
    ...product.variants.map((variant) =>
      Number(variant.compare_at_price ?? 0),
    ),
    0,
  );
  const description = stripHtml(product.body_html);
  const firstParagraph =
    stripHtml(product.body_html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? "") ||
    description;
  const tags = Array.isArray(product.tags)
    ? product.tags
    : String(product.tags ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

  return {
    id: String(product.id),
    handle: product.handle,
    name: product.title,
    vendor: product.vendor,
    price,
    compareAt: compareAt > price ? compareAt : null,
    category: categoryFor(product.title, tags),
    tag: badgeFor(product) ?? null,
    color: colorFor(product.title),
    sizes: [
      ...new Set(
        product.variants
          .filter((variant) => variant.available)
          .map((variant) => variant.option1 || variant.title),
      ),
    ],
    images,
    imageSources: product.images.map((image) => image.src),
    intro: firstParagraph,
    description,
    descriptionHtml: product.body_html,
    details: listItems(product.body_html),
    tags,
    collections: Object.entries(collectionMemberships)
      .filter(([, handles]) => handles.includes(product.handle))
      .map(([handle]) => handle),
    publishedAt: product.published_at,
    has240Gsm: /240\s*GSM/i.test(product.body_html),
    variants: product.variants.map((variant) => ({
      id: String(variant.id),
      title: variant.title,
      size: variant.option1 || variant.title,
      price: Number(variant.price),
      compareAt: variant.compare_at_price
        ? Number(variant.compare_at_price)
        : null,
      available: Boolean(variant.available),
      sku: variant.sku || "",
    })),
  };
});

const collectionImages = [];
const collections = collectionsSource.map((collection) => {
  let image = null;
  if (collection.image?.src) {
    image = `/assets/collections/${collection.handle}.webp`;
    imageTasks.push({
      source: collection.image.src,
      destination: path.join(root, "public", image.replace(/^\//, "")),
      label: `collection/${collection.handle}`,
    });
    collectionImages.push(image);
  }
  return {
    id: String(collection.id),
    name: collection.title,
    handle: collection.handle,
    description: stripHtml(collection.body_html),
    image,
  };
});

let completed = 0;
let failures = 0;

async function downloadImage(task) {
  try {
    await fs.mkdir(path.dirname(task.destination), { recursive: true });
    try {
      const stat = await fs.stat(task.destination);
      if (stat.size > 5000) {
        completed += 1;
        return;
      }
    } catch {}

    const url = new URL(task.source);
    url.searchParams.set("width", "1400");
    const response = await fetch(url, {
      headers: { Accept: "image/avif,image/webp,image/*" },
    });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const input = Buffer.from(await response.arrayBuffer());
    await sharp(input)
      .rotate()
      .resize({ width: 1400, withoutEnlargement: true })
      .webp({ quality: 84, effort: 4, smartSubsample: true })
      .toFile(task.destination);
    completed += 1;
    if (completed % 20 === 0 || completed === imageTasks.length) {
      console.log(`media ${completed}/${imageTasks.length}`);
    }
  } catch (error) {
    failures += 1;
    console.error(`FAILED ${task.label}: ${error.message}`);
  }
}

async function runPool(tasks, concurrency) {
  let next = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (next < tasks.length) {
      const task = tasks[next];
      next += 1;
      await downloadImage(task);
    }
  });
  await Promise.all(workers);
}

console.log(
  `Importing ${catalog.length} products, ${collections.length} collections and ${imageTasks.length} media files`,
);
await runPool(imageTasks, 8);

await fs.writeFile(
  path.join(root, "app", "catalog.json"),
  `${JSON.stringify({ products: catalog, collections }, null, 2)}\n`,
  "utf8",
);
await fs.writeFile(
  path.join(root, "app", "content.json"),
  `${JSON.stringify(contentSource, null, 2)}\n`,
  "utf8",
);

console.log(
  `Done: ${catalog.length} products, ${completed} media files, ${failures} failures`,
);
if (failures) process.exitCode = 1;

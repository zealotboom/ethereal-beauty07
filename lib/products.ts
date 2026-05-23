import type { Product } from "@/lib/types";

const image = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const names = [
  "Noir Bias Silk Dress",
  "Gilded Tuxedo Blazer",
  "Moonlit Satin Slip",
  "Obsidian Wide Trouser",
  "Champagne Knit Column",
  "Velvet Opera Coat",
  "Ivory Sculpted Shirt",
  "Bronze Pleated Skirt",
  "Black Cashmere Shell",
  "Aurelia Halter Gown"
];

const imageIds = [
  "photo-1539109136881-3be0616acf4b",
  "photo-1496747611176-843222e1e57c",
  "photo-1515886657613-9f3515b0c78f",
  "photo-1529139574466-a303027c1d8b",
  "photo-1520975954732-35dd22299614",
  "photo-1509631179647-0177331693ae",
  "photo-1483985988355-763728e1935b",
  "photo-1490481651871-ab68de25d43d",
  "photo-1503342217505-b0a15ec3261c",
  "photo-1515372039744-b8f02a3ae446"
];

const categories = ["Dresses", "Tailoring", "Knitwear", "Outerwear", "Separates"];
const fits = ["slim-cut", "tapered", "structured shoulders", "relaxed drape", "column silhouette"];
const palettes = [
  ["#080808", "#C9A84C"],
  ["#F0EDE6", "#111111"],
  ["#6E1F2F", "#C9A84C"],
  ["#1E2A37", "#E8C97A"],
  ["#3C2F2F", "#F0EDE6"]
];

export const products: Product[] = Array.from({ length: 50 }, (_, index) => {
  const base = index % names.length;
  const category = categories[index % categories.length];

  return {
    id: `prod-${String(index + 1).padStart(2, "0")}`,
    name: `${names[base]} ${index > 9 ? "No. " + (index + 1) : ""}`.trim(),
    description:
      "A sharply finished luxury piece with fluid movement, precise construction, and an editorial silhouette designed for evening light.",
    price: 160 + (index % 9) * 35,
    salePrice: index % 7 === 0 ? 145 + (index % 9) * 30 : undefined,
    category,
    images: [image(imageIds[base]), image(imageIds[(base + 3) % imageIds.length])],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: palettes[index % palettes.length],
    stock: 8 + (index % 18),
    tags: [category.toLowerCase(), fits[index % fits.length], index % 2 ? "warm tone" : "cool tone"],
    fit: fits[index % fits.length]
  };
});

export const featuredProducts = products.slice(0, 8);
export const trendingProducts = products.slice(8, 14);

export function getProduct(id: string) {
  return products.find((product) => product.id === id);
}

export function curatedProducts(colors: string[] = [], fits: string[] = []) {
  const terms = [...colors, ...fits].map((term) => term.toLowerCase());
  return products
    .map((product) => ({
      product,
      score: product.tags.filter((tag) => terms.some((term) => tag.includes(term))).length
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(({ product }) => product);
}

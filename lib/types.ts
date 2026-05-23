export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  tags: string[];
  fit: string;
};

export type CartLine = {
  product: Product;
  size: string;
  color: string;
  quantity: number;
};

export type StyleProfile = {
  bodyType: string;
  skinTone: string;
  skinUndertone: "warm" | "cool" | "neutral";
  recommendedFits: string[];
  recommendedColors: string[];
  recommendedColorNames: string[];
  avoidPatterns: string[];
  stylePersonality: string;
  outfitSuggestions: string[];
};

export type FindThisFeatures = {
  garmentType: string;
  primaryColor: string;
  secondaryColors: string[];
  pattern: string;
  fit: string;
  neckline: string;
  sleeveType: string;
  styleCategory: string;
  searchKeywords: string[];
};

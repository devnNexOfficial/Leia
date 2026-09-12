import catSkincare from "@/assets/cat-skincare.jpg";
import catEyes from "@/assets/cat-eyes.jpg";
import catFace from "@/assets/cat-face.jpg";

export type Category = {
  slug: string;
  name: string;
  blurb: string;
  count: number;
  image: string;
};

// These are only used while categories are loading or when none have been
// configured in Supabase yet. Storefront products always come from Supabase.
export const categories: Category[] = [
  {
    slug: "eyes",
    name: "Eyes",
    blurb: "Mascara, Eyeliner, Eyeshadow palettes — make your eyes pop.",
    count: 51,
    image: catEyes,
  },
  {
    slug: "face",
    name: "Face",
    blurb: "Foundation, Concealer, Blush, Highlighter — flawless base.",
    count: 37,
    image: catFace,
  },
  {
    slug: "skincare",
    name: "Skincare",
    blurb: "Toner, Serum, Moisturizer — nourish and prep your skin.",
    count: 42,
    image: catSkincare,
  },
];

export type Shade = {
  id?: string;
  name: string;
  hex: string;
  stockCount?: number;
  priceOverride?: number | null;
  family?: "Pink" | "Rose" | "Nude" | "Berry" | "Red" | "Gold" | "Brown" | "Clear" | "Orange" | "Coral";
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  shade: string;
  verified: boolean;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  hoverImage?: string;
  gallery?: string[];
  shades: Shade[];
  size?: string;
  skinType?: string;
  keyBenefit?: string;
  finish?: string;
  isBestseller?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  dateAdded: string;
  rating: number;
  reviewCount: number;
  stockCount?: number;
  ingredientsText?: string;
  directions?: string;
  shortDescription?: string;
  fullDescription?: string;
  ingredients?: {
    keyActives: { name: string; benefit: string }[];
    fullList: string;
  };
  reviews?: Review[];
};

export const formatPKR = (value: number) => `PKR ${value.toLocaleString("en-PK")}`;

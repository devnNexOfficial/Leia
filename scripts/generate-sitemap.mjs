import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// 1. Determine siteUrl from environment or fallback
function getSiteUrl() {
  if (process.env.VITE_SITE_URL) {
    return process.env.VITE_SITE_URL.replace(/\/+$/, "");
  }
  // Try reading from .env or .env.local
  for (const envFile of [".env.local", ".env"]) {
    const envPath = path.join(rootDir, envFile);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      const match = content.match(/VITE_SITE_URL=(.+)/);
      if (match && match[1]) {
        return match[1].trim().replace(/\/+$/, "");
      }
    }
  }
  return "https://www.leiacosmetics.store";
}

const siteUrl = getSiteUrl();
const today = new Date().toISOString().split("T")[0];

// 2. Fetch dynamic products and categories from Supabase (with static fallback)
async function fetchCatalogData() {
  let supabaseUrl = process.env.VITE_SUPABASE_URL;
  let supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    for (const envFile of [".env.local", ".env"]) {
      const envPath = path.join(rootDir, envFile);
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf8");
        const urlMatch = content.match(/VITE_SUPABASE_URL=(.+)/);
        const keyMatch = content.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
        if (urlMatch && !supabaseUrl) supabaseUrl = urlMatch[1].trim();
        if (keyMatch && !supabaseAnonKey) supabaseAnonKey = keyMatch[1].trim();
      }
    }
  }

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const [productsRes, categoriesRes] = await Promise.all([
        supabase
          .from("products")
          .select("id, name, created_at")
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("categories")
          .select("id, name, created_at")
          .order("display_order", { ascending: true }),
      ]);

      return {
        products: productsRes.data || [],
        categories: categoriesRes.data || [],
      };
    } catch (err) {
      console.warn("⚠️ [Sitemap]: Could not query Supabase directly, using fallback list:", err.message);
    }
  }

  return { products: [], categories: [] };
}

// 3. Static public pages (strictly excluding cart, checkout, confirmation, admin, login)
const staticPages = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/shop", priority: "0.9", changefreq: "daily" },
  { path: "/reviews", priority: "0.8", changefreq: "weekly" },
  { path: "/blog", priority: "0.8", changefreq: "weekly" },
  { path: "/about", priority: "0.7", changefreq: "monthly" },
  { path: "/contact", priority: "0.7", changefreq: "monthly" },
  { path: "/faqs", priority: "0.7", changefreq: "monthly" },
  { path: "/track-order", priority: "0.6", changefreq: "monthly" },
  { path: "/authorised-sellers", priority: "0.6", changefreq: "monthly" },
  { path: "/wholesale", priority: "0.6", changefreq: "monthly" },
  { path: "/careers", priority: "0.5", changefreq: "monthly" },
  { path: "/shipping", priority: "0.5", changefreq: "monthly" },
  { path: "/returns", priority: "0.5", changefreq: "monthly" },
  { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms-of-service", priority: "0.3", changefreq: "yearly" },
  { path: "/cookie-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/accessibility", priority: "0.3", changefreq: "yearly" },
];

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function generateSitemap() {
  console.log(`Generating sitemap for: ${siteUrl}`);
  const { products, categories } = await fetchCatalogData();

  const urls = [];

  // 1. Static Pages
  for (const page of staticPages) {
    const loc = page.path === "/" ? `${siteUrl}/` : `${siteUrl}${page.path}`;
    urls.push({
      loc,
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority,
      label: `Static: ${page.path}`,
    });
  }

  // 2. Category Pages (/shop?category=...)
  const fallbackCategoryNames = ["Skin Care", "Makeup / Color Cosmetics", "Haircare", "Fragrance", "Tools & Accessories", "Bath & Body"];
  const categoryNames = categories.length > 0 ? categories.map((c) => c.name) : fallbackCategoryNames;

  for (const catName of categoryNames) {
    const encoded = encodeURIComponent(catName);
    urls.push({
      loc: `${siteUrl}/shop?category=${encoded}`,
      lastmod: today,
      changefreq: "daily",
      priority: "0.85",
      label: `Category: ${catName}`,
    });
  }

  // 3. Dynamic Products
  for (const product of products) {
    const pDate = product.created_at ? product.created_at.split("T")[0] : today;
    urls.push({
      loc: `${siteUrl}/product/${product.id}`,
      lastmod: pDate,
      changefreq: "weekly",
      priority: "0.8",
      label: `Product: ${product.name}`,
    });
  }

  // Build well-formed XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const u of urls) {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(u.loc)}</loc>\n`;
    xml += `    <lastmod>${u.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
    xml += `    <priority>${u.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;

  const outputPath = path.join(rootDir, "public", "sitemap.xml");
  fs.writeFileSync(outputPath, xml, "utf8");

  console.log(`✅ [Sitemap]: Generated successfully at ${outputPath} (${urls.length} URLs included)`);
  return urls;
}

generateSitemap().catch((err) => {
  console.error("❌ [Sitemap Generator Error]:", err);
  process.exit(1);
});

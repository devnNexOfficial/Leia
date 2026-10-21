// verify-anon-security.mjs
// Run with: node verify-anon-security.mjs
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Read environment variables from .env
const env = Object.fromEntries(
  fs.readFileSync(".env", "utf8")
    .split("\n")
    .filter((line) => line.includes("=") && !line.startsWith("#"))
    .map((line) => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const anonClient = createClient(supabaseUrl, supabaseAnonKey);

async function runChecks() {
  console.log("Checking anon access permissions...\n");

  // Check 1: SELECT from product_wholesale_prices as anon
  const { data: wholesaleData, error: wholesaleError } = await anonClient
    .from("product_wholesale_prices")
    .select("*");

  const wholesaleProtected =
    (wholesaleError != null) || (Array.isArray(wholesaleData) && wholesaleData.length === 0);

  console.log("1. product_wholesale_prices query with anon key:");
  console.log(`   - Error:`, wholesaleError ? wholesaleError.message : "None");
  console.log(`   - Rows returned:`, wholesaleData ? wholesaleData.length : 0);
  console.log(
    `   -> Result: ${wholesaleProtected ? "PASS (Zero rows exposed to anon)" : "FAIL (Data leaked!)"}`
  );

  // Check 2: SELECT * from products to confirm no wholesale column exists
  const { data: productsData, error: productsError } = await anonClient
    .from("products")
    .select("*")
    .limit(1);

  if (productsError) {
    console.error("Failed to query products:", productsError.message);
    return;
  }

  const sampleProduct = productsData?.[0] || {};
  const hasWholesaleColumn = Object.keys(sampleProduct).some((key) =>
    key.toLowerCase().includes("wholesale")
  );

  console.log("\n2. products table schema inspection:");
  console.log(`   - Keys in products:`, Object.keys(sampleProduct).join(", "));
  console.log(
    `   -> Result: ${!hasWholesaleColumn ? "PASS (No wholesale columns on products)" : "FAIL (Wholesale column present!)"}`
  );
}

runChecks();

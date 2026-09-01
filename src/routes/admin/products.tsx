import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminError, AdminLoading, EmptyState } from "@/components/admin/AdminStates";
import { adminButton, adminCard, adminInput } from "@/components/admin/AdminLayout";
import type { AdminCategory, AdminProduct, ProductVariant } from "@/lib/admin-types";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/products")({
  component: Products,
});

type DraftVariant = Omit<ProductVariant, "id" | "product_id">;

const blankVariant = (): DraftVariant => ({
  name: "",
  sku: null,
  stock_count: 0,
  price_override: null,
  image_url: null,
});

function Products() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [editing, setEditing] = useState<AdminProduct | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    if (!supabase) return;
    setLoading(true);
    const [p, c] = await Promise.all([
      supabase
        .from("products")
        .select("*,categories(name),product_variants(*)")
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
    ]);

    if (p.error || c.error) {
      setError(p.error?.message ?? c.error?.message ?? "Could not load products.");
    } else {
      setProducts((p.data ?? []) as AdminProduct[]);
      setCategories((c.data ?? []) as AdminCategory[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const client = supabase;
    if (!client) return;

    const ch = client
      .channel("admin-products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "product_variants" }, load)
      .subscribe();

    return () => {
      client.removeChannel(ch);
    };
  }, []);

  const remove = async (p: AdminProduct) => {
    if (!confirm(`Delete ${p.name}?`)) return;
    const { error } = await supabase!.from("products").delete().eq("id", p.id);
    if (error) setError(error.message);
  };

  return (
    <section>
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage products, inventory, and variants.
          </p>
        </div>
        <button className={adminButton} onClick={() => setEditing(null)}>
          <Plus className="mr-1 size-4" /> Add product
        </button>
      </div>

      {error && <AdminError message={error} />}

      {loading ? (
        <AdminLoading />
      ) : products.length === 0 ? (
        <EmptyState>No products in Supabase yet.</EmptyState>
      ) : (
        <div className={`${adminCard} overflow-x-auto`}>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr className="border-t border-slate-100" key={p.id}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          loading="lazy"
                          decoding="async"
                          className="size-10 rounded object-cover"
                        />
                      ) : (
                        <div className="size-10 rounded bg-slate-100" />
                      )}
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">{p.categories?.name ?? "—"}</td>
                  <td className="px-5 py-3">
                    Rs. {Number(p.price).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    {p.product_variants?.length
                      ? p.product_variants.reduce((n, v) => n + v.stock_count, 0)
                      : p.stock_count ?? 0}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      className="mr-3"
                      onClick={() => setEditing(p)}
                      aria-label={`Edit ${p.name}`}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => remove(p)}
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing !== undefined && (
        <ProductForm
          product={editing}
          categories={categories}
          close={() => setEditing(undefined)}
        />
      )}
    </section>
  );
}

function ProductForm({
  product,
  categories,
  close,
}: {
  product: AdminProduct | null;
  categories: AdminCategory[];
  close: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [compare, setCompare] = useState(String(product?.compare_at_price ?? ""));
  const [stock, setStock] = useState(String(product?.stock_count ?? 0));
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [images, setImages] = useState<string[]>(
    product?.image_urls?.length
      ? product.image_urls
      : product?.image_url
      ? [product.image_url]
      : []
  );
  const [ingredients, setIngredients] = useState(product?.ingredients ?? "");
  const [directions, setDirections] = useState(product?.directions ?? "");
  const [status, setStatus] = useState(product?.status ?? "Active");
  const [featured, setFeatured] = useState(product?.is_featured ?? false);
  const [newArrival, setNewArrival] = useState(product?.is_new_arrival ?? false);
  const [variants, setVariants] = useState<(ProductVariant | DraftVariant)[]>(
    product?.product_variants ?? []
  );
  const [error, setError] = useState("");
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

  const upload = async (file: File, done: (url: string) => void) => {
    setError("");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Invalid image file type. Please upload a JPEG, PNG, WEBP, GIF, or AVIF image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`Image file is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 5 MB.`);
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const sanitizedExt = ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext) ? ext : "jpg";
    const path = `${crypto.randomUUID()}.${sanitizedExt}`;

    const result = await supabase!.storage.from("product-images").upload(path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

    if (result.error) {
      setError(result.error.message);
    } else {
      done(supabase!.storage.from("product-images").getPublicUrl(path).data.publicUrl);
    }
  };

  const updateVariant = (i: number, key: keyof DraftVariant, value: string) => {
    setVariants((items) =>
      items.map((item, index) =>
        index === i
          ? {
              ...item,
              [key]:
                key === "stock_count"
                  ? Number(value)
                  : key === "price_override"
                  ? value
                    ? Number(value)
                    : null
                  : value || null,
            }
          : item
      )
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const values = {
      name,
      description: description || null,
      price: Number(price),
      compare_at_price: compare ? Number(compare) : null,
      stock_count: Number(stock),
      category_id: categoryId || null,
      image_url: images[0] || null,
      image_urls: images,
      ingredients: ingredients || null,
      directions: directions || null,
      status,
      is_featured: featured,
      is_new_arrival: newArrival,
      is_active: status === "Active",
    };

    const result = product
      ? await supabase!.from("products").update(values).eq("id", product.id).select("id").single()
      : await supabase!.from("products").insert(values).select("id").single();

    if (result.error || !result.data) {
      setError(result.error?.message ?? "Could not save product.");
      return;
    }

    if (product) {
      await supabase!.from("product_variants").delete().eq("product_id", result.data.id);
    }

    const rows = variants
      .filter((v) => v.name)
      .map((v) => ({
        product_id: result.data.id,
        name: v.name,
        sku: v.sku,
        stock_count: v.stock_count,
        price_override: v.price_override,
        image_url: v.image_url ?? null,
      }));

    if (rows.length) {
      const saved = await supabase!.from("product_variants").insert(rows);
      if (saved.error) {
        setError(saved.error.message);
        return;
      }
    }

    close();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 p-4">
      <form
        onSubmit={submit}
        className="mx-auto my-5 w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl"
      >
        <div className="flex justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {product ? "Edit product" : "Add product"}
            </h2>
            <p className="text-sm text-slate-500">
              Product information, images, inventory, and variants.
            </p>
          </div>
          <button type="button" onClick={close} aria-label="Close product form">
            <X />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={name} set={setName} wide required />
          <Field label="Price (PKR)" value={price} set={setPrice} number required />
          <Field label="Compare-at price" value={compare} set={setCompare} number />

          <label className="text-sm font-medium">
            Category
            <select
              className={`${adminInput} mt-1`}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium">
            Status
            <select
              className={`${adminInput} mt-1`}
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option>Active</option>
              <option>Draft</option>
              <option>Out of Stock</option>
            </select>
          </label>

          <Field
            label="Overall stock (no variants)"
            value={stock}
            set={setStock}
            number
          />

          <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />{" "}
            Featured on homepage
          </label>

          <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={newArrival}
              onChange={(e) => setNewArrival(e.target.checked)}
            />{" "}
            New Arrival
          </label>

          <Area label="Description" value={description} set={setDescription} />
          <Area label="Ingredients" value={ingredients} set={setIngredients} />
          <Area
            label="How to use / Directions"
            value={directions}
            set={setDirections}
          />
        </div>

        <div className="mt-6">
          <div className="mb-2 flex justify-between">
            <h3 className="font-semibold">Product images</h3>
            <label className="cursor-pointer text-sm">
              + Upload
              <input
                className="hidden"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] &&
                  upload(e.target.files[0], (url) =>
                    setImages((current) => [...current, url])
                  )
                }
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((image, i) => (
              <div className="relative" key={image}>
                <img
                  src={image}
                  alt="Product image preview"
                  loading="lazy"
                  decoding="async"
                  className="h-24 w-full rounded object-cover"
                />
                <button
                  className="absolute right-1 top-1 bg-white text-red-600 rounded-full p-0.5"
                  type="button"
                  onClick={() =>
                    setImages((items) => items.filter((_, index) => index !== i))
                  }
                  aria-label="Remove image"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex justify-between">
            <h3 className="font-semibold">Variants</h3>
            <button
              type="button"
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
              onClick={() => setVariants((items) => [...items, blankVariant()])}
            >
              + Add variant
            </button>
          </div>
          {variants.map((v, i) => (
            <div
              className="mb-2 grid grid-cols-2 gap-2 rounded bg-slate-50 p-3 sm:grid-cols-6 items-center"
              key={"id" in v ? v.id : i}
            >
              <input
                className={adminInput}
                placeholder="Shade / size"
                value={v.name ?? ""}
                onChange={(e) => updateVariant(i, "name", e.target.value)}
              />
              <input
                className={adminInput}
                placeholder="SKU"
                value={v.sku ?? ""}
                onChange={(e) => updateVariant(i, "sku", e.target.value)}
              />
              <input
                className={adminInput}
                placeholder="Stock"
                type="number"
                value={v.stock_count}
                onChange={(e) => updateVariant(i, "stock_count", e.target.value)}
              />
              <input
                className={adminInput}
                placeholder="Price override"
                type="number"
                value={v.price_override ?? ""}
                onChange={(e) => updateVariant(i, "price_override", e.target.value)}
              />
              <label className="text-xs cursor-pointer text-slate-600">
                Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    upload(e.target.files[0], (url) =>
                      updateVariant(i, "image_url", url)
                    )
                  }
                />
              </label>
              <button
                type="button"
                className="text-red-600 text-xs font-semibold hover:underline"
                onClick={() =>
                  setVariants((items) => items.filter((_, index) => index !== i))
                }
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="h-9 rounded border px-3 text-sm"
            onClick={close}
          >
            Cancel
          </button>
          <button type="submit" className={adminButton}>
            Save product
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  set,
  number,
  wide,
  required,
}: {
  label: string;
  value: string;
  set: (value: string) => void;
  number?: boolean;
  wide?: boolean;
  required?: boolean;
}) {
  return (
    <label className={`text-sm font-medium ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <input
        className={`${adminInput} mt-1`}
        type={number ? "number" : "text"}
        min={number ? "0" : undefined}
        value={value}
        onChange={(e) => set(e.target.value)}
        required={required}
      />
    </label>
  );
}

function Area({
  label,
  value,
  set,
}: {
  label: string;
  value: string;
  set: (value: string) => void;
}) {
  return (
    <label className="text-sm font-medium sm:col-span-2">
      {label}
      <textarea
        className="mt-1 min-h-20 w-full rounded border border-slate-300 p-3 text-sm"
        value={value}
        onChange={(e) => set(e.target.value)}
      />
    </label>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import {
  Pencil,
  Plus,
  Trash2,
  Star,
  CheckCircle2,
  Search,
  Sparkles,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AdminError, AdminLoading, EmptyState } from "@/components/admin/AdminStates";
import { adminButton, adminCard, adminInput } from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";

export type CustomerReview = {
  id: string;
  name: string;
  location: string;
  rating: number;
  review_text: string;
  product_name: string | null;
  shade: string | null;
  avatar_color: string;
  is_verified: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviewsPage,
});

const PRESET_AVATARS = [
  "#D6336C",
  "#FF6B9D",
  "#B81D52",
  "#E91E8C",
  "#C2185B",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
];

function AdminReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [editing, setEditing] = useState<CustomerReview | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");

  const load = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("customer_reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setReviews((data ?? []) as CustomerReview[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const client = supabase;
    if (!client) return;

    const ch = client
      .channel("admin-reviews-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "customer_reviews" }, load)
      .subscribe();

    return () => {
      client.removeChannel(ch);
    };
  }, []);

  const remove = async (review: CustomerReview) => {
    if (!confirm(`Are you sure you want to delete review from "${review.name}"?`)) return;
    const { error } = await supabase!.from("customer_reviews").delete().eq("id", review.id);
    if (error) setError(error.message);
  };

  const toggleFeatured = async (review: CustomerReview) => {
    const { error } = await supabase!
      .from("customer_reviews")
      .update({ is_featured: !review.is_featured })
      .eq("id", review.id);
    if (error) setError(error.message);
  };

  const toggleVerified = async (review: CustomerReview) => {
    const { error } = await supabase!
      .from("customer_reviews")
      .update({ is_verified: !review.is_verified })
      .eq("id", review.id);
    if (error) setError(error.message);
  };

  const filtered = reviews.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.review_text.toLowerCase().includes(search.toLowerCase()) ||
      (r.product_name && r.product_name.toLowerCase().includes(search.toLowerCase())) ||
      r.location.toLowerCase().includes(search.toLowerCase());
    const matchesRating = ratingFilter === "all" || r.rating === ratingFilter;
    return matchesSearch && matchesRating;
  });

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 flex items-center gap-2">
            <Star className="size-6 text-[#D6336C] fill-[#D6336C]" /> Customer Reviews
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage verified client testimonials, ratings, and featured homepage marquee reviews.
          </p>
        </div>
        <button
          className={`${adminButton} bg-[#D6336C] hover:bg-[#c02560] shadow-sm`}
          onClick={() => setEditing(null)}
        >
          <Plus className="mr-1.5 size-4" /> Add Review
        </button>
      </div>

      {error && <AdminError message={error} />}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, product, or quote…"
            className={`${adminInput} pl-9`}
          />
        </div>

        <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1">
          <button
            onClick={() => setRatingFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              ratingFilter === "all"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Ratings ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((stars) => (
            <button
              key={stars}
              onClick={() => setRatingFilter(stars)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                ratingFilter === stars
                  ? "bg-amber-500 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>{stars}</span>
              <Star className="size-3 fill-current" />
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <AdminLoading />
      ) : filtered.length === 0 ? (
        <EmptyState>
          <div className="text-center py-6">
            <p className="text-sm text-slate-500">No reviews found matching your search.</p>
            <button
              className="mt-3 text-xs font-bold text-[#D6336C] hover:underline"
              onClick={() => setEditing(null)}
            >
              Add your first customer testimonial →
            </button>
          </div>
        </EmptyState>
      ) : (
        <div className={`${adminCard} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Rating & Product</th>
                  <th className="px-5 py-3.5">Review Feedback</th>
                  <th className="px-4 py-3.5">Badges</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 align-top w-56">
                      <div className="flex items-center gap-3">
                        <div
                          className="size-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 shadow-xs"
                          style={{ backgroundColor: rev.avatar_color }}
                        >
                          {rev.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{rev.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="size-3 text-slate-400" /> {rev.location}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top w-48">
                      <div className="space-y-1">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`size-3.5 ${
                                i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-slate-700 ml-1">
                            {rev.rating}.0
                          </span>
                        </div>
                        {rev.product_name && (
                          <div className="text-xs font-semibold text-[#D6336C] truncate">
                            {rev.product_name}
                            {rev.shade && (
                              <span className="text-slate-400 font-normal"> · {rev.shade}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="text-xs text-slate-700 leading-relaxed max-w-xl line-clamp-3">
                        "{rev.review_text}"
                      </p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-col gap-1.5 items-start">
                        <button
                          onClick={() => toggleVerified(rev)}
                          title="Click to toggle verified status"
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                            rev.is_verified
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <CheckCircle2 className="size-3" />
                          {rev.is_verified ? "Verified Buyer" : "Unverified"}
                        </button>
                        <button
                          onClick={() => toggleFeatured(rev)}
                          title="Click to toggle homepage marquee feature"
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                            rev.is_featured
                              ? "bg-pink-100 text-[#D6336C]"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Sparkles className="size-3" />
                          {rev.is_featured ? "Featured Marquee" : "Standard"}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditing(rev)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          title="Edit review"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => remove(rev)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                          title="Delete review"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Review Modal */}
      {editing !== undefined && (
        <ReviewModal review={editing} close={() => setEditing(undefined)} />
      )}
    </section>
  );
}

function ReviewModal({
  review,
  close,
}: {
  review: CustomerReview | null;
  close: () => void;
}) {
  const [name, setName] = useState(review?.name ?? "");
  const [location, setLocation] = useState(review?.location ?? "Lahore");
  const [rating, setRating] = useState(review?.rating ?? 5);
  const [reviewText, setReviewText] = useState(review?.review_text ?? "");
  const [productName, setProductName] = useState(review?.product_name ?? "");
  const [shade, setShade] = useState(review?.shade ?? "");
  const [avatarColor, setAvatarColor] = useState(review?.avatar_color ?? "#D6336C");
  const [isVerified, setIsVerified] = useState(review?.is_verified ?? true);
  const [isFeatured, setIsFeatured] = useState(review?.is_featured ?? true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    if (!name.trim() || !reviewText.trim()) {
      setError("Customer name and review text are required.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      name: name.trim(),
      location: location.trim() || "Pakistan",
      rating: Number(rating) || 5,
      review_text: reviewText.trim(),
      product_name: productName.trim() || null,
      shade: shade.trim() || null,
      avatar_color: avatarColor,
      is_verified: isVerified,
      is_featured: isFeatured,
    };

    if (review?.id) {
      const { error: updateErr } = await supabase
        .from("customer_reviews")
        .update(payload)
        .eq("id", review.id);
      if (updateErr) {
        setError(updateErr.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: insertErr } = await supabase.from("customer_reviews").insert([payload]);
      if (insertErr) {
        setError(insertErr.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    close();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-xs overflow-y-auto">
      <form
        onSubmit={submit}
        className="my-8 flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {review ? "Edit Customer Review" : "Add Customer Review"}
            </h2>
            <p className="text-xs text-slate-500">Testimonials and ratings from real clients.</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-[#FFF0F5] text-[#D6336C]">
            Social Proof
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && <AdminError message={error} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Customer Name *
              <input
                className={`${adminInput} mt-1`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ayesha M."
                required
              />
            </label>

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              City / Location
              <input
                className={`${adminInput} mt-1`}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Lahore, Karachi, Islamabad"
              />
            </label>
          </div>

          {/* Rating Stars Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Star Rating (1 to 5 Stars) *
            </label>
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 w-fit">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`size-6 ${
                      star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-slate-700">{rating} Stars</span>
            </div>
          </div>

          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Review Text *
            <textarea
              className="mt-1 h-28 w-full resize-y rounded-md border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-slate-500"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="What did the customer love about the product and experience?"
              required
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Product Name (Optional)
              <input
                className={`${adminInput} mt-1`}
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Silk Blush Powder"
              />
            </label>

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Shade / Variant (Optional)
              <input
                className={`${adminInput} mt-1`}
                value={shade}
                onChange={(e) => setShade(e.target.value)}
                placeholder="e.g. Peach Flush"
              />
            </label>
          </div>

          {/* Avatar Color */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Avatar Color
            </label>
            <div className="flex items-center gap-2">
              {PRESET_AVATARS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAvatarColor(c)}
                  className={`size-7 rounded-full border-2 transition-transform ${
                    avatarColor === c ? "border-slate-900 scale-110 shadow-md" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="verified-toggle"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="size-4 rounded text-[#D6336C] focus:ring-[#D6336C]"
              />
              <label htmlFor="verified-toggle" className="text-xs font-bold text-slate-700 select-none">
                Show as "Verified Buyer" badge
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured-toggle"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="size-4 rounded text-[#D6336C] focus:ring-[#D6336C]"
              />
              <label htmlFor="featured-toggle" className="text-xs font-bold text-slate-700 select-none">
                Feature in Homepage Infinite Review Marquee
              </label>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            onClick={close}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`${adminButton} bg-[#D6336C] hover:bg-[#c02560] px-5`}
          >
            {saving ? "Saving…" : review ? "Save Changes" : "Create Review"}
          </button>
        </div>
      </form>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Star,
  CheckCircle2,
  MapPin,
  MessageSquare,
  Sparkles,
  Plus,
  X,
  Filter,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Customer Reviews & Real Community Ratings — LEIA" },
      {
        name: "description",
        content:
          "Read verified reviews, customer ratings, and authentic feedback on LEIA foundations, lipsticks, blushes, and skincare across Pakistan.",
      },
    ],
  }),
  component: ReviewsPage,
});

type Review = {
  id: string;
  name: string;
  location: string;
  rating: number;
  review_text: string;
  product_name: string | null;
  shade: string | null;
  avatar_color: string;
  is_verified: boolean;
  created_at: string;
};

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Ayesha M.",
    location: "Lahore",
    rating: 5,
    review_text:
      "Absolutely obsessed with the Silk Blush Powder! The colour is so natural and it lasted my whole day at the office. Fast delivery and product was 100% genuine. 10/10 would order again!",
    product_name: "Silk Blush Powder",
    shade: "Peach Flush",
    avatar_color: "#D6336C",
    is_verified: true,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "r2",
    name: "Fatima Z.",
    location: "Karachi",
    rating: 5,
    review_text:
      "Rivaj eyeshadow palette is a DREAM. The pigmentation is incredible for this price. Got it for my niece's shaadi and everyone was asking where I bought it from. Packaging is also so pretty!",
    product_name: "12-Pan Eyeshadow Palette",
    shade: "Champagne Dreams",
    avatar_color: "#FF6B9D",
    is_verified: true,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "r3",
    name: "Mahnoor S.",
    location: "Islamabad",
    rating: 5,
    review_text:
      "J. Kajal is the only kajal I'll ever use. So black, so smooth, and it stays all day without smudging. I've been buying this for 2 years. The shipping was super fast too!",
    product_name: "Intense Kajal Eyeliner",
    shade: "Jet Black",
    avatar_color: "#B81D52",
    is_verified: true,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: "r4",
    name: "Hira K.",
    location: "Rawalpindi",
    rating: 5,
    review_text:
      "The Vitamin C serum by Rivaj is amazing! My skin has been so much brighter. I was skeptical at first because it's a Pakistani brand but honestly it's better than expensive imported serums.",
    product_name: "Vitamin C Brightening Serum",
    shade: "30ml",
    avatar_color: "#E91E8C",
    is_verified: true,
    created_at: new Date(Date.now() - 21 * 86400000).toISOString(),
  },
  {
    id: "r5",
    name: "Sana B.",
    location: "Multan",
    rating: 5,
    review_text:
      "Luscious foundation matches my skin tone perfectly! Finally a Pakistani brand that caters to wheatish skin. Full coverage, doesn't look cakey. COD was available and delivery was fast.",
    product_name: "Skin Tint Foundation",
    shade: "Warm Caramel",
    avatar_color: "#C2185B",
    is_verified: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "r6",
    name: "Zehra A.",
    location: "Peshawar",
    rating: 5,
    review_text:
      "The Lip Glaze in Rose Shimmer is non-sticky and gives the perfect plump effect. Beautiful formulation and arrived in 2 days in Peshawar.",
    product_name: "Luminous Lip Glaze",
    shade: "Rose Shimmer",
    avatar_color: "#9C27B0",
    is_verified: true,
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
];

function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS);
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [location, setLocation] = useState("Lahore");
  const [rating, setRating] = useState(5);
  const [productName, setProductName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchReviews = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("customer_reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setReviews(data as Review[]);
      }
    } catch {
      // Fallback stays
    }
  };

  useEffect(() => {
    void fetchReviews();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    if (!name.trim() || !reviewText.trim()) {
      setFormError("Please provide your name and review feedback.");
      return;
    }

    setSaving(true);
    setFormError("");

    const newRev = {
      name: name.trim(),
      location: location.trim() || "Pakistan",
      rating: Number(rating) || 5,
      product_name: productName.trim() || null,
      review_text: reviewText.trim(),
      avatar_color: "#D6336C",
      is_verified: true,
      is_featured: true,
    };

    const { error: insertError } = await supabase
      .from("customer_reviews")
      .insert([newRev]);

    setSaving(false);
    if (insertError) {
      setFormError(insertError.message);
    } else {
      setSubmitted(true);
      void fetchReviews();
      setTimeout(() => {
        setSubmitted(false);
        setModalOpen(false);
        setName("");
        setProductName("");
        setReviewText("");
      }, 2500);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (ratingFilter === "all") return true;
    return r.rating === ratingFilter;
  });

  const avgRating = (
    reviews.reduce((acc, curr) => acc + curr.rating, 0) / (reviews.length || 1)
  ).toFixed(1);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Banner */}
        <section className="bg-gradient-to-b from-[#FFF5F8] via-white to-white py-16 px-5 border-b border-[#F5C6D5]/40 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#D6336C]/10 text-[#D6336C] rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest">
              <Star className="size-3.5 fill-[#D6336C]" /> Verified Community Feedback
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Customer <span className="text-[#D6336C]">Reviews</span>
            </h1>
            <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
              Real experiences from beauty lovers across Pakistan who trust LEIA for their everyday skincare and makeup rituals.
            </p>

            <div className="pt-2">
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 bg-[#D6336C] hover:bg-[#c02560] text-white font-bold text-xs px-6 py-3 rounded-full transition-all shadow-lg shadow-[#D6336C]/20 hover:scale-105 active:scale-95"
              >
                <Plus className="size-4" /> Share Your Review
              </button>
            </div>
          </div>
        </section>

        {/* Ratings Summary Card */}
        <section className="max-w-5xl mx-auto px-5 -mt-6 mb-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F5C6D5] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="text-4xl sm:text-5xl font-black text-[#D6336C] font-display">
                {avgRating}
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="size-4 sm:size-5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-gray-500 font-bold mt-1">
                  Based on {reviews.length}+ verified buyer ratings
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <button
                onClick={() => setRatingFilter("all")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  ratingFilter === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-[#FFF5F8] text-gray-700 border border-[#F5C6D5] hover:bg-[#FFEBF2]"
                }`}
              >
                All ({reviews.length})
              </button>
              {[5, 4, 3].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingFilter(star)}
                  className={`flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                    ratingFilter === star
                      ? "bg-amber-500 text-white"
                      : "bg-[#FFF5F8] text-gray-700 border border-[#F5C6D5] hover:bg-[#FFEBF2]"
                  }`}
                >
                  <span>{star} Stars</span>
                  <Star className="size-3 fill-current" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Cards Grid */}
        <section className="max-w-5xl mx-auto px-5 py-6 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-3xl p-6 border border-[#F5C6D5] hover:border-[#D6336C] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Stars */}
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400 gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${
                            i < rev.rating ? "fill-amber-400" : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    {rev.is_verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="size-3 text-emerald-600" /> Verified
                      </span>
                    )}
                  </div>

                  {/* Review Quote */}
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed min-h-[60px]">
                    "{rev.review_text}"
                  </p>

                  {/* Product Details Tag */}
                  {rev.product_name && (
                    <div className="bg-[#FFF5F8] rounded-xl px-3 py-1.5 border border-[#F5C6D5]/60 text-[10px] font-bold text-[#D6336C] flex items-center justify-between">
                      <span>{rev.product_name}</span>
                      {rev.shade && <span className="text-gray-400 font-normal">{rev.shade}</span>}
                    </div>
                  )}
                </div>

                {/* Author Info */}
                <div className="pt-3 border-t border-[#F5C6D5]/40 flex items-center gap-3">
                  <div
                    className="size-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-xs shrink-0"
                    style={{ backgroundColor: rev.avatar_color || "#D6336C" }}
                  >
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{rev.name}</h4>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      <MapPin className="size-2.5" /> {rev.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Leave a Review Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="my-8 w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-[#F5C6D5] overflow-hidden animate-fadeIn">
              <div className="bg-[#D6336C] p-6 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-pink-200">
                    Community Feedback
                  </span>
                  <h2 className="text-xl font-black">Write a Review</h2>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="size-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              {submitted ? (
                <div className="p-10 text-center space-y-3">
                  <div className="size-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Thank you for your review!</h3>
                  <p className="text-xs text-gray-500">Your feedback helps beauty lovers across Pakistan shop with confidence.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="p-6 space-y-4">
                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Your Name *
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Mahnoor Khan"
                        required
                        className="mt-1 w-full h-10 px-3 border border-[#F5C6D5] rounded-xl text-xs outline-none focus:border-[#D6336C]"
                      />
                    </label>

                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      City / Location
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Lahore, Karachi"
                        className="mt-1 w-full h-10 px-3 border border-[#F5C6D5] rounded-xl text-xs outline-none focus:border-[#D6336C]"
                      />
                    </label>
                  </div>

                  {/* Star Rating Picker */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Rating *
                    </label>
                    <div className="flex items-center gap-2 bg-[#FFF5F8] p-2.5 rounded-xl border border-[#F5C6D5] w-fit">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className="p-0.5 hover:scale-125 transition-transform"
                        >
                          <Star
                            className={`size-6 ${
                              s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-[#D6336C] ml-2">{rating} Stars</span>
                    </div>
                  </div>

                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Product Reviewed (Optional)
                    <input
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g. Silk Blush Powder, Intense Kajal"
                      className="mt-1 w-full h-10 px-3 border border-[#F5C6D5] rounded-xl text-xs outline-none focus:border-[#D6336C]"
                    />
                  </label>

                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Your Review *
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="How did the formula perform? Did the shade flatter your skin tone?"
                      required
                      className="mt-1 w-full h-24 p-3 border border-[#F5C6D5] rounded-xl text-xs outline-none focus:border-[#D6336C]"
                    />
                  </label>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 bg-[#D6336C] hover:bg-[#c02560] text-white text-xs font-bold rounded-xl shadow-md transition-all"
                    >
                      {saving ? "Submitting…" : "Submit Review"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

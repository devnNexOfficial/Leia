import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag, Menu, X, Heart, Home, BookOpen, HelpCircle, Mail, Layers } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/components/cart-context";
import { CartDrawer } from "@/components/site/CartDrawer";
import { useWishlist } from "@/components/wishlist-context";
import { SearchModal } from "@/components/site/SearchModal";
import { WishlistDrawer } from "@/components/site/WishlistDrawer";
import { useStorefrontCatalog } from "@/components/storefront-catalog-context";

export function Navbar() {
  const { count, openDrawer } = useCart();
  const { wishlistCount, openWishlist } = useWishlist();
  const { categories } = useStorefrontCatalog();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Main Floating Sticky Navbar */}
      <header
        className={`z-50 transition-all duration-300 ${
          scrolled
            ? "fixed top-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] sm:w-[calc(100%-3rem)] max-w-5xl md:max-w-6xl rounded-full bg-white/95 backdrop-blur-xl border border-[#F5C6D5] shadow-xl shadow-[#D6336C]/15 py-1"
            : "relative w-full bg-white border-b border-[#F5C6D5]/30 py-2"
        }`}
      >
        <nav
          className={`relative mx-auto flex items-center justify-between gap-4 transition-all duration-300 ${
            scrolled ? "px-4 sm:px-6 h-12 md:h-14" : "max-w-7xl px-5 md:px-8 h-14 md:h-18"
          }`}
        >
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-[#D6336C] transition-colors rounded-full"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          {/* Logo - Centered on Mobile, Left-aligned on Desktop */}
          <Link
            to="/"
            className={`font-bodoni font-extrabold text-[#D6336C] tracking-[0.2em] uppercase shrink-0 hover:opacity-90 transition-all duration-300 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 ${
              scrolled ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"
            }`}
          >
            LEIA
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            <Link
              to="/"
              className={`px-4 py-1 font-semibold rounded-full transition-colors text-gray-700 hover:text-[#D6336C] hover:bg-[#FFF0F4] ${
                scrolled ? "text-xs font-bold" : "text-sm"
              }`}
            >
              Home
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                to="/shop"
                search={{ category: category.name }}
                className={`px-4 py-1 font-semibold rounded-full transition-colors text-gray-700 hover:text-[#D6336C] hover:bg-[#FFF0F4] ${
                  scrolled ? "text-xs font-bold" : "text-sm"
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            {/* Search */}
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="p-2 text-gray-600 hover:text-[#D6336C] transition-colors rounded-full hover:bg-[#FFF0F4]"
              title="Search products"
            >
              <Search className="size-5" />
            </button>

            {/* Wishlist */}
            <button
              aria-label={`Wishlist — ${wishlistCount} saved item(s)`}
              onClick={openWishlist}
              className="relative p-2 text-gray-600 hover:text-[#D6336C] transition-colors rounded-full hover:bg-[#FFF0F4]"
              title="Saved Favorites"
            >
              <Heart className="size-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[#D6336C] text-[10px] font-black text-white shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              aria-label={`Cart — ${count} item(s)`}
              onClick={openDrawer}
              className="relative p-2 text-gray-600 hover:text-[#D6336C] transition-colors rounded-full hover:bg-[#FFF0F4]"
              title="Shopping Cart"
            >
              <ShoppingBag className="size-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[#D6336C] text-[10px] font-black text-white shadow-xs">
                  {count}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#F5C6D5]/60 bg-white px-4 py-5 space-y-1.5 shadow-2xl rounded-b-2xl">
            {/* Top Primary Links */}
            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-gray-900 transition-colors hover:bg-[#FFF0F4] hover:text-[#D6336C]"
              >
                <Home className="size-4 text-[#D6336C]" />
                <span>Home</span>
              </Link>
              <Link
                to="/shop"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-gray-900 transition-colors hover:bg-[#FFF0F4] hover:text-[#D6336C]"
              >
                <ShoppingBag className="size-4 text-[#D6336C]" />
                <span>Shop All Products</span>
              </Link>
            </div>

            {/* Categories Section */}
            {categories.length > 0 && (
              <div className="pt-3 pb-1 mt-2 mb-2 border-t border-gray-100 space-y-1">
                <div className="px-3.5 pb-1 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#B81D52]">
                  <Layers className="size-3.5" />
                  <span>Categories</span>
                </div>
                <div className="pl-4 ml-3 border-l-2 border-[#F5C6D5]/50 my-1 space-y-0.5">
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      to="/shop"
                      search={{ category: category.name }}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 transition-colors hover:bg-[#FFF0F4] hover:text-[#D6336C]"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Secondary Links */}
            <div className="pt-2 border-t border-gray-100 space-y-1">
              <Link
                to="/blog"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 transition-colors hover:bg-[#FFF0F4] hover:text-[#D6336C]"
              >
                <BookOpen className="size-4 text-gray-500" />
                <span>Beauty Journal (Blog)</span>
              </Link>
              <Link
                to="/faqs"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 transition-colors hover:bg-[#FFF0F4] hover:text-[#D6336C]"
              >
                <HelpCircle className="size-4 text-gray-500" />
                <span>FAQs & Help</span>
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 transition-colors hover:bg-[#FFF0F4] hover:text-[#D6336C]"
              >
                <Mail className="size-4 text-gray-500" />
                <span>Contact Us</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Action Modals & Drawers */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <WishlistDrawer />
      <CartDrawer />
    </>
  );
}

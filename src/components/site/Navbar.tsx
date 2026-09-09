import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag, Menu, X, Heart } from "lucide-react";
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
          className={`mx-auto flex items-center justify-between gap-4 transition-all duration-300 ${
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

          {/* Logo */}
          <Link
            to="/"
            className={`font-bodoni font-extrabold text-[#D6336C] tracking-[0.2em] uppercase shrink-0 hover:opacity-90 transition-all duration-300 ${
              scrolled ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"
            }`}
          >
            LEIA
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            <Link
              to="/"
              className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors text-gray-700 hover:text-[#D6336C] hover:bg-[#FFF0F4] ${
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
                className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors text-gray-700 hover:text-[#D6336C] hover:bg-[#FFF0F4] ${
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
          <div className="md:hidden border-t border-[#F5C6D5] bg-white px-5 py-4 space-y-1 shadow-lg">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors text-gray-700 hover:bg-[#FFF0F4] hover:text-[#D6336C]"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors text-gray-700 hover:bg-[#FFF0F4] hover:text-[#D6336C]"
            >
              Shop All Products
            </Link>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="py-1 border-y border-gray-100 my-1.5 space-y-0.5">
                <p className="px-4 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#D6336C]">Categories</p>
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    to="/shop"
                    search={{ category: category.name }}
                    onClick={() => setMobileOpen(false)}
                    className="block px-6 py-2 rounded-xl text-xs font-semibold transition-colors text-gray-700 hover:bg-[#FFF0F4] hover:text-[#D6336C]"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}

            <Link
              to="/blog"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors text-gray-700 hover:bg-[#FFF0F4] hover:text-[#D6336C]"
            >
              Beauty Journal (Blog)
            </Link>
            <Link
              to="/faqs"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors text-gray-700 hover:bg-[#FFF0F4] hover:text-[#D6336C]"
            >
              FAQs & Help
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors text-gray-700 hover:bg-[#FFF0F4] hover:text-[#D6336C]"
            >
              Contact Us
            </Link>
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

# ✨ LÉÏA Pakistan — Luxury E-Commerce & Operations Platform

[![Live Site](https://img.shields.io/badge/Live%20Store-leiacosmetics.store-d6336c?style=for-the-badge&logo=google-chrome&logoColor=white)](https://www.leiacosmetics.store)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack%20Start-1.169-FF4154?style=for-the-badge&logo=tanstack&logoColor=white)](https://tanstack.com/start)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4.2-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

> **A full-stack, luxury cosmetics e-commerce platform and back-office management suite tailored specifically for the Pakistani consumer market.** Engineered with high-performance SSR, PostgreSQL Row Level Security (RLS), real-time inventory synchronization, analytics (GTM + Meta CAPI), and an RLS-protected admin ERP.

---

## 📖 Table of Contents

- [Project Overview](#-project-overview)
- [Screenshots](#-screenshots)
- [Key Architectural Highlights](#-key-architectural-highlights)
- [Feature Showcase](#-feature-showcase)
  - [Storefront Experience](#1-storefront-experience)
  - [Back-Office Admin ERP](#2-back-office-admin-erp)
- [Security & Database Engineering](#-security--database-engineering)
- [Analytics & Growth Infrastructure](#-analytics--growth-infrastructure)
- [Tech Stack Architecture](#-tech-stack-architecture)
- [Directory Structure](#-directory-structure)
- [Local Development & Setup](#-local-development--setup)
- [Verification & Testing](#-verification--testing)
- [SEO & Performance](#-seo--performance)
- [Known Limitations](#-known-limitations)
- [Author & Acknowledgments](#-author--acknowledgments)

---

## 🌟 Project Overview

**LÉÏA Pakistan** is a bespoke direct-to-consumer (D2C) beauty platform that blends Parisian girlie luxury with modern web engineering. Designed from scratch to address practical needs in the South Asian e-commerce landscape:

- **Optimized for Real-World Connectivity**: Lightweight client bundles, stale-while-revalidate client catalog caching, and responsive image payloads for mobile performance.
- **Pakistan-Native Checkout Engine**: Built-in phone normalization (`+92` / `03xx`), Cash on Delivery (COD) workflows, and 1-click WhatsApp order confirmation.
- **Enterprise-Grade Admin Suite**: Full operational control over catalog, inventory, variants, wholesale costing, reviews, customer inquiries, order fulfillment, video reels, and hero banners.

---

## 📸 Screenshots

> *Note: Place project screenshots in `docs/screenshots/` with matching filenames.*

| View | Preview |
| :--- | :--- |
| **Storefront Homepage** | ![Storefront Homepage](docs/screenshots/homepage.png) |
| **Product Catalog & Filters** | ![Product Catalog](docs/screenshots/shop.png) |
| **Product Detail & Shade Swatches** | ![Product Detail](docs/screenshots/product-detail.png) |
| **Slide-over Cart & Checkout** | ![Checkout](docs/screenshots/checkout.png) |
| **Admin Analytics Dashboard** | ![Admin Dashboard](docs/screenshots/admin-dashboard.png) |
| **Admin Products & Wholesale Pricing** | ![Admin Products](docs/screenshots/admin-products.png) |
| **Admin Order Management & WhatsApp** | ![Admin Orders](docs/screenshots/admin-orders.png) |

---

## ⚡ Key Architectural Highlights

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LÉÏA Full-Stack Architecture                    │
└────────────────────────────────────────────────────────────────────────┘

    Client Devices (Mobile / Desktop)
                 │
                 ▼
    ┌──────────────────────────┐      ┌───────────────────────────┐
    │  TanStack Router / Start │ ───► │       Nitro Engine        │
    │  • SSR & Code-Splitting  │      │  • Edge Worker Runtime    │
    │  • Hydration Optimization│      │  • Static Asset Fallbacks │
    └──────────────────────────┘      └───────────────────────────┘
                 │
                 ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                   Application State Layer                   │
    │  • React 19 Concurrent Features                            │
    │  • TanStack Query v5 Server State & Caching                 │
    │  • Stale-While-Revalidate Catalog Provider                  │
    │  • Reactive Cart, Wishlist, & Consent Contexts              │
    └─────────────────────────────────────────────────────────────┘
                 │
                 ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                  Supabase PostgreSQL Engine                 │
    │  • PostgreSQL Database with Strict Row Level Security (RLS) │
    │  • Custom RPC: place_storefront_order() Atomic Order Engine │
    │  • RLS-Protected Wholesale Costing (Admin-Only)             │
    │  • Real-Time WebSockets (Postgres Changes Subscriptions)    │
    │  • Supabase Storage (Secure Product Image CDN)              │
    └─────────────────────────────────────────────────────────────┘
                 │
                 ▼
    ┌─────────────────────────────────────────────────────────────┐
    │              Third-Party & Marketing Telemetry              │
    │  • Google Tag Manager dataLayer E-Commerce Funnel Events    │
    │  • Meta Pixel & Conversions API (CAPI) Dual-Tracking        │
    │  • WhatsApp Business Direct Order Link Automation           │
    └─────────────────────────────────────────────────────────────┘
```

1. **Modern SSR with TanStack Start & Nitro**:
   - Zero-waterfall data fetching via TanStack Router route loaders.
   - Server-side pre-rendering with Nitro engine for fast initial page responses.
2. **Atomic Order Processing (`place_storefront_order` RPC)**:
   - Order creation, variant stock validation and decrement, customer record linkage, and order-item population are executed inside an atomic PostgreSQL stored procedure.
3. **RLS-Protected, Admin-Only Wholesale Costing**:
   - Product wholesale prices are partitioned into an isolated table (`product_wholesale_prices`) protected by PostgreSQL RLS restricted solely to `public.is_admin()`. Public/storefront queries cannot read costing data even via direct API introspection.
4. **Real-time Live Inventory & Admin Push**:
   - WebSockets listen to `postgres_changes` across products, categories, variants, and wholesale data to reflect updates instantaneously without polling.
5. **Spring Physics Micro-Interactions**:
   - Fluid tactile feedback powered by `motion` (Framer Motion) on swatches, floating elements, cart additions, and drawers.

---

## 🛍️ Feature Showcase

### 1. Storefront Experience

| Feature | Description |
| :--- | :--- |
| **Hero & Video Reels** | High-fashion responsive hero banners and video showcases demonstrating makeup application tutorials with direct product purchase links. |
| **Interactive Catalog** | Filter products by category, feature flags, price range, and search terms with instant query updates. |
| **Shade & Variant Selector** | Interactive color swatches with spring bounce animations, dynamic pricing overrides, and live out-of-stock indicators per shade. |
| **Slide-over Cart & Wishlist** | Persistent local storage drawer states with animated badge counts, item counters, and instant subtotal recalculations. |
| **Instant Global Search** | Modal-based real-time search with thumbnail previews and direct navigation. |
| **Streamlined 1-Page Checkout** | Single-page checkout with Pakistani phone formatting, shipping fee rules, Cash on Delivery (COD) payment, and form validation. |
| **Live Order Tracking** | Search orders by tracking ID or order number with multi-step visual milestone progress (Pending $\rightarrow$ Confirmed $\rightarrow$ Shipped $\rightarrow$ Delivered) and direct WhatsApp support trigger. |
| **Floating WhatsApp Support** | Contextual customer service button with interactive tooltips—configured to automatically suppress on admin routes. |
| **Privacy & Cookie Consent** | Floating cookie consent banner syncing preferences with analytics tracking. |

### 2. Back-Office Admin ERP

Accessible via secure authenticated route (`/admin`):

- **Executive Analytics Dashboard** (`/admin`): Real-time metrics tracking total revenue, order count, customer inquiries, and catalog statistics.
- **Product & Inventory Engine** (`/admin/products`):
  - Multi-image CDN uploader with automatic file-type and size validation.
  - Variant & shade builder with independent SKU and stock management.
  - **Admin-Only Wholesale Price Field**: RLS-protected, admin-only wholesale costing input with non-blocking margin warnings when wholesale price exceeds retail price.
- **Order Fulfillment Center** (`/admin/orders`):
  - Status pipeline: `Pending` $\rightarrow$ `Confirmed` $\rightarrow$ `Shipped` $\rightarrow$ `Delivered` $\rightarrow$ `Cancelled`.
  - Customer contact records, delivery addresses, line-item breakdowns.
  - **1-Click WhatsApp Confirmation**: Pre-fills Urdu/English order confirmation messages directly addressed to the customer's phone number.
- **Customer Directory** (`/admin/customers`): Directory of contact-form customers grouped by email, displaying inquiry history and contact details (no customer accounts).
- **Content Management System (CMS)**:
  - **Banner Manager** (`/admin/banners`): Upload and reorder desktop and mobile hero carousel slides.
  - **Video Reels Manager** (`/admin/videos`): Link promotional MP4 videos directly to product tags.
  - **Blog Studio** (`/admin/blogs`): Create, edit, and publish rich beauty and skincare tutorials.
  - **Reviews Moderation** (`/admin/reviews`): Approve, highlight, or reject customer feedback and star ratings.
  - **FAQ Manager** (`/admin/faqs`): Organize categorized accordions.
  - **Brand Story & Pages** (`/admin/story`, `/admin/pages`): Edit brand philosophy and institutional pages.
  - **Newsletter Subscribers** (`/admin/subscribers`): Export and manage email capture leads.
  - **Inquiries Inbox** (`/admin/messages`): Triage inbound contact and wholesale distributor applications with read/unread flags.

---

## 🔒 Security & Database Engineering

### PostgreSQL Security & Row Level Security (RLS)

All endpoints interact with Supabase through strictly controlled RLS policies:

```sql
-- Helper Function to identify admin users from public.admins
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins
    where id = auth.uid()
  );
$$;
```

#### Wholesale Cost Isolation Matrix
To prevent storefront scraping of product margins:
- `public.products`: Public `SELECT` allowed (contains name, price, stock, images). **No wholesale column exists.**
- `public.product_wholesale_prices`: Completely partitioned table:
  - `product_id uuid primary key references public.products(id) on delete cascade`
  - `wholesale_price numeric(12, 2) not null check (wholesale_price >= 0)`
  - `RLS Policies`: `SELECT`, `INSERT`, `UPDATE`, `DELETE` are **100% restricted to `public.is_admin()`**.
  - `anon` and `public` roles are explicitly **REVOKED** from all permissions.

---

## 📊 Analytics & Growth Infrastructure

The platform comes equipped with dual-engine conversion tracking:

1. **Google Tag Manager (GTM) E-Commerce dataLayer**:
   - `page_view`: Route transitions captured in real-time.
   - `view_item`: Triggered upon loading product details.
   - `add_to_cart`: Captures item payload, variant selection, and currency.
   - `begin_checkout`: Logs checkout step initiation.
   - `purchase`: Fires on order confirmation with order ID, revenue, tax, and item breakdown.
2. **Meta Pixel & Conversions API (CAPI)**:
   - Client-side Meta Pixel with server-side CAPI resilience via `/api/meta-capi` (handled in `src/server/meta-capi.ts`).
   - Integrated with cookie consent: respects user's preference if set to `essential_only`.

---

## 🛠️ Tech Stack Architecture

| Layer | Technology | Key Purpose |
| :--- | :--- | :--- |
| **Framework** | **TanStack Start (Vite)** | Modern SSR framework with code splitting and hydration |
| **Routing** | **TanStack Router** | 100% type-safe file-based router with built-in layout nesting |
| **Language** | **TypeScript 5.8** | Strict static typing across routes, APIs, and state |
| **UI Library** | **React 19** | Concurrent rendering and server/client primitives |
| **Styling** | **Tailwind CSS v4** | Next-generation ultra-fast CSS engine |
| **Animations** | **Motion 13 (Framer)** | Spring physics, tactile button bounces, drawer transitions |
| **Server State** | **TanStack Query v5** | Data synchronization, deduplication, and cache invalidation |
| **Icons** | **Lucide React** | Consistent, lightweight vector icons |
| **Database** | **Supabase (PostgreSQL)** | Relational database, Auth, Storage, and Real-Time WebSockets |
| **Server Engine** | **Nitro** | Edge-ready lightweight server engine |
| **Hosting** | **Vercel** | Edge network deployment and global CDN |
| **Validation** | **Zod 4** | Type-safe form, payload, and schema parsing |

---

## 📁 Directory Structure

```
blush-boutique-sparkle-main/
├── docs/
│   └── screenshots/              # Storefront & Admin UI screenshots
├── public/                       # Static assets, favicons, sitemap.xml
├── scripts/
│   └── generate-sitemap.mjs      # Automated dynamic sitemap builder
├── src/
│   ├── components/               # UI Component Library
│   │   ├── admin/                # Admin layout, tables, modals, input primitives
│   │   ├── site/                 # Header, Footer, Hero, WhatsApp, Cart/Wishlist Drawers
│   │   ├── cart-context.tsx      # Cart state provider & local storage sync
│   │   ├── wishlist-context.tsx  # Wishlist state provider
│   │   └── storefront-catalog-context.tsx # SWR product & category provider
│   ├── data/                     # Fallback catalogs & category metadata
│   ├── lib/                      # Core utilities & API wrappers
│   │   ├── admin-types.ts        # TypeScript schemas for ERP entities
│   │   ├── gtm.ts                # GTM container & dataLayer dispatcher
│   │   ├── meta-pixel.ts         # Meta Pixel & CAPI tracking handlers
│   │   ├── pakistani-phone.ts    # Phone normalization (+92 / 03xx)
│   │   ├── storefront-orders.ts  # Order placement API & RPC fallbacks
│   │   ├── supabase.ts           # Supabase client singleton
│   │   └── utils.ts              # Styling & format helpers (clsx, twMerge)
│   ├── routes/                   # File-based TanStack routes
│   │   ├── __root.tsx            # Global layout (Providers, Trackers, WhatsApp)
│   │   ├── index.tsx             # Storefront homepage
│   │   ├── shop.tsx              # Catalog browsing & filtering
│   │   ├── product/              # Product detail & variant pages
│   │   ├── cart.tsx              # Dedicated cart summary
│   │   ├── checkout.tsx          # 1-page checkout flow
│   │   ├── confirmation.tsx      # Order success page
│   │   ├── track-order.tsx       # Live shipment & status tracking
│   │   ├── wholesale.tsx         # B2B & salon partnership inquiry
│   │   ├── reviews.tsx           # Customer reviews showcase
│   │   ├── blog.tsx              # Skincare & cosmetics articles
│   │   ├── contact.tsx           # Contact form & WhatsApp link
│   │   └── admin/                # Back-office admin routes (15 modules)
│   │       ├── index.tsx         # Analytics overview
│   │       ├── products.tsx      # Product catalog & wholesale pricing
│   │       ├── orders.tsx        # Order pipeline & WhatsApp triggers
│   │       ├── customers.tsx     # Customer directory
│   │       ├── banners.tsx       # Hero carousel editor
│   │       ├── videos.tsx        # Video showcase manager
│   │       └── ...               # Blogs, FAQs, reviews, subscribers, story
│   ├── server/                   # Server-side handlers (meta-capi endpoint)
│   ├── app.css                   # Tailwind CSS v4 styling rules
│   └── router.tsx                # TanStack Router configuration
├── supabase/
│   ├── functions/                # Supabase Edge Functions (order notifications)
│   └── migrations/               # Production SQL migrations (RLS, schema, RPC)
├── verify-anon-security.mjs      # Automated security testing script
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Local Development & Setup

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm** / **yarn**
- A **Supabase** account with a PostgreSQL project

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/devnNexOfficial/Leia.git
   cd Leia
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your credentials in `.env`:
   ```ini
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   VITE_SITE_URL=https://www.leiacosmetics.store
   VITE_GTM_ID=GTM-XXXXXXX
   META_PIXEL_ID=your_pixel_id
   META_CAPI_ACCESS_TOKEN=your_meta_capi_token
   VITE_ENABLE_PAGEVIEW_TRACKING=false
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Generate Sitemap**:
   ```bash
   npm run sitemap
   ```

6. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🧪 Verification & Testing

### Automated Anon Key Security Verification
To run an automated security check that:
1. Public `anon` users cannot read wholesale prices.
2. The `products` table exposes no wholesale data.

Run the built-in read-only verification suite:
```bash
node verify-anon-security.mjs
```

**Expected Output**:
```text
Checking anon access permissions...

1. product_wholesale_prices query with anon key:
   - Error: permission denied for table product_wholesale_prices
   - Rows returned: 0
   -> Result: PASS (Zero rows exposed to anon)

2. products table schema inspection:
   - Keys in products: id, name, description, price, image_url, category_id, is_active, ...
   -> Result: PASS (No wholesale columns on products)
```

---

## 📈 SEO & Performance

- **SEO & Social Cards**: OpenGraph tags, dynamic Twitter cards, canonical tags on storefront routes, and structured JSON-LD breadcrumbs.
- **Dynamic XML Sitemap**: `scripts/generate-sitemap.mjs` queries active Supabase catalog entries and builds a production-ready `sitemap.xml` with priority and freshness tags on every build.
- **Cumulative Layout Shift Reduction**: Explicit image aspect ratios and lazy loading applied to images and hero media.

---

## ⚠️ Known Limitations

- **Cash on Delivery Only**: Online credit/debit cards and mobile wallets are not integrated; orders process strictly via Cash on Delivery (COD).
- **Stock Decrement Scope**: The `place_storefront_order` RPC atomically validates and decrements stock for products with variants; products without variants do not have their stock count decremented during checkout.
- **Email Delivery**: Automated customer order confirmation emails depend on domain verification in Resend (currently in progress).

---

## 👤 Author & Acknowledgments

**Engineered with ❤️ for LÉÏA Pakistan by [Rana Zaeem](https://github.com/devnNexOfficial)**

- **Organization**: [DevNex Innovation](https://devnexinnovation.online)
- **GitHub**: [@devnNexOfficial](https://github.com/devnNexOfficial)
- **Live Platform**: [www.leiacosmetics.store](https://www.leiacosmetics.store)

---

### 📄 License

This software and its branding assets are proprietary and confidential.  
© 2024–2026 LÉÏA Pakistan & DevNex Innovation. All rights reserved.

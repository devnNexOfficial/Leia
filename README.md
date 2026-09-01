# LÉÏA Pakistan Storefront

Build a modern, elegant e-commerce storefront for a luxury Pakistani cosmetics brand.

BRAND FEEL Girlie but elegant and luxurious — not childish or overly playful. Think soft, feminine sophistication rather than a bubbly/cutesy look.

COLOR PALETTE (use exactly these)

Primary (headlines, buttons, key accents): #D6336C

Accent (hover states, secondary CTAs, highlights): #FF4081

Soft (card backgrounds, section backgrounds, dividers): #FFB6C1

Background (main page background): #FFF5F8

Keep most of the layout on the near-white #FFF5F8 background for breathing room — use #D6336C boldly but sparingly (headlines, primary buttons, logo). Use #FFB6C1 for soft section backgrounds and card fills. #FF4081 for hover/interactive states.

LAYOUT STYLE Inspired by coolors.co's clean, modern SaaS-style layout — not a typical cluttered e-commerce template:

Minimal, clean nav bar: logo on the left, category links center/right, cart icon on the right

Bold, large centered hero section with a confident headline, short subtext, and a primary CTA button in #D6336C

A trust/social-proof strip below the hero (e.g. "as seen in" / bestseller highlights)

Category/feature cards in a clean grid (skincare, lips, eyes, etc.), rounded corners (8-10px, not overly bubbly), soft shadow, hover state using #FF4081

Generous white space throughout, editorial feel

TYPOGRAPHY An elegant serif for headlines (editorial, upscale feel) paired with a clean sans-serif for body text. Avoid rounded "cutesy" fonts — the goal is girlie-luxury, not girlie-playful.

PRODUCT CATALOG

Large catalog with complex product variants (e.g. shade and size combinations)

Product listing page: clean grid of product cards, image-forward, price, quick category filter/sort

Product detail page: large product imagery, variant selection shown as tactile swatches (e.g. shade circles) rather than plain dropdowns, quantity selector, add-to-cart

Search and filtering by category, price, and variant (e.g. shade/skin type)

CORE PAGES/FLOWS NEEDED

Home page (hero, trust strip, category cards, featured products, footer)

Product listing / category page with filters

Product detail page with variant selection

Cart page

Checkout flow

Simple customer account (order history, saved details)

PAYMENTS & CHECKOUT Primary customers are in Pakistan — checkout should support:

Cash on Delivery (COD)

JazzCash

Easypaisa

ANIMATIONS & MICRO-INTERACTIONS The whole site should feel lively and tactile, not static. Use bounce-style easing (spring/elastic, not linear) throughout:

Buttons: scale up slightly and bounce on hover (e.g. scale 1 → 1.05 with a spring easing), a satisfying "pop" (quick scale-down then back up) on click/tap

Product cards: lift and bounce slightly on hover (translateY + scale with spring easing), image gently zooms on hover

Page/section elements: fade-and-slide-up into view on scroll, staggered for grids (each card animates in slightly after the previous one)

Add-to-cart: item should "pop" into the cart icon with a small bounce animation, cart icon itself bounces briefly to confirm

Variant/shade swatches: bounce slightly when selected, with a spring-in checkmark or ring indicator

Navigation links and icons: subtle bounce/scale on hover

Hero elements: entrance animation on page load (fade-slide-up with a slight bounce/overshoot at the end, staggered for headline, subtext, and CTA button)

Use spring/elastic easing curves (overshoot slightly past the final state before settling) rather than plain ease-in-out, so everything feels bouncy and alive rather than stiff

Keep animations quick (150-400ms) so the site still feels fast, not sluggish

FOOTER (structured like polynae.com, styled in the brand palette)

Newsletter signup section at the top of the footer: bold heading (e.g. "Get 10% off your first order"), email input + subscribe button, small note about no spam. Subscribe button should have the same bounce/pop interaction as other buttons.

Below that, a multi-column layout:

Company: Shop, Our Story, Reviews, Blog

Support: FAQs, Contact Us, Track Order, Shipping & Delivery, Returns & Exchanges

Join Us: Careers, Wholesale Inquiries, Authorized Sellers

Payment method icons row (COD, JazzCash, Easypaisa, cards)

Bottom bar: copyright, Privacy Policy, Terms of Service, Cookie Policy links

Footer links should have the same subtle bounce/underline animation on hover as the rest of the site

Footer background can use the soft #FFB6C1 tone to visually separate it from the main page background

DESIGN PRINCIPLES

Flat, clean surfaces — no heavy gradients or neon effects

Rounded corners on cards (8-10px) but not fully pill-shaped elements

Product photography should have room to breathe — avoid cramming too much per row

Mobile-responsive throughout

Animations should enhance the luxury-girlie feel (playful bounce, but still smooth and premium — not cartoonish or janky)

"Start with just the homepage (hero, trust strip, category cards, featured products, footer) — I'll ask for other pages next."

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://leia.pk

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1651d8f5-0f4c-41b2-8027-0b3f90501dac).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

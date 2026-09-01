-- Migration: 20260901_blogs_faqs_reviews_story.sql
-- Description: Creates tables for Blog Posts, FAQs, Customer Reviews, and Brand Story with RLS & Realtime.

-- ============================================================================
-- 1. BLOG POSTS TABLE
-- ============================================================================
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image text,
  category text not null default 'Beauty Guide',
  author text not null default 'LEIA Editorial',
  read_time text not null default '4 min read',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

alter table public.blog_posts enable row level security;

create policy "public reads published blog posts"
  on public.blog_posts for select to anon, authenticated
  using (published = true or public.is_admin());

create policy "admins manage blog posts"
  on public.blog_posts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter publication supabase_realtime add table public.blog_posts;

-- ============================================================================
-- 2. FAQS TABLE
-- ============================================================================
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null default 'Orders',
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger faqs_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();

alter table public.faqs enable row level security;

create policy "public reads published faqs"
  on public.faqs for select to anon, authenticated
  using (is_published = true or public.is_admin());

create policy "admins manage faqs"
  on public.faqs for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter publication supabase_realtime add table public.faqs;

-- ============================================================================
-- 3. CUSTOMER REVIEWS TABLE
-- ============================================================================
create table if not exists public.customer_reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null default 'Pakistan',
  rating int not null default 5 check (rating >= 1 and rating <= 5),
  review_text text not null,
  product_name text,
  shade text,
  avatar_color text not null default '#D6336C',
  is_verified boolean not null default true,
  is_featured boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger customer_reviews_updated_at
  before update on public.customer_reviews
  for each row execute function public.set_updated_at();

alter table public.customer_reviews enable row level security;

create policy "public reads customer reviews"
  on public.customer_reviews for select to anon, authenticated
  using (true);

create policy "admins manage customer reviews"
  on public.customer_reviews for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter publication supabase_realtime add table public.customer_reviews;

-- ============================================================================
-- 4. BRAND STORY TABLE
-- ============================================================================
create table if not exists public.brand_story (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique default 'main',
  eyebrow text not null default 'Our story',
  title text not null default 'Made for your everyday glow',
  intro text not null default 'At LEIA, we craft luxury cosmetic essentials formulated for real radiance, timeless beauty, and unmatched comfort across Pakistan.',
  hero_image text,
  section_1_title text not null default 'Hello from LEIA',
  section_1_content text not null default 'LEIA was founded with a singular purpose: to elevate everyday beauty rituals with high-performance formulas tailored to warm, diverse skin tones. We believe every person deserves makeup and skincare that feels weightless and looks effortlessly luminous.',
  section_2_title text not null default 'What We Believe',
  section_2_content text not null default 'We believe beauty should be empowering, accessible, and clean. Every shade is tested for rich pigmentation, long-lasting wear, and cruelty-free ethics without harsh chemicals.',
  section_3_title text not null default 'Our Promise',
  section_3_content text not null default 'We stand behind each handcrafted formula. From rapid nationwide shipping to verified ingredient authenticity, our atelier team ensures your luxury experience starts the moment you order.',
  quote text not null default 'Beauty begins the moment you decide to be yourself.',
  updated_at timestamptz not null default now()
);

create trigger brand_story_updated_at
  before update on public.brand_story
  for each row execute function public.set_updated_at();

alter table public.brand_story enable row level security;

create policy "public reads brand story"
  on public.brand_story for select to anon, authenticated
  using (true);

create policy "admins manage brand story"
  on public.brand_story for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter publication supabase_realtime add table public.brand_story;

-- ============================================================================
-- 5. INITIAL SEED DATA
-- ============================================================================

-- Seed Default Brand Story
insert into public.brand_story (slug, eyebrow, title, intro, hero_image, section_1_title, section_1_content, section_2_title, section_2_content, section_3_title, section_3_content, quote)
values (
  'main',
  'Our story',
  'Made for your everyday glow',
  'At LEIA, we craft luxury cosmetic essentials formulated for real radiance, timeless beauty, and unmatched comfort across Pakistan.',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80',
  'Hello from LEIA',
  'LEIA was founded with a singular purpose: to elevate everyday beauty rituals with high-performance formulas tailored to warm, diverse skin tones. We believe every person deserves makeup and skincare that feels weightless and looks effortlessly luminous.',
  'What We Believe',
  'We believe beauty should be empowering, accessible, and clean. Every shade is tested for rich pigmentation, long-lasting wear, and cruelty-free ethics without harsh chemicals.',
  'Our Promise',
  'We stand behind each handcrafted formula. From rapid nationwide shipping to verified ingredient authenticity, our atelier team ensures your luxury experience starts the moment you order.',
  'Beauty begins the moment you decide to be yourself.'
)
on conflict (slug) do nothing;

-- Seed Sample Blog Posts
insert into public.blog_posts (title, slug, excerpt, content, cover_image, category, author, read_time, published)
values
(
  'How to Achieve a Glass-Skin Glow in 5 Simple Steps',
  'glass-skin-glow-guide',
  'Master the art of radiant, luminous skin with our curated routine designed specifically for humid and changing climates.',
  '## The Secret to Radiant Skin

Achieving glass skin is not about covering flaws—it is about deep hydration, gentle exfoliation, and locking in moisture with lightweight layers.

### 1. Double Cleanse with Care
Start your evening ritual with an oil-based cleanser to melt away sunscreen and impurities, followed by a gentle pH-balanced foaming wash.

### 2. Hydrating Mist & Essence
Damp skin absorbs moisture 10x better than dry skin. Pat a soothing rosewater or hyaluronic acid toner generously onto your face.

### 3. Vitamin C & Niacinamide
Brighten dark spots and even out texture with a potent antioxidant serum. Apply 3–4 drops and press gently.

### 4. Lightweight Gel Cream
Lock in the glow without clogging pores. Look for squalane, ceramides, and aloe vera.

### 5. Non-Negotiable Sunscreen
Never skip broad-spectrum SPF 50+ to protect your cellular barrier and prevent photoaging.',
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=900&auto=format&fit=crop&q=80',
  'Skincare Rituals',
  'Dr. Areesha Malik',
  '5 min read',
  true
),
(
  'Finding Your Perfect Foundation Shade for South Asian Undertones',
  'find-perfect-foundation-shade',
  'Olive, golden, neutral or peach? Here is how to pick the right undertone for seamless, un-cakey foundation coverage.',
  '## Demystifying Warm & Olive Undertones

Finding the exact shade match can feel intimidating when traditional international ranges fail to capture South Asian depth.

### Understanding Your Undertone
- **Warm / Golden:** Veins look greenish, gold jewelry flatters you most.
- **Olive:** A subtle greenish or muted hue, neither strictly pink nor intensely yellow.
- **Neutral:** A harmonious balance that adapts easily to true beige and peach tones.

### How to Swatch Correctly
Never test foundation on your wrist! Always swatch along your lower jawline down towards your neck in natural daylight.

### Setting with Translucent Powder
For long-lasting heat resistance, press micro-fine translucent powder into the T-zone while leaving high points fresh and dewy.',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&auto=format&fit=crop&q=80',
  'Makeup Tutorials',
  'Zainab Noor',
  '4 min read',
  true
),
(
  'Lip Care 101: Preventing Chapped Lips All Year Round',
  'lip-care-101-preventing-chapped-lips',
  'Say goodbye to dry, peeling lips with our hydrating routine and nourishing botanical lip tints.',
  '## Why Lips Need Special Care

The skin on our lips is 3x thinner than the rest of our facial skin and lacks oil glands.

### Step 1: Gentle Sugar Polish
Exfoliate dead skin once a week with a gentle sugar & jojoba oil scrub.

### Step 2: Overnight Peptide Mask
Apply a thick layer of peptide balm before sleep to repair micro-cracks.

### Step 3: Tinted Oils with SPF
Choose tinted lip oils enriched with Vitamin E for everyday color that hydrates simultaneously.',
  'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=900&auto=format&fit=crop&q=80',
  'Beauty Guide',
  'LEIA Editorial',
  '3 min read',
  true
)
on conflict (slug) do nothing;

-- Seed Sample FAQs
insert into public.faqs (question, answer, category, sort_order, is_published)
values
('How do I place an order?', 'Browse our store at leia.pk, add your favorite items to cart, and checkout with Cash on Delivery (COD) or bank transfer.', 'Orders', 1, true),
('Can I modify or cancel my order after placing it?', 'Yes! You can modify or cancel your order within 2 hours of placing it by contacting our WhatsApp support team.', 'Orders', 2, true),
('How do I know my order is confirmed?', 'You will receive an instant email and SMS confirmation containing your order ID and summary.', 'Orders', 3, true),
('How long does delivery take in Pakistan?', 'Delivery takes 2–4 business days for major cities (Lahore, Karachi, Islamabad) and 3–6 days for other regions across Pakistan.', 'Shipping', 1, true),
('What are the shipping charges?', 'Shipping is FREE on all orders above PKR 1,500. Flat rate PKR 150 applies for orders below that threshold.', 'Shipping', 2, true),
('What is your return & exchange policy?', 'We accept returns or replacements within 7 days of delivery for damaged or defective items in original condition.', 'Returns', 1, true),
('What payment methods do you accept?', 'We accept Cash on Delivery (COD) nationwide, as well as direct Bank Transfers / JazzCash / EasyPaisa upon request.', 'Payments', 1, true),
('Are all LEIA products authentic & safe?', 'Yes, 100% genuine and dermatologically tested with premium, skin-safe cosmetic grade ingredients.', 'Products', 1, true)
on conflict do nothing;

-- Seed Customer Reviews
insert into public.customer_reviews (name, location, rating, review_text, product_name, shade, avatar_color, is_verified, is_featured)
values
('Ayesha M.', 'Lahore', 5, 'Absolutely obsessed with the Silk Blush Powder! The colour is so natural and it lasted my whole day at the office. Fast delivery and 100% authentic.', 'Silk Blush Powder', 'Peach Flush', '#D6336C', true, true),
('Fatima Z.', 'Karachi', 5, 'Rivaj eyeshadow palette is a DREAM. The pigmentation is incredible for this price. Got it for my sister wedding and received so many compliments!', '12-Pan Eyeshadow Palette', 'Champagne Dreams', '#FF6B9D', true, true),
('Mahnoor S.', 'Islamabad', 5, 'The Intense Kajal is the smoothest kajal I have ever used. Deep black, stays put without smudging all day long.', 'Intense Kajal Eyeliner', 'Jet Black', '#B81D52', true, true),
('Hira K.', 'Rawalpindi', 5, 'The Vitamin C serum made my skin so visibly brighter in 2 weeks. Very lightweight and smells so fresh!', 'Vitamin C Brightening Serum', '30ml', '#E91E8C', true, true),
('Sana B.', 'Multan', 5, 'Foundation matches Pakistani warm skin tones beautifully. Full coverage without feeling heavy or cakey.', 'Skin Tint Foundation', 'Warm Caramel', '#C2185B', true, true),
('Zehra A.', 'Peshawar', 5, 'Super impressed with the packaging and quick COD delivery. My new go-to makeup brand!', 'Luminous Lip Glaze', 'Rose Shimmer', '#9C27B0', true, true)
on conflict do nothing;

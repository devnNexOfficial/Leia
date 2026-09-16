# ✨ LÉÏA Pakistan Storefront

A modern, luxury e-commerce platform for premium Pakistani cosmetics. Elegant, girlie, and sophisticated—not childish.

**Live**: [leia.pk](https://leia.pk)

---

## 🎨 Brand Identity

### Color Palette
- **Primary**: `#D6336C` — Headlines, buttons, bold accents
- **Accent**: `#FF4081` — Hover states, interactive elements
- **Soft**: `#FFB6C1` — Card backgrounds, section dividers
- **Background**: `#FFF5F8` — Main page canvas (near-white)

### Design Philosophy
✓ Girlie elegance (not cutesy)  
✓ Luxury sophistication with breathing room  
✓ Clean, SaaS-inspired layout (not cluttered templates)  
✓ Serif headlines × sans-serif body text  
✓ Bouncy, tactile micro-interactions throughout

---

## 🛍️ Core Features

### Pages & Flows
- ✅ **Home** — Hero section, trust strip, category cards, featured products
- ✅ **Product Listing** — Clean grid, filters, sorting, quick search
- ✅ **Product Detail** — Large imagery, variant swatches, quantity selector
- ✅ **Cart** — Persistent, bounce animations on add
- ✅ **Checkout** — Multi-step flow with multiple payment options
- ✅ **Account** — Order history, saved details, profile management

### Product Variants
- Shade selections (color swatches, not dropdowns)
- Size options
- Skin type filters
- Tactile swatch interactions with spring animations

### Payment Methods
🇵🇰 Pakistan-focused checkout:
- 💵 **Cash on Delivery (COD)**
- 📱 **JazzCash**
- 📱 **Easypaisa**
- 💳 **Card Payments**

---

## ⚡ Animation & Interactions

All animations use **spring/elastic easing** (bouncy, premium feel—not stiff):

| Element | Interaction |
|---------|---|
| **Buttons** | Scale 1→1.05 on hover, pop on click (spring overshoot) |
| **Product Cards** | Lift + zoom on hover, staggered grid entrance |
| **Swatches** | Bounce in selection, checkmark appears with spring |
| **Add-to-Cart** | Item pops into cart icon, cart bounces to confirm |
| **Page Load** | Hero elements fade-slide-up with staggered timing |
| **Links/Icons** | Subtle bounce + underline on hover |

**Timing**: 150–400ms (fast, responsive, premium)

---

## 🏗️ Layout & Components

### Navigation
- Logo left, category links center/right, cart icon right
- Minimal, clean design (SaaS-inspired, not bloated)

### Hero Section
- Large, centered headline + short subtext
- Primary CTA button (`#D6336C`)
- Trust/social-proof strip below (bestsellers, reviews, "as seen in")

### Cards & Spacing
- Rounded corners: 8–10px (elegant, not pill-shaped)
- Soft shadows, generous white space
- Image-forward product cards
- #FFB6C1 soft backgrounds for category/feature sections

### Footer (Polynae-inspired)
```
┌─────────────────────────────────────┐
│ Newsletter Signup (10% off offer)   │
├─────────────────────────────────────┤
│ Shop | Our Story | Reviews | Blog   │
│ FAQs | Contact | Track Order | ...  │
│ Careers | Wholesale | Authorized... │
├─────────────────────────────────────┤
│ [COD] [JazzCash] [Easypaisa] [💳]  │
├─────────────────────────────────────┤
│ © 2024 LÉÏA | Privacy | Terms       │
└─────────────────────────────────────┘
```
Footer background: `#FFB6C1` for visual separation

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ (install with [nvm](https://github.com/nvm-sh/nvm))
- npm or yarn

### Installation
```bash
git clone https://github.com/devNexOfficial/leia.pk
cd leia-storefront
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
leia-storefront/
├── public/              # Static assets (logos, favicons)
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Home, product, cart, checkout
│   ├── hooks/          # React hooks (cart, auth, animations)
│   ├── styles/         # Global CSS + Tailwind config
│   ├── utils/          # Helpers, animations, payment logic
│   └── App.tsx         # Root component
├── package.json
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 18, TypeScript, Tailwind CSS |
| **Animations** | Framer Motion (spring easing) |
| **State** | React Context + Zustand |
| **Backend** | Node.js + Express (REST API) |
| **Database** | PostgreSQL (Supabase) |
| **Payments** | JazzCash, Easypaisa, COD APIs |
| **Hosting** | Vercel (frontend), Railway/Render (backend) |
| **CI/CD** | GitHub Actions |

---

## 🎯 Development Roadmap

### Phase 1 (Current) ✅
- [x] Homepage design & layout
- [x] Product listing grid
- [x] Basic animations (bounce, hover)
- [x] Footer with newsletter signup

### Phase 2
- [ ] Product detail page + variant selection
- [ ] Shopping cart with persistent storage
- [ ] Checkout flow UI
- [ ] Payment gateway integration

### Phase 3
- [ ] Customer accounts & order history
- [ ] Admin dashboard (product management)
- [ ] Email notifications (order confirmations, shipping)
- [ ] Advanced filtering & search

### Phase 4
- [ ] Product reviews & ratings
- [ ] Wishlist functionality
- [ ] Loyalty/rewards program
- [ ] Multi-language support (Urdu, English)

---

## 🤝 Contributing

We love contributions! Here's how:

1. Fork this repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "Add amazing feature"`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

**Style Guide**:
- Use TypeScript for all new code
- Follow Tailwind CSS conventions
- Keep components small & reusable
- Add spring animations for interactions
- Test on mobile (responsive first)

---

## 📱 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Latest |
| Firefox | Latest |
| Safari | Latest |
| Mobile Safari | iOS 14+ |
| Chrome Mobile | Latest |

---

## 🔒 Security & Privacy

- All payment data encrypted (PCI-DSS compliant)
- HTTPS-only (SSL/TLS)
- Privacy Policy: [leia.pk/privacy](https://leia.pk/privacy)
- Terms of Service: [leia.pk/terms](https://leia.pk/terms)
- Cookie Policy: [leia.pk/cookies](https://leia.pk/cookies)

---

## 📞 Support & Contact

- 📧 **Email**: support@leia.pk
- 💬 **Live Chat**: Available on website
- 📱 **WhatsApp**: [Link]
- 🐛 **Report Issues**: [GitHub Issues](https://github.com/devNexOfficial/leia.pk/issues)

---

## 📄 License

This project is proprietary. All rights reserved © 2024 LÉÏA Pakistan.

---

## 👥 Team

**Built with ❤️ by [DevNex Innovation](https://devnexinnovation.online)**

- **Design & Brand**: [Team]
- **Development**: [Team]
- **Marketing**: [Team]

---


**Last Updated**: September 2026  
**Status**: 🟢 Active Development

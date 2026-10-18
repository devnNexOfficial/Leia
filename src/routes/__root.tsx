import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { GTM_ID } from "@/lib/gtm";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

import {
  siteConfig,
  siteUrl,
  defaultTitle,
  defaultDescription,
  defaultOgImage,
} from "@/lib/siteConfig";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#FFF5F8" },
      { title: defaultTitle },
      {
        name: "description",
        content: defaultDescription,
      },
      { name: "author", content: "Leia Cosmetics" },
      { property: "og:site_name", content: siteConfig.siteName },
      { property: "og:title", content: defaultTitle },
      {
        property: "og:description",
        content: defaultDescription,
      },
      { property: "og:url", content: siteUrl },
      { property: "og:type", content: "website" },
      { property: "og:image", content: defaultOgImage },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Leia Cosmetics — Authentic Luxury Cosmetics" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: siteConfig.social.twitter },
      { name: "twitter:creator", content: siteConfig.social.twitter },
      { name: "twitter:title", content: defaultTitle },
      { name: "twitter:description", content: defaultDescription },
      { name: "twitter:image", content: defaultOgImage },
    ],
    links: [
      { rel: "preconnect", href: "https://jalhdmqsniibmsmsvfjp.supabase.co" },
      { rel: "dns-prefetch", href: "https://jalhdmqsniibmsmsvfjp.supabase.co" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,700;6..96,800&family=Inter:wght@400;500;600;700;800;900&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "canonical", href: siteUrl },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
    scripts: [
      {
        children: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});function loadGtm(){if(w['__gtm_loaded__'])return;w['__gtm_loaded__']=true;var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);}if('requestIdleCallback' in w){w.requestIdleCallback(loadGtm,{timeout:1000});}else{w.addEventListener('load',function(){setTimeout(loadGtm,1000);});}w.addEventListener('pointerdown',loadGtm,{once:true,passive:true});w.addEventListener('scroll',loadGtm,{once:true,passive:true});})(window,document,'script','dataLayer','${GTM_ID}');`,
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.siteName,
  alternateName: "LÉÏA",
  url: siteUrl,
  logo: `${siteUrl}/apple-touch-icon.png`,
  sameAs: [siteConfig.social.instagram],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+92-341-7813558",
    contactType: "customer service",
    areaServed: "PK",
    availableLanguage: ["English", "Urdu"],
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.siteName,
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/shop?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { WishlistProvider } from "@/components/wishlist-context";
import { CartProvider } from "@/components/cart-context";
import { FloatingWhatsApp } from "@/components/site/FloatingWhatsApp";
import { CookieConsentBanner } from "@/components/site/CookieConsentBanner";
import { StorefrontCatalogProvider } from "@/components/storefront-catalog-context";
import { trackMetaEvent } from "@/lib/meta-pixel";

function GtmRouteTracker() {
  const router = useRouter();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const unsubscribe = router.subscribe("onResolved", (event) => {
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        return;
      }
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: "page_view",
            page_path: event.toLocation.href,
            page_title: document.title,
          });
        }
      }, 0);
    });

    return () => {
      unsubscribe();
    };
  }, [router]);

  return null;
}

function MetaPageViewTracker() {
  const isEnabled =
    typeof import.meta !== "undefined" && import.meta.env?.VITE_ENABLE_PAGEVIEW_TRACKING === "true";

  if (!isEnabled) {
    return null;
  }

  return <MetaPageViewTrackerActive />;
}

function MetaPageViewTrackerActive() {
  const router = useRouter();
  const lastTrackedPath = useRef<string | null>(null);

  const firePageView = useCallback(() => {
    if (typeof window === "undefined") return;

    // Respect cookie consent: Skip if user explicitly chose "essential_only"
    try {
      const consent = localStorage.getItem("leia_cookie_consent_v1");
      if (consent === "essential_only") return;
    } catch {
      // LocalStorage blocked/unavailable
    }

    const currentPath = window.location.pathname + window.location.search;
    if (lastTrackedPath.current === currentPath) return;
    lastTrackedPath.current = currentPath;

    try {
      trackMetaEvent("PageView");
    } catch (err) {
      if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
        console.warn("[Meta Pixel] Failed to track PageView:", err);
      }
    }
  }, []);

  useEffect(() => {
    firePageView();
    const unsubscribe = router.subscribe("onResolved", () => {
      setTimeout(firePageView, 0);
    });
    return () => unsubscribe();
  }, [router, firePageView]);

  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <QueryClientProvider client={queryClient}>
      <StorefrontCatalogProvider>
        <WishlistProvider>
          <CartProvider>
            <GtmRouteTracker />
            <MetaPageViewTracker />
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
            {!isAdmin && <FloatingWhatsApp />}
            <CookieConsentBanner />
          </CartProvider>
        </WishlistProvider>
      </StorefrontCatalogProvider>
    </QueryClientProvider>
  );
}

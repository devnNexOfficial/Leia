export type LegalPageSlug =
  "privacy-policy" | "terms-of-service" | "accessibility" | "cookie-policy";
export type LegalPageDefinition = { slug: LegalPageSlug; title: string; content: string };

const placeholderNotice =
  "Placeholder notice: This template is provided for general information only. Please have it reviewed and tailored by qualified legal counsel before relying on it.";

export const legalPages: LegalPageDefinition[] = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    content: `${placeholderNotice}\n\n## Information we collect\nWe may collect information you provide when you place an order, create an account, contact us, or join our newsletter. This can include your name, email address, phone number, delivery address, and order details. We may also collect limited technical information such as device, browser, and website usage data.\n\n## How we use information\nWe use this information to process orders, arrange delivery, provide customer support, prevent fraud, improve our store, and send marketing messages where you have chosen to receive them.\n\n## Sharing and security\nWe share information only with service providers needed to operate the store, such as payment, delivery, hosting, and analytics providers, or where required by law. We use reasonable safeguards, but no online service can guarantee absolute security.\n\n## Advertising, Analytics and Meta (Facebook/Instagram)\nWe collect your email address, phone number, first and last name, city and country when you place an order, start filling in our checkout form, subscribe to our newsletter, or contact us. We also automatically collect your IP address, browser and device information, cookies and similar identifiers (including Meta's _fbp and _fbc cookies), and a random anonymous identifier stored in your browser to recognise repeat visits.\n\nWe use this information to measure website activity and orders, and to improve and measure our advertising on Meta platforms (Facebook and Instagram). This helps us understand and improve our marketing and measure order conversions.\n\nWe share this information with Meta Platforms through the Meta Pixel and Meta Conversions API. When shared, customer identifiers such as email address, phone number, name, and city are sent in hashed (scrambled) form using SHA-256, never as plain text.\n\nYou have choices regarding this data: you can clear your browser storage and cookies at any time; you can manage your advertising preferences within your Meta or Facebook account settings; you can contact us at hello@leia.pk to request access, stop use, or delete your information; and you can unsubscribe from our newsletter at any time via the link in our emails.\n\nWe retain this information only for as long as needed for these measurement and marketing purposes or as required by applicable law.\n\n## Your choices and rights\nYou may ask to access, correct, delete, or restrict use of your personal information, and you can opt out of marketing at any time. Contact us using the details below to make a request.\n\n## Contact\nFor privacy questions, please contact our customer support team at hello@leia.pk with your name and the email address used with us.`,
  },
  {
    slug: "terms-of-service",
    title: "Terms of Service",
    content: `${placeholderNotice}\n\n## Using this store\nBy using this website or placing an order, you agree to these terms. You must provide accurate order and contact details and use the store only for lawful purposes.\n\n## Products, pricing, and availability\nWe aim to keep product details, prices, and stock information accurate, but errors can occur. We may correct errors, update information, limit quantities, or cancel an order where necessary, including after an order has been submitted.\n\n## Orders and payment\nAn order is subject to acceptance and availability. Payment methods, delivery charges, and estimated delivery times are shown during checkout. We may contact you to verify an order before dispatch.\n\n## Returns and liability\nReturns and exchanges are governed by our published returns policy. To the extent permitted by law, we are not liable for indirect or consequential loss arising from use of this store or its products.\n\n## Changes and contact\nWe may update these terms from time to time. Continued use of the store after an update means you accept the revised terms. Contact customer support with questions.`,
  },
  {
    slug: "accessibility",
    title: "Accessibility Statement",
    content: `${placeholderNotice}\n\n## Our commitment\nWe want our online store to be usable by as many people as possible, including people using assistive technologies. We work to provide clear content, readable text, keyboard-friendly interactions, and meaningful image descriptions where practical.\n\n## Ongoing improvements\nAccessibility is an ongoing effort. We review and improve the site as features, content, and technology change. Some third-party content or services may not yet meet every accessibility need.\n\n## Need help?\nIf you have trouble using any part of this website, need information in another format, or want to report an accessibility barrier, please contact customer support. Tell us what you were trying to do and how we can help.`,
  },
  {
    slug: "cookie-policy",
    title: "Cookie Policy",
    content: `${placeholderNotice}\n\n## What cookies are\nCookies are small text files placed on your device when you visit a website. They help a website remember information about your visit and can make the service work more effectively.\n\n## How we use cookies\nWe may use essential cookies to keep the store functioning, preference cookies to remember settings, analytics cookies to understand site use, and marketing cookies where applicable and permitted.\n\n## Your choices\nYou can control or delete cookies through your browser settings. Blocking some cookies may affect features such as shopping cart, checkout, or saved preferences.\n\n## Updates and contact\nWe may update this policy when our practices or technologies change. Contact customer support if you have questions about our use of cookies.`,
  },
];

export const legalPageBySlug = (slug: LegalPageSlug) =>
  legalPages.find((page) => page.slug === slug)!;

const items = [
  "💄 Luscious", "✨ Rivaj UK", "🌸 J.", "💎 Medora", "💫 MyGlamm",
  "🎀 Sapphire", "🌹 Olivia", "✦ Makeup & Skincare", "🇵🇰 100% Authentic",
  "🚚 Free Delivery", "💵 Cash on Delivery (COD)", "🎁 Gift Wrapping Available",
];

// Tripled for seamless loop
const marqueeItems = [...items, ...items, ...items];

export function PressMarquee() {
  return (
    <div className="relative overflow-hidden bg-[#D6336C] border-y border-[#b82a5b] py-3 select-none">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-[#D6336C] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-[#D6336C] to-transparent pointer-events-none" />

      <div className="flex animate-marquee whitespace-nowrap">
        {marqueeItems.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-5 mx-5 text-xs font-bold tracking-[0.15em] text-white/90 uppercase"
          >
            {item}
            <span className="text-white/40 text-xs">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

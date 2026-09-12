const items = [
  "LUSCIOUS COSMETICS",
  "RIVAJ UK",
  "J. BEAUTY",
  "MEDORA",
  "MYGLAMM",
  "SAPPHIRE",
  "OLIVIA",
  "100% AUTHENTIC",
  "FREE NATIONWIDE DELIVERY",
  "CASH ON DELIVERY",
  "SIGNATURE GIFT WRAPPING",
];

// Duplicate list for seamless 100% loop with translateX(-50%)
const marqueeItems = [...items, ...items];

export function PressMarquee() {
  return (
    <div className="relative h-9 flex items-center overflow-hidden bg-[#D6336C] border-y border-[#B82A5B] select-none">
      {/* Subtle ambient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-r from-[#D6336C] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-l from-[#D6336C] to-transparent pointer-events-none" />

      <div className="flex animate-marquee-slow whitespace-nowrap items-center">
        {marqueeItems.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-8 sm:gap-12 mx-5 sm:mx-8 text-[11px] sm:text-xs font-semibold tracking-[0.18em] text-white uppercase shrink-0"
          >
            <span>{item}</span>
            <span className="text-white/40 text-[9px] select-none">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

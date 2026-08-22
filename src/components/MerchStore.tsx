"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { logError } from "@/lib/logger";
import { amazonProductUrl, amazonSearchUrl } from "@/lib/affiliate-config";

interface MerchItem {
  id: string;
  name: string;
  image: string;
  price: string;
  originalPrice?: string;
  affiliateUrl: string;
  platform: string;
  category: string;
  rating?: number;
  reviews?: number;
  tags: string[];
  anime: string;
}

function amazonUrl(asin: string): string {
  return amazonProductUrl(asin);
}

const MERCH_ITEMS: MerchItem[] = [
  // ══════════════════════════════════════════════
  // FIGURINES
  // ══════════════════════════════════════════════
  {
    id: "figurine-tanjiro-bandai",
    name: "Demon Slayer Tanjiro Kamado — Breath of Water (Bandai FiguartsZERO)",
    image: "https://m.media-amazon.com/images/I/71OSV9DA6GL._AC_SL1500_.jpg",
    price: "₹2,499",
    originalPrice: "₹3,999",
    affiliateUrl: amazonUrl("B084C9Z7KP"),
    platform: "Amazon",
    category: "Figurines",
    tags: ["Demon Slayer", "Figurine", "Tanjiro", "Bandai"],
    anime: "Demon Slayer",
  },
  {
    id: "figurine-luffy-little-ones",
    name: "One Piece Straw Hat Luffy Action Figure (20cm)",
    image: "https://m.media-amazon.com/images/I/71Y2ot9ofXL._AC_SL1500_.jpg",
    price: "₹1,319",
    originalPrice: "₹2,889",
    affiliateUrl: amazonUrl("B0F5BR9483"),
    platform: "Amazon",
    category: "Figurines",
    tags: ["One Piece", "Figurine", "Luffy"],
    anime: "One Piece",
  },
  {
    id: "figurine-gojo-funfob",
    name: "Jujutsu Kaisen Gojo Satoru Action Figure (21.5cm)",
    image: "https://m.media-amazon.com/images/I/31LNc8YzeUL._AC_SL1500_.jpg",
    price: "₹642",
    originalPrice: "₹2,999",
    affiliateUrl: amazonUrl("B0GVPTQ45G"),
    platform: "Amazon",
    category: "Figurines",
    tags: ["Jujutsu Kaisen", "Figurine", "Gojo"],
    anime: "Jujutsu Kaisen",
  },
  {
    id: "figurine-zoro-trunkin",
    name: "One Piece Roronoa Zoro Battle Mode Figure",
    image: "https://m.media-amazon.com/images/I/61op+F7QRuL._AC_SL1500_.jpg",
    price: "₹1,329",
    originalPrice: "₹3,999",
    affiliateUrl: amazonUrl("B0GNJRFDV2"),
    platform: "Amazon",
    category: "Figurines",
    tags: ["One Piece", "Figurine", "Zoro"],
    anime: "One Piece",
  },
  {
    id: "figurine-naruto-banpresto",
    name: "Naruto Shippuden Kakashi Hatake Banpresto Figure",
    image: "https://m.media-amazon.com/images/I/71FQLUqipWL._AC_SL1500_.jpg",
    price: "₹2,499",
    originalPrice: "₹3,499",
    affiliateUrl: amazonUrl("B0DFCNGSC9"),
    platform: "Amazon",
    category: "Figurines",
    tags: ["Naruto", "Figurine", "Kakashi", "Banpresto"],
    anime: "Naruto",
  },
  {
    id: "figurine-ds-set",
    name: "Demon Slayer Figure Set of 6 — Tanjiro, Nezuko, Zenitsu & More",
    image: "https://m.media-amazon.com/images/I/61FHv4KFEpL._AC_SL1500_.jpg",
    price: "₹1,599",
    originalPrice: "₹4,499",
    affiliateUrl: amazonUrl("B0HCRS42YK"),
    platform: "Amazon",
    category: "Figurines",
    tags: ["Demon Slayer", "Figurine", "Set", "Tanjiro", "Nezuko"],
    anime: "Demon Slayer",
  },
  {
    id: "figurine-tanjiro-fowwelt",
    name: "FowWelt Demon Slayer Tanjiro Action Figure 16CM PVC Collectible",
    image: "https://m.media-amazon.com/images/I/41gp-+-Gk8L._AC_SL1500_.jpg",
    price: "₹398",
    originalPrice: "₹999",
    affiliateUrl: amazonUrl("B0DV4GRN9Q"),
    platform: "Amazon",
    category: "Figurines",
    tags: ["Demon Slayer", "Figurine", "Tanjiro", "FowWelt"],
    anime: "Demon Slayer",
  },

  // ══════════════════════════════════════════════
  // CLOTHING
  // ══════════════════════════════════════════════
  {
    id: "clothing-hxh-tee",
    name: "Hunter x Hunter Gon & Killua Streetwear Oversized T-Shirt",
    image: "https://m.media-amazon.com/images/I/51NEaHK03tL._AC_SL1500_.jpg",
    price: "₹899",
    originalPrice: "₹1,399",
    affiliateUrl: amazonUrl("B0D6BQGKR8"),
    platform: "Amazon",
    category: "Clothing",
    tags: ["Hunter x Hunter", "T-Shirt", "Streetwear", "Gon", "Killua"],
    anime: "Hunter x Hunter",
  },
  {
    id: "clothing-tokyo-hoodie",
    name: "Tokyo Revengers Manji Uniform Anime Hoodie",
    image: "https://m.media-amazon.com/images/I/81+3g00XzmL._AC_SL1500_.jpg",
    price: "₹889",
    originalPrice: "₹1,999",
    affiliateUrl: amazonUrl("B0BR85YWFD"),
    platform: "Amazon",
    category: "Clothing",
    tags: ["Tokyo Revengers", "Hoodie", "Streetwear"],
    anime: "Tokyo Revengers",
  },
  {
    id: "clothing-op-tee",
    name: "One Piece Luffy Most Wanted Anime Oversized T-Shirt",
    image: "https://m.media-amazon.com/images/I/51V0uVw4DpL._AC_SL1500_.jpg",
    price: "₹649",
    originalPrice: "₹999",
    affiliateUrl: amazonUrl("B0C1WTNNKK"),
    platform: "Amazon",
    category: "Clothing",
    tags: ["One Piece", "T-Shirt", "Luffy"],
    anime: "One Piece",
  },
  {
    id: "clothing-jjk-hoodie",
    name: "Jujutsu Kaisen Gojo Satoru Anime Hoodie",
    image: "https://m.media-amazon.com/images/I/617lX5UZxmL._AC_SL1500_.jpg",
    price: "₹1,699",
    originalPrice: "₹2,200",
    affiliateUrl: amazonUrl("B0BV8HBZLL"),
    platform: "Amazon",
    category: "Clothing",
    tags: ["Jujutsu Kaisen", "Hoodie", "Gojo"],
    anime: "Jujutsu Kaisen",
  },
  {
    id: "clothing-ds-zenitsu",
    name: "Demon Slayer Zenitsu Agatsuma Oversized T-Shirt",
    image: "https://m.media-amazon.com/images/I/5108uMOHuiL._AC_SL1500_.jpg",
    price: "₹549",
    originalPrice: "₹999",
    affiliateUrl: amazonUrl("B0D9HBJS7L"),
    platform: "Amazon",
    category: "Clothing",
    tags: ["Demon Slayer", "T-Shirt", "Zenitsu"],
    anime: "Demon Slayer",
  },

  // ══════════════════════════════════════════════
  // ACCESSORIES
  // ══════════════════════════════════════════════
  {
    id: "accessory-ds-keychain",
    name: "Demon Slayer Anime Keychain Set (Pack of 4)",
    image: "https://m.media-amazon.com/images/I/51IH34aVMaL._AC_SL1500_.jpg",
    price: "₹899",
    originalPrice: "₹2,499",
    affiliateUrl: amazonUrl("B0H23F1KMT"),
    platform: "Amazon",
    category: "Accessories",
    tags: ["Demon Slayer", "Keychain", "Set", "Tanjiro"],
    anime: "Demon Slayer",
  },
  {
    id: "accessory-naruto-holder",
    name: "Naruto Uzumaki Bobblehead Figure with Mobile Holder",
    image: "https://m.media-amazon.com/images/I/51Jro8V58ZL._AC_SL1500_.jpg",
    price: "₹450",
    originalPrice: "₹999",
    affiliateUrl: amazonUrl("B0CW1R53VD"),
    platform: "Amazon",
    category: "Accessories",
    tags: ["Naruto", "Bobblehead", "Desk", "Mobile Holder"],
    anime: "Naruto",
  },
  {
    id: "accessory-anime-lamp",
    name: "Anime LED Action Figure Lamp with Glow Effect",
    image: "https://m.media-amazon.com/images/I/71bjCUqejNL._AC_SL1500_.jpg",
    price: "₹1,399",
    originalPrice: "₹2,999",
    affiliateUrl: amazonUrl("B0H9S3B93B"),
    platform: "Amazon",
    category: "Accessories",
    tags: ["Lamp", "LED", "Decoration", "Berserk"],
    anime: "Berserk",
  },
  {
    id: "accessory-tumbler-luffy",
    name: "One Piece Luffy Anime Steel Tumbler 600ml + Keychain",
    image: "https://m.media-amazon.com/images/I/719XtED7rbL._AC_SL1500_.jpg",
    price: "₹849",
    originalPrice: "₹1,499",
    affiliateUrl: amazonUrl("B0D14Z6GSS"),
    platform: "Amazon",
    category: "Accessories",
    tags: ["One Piece", "Tumbler", "Luffy", "Keychain"],
    anime: "One Piece",
  },

  // ══════════════════════════════════════════════
  // MANGA
  // ══════════════════════════════════════════════
  {
    id: "manga-op-vol1",
    name: "One Piece Manga Vol. 1 — Romance Dawn",
    image: "https://m.media-amazon.com/images/I/81rEhhwbubL._AC_SL1500_.jpg",
    price: "₹579",
    originalPrice: "₹799",
    affiliateUrl: amazonUrl("1569319014"),
    platform: "Amazon",
    category: "Manga",
    tags: ["One Piece", "Manga", "Vol. 1", "Romance Dawn"],
    anime: "One Piece",
  },
  {
    id: "manga-naruto-vol1",
    name: "Naruto Manga Vol. 1",
    image: "https://m.media-amazon.com/images/I/91tMEjJraaL._AC_SL1500_.jpg",
    price: "₹509",
    originalPrice: "₹799",
    affiliateUrl: amazonUrl("1569319006"),
    platform: "Amazon",
    category: "Manga",
    tags: ["Naruto", "Manga", "Vol. 1"],
    anime: "Naruto",
  },
  {
    id: "manga-aot-vol1",
    name: "Attack on Titan Manga Vol. 1",
    image: "https://m.media-amazon.com/images/I/81ZvSRPmJqL._AC_SL1500_.jpg",
    price: "₹538",
    originalPrice: "₹799",
    affiliateUrl: amazonUrl("1421534428"),
    platform: "Amazon",
    category: "Manga",
    tags: ["Attack on Titan", "Manga", "Vol. 1", "Eren"],
    anime: "Attack on Titan",
  },
  {
    id: "manga-jjk-vol1",
    name: "Jujutsu Kaisen Manga Vol. 1",
    image: "https://m.media-amazon.com/images/I/91Mp2Q93CpL._AC_SL1500_.jpg",
    price: "₹509",
    originalPrice: "₹799",
    affiliateUrl: amazonUrl("1974710025"),
    platform: "Amazon",
    category: "Manga",
    tags: ["Jujutsu Kaisen", "Manga", "Vol. 1", "Yuji"],
    anime: "Jujutsu Kaisen",
  },
  {
    id: "manga-ds-vol1",
    name: "Demon Slayer Kimetsu no Yaiba Manga Vol. 1",
    image: "https://m.media-amazon.com/images/I/91W2VwJpLhL._AC_SL1500_.jpg",
    price: "₹509",
    originalPrice: "₹799",
    affiliateUrl: amazonUrl("1974700526"),
    platform: "Amazon",
    category: "Manga",
    tags: ["Demon Slayer", "Manga", "Vol. 1", "Tanjiro"],
    anime: "Demon Slayer",
  },
];

const CATEGORIES = ["All", "Figurines", "Clothing", "Accessories", "Manga"] as const;
const PLATFORM_FILTERS = ["All", "Amazon"] as const;

function matchesSearch(item: MerchItem, query: string): boolean {
  const q = query.toLowerCase();
  const searchable = [
    item.name,
    item.category,
    item.anime,
    item.platform,
    ...item.tags,
  ]
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).every((word) => searchable.includes(word));
}

export default function MerchStore() {
  const [category, setCategory] = useState<string>("All");
  const [platformFilter, setPlatformFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const handleSearchAmazon = useCallback(() => {
    const q = search.trim();
    if (!q) return;
    window.open(amazonSearchUrl(q), "_blank", "noopener,noreferrer");
  }, [search]);

  const filtered = MERCH_ITEMS.filter((item) => {
    if (category !== "All" && item.category !== category) return false;
    if (platformFilter !== "All" && item.platform !== platformFilter) return false;
    if (search && !matchesSearch(item, search)) return false;
    return true;
  });

  return (
    <>
      <style>{`
        @keyframes neonBorder {
          0%   { border-color: #ff00ff; box-shadow: 0 0 8px #ff00ff55, inset 0 0 8px #ff00ff11; }
          20%  { border-color: #00ffff; box-shadow: 0 0 8px #00ffff55, inset 0 0 8px #00ffff11; }
          40%  { border-color: #ff3366; box-shadow: 0 0 8px #ff336655, inset 0 0 8px #ff336611; }
          60%  { border-color: #ffff00; box-shadow: 0 0 8px #ffff0055, inset 0 0 8px #ffff0011; }
          80%  { border-color: #ff0066; box-shadow: 0 0 8px #ff006655, inset 0 0 8px #ff006611; }
          100% { border-color: #ff00ff; box-shadow: 0 0 8px #ff00ff55, inset 0 0 8px #ff00ff11; }
        }
        .neon-border {
          animation: neonBorder 4s linear infinite;
          border-width: 1.5px;
          border-style: solid;
        }
        .neon-border-card {
          animation: neonBorder 4s linear infinite;
          animation-delay: calc(var(--i, 0) * -0.4s);
          border-width: 1px;
          border-style: solid;
        }
        @keyframes neonBorderHover {
          0%   { border-color: #ff00ff; box-shadow: 0 0 14px #ff00ff, 0 0 28px #ff00ff88; }
          20%  { border-color: #00ffff; box-shadow: 0 0 14px #00ffff, 0 0 28px #00ffff88; }
          40%  { border-color: #ff3366; box-shadow: 0 0 14px #ff3366, 0 0 28px #ff336688; }
          60%  { border-color: #ffff00; box-shadow: 0 0 14px #ffff00, 0 0 28px #ffff0088; }
          80%  { border-color: #ff0066; box-shadow: 0 0 14px #ff0066, 0 0 28px #ff006688; }
          100% { border-color: #ff00ff; box-shadow: 0 0 14px #ff00ff, 0 0 28px #ff00ff88; }
        }
        .neon-border-card:hover {
          animation: neonBorderHover 1.5s linear infinite !important;
          transform: scale(1.03);
        }
        .neon-filter {
          animation: neonBorder 4s linear infinite;
          animation-delay: calc(var(--fd, 0) * -1s);
          border-width: 1px;
          border-style: solid;
        }
        .merch-search:focus,
        .merch-search:focus-visible,
        .merch-search:focus-within {
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>

      <div>
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3">
          {/* Search Bar */}
          <div className="relative">
            <button
              type="button"
              onClick={handleSearchAmazon}
              title="Search on Amazon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-mute)] transition-colors hover:text-[var(--color-cyan)]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            <input
              type="text"
              placeholder="Search anime merch — press Enter to search on Amazon"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchAmazon();
                }
              }}
              className="merch-search neon-border w-full rounded-xl bg-[var(--color-surface1)] pl-12 pr-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-mute)] focus:outline-none focus:ring-0 focus:border-transparent"
            />
          </div>

          {/* Filter Rows */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest text-[var(--color-mute)] font-mono shrink-0">Category</span>
            <div className="neon-filter flex flex-wrap gap-1.5 rounded-xl bg-[var(--color-surface1)] p-1.5" style={{ ["--fd" as string]: "0" }}>
              {CATEGORIES.map((f) => (
                <button
                  key={f}
                  onClick={() => setCategory(f)}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                    category === f
                      ? "bg-[var(--color-magenta)] text-white shadow-[0_0_10px_var(--color-magenta)]"
                      : "text-[var(--color-mute)] hover:text-[var(--color-text)] hover:bg-white/5"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <span className="text-[10px] uppercase tracking-widest text-[var(--color-mute)] font-mono shrink-0">Platform</span>
            <div className="neon-filter flex flex-wrap gap-1.5 rounded-xl bg-[var(--color-surface1)] p-1.5" style={{ ["--fd" as string]: "2" }}>
              {PLATFORM_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setPlatformFilter(f)}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                    platformFilter === f
                      ? "bg-[var(--color-magenta)] text-white shadow-[0_0_10px_var(--color-magenta)]"
                      : "text-[var(--color-mute)] hover:text-[var(--color-text)] hover:bg-white/5"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        {search && (
          <p className="mb-3 text-xs text-[var(--color-mute)]">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
          </p>
        )}

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item, i) => (
            <MerchCard key={item.id} item={item} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="mb-2 text-lg text-[var(--color-mute)]">No items found.</p>
            <p className="text-xs text-[var(--color-mute)]">Try searching for &ldquo;anime&rdquo;, &ldquo;naruto&rdquo;, &ldquo;figure&rdquo;, or &ldquo;manga&rdquo;</p>
          </div>
        )}

        {/* Disclaimer */}
        <p className="mt-6 text-center text-[10px] text-[var(--color-mute)]">
          * As an Amazon Associate, we earn from qualifying purchases. Prices may vary.
        </p>
      </div>
    </>
  );
}

function MerchCard({ item, index }: { item: MerchItem; index: number }) {
  const handleClick = useCallback(async () => {
    try {
      await fetch("/api/affiliate/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partner: "amazon", page: "/merch" }),
      });
    } catch (e) { logError(e); }
  }, []);

  return (
    <a
      href={item.affiliateUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className="neon-border-card group overflow-hidden rounded-xl bg-[var(--color-surface1)] transition-all"
      style={{ ["--i" as string]: index }}
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          loading="lazy"
          className="object-cover transition-transform group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {item.originalPrice && (
          <span className="absolute top-2 right-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
            SALE
          </span>
        )}
        <span className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          {item.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="mb-2 text-sm font-bold line-clamp-2 group-hover:text-[var(--color-cyan)]">
          {item.name}
        </h3>
        <div className="mb-2 flex items-center gap-2">
          {item.rating && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-yellow-400">★</span>
              <span className="text-xs text-[var(--color-mute)]">{item.rating}</span>
            </div>
          )}
          {item.reviews && (
            <span className="text-[10px] text-[var(--color-mute)]">({item.reviews})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-[var(--color-cyan)]">{item.price}</span>
          {item.originalPrice && (
            <span className="text-xs text-[var(--color-mute)] line-through">{item.originalPrice}</span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded bg-[var(--color-surface2)] px-1.5 py-0.5 text-[9px] text-[var(--color-mute)]">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-[var(--color-mute)]">on {item.platform}</span>
          <span className="text-xs font-bold text-[var(--color-cyan)] group-hover:underline">
            Buy Now →
          </span>
        </div>
      </div>
    </a>
  );
}

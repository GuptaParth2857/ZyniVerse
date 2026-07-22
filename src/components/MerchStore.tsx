"use client";

import { useState } from "react";

interface MerchItem {
  id: string;
  name: string;
  image: string;
  price: string;
  originalPrice?: string;
  affiliateUrl: string;
  platform: string;
  rating?: number;
  reviews?: number;
  tags: string[];
}

const MERCH_ITEMS: MerchItem[] = [
  // ══════════════════════════════════════════════
  // FIGURINES
  // ══════════════════════════════════════════════
  {
    id: "figurine-one-piece-luffy",
    name: "One Piece Monkey D. Luffy Figurine",
    image: "https://m.media-amazon.com/images/I/71Q0Q7GQ+QL._AC_SL1500_.jpg",
    price: "₹1,299",
    originalPrice: "₹1,999",
    affiliateUrl: "https://amzn.to/3xK5Z1j",
    platform: "Amazon",
    rating: 4.5,
    reviews: 234,
    tags: ["One Piece", "Figurine", "Luffy"],
  },
  {
    id: "figurine-naruto-uzumaki",
    name: "Naruto Uzumaki Action Figure",
    image: "https://m.media-amazon.com/images/I/71Q0Q7GQ+QL._AC_SL1500_.jpg",
    price: "₹899",
    originalPrice: "₹1,499",
    affiliateUrl: "https://amzn.to/3xK5Z1j",
    platform: "Amazon",
    rating: 4.3,
    reviews: 187,
    tags: ["Naruto", "Figurine", "Action Figure"],
  },
  {
    id: "figurine-goku-dragon-ball",
    name: "Dragon Ball Z Goku Super Saiyan",
    image: "https://m.media-amazon.com/images/I/71Q0Q7GQ+QL._AC_SL1500_.jpg",
    price: "₹1,599",
    originalPrice: "₹2,499",
    affiliateUrl: "https://amzn.to/3xK5Z1j",
    platform: "Amazon",
    rating: 4.7,
    reviews: 312,
    tags: ["Dragon Ball", "Figurine", "Goku"],
  },
  {
    id: "figurine-eren-attack-on-titan",
    name: "Attack on Titan Eren Jaeger Figure",
    image: "https://m.media-amazon.com/images/I/71Q0Q7GQ+QL._AC_SL1500_.jpg",
    price: "₹1,899",
    originalPrice: "₹2,999",
    affiliateUrl: "https://amzn.to/3xK5Z1j",
    platform: "Amazon",
    rating: 4.6,
    reviews: 156,
    tags: ["Attack on Titan", "Figurine", "Eren"],
  },
  {
    id: "figurine-tanjiro-demon-slayer",
    name: "Demon Slayer Tanjiro Kamado Figure",
    image: "https://m.media-amazon.com/images/I/71Q0Q7GQ+QL._AC_SL1500_.jpg",
    price: "₹1,399",
    originalPrice: "₹2,199",
    affiliateUrl: "https://amzn.to/3xK5Z1j",
    platform: "Amazon",
    rating: 4.4,
    reviews: 198,
    tags: ["Demon Slayer", "Figurine", "Tanjiro"],
  },

  // ══════════════════════════════════════════════
  // CLOTHING
  // ══════════════════════════════════════════════
  {
    id: "clothing-one-piece-tshirt",
    name: "One Piece Straw Hat Pirates T-Shirt",
    image: "https://m.media-amazon.com/images/I/71Q0Q7GQ+QL._AC_SL1500_.jpg",
    price: "₹599",
    originalPrice: "₹999",
    affiliateUrl: "https://amzn.to/3xK5Z1j",
    platform: "Amazon",
    rating: 4.2,
    reviews: 456,
    tags: ["One Piece", "Clothing", "T-Shirt"],
  },
  {
    id: "clothing-naruto-hoodie",
    name: "Naruto Uzumaki Hoodie",
    image: "https://m.media-amazon.com/images/I/71Q0Q7GQ+QL._AC_SL1500_.jpg",
    price: "₹899",
    originalPrice: "₹1,499",
    affiliateUrl: "https://amzn.to/3xK5Z1j",
    platform: "Amazon",
    rating: 4.4,
    reviews: 234,
    tags: ["Naruto", "Clothing", "Hoodie"],
  },
  {
    id: "clothing-dragon-ball-cap",
    name: "Dragon Ball Z Capsule Corp Cap",
    image: "https://m.media-amazon.com/images/I/71Q0Q7GQ+QL._AC_SL1500_.jpg",
    price: "₹499",
    originalPrice: "₹799",
    affiliateUrl: "https://amzn.to/3xK5Z1j",
    platform: "Amazon",
    rating: 4.1,
    reviews: 189,
    tags: ["Dragon Ball", "Clothing", "Cap"],
  },

  // ══════════════════════════════════════════════
  // ACCESSORIES
  // ══════════════════════════════════════════════
  {
    id: "accessory-anime-keychain",
    name: "Anime Character Keychain Set (6 pcs)",
    image: "https://m.media-amazon.com/images/I/71Q0Q7GQ+QL._AC_SL1500_.jpg",
    price: "₹399",
    originalPrice: "₹699",
    affiliateUrl: "https://amzn.to/3xK5Z1j",
    platform: "Amazon",
    rating: 4.3,
    reviews: 567,
    tags: ["Keychain", "Accessories", "Set"],
  },
  {
    id: "accessory-anime-mug",
    name: "Dragon Ball Z Kamehameha Coffee Mug",
    image: "https://m.media-amazon.com/images/I/71Q0Q7GQ+QL._AC_SL1500_.jpg",
    price: "₹349",
    originalPrice: "₹599",
    affiliateUrl: "https://amzn.to/3xK5Z1j",
    platform: "Amazon",
    rating: 4.5,
    reviews: 345,
    tags: ["Dragon Ball", "Mug", "Kitchen"],
  },
  {
    id: "accessory-anime-poster",
    name: "Attack on Titan Wall Poster (24x36)",
    image: "https://m.media-amazon.com/images/I/71Q0Q7GQ+QL._AC_SL1500_.jpg",
    price: "₹299",
    originalPrice: "₹599",
    affiliateUrl: "https://amzn.to/3xK5Z1j",
    platform: "Amazon",
    rating: 4.6,
    reviews: 234,
    tags: ["Attack on Titan", "Poster", "Decoration"],
  },

  // ══════════════════════════════════════════════
  // MANGA
  // ══════════════════════════════════════════════
  {
    id: "manga-one-piece-vol1",
    name: "One Piece Manga Vol. 1",
    image: "https://m.media-amazon.com/images/I/71Q0Q7GQ+QL._AC_SL1500_.jpg",
    price: "₹399",
    originalPrice: "₹500",
    affiliateUrl: "https://amzn.to/3xK5Z1j",
    platform: "Amazon",
    rating: 4.8,
    reviews: 1234,
    tags: ["One Piece", "Manga", "Book"],
  },
  {
    id: "manga-naruto-vol1",
    name: "Naruto Manga Vol. 1",
    image: "https://m.media-amazon.com/images/I/71Q0Q7GQ+QL._AC_SL1500_.jpg",
    price: "₹399",
    originalPrice: "₹500",
    affiliateUrl: "https://amzn.to/3xK5Z1j",
    platform: "Amazon",
    rating: 4.7,
    reviews: 987,
    tags: ["Naruto", "Manga", "Book"],
  },
  {
    id: "manga-attack-on-titan-vol1",
    name: "Attack on Titan Manga Vol. 1",
    image: "https://m.media-amazon.com/images/I/71Q0Q7GQ+QL._AC_SL1500_.jpg",
    price: "₹399",
    originalPrice: "₹500",
    affiliateUrl: "https://amzn.to/3xK5Z1j",
    platform: "Amazon",
    rating: 4.6,
    reviews: 876,
    tags: ["Attack on Titan", "Manga", "Book"],
  },
];

const PLATFORM_FILTERS = ["All", "Amazon", "CDJapan", "Crunchyroll Store"] as const;

export default function MerchStore() {
  const [platformFilter, setPlatformFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const filtered = MERCH_ITEMS.filter((item) => {
    if (platformFilter !== "All" && item.platform !== platformFilter) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search merch..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-[var(--color-surface2)] bg-[var(--color-surface1)] px-4 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-mute)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cyan)]"
        />
        <div className="flex gap-1 rounded-lg border border-[var(--color-surface2)] bg-[var(--color-surface1)] p-1">
          {PLATFORM_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setPlatformFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                platformFilter === f
                  ? "bg-[var(--color-cyan)] text-black"
                  : "text-[var(--color-mute)] hover:text-[var(--color-text)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item) => (
          <MerchCard key={item.id} item={item} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-10 text-center text-[var(--color-mute)]">
          No items found.
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-6 text-center text-[10px] text-[var(--color-mute)]">
        * As an Amazon Associate, we earn from qualifying purchases. Prices may vary.
      </p>
    </div>
  );
}

function MerchCard({ item }: { item: MerchItem }) {
  return (
    <a
      href={item.affiliateUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group overflow-hidden rounded-xl border border-[var(--color-surface2)] bg-[var(--color-surface1)] transition-all hover:border-[var(--color-cyan)] hover:shadow-lg hover:shadow-[var(--color-cyan)]/5"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {item.originalPrice && (
          <span className="absolute top-2 right-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
            SALE
          </span>
        )}
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
            <span className="text-[10px] text-[var(--color-mute)]">({item.reviews} reviews)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-[var(--color-cyan)]">{item.price}</span>
          {item.originalPrice && (
            <span className="text-xs text-[var(--color-mute)] line-through">{item.originalPrice}</span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {item.tags.slice(0, 2).map((tag) => (
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

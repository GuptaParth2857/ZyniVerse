import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export default function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      ...(crumb.href ? { item: `${BASE_URL}${crumb.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)] overflow-x-auto">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2 whitespace-nowrap">
            {i > 0 && <span>/</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-[var(--color-cyan)] transition-colors truncate max-w-[200px]">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-[var(--color-ink)]">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}

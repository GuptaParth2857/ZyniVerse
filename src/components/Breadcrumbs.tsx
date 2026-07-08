import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)] overflow-x-auto">
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
  );
}

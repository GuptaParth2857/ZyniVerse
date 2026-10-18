// Next.js only enables on-demand ISR for a dynamic segment when
// `generateStaticParams` exists. page.tsx here is a Client Component, so the
// route segment config lives in this layout instead. Empty array means no
// build-time prerender; hits after the first are served from the CDN.
export const revalidate = 21600;

export function generateStaticParams() {
  return [];
}

export default function CommissionLayout({ children }: { children: React.ReactNode }) {
  return children;
}

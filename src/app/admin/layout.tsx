"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-void)]">
      <AdminSidebar />
      <main className="lg:ml-56 px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}

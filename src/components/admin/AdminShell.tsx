"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("adminSidebarCollapsed") === "1") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCollapsed(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.dataset.adminSidebar = collapsed ? "hidden" : "open";
    return () => {
      delete document.documentElement.dataset.adminSidebar;
    };
  }, [collapsed]);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("adminSidebarCollapsed", next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-void)]">
      <AdminSidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      <main className="px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}

import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminSession } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, isAdmin } = await getAdminSession();
  if (!session || !isAdmin) {
    redirect("/login");
  }

  return <AdminShell>{children}</AdminShell>;
}

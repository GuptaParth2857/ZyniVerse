import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserListForm from "@/components/UserListForm";

export const metadata = {
  title: "Create List | ZyniVerse",
};

export default async function CreateListPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="neon-rgb-border rounded-xl px-4 py-2 mb-8">
        <h1 className="text-3xl font-bold">Create Custom List</h1>
      </div>
      <UserListForm />
    </div>
  );
}

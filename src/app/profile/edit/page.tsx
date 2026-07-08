import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import ProfileEditor from "@/components/ProfileEditor";

export const metadata: Metadata = {
  title: "Edit Profile - ZyniVerse",
  description: "Customize your profile",
};

export default async function EditProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Edit Profile</h1>
        <p className="text-white/50 mb-8">Customize your profile appearance and forum signature</p>
        <div className="bg-white/5 rounded-xl p-6">
          <ProfileEditor
            user={{
              id: user.id,
              username: user.username,
              bio: user.bio,
              banner: user.banner,
              themeColor: user.themeColor,
              signature: user.signature,
              avatar: user.avatar,
            }}
          />
        </div>
      </div>
    </main>
  );
}

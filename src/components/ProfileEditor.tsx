"use client";

import { useState } from "react";

const THEME_COLORS = ["emerald", "blue", "purple", "pink", "amber", "teal", "rose", "indigo"];

export default function ProfileEditor({ user: initial }: { user: { id: string; username: string; bio: string | null; banner: string | null; themeColor: string | null; signature: string | null; avatar: string | null } }) {
  const [user, setUser] = useState(initial);
  const [saving, setSaving] = useState(false);

  const save = async (field: string, value: string) => {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value || null }),
    });
    setUser((prev) => ({ ...prev, [field]: value }));
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-white/60 mb-2">Banner URL</label>
        <div className="flex gap-2">
          <input type="text" defaultValue={user.banner || ""} onBlur={(e) => save("banner", e.target.value)}
            placeholder="https://example.com/banner.jpg"
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 placeholder:text-white/30 outline-none focus:border-emerald-500/50" />
        </div>
        {user.banner && (
          <img src={user.banner} alt="Banner preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
        )}
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-2">Avatar URL</label>
        <input type="text" defaultValue={user.avatar || ""} onBlur={(e) => save("avatar", e.target.value)}
          placeholder="https://example.com/avatar.jpg"
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 placeholder:text-white/30 outline-none focus:border-emerald-500/50" />
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-2">Bio</label>
        <textarea defaultValue={user.bio || ""} onBlur={(e) => save("bio", e.target.value)} rows={3}
          placeholder="Tell us about yourself..."
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 placeholder:text-white/30 outline-none focus:border-emerald-500/50 resize-none" />
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-2">Theme Color</label>
        <div className="flex gap-2">
          {THEME_COLORS.map((color) => (
            <button key={color} onClick={() => save("themeColor", color)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                user.themeColor === color ? "border-white scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: `var(--color-${color})` }} />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-2">Forum Signature</label>
        <textarea defaultValue={user.signature || ""} onBlur={(e) => save("signature", e.target.value)} rows={2}
          placeholder="Your forum signature (displayed below forum posts)"
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 placeholder:text-white/30 outline-none focus:border-emerald-500/50 resize-none" />
      </div>

      {saving && <div className="text-xs text-emerald-400">Saving...</div>}
    </div>
  );
}

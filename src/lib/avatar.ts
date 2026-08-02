export function isDefaultAvatar(url?: string | null): boolean {
  if (!url) return true;
  const u = url.toLowerCase().trim();
  if (u === "") return true;
  if (u.includes("/a/default")) return true;
  if (u.includes("avatars.githubusercontent.com/u/0")) return true;
  if (u.includes("/identicon.png")) return true;
  if (u.includes("/mp.png")) return true;
  return false;
}

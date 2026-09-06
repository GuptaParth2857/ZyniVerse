export function parseAge(age?: string | number | null): { ageInt: number | null; ageLabel: string | null } {
  if (age == null || age === "") return { ageInt: null, ageLabel: null };
  const str = String(age).trim();
  if (!str || /unknown|n\/a/i.test(str)) return { ageInt: null, ageLabel: null };
  const match = str.match(/\d+/g);
  const nums = match ? match.map(Number) : [];
  if (nums.length === 0) return { ageInt: null, ageLabel: str };
  const ageInt = Math.min(...nums);
  return { ageInt, ageLabel: str };
}

export function normalizeGender(g?: string | null): string | null {
  if (!g) return null;
  const s = g.trim().toLowerCase();
  if (s.includes("female")) return "Female";
  if (s.includes("male")) return "Male";
  if (s.includes("non-binary") || s.includes("nonbinary")) return "Non-binary";
  return s || null;
}
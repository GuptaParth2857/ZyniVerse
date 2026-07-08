export interface TierData {
  tier: string;
  label: string;
  color: string;
  description: string;
}

export const TIERS: TierData[] = [
  { tier: 'S', label: 'S', color: '#FF7F7F', description: 'Peak Fiction — Absolute Masterpiece' },
  { tier: 'A', label: 'A', color: '#FFBF7F', description: 'Excellent — Must Watch' },
  { tier: 'B', label: 'B', color: '#FFDF7F', description: 'Great — Highly Enjoyable' },
  { tier: 'C', label: 'C', color: '#BFFF7F', description: 'Good — Solid Experience' },
  { tier: 'D', label: 'D', color: '#7FBFFF', description: 'Decent — Has Its Moments' },
  { tier: 'F', label: 'F', color: '#BF7FFF', description: 'Skip — Not Worth Your Time' },
];

export function getTierColor(tier: string): string {
  return TIERS.find((t) => t.tier === tier)?.color || '#888';
}

export function getTierData(tier: string): TierData | undefined {
  return TIERS.find((t) => t.tier === tier);
}

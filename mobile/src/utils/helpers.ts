export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

export function formatScore(score?: number): string {
  if (!score) return '--';
  return (score / 10).toFixed(1);
}

export function getScoreColor(score?: number): string {
  if (!score) return '#94a3b8';
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#22d3ee';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

export function getFillerColor(percentage: number): string {
  if (percentage <= 10) return '#22c55e';
  if (percentage <= 30) return '#f59e0b';
  return '#ef4444';
}

export function getEpisodeTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'canon':
    case 'manga_canon':
      return '#22c55e';
    case 'mixed':
    case 'mostly_canon':
      return '#f59e0b';
    case 'filler':
      return '#ef4444';
    default:
      return '#64748b';
  }
}

export function formatTimeUntilAiring(seconds: number): string {
  if (seconds <= 0) return 'Airing now';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'watching': return '#22c55e';
    case 'completed': return '#3b82f6';
    case 'planning': return '#f59e0b';
    case 'dropped': return '#ef4444';
    case 'paused': return '#94a3b8';
    default: return '#64748b';
  }
}

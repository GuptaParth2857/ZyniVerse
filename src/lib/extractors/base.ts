export interface VideoSource {
  url: string;
  quality: string;
  format: "hls" | "mp4" | "dash";
  Headers?: Record<string, string>;
}

export interface ExtractedMedia {
  sources: VideoSource[];
  tracks?: { file: string; label: string; kind: string }[];
  embedUrl?: string;
  source: string;
}

export interface SiteExtractor {
  name: string;
  canExtract(url: string): boolean;
  extract(url: string): Promise<ExtractedMedia>;
}

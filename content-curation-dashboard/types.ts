export enum Platform {
  YouTube = 'YouTube',
  Facebook = 'Facebook',
  Blog = 'Blog',
}

export interface ContentItem {
  id: string;
  platform: Platform;
  url: string;
  title: string;
  description: string;
  publishDate: string; // YYYY-MM-DD
  views?: number;
  likes?: number;
  rating?: number; // 1-5 scale
  author?: string;
}

export type SortOrder = 'newest' | 'oldest';

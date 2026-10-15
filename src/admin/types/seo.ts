export type SitemapType = 'page' | 'route' | 'article';

export interface SitemapEntry {
  path: string;
  lastmod: string;
  type: SitemapType;
}

export interface SitemapResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data: SitemapEntry[];
}

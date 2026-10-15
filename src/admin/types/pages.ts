import type { MediaDoc } from './media';

export type PageKind = 'system' | 'content';

export interface PageDoc {
  id: number;
  slug: string;
  kind: PageKind;
  title: string;
  content?: Record<string, unknown> | null;
  contentHtml?: string | null;
  status: 'draft' | 'published';
  seo?: {
    metaTitle?: string | null;
    appendBrand?: boolean | null;
    metaDescription?: string | null;
    ogImage?: (number | null) | MediaDoc;
    noindex?: boolean | null;
  };
  createdAt: string;
  updatedAt: string;
}

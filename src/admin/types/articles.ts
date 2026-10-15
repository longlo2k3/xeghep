import type { MediaDoc } from './media';
import type { RouteDoc } from './routes';

export type ArticleCategory = 'kinh-nghiem' | 'tin-tuyen' | 'khuyen-mai';

export interface TOCItem {
  id: string;
  text: string;
  level?: number;
}

export interface ArticleDoc {
  id: number;
  slug: string;
  title: string;
  category: ArticleCategory;
  excerpt: string;
  content: string;
  contentHtml?: string | null;
  tableOfContents?: TOCItem[] | unknown | null;
  author: string;
  authorType?: 'Organization' | 'Person' | null;
  featuredImage: number | MediaDoc;
  relatedRoute?: (number | null) | RouteDoc;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string | null;
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

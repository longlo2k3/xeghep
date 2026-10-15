export type RedirectStatusCode = '301' | '302' | '308' | '410';
export type RedirectSource = 'auto' | 'manual' | 'seed' | 'auto_slug_change';

export interface RedirectDoc {
  id: number;
  fromUrl?: string;
  toUrl?: string | null;
  from?: string;
  to?: string | null;
  statusCode: RedirectStatusCode;
  source?: RedirectSource | null;
  isActive?: boolean | null;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

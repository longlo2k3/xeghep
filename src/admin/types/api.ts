export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiError {
  code?: string;
  message: string;
  fields?: ApiFieldError[];
  statusCode?: number;
}

export interface ApiResponse<T> {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: T;
  doc?: T;
  error?: ApiError;
  meta?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter?: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

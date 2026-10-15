export type Role = "admin" | "dispatcher" | "editor";

export const roleOf = (req: { user?: { role?: string } | null } | undefined): Role | null =>
  (req?.user?.role as Role | undefined) ?? null;

/** Bất kỳ user đã đăng nhập nào (admin panel). */
export const isAuthenticated = ({ req }: { req?: any }): boolean => Boolean(req?.user);

/** Chỉ admin. */
export const isAdmin = ({ req }: { req?: any }): boolean => roleOf(req) === "admin";

/** admin + editor (routes, articles, pages, media). */
export const isAdminOrEditor = ({ req }: { req?: any }): boolean => {
  const role = roleOf(req);
  return role === "admin" || role === "editor";
};

/** admin + dispatcher (bookings). */
export const isAdminOrDispatcher = ({ req }: { req?: any }): boolean => {
  const role = roleOf(req);
  return role === "admin" || role === "dispatcher";
};

/** Nội dung công khai: ai cũng đọc được. */
export const openRead = (): boolean => true;

/** Chỉ admin ghi (redirects, bảng giá phụ, globals). */
export const adminWrite = ({ req }: { req?: any }): boolean => roleOf(req) === "admin";

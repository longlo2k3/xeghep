/**
 * Slugify tiếng Việt: bỏ dấu, đ/Đ -> d, chữ thường, ký tự lạ -> '-', gộp '-', bỏ '-' đầu/cuối.
 */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

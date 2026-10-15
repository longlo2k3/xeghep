import { describe, expect, it } from "vitest";

import { slugify } from "../src/lib/seo/slugify";

describe("slugify", () => {
  it("slugifies a route name with arrows and Vietnamese diacritics", () => {
    expect(slugify("Hải Phòng ⇄ Hà Nội ⇄ Nội Bài")).toBe(
      "hai-phong-ha-noi-noi-bai",
    );
  });

  it("handles Đà Nẵng (đ + dấu nặng)", () => {
    expect(slugify("Đà Nẵng")).toBe("da-nang");
  });

  it("lowercases and strips diacritics", () => {
    expect(slugify("Hạ Long")).toBe("ha-long");
    expect(slugify("Móng Cái")).toBe("mong-cai");
    expect(slugify("Bắc Ninh – Bắc Giang")).toBe("bac-ninh-bac-giang");
  });

  it("converts đ / Đ to d", () => {
    expect(slugify("đường")).toBe("duong");
    expect(slugify("Đường")).toBe("duong");
  });

  it("collapses spaces and punctuation into single dashes", () => {
    expect(slugify("  Trắng   Đen, màu!  ")).toBe("trang-den-mau");
    expect(slugify("chính sách / bảo mật")).toBe("chinh-sach-bao-mat");
  });

  it("never leaves leading or trailing dashes", () => {
    expect(slugify("Xe Ghép!")).toBe("xe-ghep");
    expect(slugify("---đầu---cuối---")).toBe("dau-cuoi");
  });

  it("returns empty string for empty or symbol-only input", () => {
    expect(slugify("")).toBe("");
    expect(slugify("   ")).toBe("");
    expect(slugify("⇄ ⇄")).toBe("");
  });
});

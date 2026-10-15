import { describe, expect, it } from "vitest";

import { assertPriceFrom, parseVndText } from "../src/seed/parseVndText";

describe("parseVndText", () => {
  it("parses a plain k price", () => {
    expect(parseVndText("400k")).toEqual({
      min: 400000,
      max: null,
      from: false,
      negotiable: false,
    });
  });

  it('marks "từ 899k" as from-price', () => {
    expect(parseVndText("từ 899k")).toEqual({
      min: 899000,
      max: null,
      from: true,
      negotiable: false,
    });
  });

  it("parses a k range", () => {
    expect(parseVndText("400k – 500k")).toEqual({
      min: 400000,
      max: 500000,
      from: false,
      negotiable: false,
    });
  });

  it("parses dotted thousands in a range", () => {
    expect(parseVndText("1.500k – 1.600k")).toEqual({
      min: 1500000,
      max: 1600000,
      from: false,
      negotiable: false,
    });
  });

  it('marks "Liên hệ thỏa thuận" as negotiable', () => {
    expect(parseVndText("Liên hệ thỏa thuận")).toEqual({
      min: null,
      max: null,
      from: false,
      negotiable: true,
    });
  });

  it("parses plain VND written with đ", () => {
    expect(parseVndText("150.000đ")).toEqual({
      min: 150000,
      max: null,
      from: false,
      negotiable: false,
    });
  });

  it("returns null for empty input", () => {
    expect(parseVndText("")).toBeNull();
    expect(parseVndText(undefined)).toBeNull();
    expect(parseVndText(null)).toBeNull();
  });

  it("throws when nothing can be parsed", () => {
    expect(() => parseVndText("giá liên vòng")).toThrow('Không parse được giá: "giá liên vòng"');
    expect(() => parseVndText("contact us")).toThrow("Không parse được giá");
  });
});

describe("assertPriceFrom", () => {
  it("passes when priceFrom equals tierShare1.min", () => {
    expect(() =>
      assertPriceFrom({ slug: "hai-phong-ha-noi-noi-bai", priceFrom: 400000, priceShare1Text: "400k" }),
    ).not.toThrow();
  });

  it("passes for a range price using its min", () => {
    expect(() =>
      assertPriceFrom({
        slug: "hai-phong-bac-ninh-bac-giang",
        priceFrom: 400000,
        priceShare1Text: "400k – 500k",
      }),
    ).not.toThrow();
  });

  it("throws when priceFrom does not match", () => {
    expect(() =>
      assertPriceFrom({ slug: "ha-noi-ha-long", priceFrom: 500000, priceShare1Text: "450k – 550k" }),
    ).toThrow("Lệch priceFrom ở ha-noi-ha-long: 500000 vs 450000");
  });

  it("throws when priceShare1Text is missing", () => {
    expect(() => assertPriceFrom({ slug: "x", priceFrom: 400000 })).toThrow("Lệch priceFrom ở x");
  });
});

import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { Media } from "../src/collections/Media";
import { GET as serveMedia } from "../src/app/media/[...path]/route";

const upload = Media.upload as Exclude<typeof Media.upload, boolean | undefined>;
const imageSizes = upload.imageSizes ?? [];

function getField(name: string) {
  return Media.fields.find((field) => "name" in field && field.name === name) as any;
}

describe("T080 — media pipeline config", () => {
  it("upload config: staticDir media, mimeTypes chỉ ảnh", () => {
    expect(upload.staticDir).toBe("media");
    expect(upload.mimeTypes).toEqual([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ]);
  });

  it("sharp imageSizes: card 640w / hero 1600w / og 1200x630 crop", () => {
    expect(imageSizes.map((size) => size.name)).toEqual(["card", "hero", "og"]);

    const card = imageSizes.find((size) => size.name === "card")!;
    expect(card.width).toBe(640);
    expect(card.withoutEnlargement).toBe(true);

    const hero = imageSizes.find((size) => size.name === "hero")!;
    expect(hero.width).toBe(1600);

    const og = imageSizes.find((size) => size.name === "og")!;
    expect(og.width).toBe(1200);
    expect(og.height).toBe(630);
    expect(og.fit).toBe("cover");
  });

  it("bản gốc được cap ≤ 2400px qua resizeOptions (fit inside, không phóng to)", () => {
    expect(upload.resizeOptions).toMatchObject({
      fit: "inside",
      height: 2400,
      width: 2400,
      withoutEnlargement: true,
    });
  });

  it("alt bắt buộc (a11y + SEO theo data-model)", () => {
    const alt = getField("alt");
    expect(alt).toBeTruthy();
    expect(alt.required).toBe(true);
  });

  it("URL của doc và mọi size không bao giờ nằm dưới /api/", () => {
    const doc: any = {
      filename: "HaNoi.webp",
      sizes: {
        card: { url: "/api/media/file/HaNoi-640x360.webp" },
        hero: { url: "/api/media/file/HaNoi-1600x900.webp" },
        og: { url: "/media/HaNoi-1200x630.webp" },
      },
      url: "/api/media/file/HaNoi.webp",
    };

    const hook = (Media.hooks as any).afterRead[0];
    const result = hook({ doc, req: {} });

    expect(result.url).toBe("/media/HaNoi.webp");
    expect(result.sizes.card.url).toBe("/media/HaNoi-640x360.webp");
    expect(result.sizes.hero.url).toBe("/media/HaNoi-1600x900.webp");
    expect(result.sizes.og.url).toBe("/media/HaNoi-1200x630.webp");

    const urlField: any = getField("url");
    const afterRead = urlField.hooks.afterRead[0];
    expect(
      afterRead({
        data: { filename: "banner.webp" },
        originalDoc: {},
        value: "/api/media/file/banner.webp",
      }),
    ).toBe("/media/banner.webp");
    expect(
      afterRead({
        data: {},
        originalDoc: {},
        value: "/api/media/file/banner.webp",
      }),
    ).toBe("/media/banner.webp");
  });
});

describe("T080 — route /media/* (không nằm dưới /api/)", () => {
  const context = (segments: string[]) => ({
    params: Promise.resolve({ path: segments }),
  });

  it.runIf(fs.existsSync(path.join(process.cwd(), "media", "HaNoi.webp")))(
    "GET /media/<file> trả 200 + content-type ảnh",
    async () => {
      const response = await serveMedia(
        new Request("http://localhost:3001/media/HaNoi.webp"),
        context(["HaNoi.webp"]),
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe("image/webp");
    },
  );

  it.runIf(fs.existsSync(path.join(process.cwd(), "media", "HaNoi.webp")))(
    "fallback trả 200 cho file có hậu tố số (-2) khi file gốc tồn tại",
    async () => {
      const response = await serveMedia(
        new Request("http://localhost:3001/media/HaNoi-2.webp"),
        context(["HaNoi-2.webp"]),
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe("image/webp");
    },
  );

  it.runIf(fs.existsSync(path.join(process.cwd(), "media", "HaNoi.webp")))(
    "fallback trả 200 cho file có hậu tố số và size (-2-640x360) khi file gốc tồn tại",
    async () => {
      const response = await serveMedia(
        new Request("http://localhost:3001/media/HaNoi-2-640x360.webp"),
        context(["HaNoi-2-640x360.webp"]),
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe("image/webp");
    },
  );

  it("chặn path traversal ra ngoài media/", async () => {
    const response = await serveMedia(
      new Request("http://localhost:3001/media/../payload.config.ts"),
      context(["..", "payload.config.ts"]),
    );
    expect(response.status).toBe(404);
  });

  it("404 khi file không tồn tại", async () => {
    const response = await serveMedia(
      new Request("http://localhost:3001/media/khong-ton-tai.webp"),
      context(["khong-ton-tai.webp"]),
    );
    expect(response.status).toBe(404);
  });
});


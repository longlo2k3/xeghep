import { beforeEach, describe, expect, it, vi } from "vitest";

const find = vi.fn();
vi.mock("@/lib/api/ctx", () => ({ getPayloadInstance: async () => ({ find }) }));

import { getRoutesDirect } from "@/lib/api/server";
import { GET } from "@/app/api/v1/routes/route";

describe("public route display order", () => {
  beforeEach(() => {
    find.mockReset();
    find.mockResolvedValue({ docs: [], totalDocs: 0 });
  });

  it("sorts server-rendered routes by the CMS display order", async () => {
    await getRoutesDirect();
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "routes", sort: "sortOrder" }),
    );
  });

  it("sorts the public routes API by the same display order", async () => {
    await GET(new Request("https://example.com/api/v1/routes"));
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "routes", sort: "sortOrder" }),
    );
  });
});

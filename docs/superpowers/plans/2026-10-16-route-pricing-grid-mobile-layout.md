# RoutePricingGrid Mobile Pricing Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make pricing details in each route card use the approved two-column label-and-price layout on mobile while preserving the existing tablet and desktop rows.

**Architecture:** Keep `RoutePricingCard` server-rendered and reuse its single pricing-detail map. Responsive Tailwind utilities will switch the collection and item layout at the `sm` breakpoint, avoiding duplicated content and viewport JavaScript.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 3, Vitest, React DOM server renderer

---

## File structure

- Create `tests/route-pricing-grid.test.ts`: focused server-rendered markup test for responsive class contracts, content order, and decorative marker accessibility.
- Modify `src/components/home/RoutePricingGrid.tsx`: responsive mobile pricing grid and item presentation; desktop presentation remains intact.

### Task 1: Lock the responsive markup contract with a failing test

**Files:**
- Create: `tests/route-pricing-grid.test.ts`
- Test: `tests/route-pricing-grid.test.ts`

- [x] **Step 1: Write the failing test**

```ts
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RoutePricingCard } from "@/components/home/RoutePricingGrid";
import type { RouteItem } from "@/lib/types";

const route: RouteItem = {
  slug: "ha-noi-hai-phong",
  name: "Hà Nội - Hải Phòng",
  origin: "Hà Nội",
  destination: "Hải Phòng",
  distance: "120 km",
  duration: "2 giờ",
  priceFrom: 250_000,
  priceShare1Text: "250k - 300k",
  priceShare2Text: "",
  priceCharter4to5Text: "400k - 500k",
  priceCharter7Text: "500k - 600k",
  pricingDetails: [
    { label: "Ghép 1 khách", price: "250k - 300k" },
    { label: "Bao xe 4 chỗ", price: "400k - 500k" },
    { label: "Bao xe 7 chỗ", price: "500k - 600k" },
  ],
  description: "",
  pickups: [],
  dropoffs: [],
  faqs: [],
  regions: [],
};

describe("RoutePricingCard", () => {
  it("uses a two-column pricing layout only below the sm breakpoint", () => {
    const html = renderToStaticMarkup(
      React.createElement(RoutePricingCard, { route }),
    );

    expect(html).toContain('data-testid="pricing-details"');
    expect(html).toContain("grid grid-cols-2");
    expect(html).toContain("sm:block");
    expect(html).toContain('aria-hidden="true"');
    expect(html.indexOf("Ghép 1 khách")).toBeLessThan(
      html.indexOf("Bao xe 4 chỗ"),
    );
    expect(html.indexOf("Bao xe 4 chỗ")).toBeLessThan(
      html.indexOf("Bao xe 7 chỗ"),
    );
  });
});
```

- [x] **Step 2: Run the focused test and verify that it fails**

Run: `npm test -- --project site tests/route-pricing-grid.test.ts`

Expected: FAIL because the current pricing-detail container does not contain `data-testid="pricing-details"`, `grid grid-cols-2`, `sm:block`, or an `aria-hidden="true"` marker.

- [x] **Step 3: Commit the failing test**

```bash
git add tests/route-pricing-grid.test.ts
git commit -m "test: specify mobile route pricing layout"
```

### Task 2: Implement the mobile-only two-column pricing layout

**Files:**
- Modify: `src/components/home/RoutePricingGrid.tsx:57-81`
- Test: `tests/route-pricing-grid.test.ts`

- [x] **Step 1: Change the pricing collection and items with responsive Tailwind utilities**

Replace the pricing-detail collection with:

```tsx
<div
  data-testid="pricing-details"
  className="grid grid-cols-2 gap-x-2 gap-y-2 sm:block sm:space-y-1"
>
  {route.pricingDetails.map((detail, idx) => (
    <div
      key={idx}
      className="min-w-0 px-1 py-0.5 sm:flex sm:items-center sm:justify-between sm:py-1 sm:px-2 sm:rounded sm:odd:bg-white sm:even:bg-slate-100/80"
    >
      <span className="flex min-w-0 items-start gap-1.5 text-[10px] font-medium leading-tight text-slate-700 sm:items-center sm:text-xs sm:truncate sm:pr-1">
        <span
          aria-hidden="true"
          className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-[#d9261c] sm:hidden"
        />
        {getServiceIcon(
          detail.label,
          "hidden sm:block w-3.5 h-3.5 text-slate-400 flex-shrink-0",
        )}
        <span className="min-w-0 sm:truncate">{detail.label}</span>
      </span>
      <span className="mt-0.5 block pl-3 text-left text-xs font-extrabold leading-tight text-[#d9261c] sm:mt-0 sm:pl-0 sm:text-right sm:flex-shrink-0">
        {detail.price}
      </span>
    </div>
  ))}
</div>
```

This preserves DOM order, so an odd last item naturally occupies the left cell of the final CSS-grid row. The `sm:block` breakpoint restores the existing desktop stacking model, and the `sm:*` item utilities restore the horizontal rows.

- [x] **Step 2: Run the focused test and verify that it passes**

Run: `npm test -- --project site tests/route-pricing-grid.test.ts`

Expected: PASS with one passing test.

- [x] **Step 3: Run static verification**

Run: `npm run typecheck`

Expected: exit code 0 with no TypeScript errors.

Run: `npx eslint src/components/home/RoutePricingGrid.tsx tests/route-pricing-grid.test.ts`

Expected: exit code 0 with no lint errors.

- [x] **Step 4: Review the diff for scope and whitespace errors**

Run: `git diff --check -- src/components/home/RoutePricingGrid.tsx tests/route-pricing-grid.test.ts`

Expected: no output and exit code 0.

Run: `git diff -- src/components/home/RoutePricingGrid.tsx tests/route-pricing-grid.test.ts`

Expected: only the approved responsive pricing markup and focused test are present; existing changes in `src/app/(site)/globals.css`, `src/lib/api.ts`, and `src/lib/api/redirects.ts` are absent from this diff.

- [x] **Step 5: Commit the implementation**

```bash
git add src/components/home/RoutePricingGrid.tsx tests/route-pricing-grid.test.ts
git commit -m "feat: add mobile route pricing grid"
```

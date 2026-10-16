# RoutePricingGrid mobile pricing layout

## Context

`RoutePricingGrid` is a server-rendered Next.js App Router component styled with Tailwind CSS. Each route card currently renders pricing details as full-width horizontal rows on every viewport.

## Goal

On mobile viewports only, present the pricing details in a compact two-column layout inspired by the supplied reference image. Keep the existing tablet and desktop row layout unchanged.

## Design

- At widths below the project's `sm` breakpoint, render the pricing-detail collection as a two-column grid.
- Each mobile item shows a small brand-colored circular marker, the service label on the first line, and the price as the stronger second line.
- Preserve the source order. When the item count is odd, the last item occupies the left column of the final row.
- At `sm` and wider, preserve the current alternating horizontal rows, service icons, right-aligned prices, spacing, and visual hierarchy.
- Keep the existing section heading, route cards, actions, links, and data unchanged.
- Use responsive Tailwind classes in the existing markup; do not add viewport JavaScript or duplicate mobile/desktop pricing DOM trees.

## Accessibility and SEO

- Pricing labels and values remain server-rendered text in the DOM.
- The decorative marker is hidden from assistive technology.
- Text contrast and readable font sizing must remain adequate on the light pricing surface.
- No navigation, metadata, structured data, or crawl behavior changes are required.

## Verification

- Add or update a focused component test if an existing suitable test pattern is available.
- Run the relevant component test, TypeScript check, and lint for the changed file.
- Verify the responsive classes encode a two-column mobile grid and restore the existing row layout from `sm` upward.
- Confirm no unrelated working-tree changes are included.

## Acceptance criteria

1. Mobile pricing details visually follow the reference layout structure: two columns, marker plus label, price below.
2. An odd final pricing item stays in the left column.
3. Tablet and desktop retain the existing horizontal row presentation.
4. Pricing content, order, links, and card behavior do not change.

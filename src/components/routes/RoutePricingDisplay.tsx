import React, { type ReactNode } from "react";

import { sanitizeRoutePricingHtml } from "@/lib/seo/sanitize";
import { sanitizeRoutePricingCss } from "@/lib/seo/sanitizeRoutePricingCss";
import { RoutePricingScriptFrame } from "./RoutePricingScriptFrame";

type Props = {
  customHtml: string | null;
  customCss?: string | null;
  customJs?: string | null;
  children?: ReactNode;
};

/** Render on the server so the chosen price table is present in raw HTML. */
export function RoutePricingDisplay({ customHtml, customCss, customJs, children }: Props) {
  const safeHtml = sanitizeRoutePricingHtml(customHtml);
  const safeCss = sanitizeRoutePricingCss(customCss);

  if (safeHtml.trim()) {
    if (customJs?.trim()) return <RoutePricingScriptFrame html={safeHtml} css={safeCss} javascript={customJs} />;
    return (
      <div data-route-pricing className="route-custom-pricing overflow-x-auto text-slate-700">
        {safeCss && <style>{safeCss}</style>}
        <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
      </div>
    );
  }

  return <div className="overflow-x-auto">{children}</div>;
}

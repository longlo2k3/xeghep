"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { buildRoutePricingFrame } from "@/lib/seo/buildRoutePricingFrame";

type Props = { html: string; css: string; javascript: string };

export function RoutePricingScriptFrame({ html, css, javascript }: Props) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const token = useRef("");
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [height, setHeight] = useState(160);

  useEffect(() => {
    token.current = crypto.randomUUID();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow || event.data?.type !== "route-pricing-height" || event.data?.token !== token.current) return;
      const nextHeight = Number(event.data.height);
      if (Number.isFinite(nextHeight)) setHeight(Math.max(40, Math.min(10000, Math.ceil(nextHeight))));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [mounted]);

  const srcDoc = useMemo(() => mounted ? buildRoutePricingFrame(html, css, javascript, token.current) : "", [mounted, html, css, javascript]);

  return (
    <div className="route-custom-pricing text-slate-700">
      {!ready && <div data-route-pricing>
        {css && <style>{css}</style>}
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>}
      {mounted && <iframe
        ref={frameRef}
        title="Bảng giá chi tiết tuyến tương tác"
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
        srcDoc={srcDoc}
        onLoad={() => setReady(true)}
        hidden={!ready}
        style={{ width: "100%", height, border: 0 }}
      />}
    </div>
  );
}

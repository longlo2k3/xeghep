/** Build an isolated document for administrator-authored price table behavior. */
export function buildRoutePricingFrame(html: string, css: string, javascript: string, token: string): string {
  const code = JSON.stringify(javascript).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  const resizeToken = JSON.stringify(token);
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-src 'none'"><style>html,body{margin:0;padding:0}body{overflow:hidden}${css}</style></head><body><div data-route-pricing>${html}</div><script>
    const sendHeight = () => parent.postMessage({ type: 'route-pricing-height', token: ${resizeToken}, height: document.documentElement.scrollHeight }, '*');
    new ResizeObserver(sendHeight).observe(document.body);
    window.addEventListener('load', sendHeight);
    try { (0, eval)(${code}); } catch (error) { console.error('Route pricing script error:', error); }
    sendHeight();
  <\/script></body></html>`;
}

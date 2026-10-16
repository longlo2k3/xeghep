import fs from "node:fs";
import { Client } from "pg";
import { sanitizeRoutePricingCss } from "./src/lib/seo/sanitizeRoutePricingCss.ts";
import { sanitizeRoutePricingHtml } from "./src/lib/seo/sanitize.ts";
import { buildRoutePricingFrame } from "./src/lib/seo/buildRoutePricingFrame.ts";

const uri = fs.readFileSync(".env.local", "utf8").split(/\r?\n/).find((line) => line.startsWith("DATABASE_URI=")).slice(13);
const db = new Client({ connectionString: uri });
await db.connect();
const result = await db.query("select custom_pricing_html,custom_pricing_css,custom_pricing_js from routes where slug=$1", ["ha-noi-ninh-binh"]);
await db.end();
const route = result.rows[0];
const css = fs.readFileSync("docs/examples/ninh-binh-pricing.css", "utf8");
const frame = buildRoutePricingFrame(sanitizeRoutePricingHtml(route.custom_pricing_html), sanitizeRoutePricingCss(css), route.custom_pricing_js, "probe-token");
const escaped = frame.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
fs.writeFileSync(".tmp-route-pricing-browser.html", `<!doctype html><html><head><meta charset="utf-8"></head><body><h1>Pricing browser probe</h1><iframe sandbox="allow-scripts" srcdoc="${escaped}" style="width:100%;height:850px;border:1px solid #888"></iframe></body></html>`);

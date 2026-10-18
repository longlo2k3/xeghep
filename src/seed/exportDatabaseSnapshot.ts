import fs from "node:fs";

import { loadEnv } from "payload/node";

import {
  SNAPSHOT_PATH,
  snapshotDoc,
  sourceForMedia,
  type DatabaseSnapshot,
} from "./databaseSnapshot";

(process.env as Record<string, string | undefined>).NODE_ENV = "development";
process.env.PAYLOAD_DB_PUSH = "false";
loadEnv();

const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config");
const payload = await getPayload({ config });

async function all(collection: "media" | "routes" | "pages" | "articles" | "airport_pricing" | "distance_rates" | "redirects") {
  const result = await payload.find({
    collection,
    limit: 1000,
    depth: 0,
    overrideAccess: true,
    sort: "id",
  });
  if (result.hasNextPage) throw new Error(`${collection}: export exceeds 1000 records`);
  return result.docs as Record<string, any>[];
}

try {
  const [media, routes, pages, articles, airport, distance, redirects, company, pricing] =
    await Promise.all([
      all("media"),
      all("routes"),
      all("pages"),
      all("articles"),
      all("airport_pricing"),
      all("distance_rates"),
      all("redirects"),
      payload.findGlobal({ slug: "company_settings", depth: 0, overrideAccess: true }),
      payload.findGlobal({ slug: "pricing_settings", depth: 0, overrideAccess: true }),
    ]);

  const snapshot: DatabaseSnapshot = {
    version: 1,
    media: media.map((doc) => ({
      sourceId: doc.id,
      source: sourceForMedia(doc.filename),
      alt: doc.alt,
      caption: doc.caption ?? null,
    })),
    routes: routes.map((doc) => snapshotDoc(doc, ["priceFrom"])),
    pages: pages.map((doc) => snapshotDoc(doc)),
    articles: articles.map((doc) => snapshotDoc(doc)),
    airportPricing: airport.map((doc) => snapshotDoc(doc, ["roundTripWarning"])),
    distanceRates: distance.map((doc) => snapshotDoc(doc)),
    redirects: redirects.map((doc) => snapshotDoc(doc)),
    companySettings: snapshotDoc(company as Record<string, any>, [
      "hotlineHref", "zaloHref", "smsHref", "domainName",
    ]).data,
    pricingSettings: snapshotDoc(pricing as Record<string, any>, ["priceValidUntilWarning"]).data,
  };

  fs.writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`Exported DB seed to ${SNAPSHOT_PATH}`);
  console.log(`media=${snapshot.media.length}, routes=${snapshot.routes.length}, pages=${snapshot.pages.length}, articles=${snapshot.articles.length}, airport=${snapshot.airportPricing.length}, distance=${snapshot.distanceRates.length}, redirects=${snapshot.redirects.length}`);
} catch (error) {
  console.error(error);
  await payload.destroy();
  process.exit(1);
}

await payload.destroy();
process.exit(0);

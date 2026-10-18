import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const SNAPSHOT_PATH = path.join(PROJECT_ROOT, "src/seed/data/databaseSnapshot.json");

export type SnapshotDoc = { sourceId: number; data: Record<string, any> };
export type SnapshotMedia = {
  sourceId: number;
  source: string;
  alt: string;
  caption: string | null;
};
export type DatabaseSnapshot = {
  version: 1;
  media: SnapshotMedia[];
  routes: SnapshotDoc[];
  pages: SnapshotDoc[];
  articles: SnapshotDoc[];
  airportPricing: SnapshotDoc[];
  distanceRates: SnapshotDoc[];
  redirects: SnapshotDoc[];
  companySettings: Record<string, any>;
  pricingSettings: Record<string, any>;
};

/** The DB contains duplicate upload names (-1/-2); tracked originals are the seed assets. */
export function sourceForMedia(filename: string): string {
  const stem = path.parse(filename).name.replace(/-\d+$/, "");
  const candidates = ["media", "public"].flatMap((dir) =>
    fs.readdirSync(path.join(PROJECT_ROOT, dir))
      .filter((name) => path.parse(name).name === stem)
      .map((name) => `${dir}/${name}`),
  );
  const exact = candidates.find((candidate) => path.basename(candidate) === filename);
  const source = exact ?? candidates[0];
  if (!source) throw new Error(`No tracked source asset for media file ${filename}`);
  return source;
}

/** Keep editable fields, without DB IDs/timestamps or derived read-only values. */
export function snapshotDoc(doc: Record<string, any>, excluded: string[] = []): SnapshotDoc {
  const { id, createdAt: _createdAt, updatedAt: _updatedAt, ...data } = doc;
  if (typeof id !== "number") throw new Error("Snapshot document has no numeric ID");
  for (const key of excluded) delete data[key];
  return { sourceId: id, data };
}

export function readSnapshot(): DatabaseSnapshot {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8")) as DatabaseSnapshot;
  if (snapshot.version !== 1) throw new Error("Unsupported database seed snapshot version");
  return snapshot;
}

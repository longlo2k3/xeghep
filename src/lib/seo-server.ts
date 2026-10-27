import { getCompanySettings } from "@/lib/api";
import { normalizeSiteDomain, getFallbackSiteDomain } from "./seo";

/**
 * Resolves the primary site domain configured in Admin (CompanySettings).
 * Falls back to environment variable or default domain if unset.
 * SERVER-SIDE ONLY: uses getCompanySettings from @/lib/api.
 */
export async function resolveSiteDomain(): Promise<string> {
  if (process.env.VITEST) {
    return getFallbackSiteDomain();
  }
  try {
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
    const settingsPromise = getCompanySettings().catch(() => null);
    const settings = await Promise.race([settingsPromise, timeoutPromise]);
    const website = settings?.info?.website;
    if (website) {
      const normalized = normalizeSiteDomain(website);
      if (normalized) return normalized;
    }
  } catch {
    // fallback when DB/CMS is offline
  }
  return getFallbackSiteDomain();
}

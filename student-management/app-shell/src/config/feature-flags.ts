// app-shell/src/config/feature-flags.ts
import manifest from "../../../app-manifest.json";

// Map PBC ID → feature flag key
const PBC_FLAG_MAP: Record<string, keyof typeof manifest.featureFlags> = {
  // Thêm vào đây khi có PBC cần feature flag
  // "pbc-notification-center": "enableNotifications",
};

export function isFeatureEnabled(pbcId: string): boolean {
  const flagKey = PBC_FLAG_MAP[pbcId];
  if (!flagKey) return true; // Mặc định bật nếu không có flag
  return manifest.featureFlags[flagKey] === true;
}

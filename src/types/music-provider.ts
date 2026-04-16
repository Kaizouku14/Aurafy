export type ProviderId = "spotify" | "ytmusic";

export type ProviderPreference = ProviderId | "auto";

export type PlaybackRestrictionReason =
  | "premium_required"
  | "not_found"
  | "geo_blocked"
  | "rate_limited"
  | "unsupported"
  | "unknown";

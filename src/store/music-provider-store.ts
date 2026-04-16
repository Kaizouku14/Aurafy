import { create } from "zustand";
import type {
  PlaybackRestrictionReason,
  ProviderId,
  ProviderPreference,
} from "@/types/music-provider";

type SwitchReason =
  | PlaybackRestrictionReason
  | "playback_error"
  | "manual_switch";

interface MusicProviderState {
  hasSpotifyAuth: boolean;
  isSpotifyPremium: boolean;

  /**
   * User's preferred provider. "auto" means try preferred order with fallback.
   */
  preference: ProviderPreference;

  /**
   * Provider currently being used for playback.
   */
  activeProvider: ProviderId;

  /**
   * Whether the app switched providers automatically due to playback limitations.
   */
  isAutoSwitched: boolean;

  /**
   * Optional reason for the latest switch/fallback.
   */
  lastSwitchReason: SwitchReason | null;

  setPreference: (preference: ProviderPreference) => void;
  setSpotifyAuth: (hasSpotifyAuth: boolean) => void;
  setSpotifyPremium: (isSpotifyPremium: boolean) => void;
  setActiveProvider: (
    provider: ProviderId,
    options?: {
      autoSwitched?: boolean;
      reason?: MusicProviderState["lastSwitchReason"];
    },
  ) => void;
  resetSwitchState: () => void;

  /**
   * Returns provider order to try for playback attempts.
   */
  getAttemptOrder: () => ProviderId[];
}

type ProviderPolicyState = Pick<
  MusicProviderState,
  | "hasSpotifyAuth"
  | "isSpotifyPremium"
  | "preference"
  | "activeProvider"
  | "isAutoSwitched"
  | "lastSwitchReason"
>;

const enforceProviderPolicy = (
  state: ProviderPolicyState,
): ProviderPolicyState => {
  if (!state.hasSpotifyAuth) {
    return {
      ...state,
      isSpotifyPremium: false,
      preference: "ytmusic",
      activeProvider: "ytmusic",
      isAutoSwitched: false,
      lastSwitchReason: null,
    };
  }

  if (state.isSpotifyPremium) {
    return {
      ...state,
      preference: "spotify",
      activeProvider: "spotify",
      isAutoSwitched: false,
      lastSwitchReason: null,
    };
  }

  return state;
};

export const useMusicProviderStore = create<MusicProviderState>((set, get) => ({
  hasSpotifyAuth: false,
  isSpotifyPremium: false,
  preference: "ytmusic",
  activeProvider: "ytmusic",
  isAutoSwitched: false,
  lastSwitchReason: null,

  setSpotifyAuth: (hasSpotifyAuth) => {
    set((state) =>
      enforceProviderPolicy({
        ...state,
        hasSpotifyAuth,
      }),
    );
  },

  setSpotifyPremium: (isSpotifyPremium) => {
    set((state) =>
      enforceProviderPolicy({
        ...state,
        isSpotifyPremium,
      }),
    );
  },

  setPreference: (preference) => {
    set((state) => {
      // When user explicitly chooses a provider, align active provider immediately.
      if (preference === "spotify" || preference === "ytmusic") {
        return enforceProviderPolicy({
          ...state,
          preference,
          activeProvider: preference,
          isAutoSwitched: false,
          lastSwitchReason: "manual_switch" as const,
        });
      }

      // "auto" keeps current active provider until orchestrator decides otherwise.
      return enforceProviderPolicy({
        ...state,
        preference,
        isAutoSwitched: false,
        lastSwitchReason: null,
      });
    });
  },

  setActiveProvider: (provider, options) => {
    set((state) =>
      enforceProviderPolicy({
        ...state,
        activeProvider: provider,
        isAutoSwitched: options?.autoSwitched ?? false,
        lastSwitchReason: options?.reason ?? null,
      }),
    );
  },

  resetSwitchState: () =>
    set((state) => ({
      ...state,
      isAutoSwitched: false,
      lastSwitchReason: null,
    })),

  getAttemptOrder: () => {
    const { preference, hasSpotifyAuth, isSpotifyPremium } =
      enforceProviderPolicy(get());

    if (!hasSpotifyAuth) return ["ytmusic"];
    if (isSpotifyPremium) return ["spotify"];

    if (preference === "spotify") return ["spotify", "ytmusic"];
    if (preference === "ytmusic") return ["ytmusic", "spotify"];

    // auto
    return ["spotify", "ytmusic"];
  },
}));

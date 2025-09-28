import {
  AccountInfo,
  AppState,
  BuildStateResult,
  ParsedDataset,
  PrivacyBuckets,
  RequestsBuckets,
} from "../types";
import { deriveFollowData } from "./metrics";
import { mergeParsedDatasets } from "./parsers";

const defaultAccount: AccountInfo = {
  username: undefined,
  snapshotDate: undefined,
};

const createEmptyRequests = (): RequestsBuckets => ({
  sent: [],
  received: [],
  recent: [],
});

const createEmptyPrivacy = (): PrivacyBuckets => ({
  restricted: [],
  hideStoryFrom: [],
  blocked: [],
});

const createBaseState = (account?: Partial<AccountInfo>): AppState => ({
  account: { ...defaultAccount, ...account },
  followers: new Set<string>(),
  following: new Set<string>(),
  mutuals: [],
  notFollowingBack: [],
  fansYouDontFollow: [],
  requests: createEmptyRequests(),
  privacy: createEmptyPrivacy(),
  hashtags: [],
  recentlyUnfollowed: [],
  dismissedSuggestions: [],
  report: {
    sections: [],
    charts: [],
  },
  files: [],
});

export const buildStateFromDatasets = (
  datasets: ParsedDataset[],
  account?: Partial<AccountInfo>
): BuildStateResult => {
  const baseState = createBaseState(account);
  baseState.files = datasets;

  const merged = mergeParsedDatasets(datasets);

  const followers = merged.get("followers") ?? [];
  const following = merged.get("following") ?? [];
  const requests = merged.get("pending_sent_requests") ?? [];
  const requestsReceived = merged.get("pending_received_requests") ?? [];
  const requestsRecent = merged.get("recent_requests") ?? [];
  const restricted = merged.get("restricted") ?? [];
  const hideStoryFrom = merged.get("hide_story") ?? [];
  const blocked = merged.get("blocked") ?? [];
  const hashtags = merged.get("hashtags") ?? [];
  const recentlyUnfollowed = merged.get("recently_unfollowed") ?? [];
  const dismissedSuggestions = merged.get("dismissed_suggestions") ?? [];

  const normalized = deriveFollowData(followers, following);

  baseState.followers = normalized.followersSet;
  baseState.following = normalized.followingSet;
  baseState.mutuals = normalized.derived.mutuals;
  baseState.notFollowingBack = normalized.derived.notFollowingBack;
  baseState.fansYouDontFollow = normalized.derived.fansYouDontFollow;
  baseState.requests = {
    sent: requests,
    received: requestsReceived,
    recent: requestsRecent,
  };
  baseState.privacy = {
    restricted,
    hideStoryFrom,
    blocked,
  };
  baseState.hashtags = hashtags;
  baseState.recentlyUnfollowed = recentlyUnfollowed;
  baseState.dismissedSuggestions = dismissedSuggestions;

  return {
    state: baseState,
    metrics: normalized.metrics,
  };
};

import { AppState, AppStateLite, Delta, UsernameEntry } from "./types";
import { normalizeUsername } from "./instagram/parsers";

const toEntry = (username: string): UsernameEntry => ({ username });

export const createAppStateLite = (state: AppState): AppStateLite => ({
  account: state.account,
  followers: Array.from(state.followers.keys()),
  following: Array.from(state.following.keys()),
  mutuals: state.mutuals.map((entry) => entry.username),
  snapshotDate: state.account.snapshotDate,
});

const diffLists = (
  baseline: string[],
  target: string[]
): { added: UsernameEntry[]; removed: UsernameEntry[] } => {
  const baselineSet = new Set(baseline.map(normalizeUsername));
  const targetSet = new Set(target.map(normalizeUsername));

  const added: UsernameEntry[] = [];
  const removed: UsernameEntry[] = [];

  for (const username of target) {
    const key = normalizeUsername(username);
    if (!baselineSet.has(key)) {
      added.push(toEntry(username));
    }
  }

  for (const username of baseline) {
    const key = normalizeUsername(username);
    if (!targetSet.has(key)) {
      removed.push(toEntry(username));
    }
  }

  return { added, removed };
};

const computeReciprocity = (followers: string[], following: string[], mutuals: string[]): number => {
  if (following.length === 0) return 1;
  const mutualCount = mutuals.length > 0 ? mutuals.length : computeMutualCount(followers, following);
  return Number((mutualCount / following.length).toFixed(4));
};

const computeMutualCount = (followers: string[], following: string[]): number => {
  const followerSet = new Set(followers.map(normalizeUsername));
  let count = 0;
  for (const username of following) {
    if (followerSet.has(normalizeUsername(username))) {
      count += 1;
    }
  }
  return count;
};

export const compareSnapshots = (baseline: AppStateLite, target: AppStateLite): Delta => {
  const followersDiff = diffLists(baseline.followers, target.followers);
  const followingDiff = diffLists(baseline.following, target.following);

  const mutualsBaseline = baseline.mutuals;
  const mutualsTarget = target.mutuals.length
    ? target.mutuals
    : baseline.mutuals;

  const reciprocityBefore = computeReciprocity(
    baseline.followers,
    baseline.following,
    mutualsBaseline
  );
  const reciprocityAfter = computeReciprocity(
    target.followers,
    target.following,
    mutualsTarget
  );

  const mutualsDelta = computeMutualCount(
    target.followers,
    target.following
  ) - computeMutualCount(baseline.followers, baseline.following);

  return {
    newFollowers: followersDiff.added,
    lostFollowers: followersDiff.removed,
    newFollowing: followingDiff.added,
    unfollowed: followingDiff.removed,
    mutualsDelta,
    reciprocityBefore,
    reciprocityAfter,
  };
};

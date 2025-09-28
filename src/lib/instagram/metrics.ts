import {
  DerivedLists,
  FollowMetrics,
  NormalizedFollowData,
  UsernameEntry,
} from "../types";
import { normalizeUsername } from "./parsers";

const sortEntries = (entries: UsernameEntry[]): UsernameEntry[] =>
  [...entries].sort((a, b) => a.username.localeCompare(b.username));

const buildEntryMap = (entries: UsernameEntry[]) => {
  const map = new Map<string, UsernameEntry>();
  for (const entry of entries) {
    const key = normalizeUsername(entry.username);
    if (!map.has(key)) {
      map.set(key, entry);
    }
  }
  return map;
};

const buildDerivedLists = (
  followersMap: Map<string, UsernameEntry>,
  followingMap: Map<string, UsernameEntry>
): DerivedLists => {
  const mutuals: UsernameEntry[] = [];
  const notFollowingBack: UsernameEntry[] = [];
  const fansYouDontFollow: UsernameEntry[] = [];

  for (const [key, entry] of followingMap.entries()) {
    if (followersMap.has(key)) {
      mutuals.push(entry);
    } else {
      notFollowingBack.push(entry);
    }
  }

  for (const [key, entry] of followersMap.entries()) {
    if (!followingMap.has(key)) {
      fansYouDontFollow.push(entry);
    }
  }

  return {
    mutuals: sortEntries(mutuals),
    notFollowingBack: sortEntries(notFollowingBack),
    fansYouDontFollow: sortEntries(fansYouDontFollow),
  };
};

const computeFollowMetrics = (
  followersCount: number,
  followingCount: number,
  mutualCount: number,
  notFollowingBackCount: number,
  fansCount: number
): FollowMetrics => {
  const reciprocityRate = followingCount === 0 ? 1 : mutualCount / followingCount;
  const followBackRate = followersCount === 0 ? 1 : mutualCount / followersCount;

  return {
    followingCount,
    followersCount,
    mutualCount,
    notFollowingBackCount,
    fansYouDontFollowCount: fansCount,
    reciprocityRate: Number(reciprocityRate.toFixed(4)),
    followBackRate: Number(followBackRate.toFixed(4)),
  };
};

export const deriveFollowData = (
  followers: UsernameEntry[],
  following: UsernameEntry[]
): NormalizedFollowData => {
  const followerMap = buildEntryMap(followers);
  const followingMap = buildEntryMap(following);

  const followersSet = new Set(followerMap.keys());
  const followingSet = new Set(followingMap.keys());

  const derived = buildDerivedLists(followerMap, followingMap);

  const metrics = computeFollowMetrics(
    followersSet.size,
    followingSet.size,
    derived.mutuals.length,
    derived.notFollowingBack.length,
    derived.fansYouDontFollow.length
  );

  return {
    followersSet,
    followingSet,
    followerMap,
    followingMap,
    derived,
    metrics,
  };
};

export const filterRequestsByAge = (
  entries: UsernameEntry[],
  ageInDays: number,
  now: number = Date.now()
): UsernameEntry[] => {
  if (!Number.isFinite(ageInDays) || ageInDays <= 0) return [...entries];
  const minTimestamp = now - ageInDays * 24 * 60 * 60 * 1000;
  return entries.filter((entry) => {
    if (!entry.timestamp) return true;
    return entry.timestamp < minTimestamp;
  });
};

import { AppState, FollowMetrics } from "./types";

export const computeMetrics = (state: AppState): FollowMetrics => {
  const followingCount = state.following.size;
  const followersCount = state.followers.size;
  const mutualCount = state.mutuals.length;
  const notFollowingBackCount = state.notFollowingBack.length;
  const fansCount = state.fansYouDontFollow.length;
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

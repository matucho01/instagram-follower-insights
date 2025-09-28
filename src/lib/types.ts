export type Username = string;

export interface UsernameEntry {
  username: Username;
  displayName?: string;
  href?: string;
  timestamp?: number;
  source?: ExportDatasetKind;
}

export type ExportDatasetKind =
  | "followers"
  | "following"
  | "pending_sent_requests"
  | "pending_received_requests"
  | "recent_requests"
  | "restricted"
  | "hide_story"
  | "hashtags"
  | "blocked"
  | "recently_unfollowed"
  | "dismissed_suggestions"
  | "profile_information"
  | "unknown";

export interface ParsedDataset {
  kind: ExportDatasetKind;
  entries: UsernameEntry[];
  sourceFile: string;
  raw: unknown;
}

export interface AccountInfo {
  username?: string;
  snapshotDate?: string;
}

export interface RequestsBuckets {
  sent: UsernameEntry[];
  received: UsernameEntry[];
  recent: UsernameEntry[];
}

export interface PrivacyBuckets {
  restricted: UsernameEntry[];
  hideStoryFrom: UsernameEntry[];
  blocked: UsernameEntry[];
}

export interface ReportSection {
  id: string;
  title: string;
  description?: string;
  rows?: string[][];
}

export interface ReportChart {
  id: string;
  type: "bar" | "line" | "pie" | "doughnut";
  labels: string[];
  dataset: number[];
  color?: string;
}

export interface ReportState {
  sections: ReportSection[];
  charts: ReportChart[];
  exportedAt?: string;
}

export interface FollowMetrics {
  followingCount: number;
  followersCount: number;
  mutualCount: number;
  notFollowingBackCount: number;
  fansYouDontFollowCount: number;
  reciprocityRate: number;
  followBackRate: number;
}

export interface Delta {
  newFollowers: UsernameEntry[];
  lostFollowers: UsernameEntry[];
  newFollowing: UsernameEntry[];
  unfollowed: UsernameEntry[];
  mutualsDelta: number;
  reciprocityBefore: number;
  reciprocityAfter: number;
}

export interface AppStateLite {
  account: AccountInfo;
  followers: Username[];
  following: Username[];
  mutuals: Username[];
  snapshotDate?: string;
}

export interface DerivedLists {
  mutuals: UsernameEntry[];
  notFollowingBack: UsernameEntry[];
  fansYouDontFollow: UsernameEntry[];
}

export interface NormalizedFollowData {
  followersSet: Set<string>;
  followingSet: Set<string>;
  followerMap: Map<string, UsernameEntry>;
  followingMap: Map<string, UsernameEntry>;
  derived: DerivedLists;
  metrics: FollowMetrics;
}

export interface AppState {
  account: AccountInfo;
  followers: Set<string>;
  following: Set<string>;
  mutuals: UsernameEntry[];
  notFollowingBack: UsernameEntry[];
  fansYouDontFollow: UsernameEntry[];
  requests: RequestsBuckets;
  privacy: PrivacyBuckets;
  hashtags: UsernameEntry[];
  recentlyUnfollowed: UsernameEntry[];
  dismissedSuggestions: UsernameEntry[];
  compare?: {
    baseline: AppStateLite;
    delta: Delta;
  };
  report: ReportState;
  files: ParsedDataset[];
}

export interface EncryptedPayload {
  version: 1;
  salt: string;
  iv: string;
  data: string;
}

export interface BuildStateResult {
  state: AppState;
  metrics: FollowMetrics;
}

export interface SerializedAppState
  extends Omit<AppState, "followers" | "following"> {
  followers: string[];
  following: string[];
}

export interface PersistedAnalysis {
  state: SerializedAppState;
  metrics: FollowMetrics;
  warnings?: ParserWarning[];
}

export interface CsvExportOptions {
  filename: string;
  headers?: string[];
}

export interface PdfReportOptions {
  title: string;
  summary: FollowMetrics;
  mutualsPreview: UsernameEntry[];
  notFollowingBackPreview: UsernameEntry[];
  fansPreview: UsernameEntry[];
  locale?: string;
}

export const STORAGE_PREFIX = "instagram-insights";

export interface ParserWarning {
  file: string;
  message: string;
}

export interface ParseWorkerResult extends BuildStateResult {
  warnings: ParserWarning[];
}

export type AppView =
  | "landing"
  | "summary"
  | "lists"
  | "requests"
  | "privacy"
  | "hashtags"
  | "compare";

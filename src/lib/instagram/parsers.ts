import { ExportDatasetKind, ParsedDataset, UsernameEntry } from "../types";

const DATASET_KEY_MAP: Array<{
  kind: ExportDatasetKind;
  fileHints: RegExp[];
  jsonKeys: string[];
}> = [
  {
    kind: "followers",
    fileHints: [/follower/i],
    jsonKeys: ["relationships_followers", "followers", "followers_list"],
  },
  {
    kind: "following",
    fileHints: [/following/i],
    jsonKeys: ["relationships_following", "following", "following_list"],
  },
  {
    kind: "pending_sent_requests",
    fileHints: [/pending.*(sent|outgoing)/i],
    jsonKeys: [
      "pending_follow_requests_sent",
      "follow_requests_sent",
      "relationships_follow_requests_sent",
    ],
  },
  {
    kind: "pending_received_requests",
    fileHints: [/pending.*(received|incoming)/i],
    jsonKeys: [
      "pending_follow_requests",
      "follow_requests_received",
      "relationships_follow_requests_received",
    ],
  },
  {
    kind: "recent_requests",
    fileHints: [/recent.*requests/i],
    jsonKeys: [
      "recent_follow_requests",
      "relationships_permanent_follow_requests",
    ],
  },
  {
    kind: "restricted",
    fileHints: [/restricted/i],
    jsonKeys: [
      "restricted_profiles",
      "restricted_list",
      "relationships_restricted_users",
    ],
  },
  {
    kind: "hide_story",
    fileHints: [/hide.*story/i, /story.*hide/i],
    jsonKeys: [
      "hide_story_from",
      "hidden_story_replies",
      "relationships_hide_stories_from",
    ],
  },
  {
    kind: "hashtags",
    fileHints: [/hashtag/i],
    jsonKeys: ["hashtags_following", "hashtags", "relationships_following_hashtags"],
  },
  {
    kind: "blocked",
    fileHints: [/blocked/i],
    jsonKeys: [
      "blocked_profiles",
      "blocked_list",
      "relationships_blocked_users",
    ],
  },
  {
    kind: "recently_unfollowed",
    fileHints: [/unfollow/i],
    jsonKeys: [
      "recently_unfollowed_profiles",
      "recently_unfollowed",
      "relationships_unfollowed_users",
    ],
  },
  {
    kind: "dismissed_suggestions",
    fileHints: [/removed_suggestions/i, /dismissed/i],
    jsonKeys: [
      "removed_suggestions",
      "dismissed_suggestions",
      "relationships_dismissed_suggested_users",
    ],
  },
  {
    kind: "profile_information",
    fileHints: [/profile/i],
    jsonKeys: ["profile", "account_information"],
  },
];

const USERNAME_REGEX = /^[A-Za-z0-9._-]{1,32}$/;

const CONNECTION_DATASET_KINDS = new Set<ExportDatasetKind>([
  "followers",
  "following",
  "pending_sent_requests",
  "pending_received_requests",
  "recent_requests",
  "restricted",
  "hide_story",
  "blocked",
  "recently_unfollowed",
  "dismissed_suggestions",
]);

export const normalizeUsername = (username: string): string =>
  username.trim().replace(/^[@#]/, "").toLowerCase();

const coerceTimestamp = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const extractUsernameFromHref = (href: string): string | undefined => {
  try {
    const url = new URL(href);
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length === 0) return undefined;
    if (segments[0] === "_u" && segments.length > 1) {
      return segments[1];
    }
    return segments[segments.length - 1];
  } catch {
    return undefined;
  }
};

const looksLikeHandle = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 64) return false;
  if (/^https?:\/\//i.test(trimmed)) return false;
  if (trimmed.includes(" ")) return false;
  if (trimmed.startsWith("#")) return trimmed.length > 1;
  return USERNAME_REGEX.test(trimmed.replace(/^@/, ""));
};

const toEntry = (value: string, extras: Partial<UsernameEntry> = {}): UsernameEntry => ({
  username: value.trim(),
  ...extras,
});

const collectStringListEntries = (node: unknown, acc: UsernameEntry[], seen: Set<string>): void => {
  if (!node) return;
  if (Array.isArray(node)) {
    for (const item of node) {
      collectStringListEntries(item, acc, seen);
    }
    return;
  }

  if (typeof node !== "object") {
    if (typeof node === "string" && looksLikeHandle(node)) {
      const normalized = normalizeUsername(node);
      if (!seen.has(normalized)) {
        seen.add(normalized);
        acc.push(toEntry(node));
      }
    }
    return;
  }

  const obj = node as Record<string, unknown>;
  if (Array.isArray(obj.string_list_data)) {
    for (const item of obj.string_list_data) {
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        const rawValue = typeof record.value === "string" ? record.value : undefined;
        const hrefCandidate =
          typeof record.href === "string" ? extractUsernameFromHref(record.href) : undefined;
        const parentTitle = typeof obj.title === "string" ? obj.title : undefined;
        const recordTitle = typeof record.title === "string" ? record.title : undefined;

        const candidate = [rawValue, hrefCandidate, recordTitle, parentTitle].find(
          (value): value is string => typeof value === "string" && looksLikeHandle(value)
        );

        if (candidate) {
          const normalized = normalizeUsername(candidate);
          if (!seen.has(normalized)) {
            seen.add(normalized);
            acc.push(
              toEntry(candidate, {
                displayName: recordTitle ?? parentTitle,
                href: typeof record.href === "string" ? record.href : undefined,
                timestamp: coerceTimestamp(record.timestamp),
              })
            );
          }
        }
      }
    }
  }

  if (typeof obj.value === "string" && looksLikeHandle(obj.value)) {
    const normalized = normalizeUsername(obj.value);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      acc.push(
        toEntry(obj.value, {
          displayName: typeof obj.title === "string" ? obj.title : undefined,
          href: typeof obj.href === "string" ? obj.href : undefined,
          timestamp: coerceTimestamp(obj.timestamp),
        })
      );
    }
  }

  if (typeof obj.username === "string" && looksLikeHandle(obj.username)) {
    const normalized = normalizeUsername(obj.username);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      acc.push(
        toEntry(obj.username, {
          displayName: typeof obj.full_name === "string" ? obj.full_name : undefined,
          href: typeof obj.href === "string" ? obj.href : undefined,
          timestamp: coerceTimestamp(obj.timestamp),
        })
      );
    }
  }

  if (typeof obj.title === "string" && looksLikeHandle(obj.title)) {
    const normalized = normalizeUsername(obj.title);
    if (!seen.has(normalized)) {
      const hrefCandidate =
        typeof obj.href === "string" ? extractUsernameFromHref(obj.href) : undefined;
      const username = hrefCandidate && looksLikeHandle(hrefCandidate) ? hrefCandidate : obj.title;
      const normalizedUsername = normalizeUsername(username);
      if (!seen.has(normalizedUsername)) {
        seen.add(normalizedUsername);
        acc.push(
          toEntry(username, {
            displayName: obj.title,
            href: typeof obj.href === "string" ? obj.href : undefined,
            timestamp: coerceTimestamp(obj.timestamp),
          })
        );
      }
    }
  }

  if (typeof obj.href === "string") {
    const hrefUsername = extractUsernameFromHref(obj.href);
    if (hrefUsername && looksLikeHandle(hrefUsername)) {
      const normalized = normalizeUsername(hrefUsername);
      if (!seen.has(normalized)) {
        seen.add(normalized);
        acc.push(
          toEntry(hrefUsername, {
            displayName: typeof obj.title === "string" ? obj.title : undefined,
            href: obj.href,
            timestamp: coerceTimestamp(obj.timestamp),
          })
        );
      }
    }
  }

  for (const value of Object.values(obj)) {
    if (value && typeof value === "object") {
      collectStringListEntries(value, acc, seen);
    }
  }
};

const collectRelationshipEntries = (node: unknown, acc: UsernameEntry[], seen: Set<string>): void => {
  if (!node) return;

  const processEntry = (entry: unknown, parentTitle?: string) => {
    if (!entry || typeof entry !== "object") return;
    const obj = entry as Record<string, unknown>;

    if (Array.isArray(obj.string_list_data)) {
      for (const item of obj.string_list_data) {
        if (!item || typeof item !== "object") continue;
        const record = item as Record<string, unknown>;
        const rawValue = typeof record.value === "string" ? record.value : undefined;
        const hrefCandidate =
          typeof record.href === "string" ? extractUsernameFromHref(record.href) : undefined;
        const recordTitle = typeof record.title === "string" ? record.title : undefined;

        const candidate = [rawValue, hrefCandidate, recordTitle, parentTitle].find(
          (value): value is string => typeof value === "string" && looksLikeHandle(value)
        );

        if (!candidate) continue;

        const normalized = normalizeUsername(candidate);
        if (seen.has(normalized)) continue;

        seen.add(normalized);
        acc.push(
          toEntry(candidate, {
            displayName: recordTitle ?? parentTitle,
            href: typeof record.href === "string" ? record.href : undefined,
            timestamp: coerceTimestamp(record.timestamp),
          })
        );
      }
    }
  };

  if (Array.isArray(node)) {
    for (const item of node) {
      processEntry(item);
    }
    return;
  }

  if (typeof node === "object") {
    const obj = node as Record<string, unknown>;
    if (Array.isArray(obj.string_list_data)) {
      processEntry(obj, typeof obj.title === "string" ? obj.title : undefined);
    }

    for (const value of Object.values(obj)) {
      if (Array.isArray(value)) {
        for (const child of value) {
          processEntry(child, typeof obj.title === "string" ? obj.title : undefined);
        }
      }
    }
  }
};

const inferKindFromFileName = (fileName: string): ExportDatasetKind => {
  const baseName = fileName.split(/[\\/]/).pop() ?? fileName;

  for (const entry of DATASET_KEY_MAP) {
    if (entry.fileHints.some((regex) => regex.test(baseName))) {
      return entry.kind;
    }
  }
  return "unknown";
};

const inferKindFromJson = (json: unknown): ExportDatasetKind => {
  if (!json || typeof json !== "object") return "unknown";
  const keys = Object.keys(json as Record<string, unknown>);
  for (const entry of DATASET_KEY_MAP) {
    if (entry.jsonKeys.some((candidate) => keys.includes(candidate))) {
      return entry.kind;
    }
  }
  return "unknown";
};

export const parseInstagramDataset = (
  fileName: string,
  json: unknown
): ParsedDataset => {
  const kind = (() => {
    const fromFile = inferKindFromFileName(fileName);
    if (fromFile !== "unknown") return fromFile;
    const fromJson = inferKindFromJson(json);
    if (fromJson !== "unknown") return fromJson;
    return "unknown";
  })();

  const entries: UsernameEntry[] = [];
  const seen = new Set<string>();

  const targets: unknown[] = [];
  const config = DATASET_KEY_MAP.find((entry) => entry.kind === kind);

  if (config && json && typeof json === "object" && !Array.isArray(json)) {
    const obj = json as Record<string, unknown>;
    for (const key of config.jsonKeys) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined) {
        targets.push(obj[key]);
      }
    }
  }

  if (targets.length === 0) {
    targets.push(json);
  }

  for (const target of targets) {
    if (CONNECTION_DATASET_KINDS.has(kind)) {
      collectRelationshipEntries(target, entries, seen);
    } else {
      collectStringListEntries(target, entries, seen);
    }
  }

  return {
    kind,
    entries: entries.map((entry) => ({ ...entry, source: kind })),
    sourceFile: fileName,
    raw: json,
  };
};

export const mergeParsedDatasets = (datasets: ParsedDataset[]): Map<ExportDatasetKind, UsernameEntry[]> => {
  const result = new Map<ExportDatasetKind, UsernameEntry[]>();

  for (const dataset of datasets) {
    const existing = result.get(dataset.kind) ?? [];
    const map = new Map(existing.map((entry) => [normalizeUsername(entry.username), entry]));

    for (const entry of dataset.entries) {
      const key = normalizeUsername(entry.username);
      if (!map.has(key)) {
        map.set(key, entry);
      }
    }

    result.set(dataset.kind, Array.from(map.values()));
  }

  return result;
};

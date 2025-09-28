import { describe, expect, it } from "vitest";
import { parseInstagramDataset, mergeParsedDatasets } from "./parsers";

const FOLLOWER_ENTRY = (username: string, timestamp = 1758901980) => ({
  title: "",
  media_list_data: [],
  string_list_data: [
    {
      href: `https://www.instagram.com/${username}`,
      value: username,
      timestamp,
    },
  ],
});

describe("parseInstagramDataset", () => {
  it("detects followers files and normalizes usernames", () => {
    const dataset = parseInstagramDataset("followers_1.json", [
      FOLLOWER_ENTRY("RandomCentennial"),
      FOLLOWER_ENTRY("ferphotos23"),
    ]);

    expect(dataset.kind).toBe("followers");
    expect(dataset.entries).toHaveLength(2);
    expect(dataset.entries.map((entry) => entry.username)).toEqual([
      "RandomCentennial",
      "ferphotos23",
    ]);
  });

  it("detects following files via path segments", () => {
    const dataset = parseInstagramDataset(
      "connections/followers_and_following/following.json",
      {
        relationships_following: [FOLLOWER_ENTRY("sori.v1")],
      }
    );

    expect(dataset.kind).toBe("following");
    expect(dataset.entries).toHaveLength(1);
    expect(dataset.entries[0].username).toBe("sori.v1");
  });

  it("ignores duplicate usernames across nested arrays", () => {
    const dataset = parseInstagramDataset("followers.json", [
      FOLLOWER_ENTRY("meluu.rh"),
      {
        title: "",
        string_list_data: [
          {
            href: "https://www.instagram.com/meluu.rh",
            value: "@meluu.rh",
          },
        ],
      },
    ]);

    expect(dataset.entries).toHaveLength(1);
    expect(dataset.entries[0].username.toLowerCase()).toBe("meluu.rh");
  });
});

describe("mergeParsedDatasets", () => {
  it("deduplicates entries when merging", () => {
    const followers = parseInstagramDataset("followers.json", [
      FOLLOWER_ENTRY("katianayelit"),
      FOLLOWER_ENTRY("katianayelit"),
    ]);

    const following = parseInstagramDataset("following.json", [
      {
        relationships_following: [FOLLOWER_ENTRY("katianayelit")],
      },
    ]);

    const merged = mergeParsedDatasets([followers, following]);
    const followerEntries = merged.get("followers");
    const followingEntries = merged.get("following");

    expect(followerEntries?.length).toBe(1);
    expect(followingEntries?.length).toBe(1);
  });
});

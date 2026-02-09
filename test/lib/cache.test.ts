import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryCache } from "@/lib/cache";

describe("MemoryCache", () => {
  let cache: MemoryCache;

  beforeEach(() => {
    cache = new MemoryCache();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should store and retrieve values", () => {
    cache.set("key", { data: "test" }, 60_000);
    expect(cache.get("key")).toEqual({ data: "test" });
  });

  it("should return undefined for missing keys", () => {
    expect(cache.get("missing")).toBeUndefined();
  });

  it("should expire values after TTL", () => {
    cache.set("key", "value", 5_000);
    vi.advanceTimersByTime(6_000);
    expect(cache.get("key")).toBeUndefined();
  });

  it("should not expire values within TTL", () => {
    cache.set("key", "value", 5_000);
    vi.advanceTimersByTime(4_000);
    expect(cache.get("key")).toBe("value");
  });

  it("should overwrite existing keys", () => {
    cache.set("key", "old", 60_000);
    cache.set("key", "new", 60_000);
    expect(cache.get("key")).toBe("new");
  });
});

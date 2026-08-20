import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("should merge class names", () => {
    const result = cn("foo", "bar");
    expect(result).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    const result = cn("base", true && "active", false && "hidden");
    expect(result).toContain("base");
    expect(result).toContain("active");
    expect(result).not.toContain("hidden");
  });

  it("should merge Tailwind classes (last wins)", () => {
    const result = cn("px-4 py-2", "px-8");
    expect(result).toContain("px-8");
    expect(result).toContain("py-2");
    expect(result).not.toContain("px-4");
  });

  it("should handle empty inputs", () => {
    expect(cn()).toBe("");
    expect(cn("")).toBe("");
    expect(cn("", "")).toBe("");
  });

  it("should handle undefined and null", () => {
    const result = cn("foo", undefined, null, "bar");
    expect(result).toContain("foo");
    expect(result).toContain("bar");
  });

  it("should handle arrays", () => {
    const result = cn(["foo", "bar"], "baz");
    expect(result).toContain("foo");
    expect(result).toContain("bar");
    expect(result).toContain("baz");
  });

  it("should handle complex Tailwind merging", () => {
    const result = cn(
      "bg-red-500 text-white",
      "bg-blue-500"
    );
    expect(result).toContain("bg-blue-500");
    expect(result).not.toContain("bg-red-500");
    expect(result).toContain("text-white");
  });

  it("should handle dark mode classes", () => {
    const result = cn("bg-white dark:bg-gray-900", "bg-gray-100");
    expect(result).toContain("bg-gray-100");
    expect(result).toContain("dark:bg-gray-900");
  });
});

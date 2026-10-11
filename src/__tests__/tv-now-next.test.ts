import { describe, expect, it } from "vitest";
import { computeNowNext, timeToMinutes } from "@/lib/tv-now-next";

const DAY: {
  show: string;
  start: string;
  end: string;
  duration: number;
}[] = [
  { show: "Morning Cartoon", start: "06:00", end: "09:00", duration: 180 },
  { show: "Dragon Ball Z", start: "09:00", end: "10:00", duration: 60 },
  { show: "One Piece", start: "10:00", end: "11:30", duration: 90 },
  { show: "Late Night Block", start: "22:00", end: "06:00", duration: 480 },
];

describe("computeNowNext", () => {
  it("returns nothing for empty slots", () => {
    const res = computeNowNext([], 9 * 60);
    expect(res.now).toBeNull();
    expect(res.next).toBeNull();
  });

  it("finds the airing slot mid-morning", () => {
    const res = computeNowNext(DAY, 9 * 60 + 30); // 09:30
    expect(res.now?.show).toBe("Dragon Ball Z");
    expect(res.next?.show).toBe("One Piece");
    expect(res.nowEndsInMinutes).toBe(30);
    expect(res.nextInMinutes).toBe(30);
  });

  it("picks the next slot when nothing is airing", () => {
    const res = computeNowNext(DAY, 12 * 60); // 12:00 (gap)
    expect(res.now).toBeNull();
    expect(res.next?.show).toBe("Late Night Block");
    expect(res.nextInMinutes).toBe(10 * 60);
  });

  it("wraps overnight slots correctly", () => {
    // Airing inside the 22:00 → 06:00 block (02:00)
    const res = computeNowNext(DAY, 2 * 60);
    expect(res.now?.show).toBe("Late Night Block");
    expect(res.next?.show).toBe("Morning Cartoon");
    expect(res.nextInMinutes).toBe(4 * 60);
    expect(res.nowEndsInMinutes).toBe(4 * 60);
  });

  it("handles the boundary right at slot start", () => {
    const res = computeNowNext(DAY, 10 * 60);
    expect(res.now?.show).toBe("One Piece");
    expect(res.next?.show).toBe("Late Night Block");
  });

  it("treats just-after-midnight as inside the overnight block", () => {
    const res = computeNowNext(DAY, 3 * 60);
    expect(res.now?.show).toBe("Late Night Block");
    expect(res.next?.show).toBe("Morning Cartoon");
  });

  it("parses times to minutes", () => {
    expect(timeToMinutes("19:37")).toBe(1177);
    expect(timeToMinutes("00:00")).toBe(0);
  });
});
import { describe, expect, it } from "vitest";
import { getMondayOfWeek } from "./revenueTrendUtils";

process.env.TZ = "Asia/Bangkok";

describe("getMondayOfWeek", () => {
  it("formats the local Monday without shifting through UTC", () => {
    const thailandMorning = new Date("2026-08-17T00:30:00");

    expect(getMondayOfWeek(thailandMorning)).toBe("2026-08-17");
  });

  it("returns the previous Monday for a Sunday", () => {
    const sunday = new Date("2026-08-23T12:00:00");

    expect(getMondayOfWeek(sunday)).toBe("2026-08-17");
  });
});

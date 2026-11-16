import { describe, expect, it } from "vitest";
import { isFormerStudent } from "./enrollments";

describe("isFormerStudent", () => {
  it("is false while the student still has an Enrollment on the course", () => {
    expect(isFormerStudent({ enrollmentId: 12 })).toBe(false);
  });

  it("is true once the student's Enrollment has ended", () => {
    expect(isFormerStudent({ enrollmentId: null })).toBe(true);
  });
});

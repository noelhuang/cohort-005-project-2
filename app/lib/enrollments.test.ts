import { describe, expect, it } from "vitest";
import { isFormerLearner } from "./enrollments";

describe("isFormerLearner", () => {
  it("is false while the learner still has an Enrollment on the course", () => {
    expect(isFormerLearner({ enrollmentId: 12 })).toBe(false);
  });

  it("is true once the learner's Enrollment has ended", () => {
    expect(isFormerLearner({ enrollmentId: null })).toBe(true);
  });
});

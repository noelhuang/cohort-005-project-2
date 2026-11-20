import { describe, expect, it } from "vitest";
import { addedExemptions } from "./check-lint-exemptions";

const config = (overrides: object[]) =>
  `{
  // Comments and trailing commas, as in the real file.
  "overrides": ${JSON.stringify(overrides)},
}`;

const exempt = (rule: string, files: string[]) => ({
  files,
  rules: { [rule]: "off" },
});

describe("addedExemptions", () => {
  it("reports a file newly exempted from a size rule", () => {
    const before = config([exempt("max-lines-per-function", ["a.tsx"])]);
    const after = config([
      exempt("max-lines-per-function", ["a.tsx", "b.tsx"]),
    ]);
    expect(addedExemptions(before, after)).toEqual([
      { rule: "max-lines-per-function", file: "b.tsx" },
    ]);
  });

  it("allows removing an exemption", () => {
    const before = config([exempt("max-lines", ["a.tsx", "b.tsx"])]);
    const after = config([exempt("max-lines", ["a.tsx"])]);
    expect(addedExemptions(before, after)).toEqual([]);
  });

  it("treats a file moved to another size rule as new for that rule", () => {
    const before = config([exempt("max-lines", ["a.tsx"])]);
    const after = config([exempt("max-depth", ["a.tsx"])]);
    expect(addedExemptions(before, after)).toEqual([
      { rule: "max-depth", file: "a.tsx" },
    ]);
  });

  it("ignores overrides that switch off other rules", () => {
    const before = config([]);
    const after = config([exempt("no-console", ["scripts/**"])]);
    expect(addedExemptions(before, after)).toEqual([]);
  });

  it("reports a file given a looser size limit", () => {
    const before = config([]);
    const after = config([
      { files: ["a.tsx"], rules: { "max-lines": ["error", { max: 900 }] } },
    ]);
    expect(addedExemptions(before, after)).toEqual([
      { rule: "max-lines", file: "a.tsx" },
    ]);
  });
});

import { describe, it, expect } from "vitest";
import { noteDraftStatus } from "../index";

describe("noteDraftStatus", () => {
  it("cannot save an empty box when there is no note yet", () => {
    expect(noteDraftStatus("", null, 10)).toEqual({
      length: 0,
      tooLong: false,
      empty: true,
      unsaved: false,
      canSave: false,
    });
  });

  it("treats whitespace alone as empty", () => {
    const status = noteDraftStatus("   \n ", null, 10);
    expect(status.empty).toBe(true);
    expect(status.canSave).toBe(false);
  });

  it("can save new text", () => {
    expect(noteDraftStatus("hello", null, 10)).toEqual({
      length: 5,
      tooLong: false,
      empty: false,
      unsaved: true,
      canSave: true,
    });
  });

  it("has nothing to save when the box matches the saved note", () => {
    const status = noteDraftStatus("hello", "hello", 10);
    expect(status.unsaved).toBe(false);
    expect(status.canSave).toBe(false);
  });

  it("ignores whitespace the action would trim away", () => {
    expect(noteDraftStatus("  hello\n", "hello", 10).unsaved).toBe(false);
  });

  it("counts every character in the box", () => {
    expect(noteDraftStatus("  hi  ", null, 10).length).toBe(6);
  });

  it("allows exactly the limit", () => {
    const status = noteDraftStatus("a".repeat(10), null, 10);
    expect(status.tooLong).toBe(false);
    expect(status.canSave).toBe(true);
  });

  it("refuses one character over the limit", () => {
    const status = noteDraftStatus("a".repeat(11), null, 10);
    expect(status.tooLong).toBe(true);
    expect(status.canSave).toBe(false);
  });

  it("measures the limit after trimming, as the action does", () => {
    expect(noteDraftStatus(` ${"a".repeat(10)} `, null, 10).tooLong).toBe(
      false
    );
  });

  it("marks a cleared box as unsaved but not saveable", () => {
    const status = noteDraftStatus("", "hello", 10);
    expect(status.unsaved).toBe(true);
    expect(status.canSave).toBe(false);
  });
});

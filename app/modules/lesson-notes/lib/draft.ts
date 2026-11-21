export type NoteDraftStatus = {
  length: number;
  tooLong: boolean;
  empty: boolean;
  unsaved: boolean;
  canSave: boolean;
};

export function describeDraft(
  draft: string,
  savedBody: string | null,
  maxLength: number
): NoteDraftStatus {
  const trimmed = draft.trim();
  // The action trims before it checks the length, so the counter measures
  // the trimmed text too: otherwise it can read "5003 / 5000" while Save
  // stays enabled.
  const length = trimmed.length;
  const tooLong = length > maxLength;
  const empty = trimmed.length === 0;
  const unsaved = trimmed !== (savedBody ?? "");

  return {
    length,
    tooLong,
    empty,
    unsaved,
    canSave: unsaved && !empty && !tooLong,
  };
}

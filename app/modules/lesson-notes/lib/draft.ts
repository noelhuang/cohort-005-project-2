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
  const length = draft.length;
  // The action trims before it checks the length, so the limit applies to
  // the trimmed text; the counter still shows what is in the box.
  const tooLong = trimmed.length > maxLength;
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

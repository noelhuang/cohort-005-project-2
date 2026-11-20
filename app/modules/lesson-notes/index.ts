import { describeDraft, type NoteDraftStatus } from "./lib/draft";

export type { NoteDraftStatus };

/**
 * What the note editor should show for the text in the box, given the note
 * as last saved: the character count, whether it is over the limit, and
 * whether Save would do anything.
 */
export function noteDraftStatus(
  draft: string,
  savedBody: string | null,
  maxLength: number
): NoteDraftStatus {
  return describeDraft(draft, savedBody, maxLength);
}

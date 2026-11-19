import { and, desc, eq } from "drizzle-orm";
import { courses, lessons, modules, notes } from "~/db/schema";
import { MAX_NOTE_LENGTH } from "~/lib/notes";
import {
  savedLessonColumns,
  type Db,
  type SavedLesson,
} from "~/lib/saved-lessons.server";

// ─── Notes ───
// A Student's own plain-text writing about a Lesson, private to them. One per
// Student per Lesson, held by the notes_user_lesson_unique index. See
// GLOSSARY.md.
//
// Privacy: every read here is scoped to the owning Student. Nothing outside the
// Student's own Lesson page and Saved page may read Note bodies.

type Note = typeof notes.$inferSelect;

export function getNote(db: Db, userId: number, lessonId: number) {
  return db
    .select()
    .from(notes)
    .where(and(eq(notes.userId, userId), eq(notes.lessonId, lessonId)))
    .get();
}

export type SaveNoteResult =
  { ok: true; note: Note | null } | { ok: false; error: string };

/**
 * Creates the Note, or replaces its body and moves `updatedAt` on. The body is
 * trimmed; over MAX_NOTE_LENGTH it is refused, not truncated. An empty body
 * removes the Note, so clearing the box and saving leaves no Note behind.
 */
export function saveNote(
  db: Db,
  userId: number,
  lessonId: number,
  body: string,
  now: Date
): SaveNoteResult {
  const trimmed = body.trim();
  if (trimmed.length > MAX_NOTE_LENGTH) {
    return {
      ok: false,
      error: `A note can be at most ${MAX_NOTE_LENGTH.toLocaleString("en")} characters.`,
    };
  }

  if (trimmed.length === 0) {
    db.delete(notes)
      .where(and(eq(notes.userId, userId), eq(notes.lessonId, lessonId)))
      .run();
    return { ok: true, note: null };
  }

  const at = now.toISOString();
  const note = db
    .insert(notes)
    .values({ userId, lessonId, body: trimmed, createdAt: at, updatedAt: at })
    .onConflictDoUpdate({
      target: [notes.userId, notes.lessonId],
      set: { body: trimmed, updatedAt: at },
    })
    .returning()
    .get();
  return { ok: true, note };
}

export type SavedNote = SavedLesson & {
  id: number;
  body: string;
  updatedAt: string;
};

/** The Student's own Notes, most recently edited first. */
export function listNotes(db: Db, userId: number): SavedNote[] {
  return db
    .select({
      id: notes.id,
      body: notes.body,
      updatedAt: notes.updatedAt,
      ...savedLessonColumns,
    })
    .from(notes)
    .innerJoin(lessons, eq(notes.lessonId, lessons.id))
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(courses, eq(modules.courseId, courses.id))
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.updatedAt), desc(notes.id))
    .all();
}

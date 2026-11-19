import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "~/db/schema";
import { courses, lessons, modules } from "~/db/schema";

// The Lesson, Module and Course a Bookmark or Note points at, so the Saved page
// can link to the Lesson and name its Course. Shared by the bookmarks and notes
// services.

export type Db = BetterSQLite3Database<typeof schema>;

export const savedLessonColumns = {
  lessonId: lessons.id,
  lessonTitle: lessons.title,
  moduleTitle: modules.title,
  courseTitle: courses.title,
  courseSlug: courses.slug,
};

export type SavedLesson = {
  lessonId: number;
  lessonTitle: string;
  moduleTitle: string;
  courseTitle: string;
  courseSlug: string;
};

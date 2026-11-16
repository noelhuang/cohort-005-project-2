/** A learner on the roster who had an Enrollment on the course and no longer has one. */
export function isFormerLearner(student: { enrollmentId: number | null }): boolean {
  return student.enrollmentId === null;
}

// kafka-gateway/src/topic-registry.ts
//
// WHITELIST — chỉ các topic trong danh sách này mới được publish/subscribe qua gateway
// OUTPUT: codegen từ app-wiring.json.edges[] — đồng bộ với EVENTS constants trong shared/shared-events/index.ts
//
export const ALLOWED_TOPICS: string[] = [
  // ── Auth (pbc-auth) ──────────────────────────────────────────────────────
  "auth.user.loggedIn",
  "auth.user.loggedOut",
  "auth.token.refreshed",
  "auth.user.loginFailed",
  "auth.user.created",
  "auth.user.roleChanged",

  // ── Student (pbc-student-management) ────────────────────────────────────
  "student.created",
  "student.updated",
  "student.deleted",
  "student.statusChanged",
  "student.selected",
  "student.profile.updated",
  "student.linkedToUser",
  "student.classAssigned",

  // ── Class (pbc-class-management) ─────────────────────────────────────────
  "class.created",
  "class.updated",
  "class.deleted",
  "class.studentAssigned",
  "class.studentRemoved",

  // ── Course (pbc-course-management) ───────────────────────────────────────
  "course.created",
  "course.updated",
  "course.deleted",

  // ── Subject (pbc-subject-management) ─────────────────────────────────────
  "subject.created",
  "subject.updated",
  "subject.deleted",
  "subject.assignedToClass",
  "subject.assignedToCourse",

  // ── Enrollment ────────────────────────────────────────────────────────────
  "enrollment.prefill.requested",
  "enrollment.created",
  "enrollment.updated",
  "enrollment.cancelled",

  // ── Notification (pbc-notification) ──────────────────────────────────────
  "notification.triggered",
  "notification.read",
  "notification.dismissed",
];

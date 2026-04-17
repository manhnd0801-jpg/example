// Shared event definitions — dùng chung cho App Shell và tất cả PBC
//
// Quy ước đặt tên event: <domain>.<entity>.<verb>
// Dùng past tense cho facts (đã xảy ra): loggedIn, created, updated
// Dùng verb cho commands (yêu cầu xảy ra): trigger, send
//
// R-07: Mọi event name phải dùng từ file này — không tự định nghĩa chuỗi thô

export const EVENTS = {
  AUTH: {
    USER_LOGGED_IN:  "auth.user.loggedIn",
    USER_LOGGED_OUT: "auth.user.loggedOut",
    TOKEN_REFRESHED: "auth.token.refreshed",
    LOGIN_FAILED:    "auth.user.loginFailed",
    USER_CREATED:    "auth.user.created",
    ROLE_CHANGED:    "auth.user.roleChanged",
  },
  USER: {
    CREATED:      "user.created",
    UPDATED:      "user.updated",
    DELETED:      "user.deleted",
    ROLE_CHANGED: "user.roleChanged",
  },
  STUDENT: {
    CREATED:         "student.created",
    UPDATED:         "student.updated",
    DELETED:         "student.deleted",
    STATUS_CHANGED:  "student.statusChanged",
    SELECTED:        "student.selected",
    PROFILE_UPDATED: "student.profile.updated",
    LINKED_TO_USER:  "student.linkedToUser",
    CLASS_ASSIGNED:  "student.classAssigned",
  },
  CLASS: {
    CREATED:          "class.created",
    UPDATED:          "class.updated",
    DELETED:          "class.deleted",
    STUDENT_ASSIGNED: "class.studentAssigned",
    STUDENT_REMOVED:  "class.studentRemoved",
  },
  COURSE: {
    CREATED: "course.created",
    UPDATED: "course.updated",
    DELETED: "course.deleted",
  },
  SUBJECT: {
    CREATED:              "subject.created",
    UPDATED:              "subject.updated",
    DELETED:              "subject.deleted",
    ASSIGNED_TO_CLASS:    "subject.assignedToClass",
    ASSIGNED_TO_COURSE:   "subject.assignedToCourse",
  },
  ENROLLMENT: {
    PREFILL_REQUESTED: "enrollment.prefill.requested",
    CREATED:           "enrollment.created",
    UPDATED:           "enrollment.updated",
    CANCELLED:         "enrollment.cancelled",
  },
  NOTIFICATION: {
    TRIGGERED: "notification.triggered",
    READ:      "notification.read",
    DISMISSED: "notification.dismissed",
  },
} as const;

// ─── Legacy TOPICS alias (backward compat với code cũ) ───────────────────────
// @deprecated — dùng EVENTS thay thế
export const TOPICS = {
  UI_STUDENT_SELECTED:          EVENTS.STUDENT.SELECTED,
  ENROLLMENT_PREFILL_REQUESTED: EVENTS.ENROLLMENT.PREFILL_REQUESTED,
} as const;

// ─── Payload Types ────────────────────────────────────────────────────────────

export interface EventAuthUserLoggedIn {
  sub: string;
  name: string;
  email: string;
  roles: string[];
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  tenantId?: string;
  // Legacy fields — backward compat với pbc-auth hiện tại
  userId?: string;
  username?: string;
  role?: string;
}

export interface EventAuthUserLoggedOut {
  sub: string;
  reason?: "manual" | "expired" | "forced";
}

export interface EventAuthTokenRefreshed {
  sub: string;
  accessToken: string;
  expiresIn: number;
}

export interface EventAuthLoginFailed {
  username: string;
  reason: string;
  attemptedAt: string; // ISO 8601
}

export interface EventAuthUserCreated {
  userId: string;
  name: string;
  email: string;
  roles: string[];
  tenantId?: string;
  createdAt: string; // ISO 8601
}

export interface EventAuthRoleChanged {
  userId: string;
  oldRoles: string[];
  newRoles: string[];
  changedAt: string; // ISO 8601
}

export interface EventUserCreated {
  userId: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: string; // ISO 8601
}

export interface EventUserUpdated {
  userId: string;
  changes: Partial<{ name: string; email: string; roles: string[] }>;
  updatedAt: string;
}

export interface EventUserDeleted {
  userId: string;
  deletedAt: string;
}

// ─── Student Events ───────────────────────────────────────────────────────────

export interface EventStudentCreated {
  studentId: string;
  studentCode: string;
  fullName: string;
  email: string;
  tenantId?: string;
  createdAt: string; // ISO 8601
}

export interface EventStudentUpdated {
  studentId: string;
  changes: Partial<{
    fullName: string;
    email: string;
    phone: string;
    address: string;
  }>;
  updatedAt: string;
}

export interface EventStudentDeleted {
  studentId: string;
  deletedAt: string;
}

export interface EventStudentStatusChanged {
  studentId: string;
  oldStatus: string;
  newStatus: string;
  changedAt: string; // ISO 8601
}

export interface EventStudentSelected {
  studentId: string;
  tenantId?: string;
}

export interface EventStudentLinkedToUser {
  studentId?: string;
  userId: string;
  tenantId?: string;
}

export interface EventStudentClassAssigned {
  studentId: string;
  classId: string;
  assignedAt?: string;
}

// ─── Class Events ─────────────────────────────────────────────────────────────

export interface EventClassCreated {
  classId: string;
  className: string;
  academicYear: string;
  tenantId?: string;
  createdAt: string; // ISO 8601
}

export interface EventClassUpdated {
  classId: string;
  changes: Partial<{ className: string; academicYear: string }>;
  updatedAt: string;
}

export interface EventClassStudentAssigned {
  classId: string;
  studentId: string;
  assignedAt: string; // ISO 8601
}

export interface EventClassStudentRemoved {
  classId: string;
  studentId: string;
  removedAt: string; // ISO 8601
}

// ─── Course Events ────────────────────────────────────────────────────────────

export interface EventCourseCreated {
  courseId: string;
  courseName: string;
  tenantId?: string;
  createdAt: string; // ISO 8601
}

export interface EventCourseUpdated {
  courseId: string;
  changes: Partial<{ courseName: string; description: string }>;
  updatedAt: string;
}

export interface EventCourseDeleted {
  courseId: string;
  deletedAt: string;
}

// ─── Subject Events ───────────────────────────────────────────────────────────

export interface EventSubjectCreated {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  tenantId?: string;
  createdAt: string; // ISO 8601
}

export interface EventSubjectUpdated {
  subjectId: string;
  changes: Partial<{ subjectName: string; credits: number }>;
  updatedAt: string;
}

export interface EventSubjectAssignedToClass {
  subjectId: string;
  classId: string;
  assignedAt: string; // ISO 8601
}

export interface EventSubjectAssignedToCourse {
  subjectId: string;
  courseId: string;
  assignedAt: string; // ISO 8601
}

// ─── Enrollment Events ────────────────────────────────────────────────────────

export interface EventEnrollmentPrefillRequested {
  studentId: string;
  source: string;
  tenantId?: string;
}

export interface EventEnrollmentCreated {
  enrollmentId: string;
  studentId: string;
  courseId: string;
  createdAt: string; // ISO 8601
}

// ─── Notification Events ──────────────────────────────────────────────────────

export interface EventNotificationTriggered {
  type: "info" | "warning" | "error" | "success";
  message: string;
  userId?: string; // undefined = broadcast to all
  metadata?: Record<string, unknown>;
}

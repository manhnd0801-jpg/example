// app-shell/src/config/event-mapping.config.ts
//
// Khai báo toàn bộ event routing giữa các PBC tại một chỗ duy nhất
// Format: source event → [target events + optional transform]
// R-07: Luôn dùng EVENTS constants — không dùng chuỗi thô
// OUTPUT: codegen từ app-wiring.json.edges[] — không sửa tay
//
import { EVENTS } from "@shared/shared-events";
import type {
  EventAuthUserLoggedIn,
  EventAuthUserCreated,
  EventAuthRoleChanged,
  EventStudentCreated,
  EventStudentStatusChanged,
  EventClassCreated,
  EventClassStudentAssigned,
  EventCourseCreated,
  EventSubjectAssignedToClass,
} from "@shared/shared-events";

export interface EventTarget {
  event: string;
  transform?: (payload: unknown) => unknown;
}

export interface EventMapping {
  source: { pbcId: string; event: string };
  targets: EventTarget[];
}

export const EVENT_MAPPING: EventMapping[] = [
  // edge-001: pbc-auth → pbc-student-management
  // Liên kết tài khoản với hồ sơ sinh viên khi tạo user mới
  {
    source: { pbcId: "pbc-auth", event: EVENTS.AUTH.USER_CREATED },
    targets: [
      {
        event: EVENTS.STUDENT.LINKED_TO_USER,
        transform: (p) => {
          const payload = p as EventAuthUserCreated;
          return { userId: payload.userId, tenantId: payload.tenantId };
        },
      },
    ],
  },

  // edge-002: pbc-auth → pbc-notification
  // Gửi thông báo chào mừng khi user đăng nhập
  {
    source: { pbcId: "pbc-auth", event: EVENTS.AUTH.USER_LOGGED_IN },
    targets: [
      {
        event: EVENTS.NOTIFICATION.TRIGGERED,
        transform: (p) => {
          const payload = p as EventAuthUserLoggedIn;
          return {
            type: "info" as const,
            message: `Chào mừng ${payload.name} đã đăng nhập!`,
            userId: payload.sub,
          };
        },
      },
    ],
  },

  // edge-003: pbc-auth → pbc-notification
  // Thông báo khi tài khoản mới được tạo
  {
    source: { pbcId: "pbc-auth", event: EVENTS.AUTH.USER_CREATED },
    targets: [
      {
        event: EVENTS.NOTIFICATION.TRIGGERED,
        transform: (p) => {
          const payload = p as EventAuthUserCreated;
          return {
            type: "success" as const,
            message: `Tài khoản mới được tạo: ${payload.name}`,
            userId: payload.userId,
          };
        },
      },
    ],
  },

  // edge-004: pbc-auth → pbc-notification
  // Thông báo khi quyền user thay đổi
  {
    source: { pbcId: "pbc-auth", event: EVENTS.AUTH.ROLE_CHANGED },
    targets: [
      {
        event: EVENTS.NOTIFICATION.TRIGGERED,
        transform: (p) => {
          const payload = p as EventAuthRoleChanged;
          return {
            type: "info" as const,
            message: `Quyền của tài khoản đã được cập nhật`,
            userId: payload.userId,
          };
        },
      },
    ],
  },

  // edge-005: pbc-student-management → pbc-notification
  // Thông báo khi sinh viên mới được tạo
  {
    source: { pbcId: "pbc-student-management", event: EVENTS.STUDENT.CREATED },
    targets: [
      {
        event: EVENTS.NOTIFICATION.TRIGGERED,
        transform: (p) => {
          const payload = p as EventStudentCreated;
          return {
            type: "success" as const,
            message: `Sinh viên mới được tạo: ${payload.fullName}`,
          };
        },
      },
    ],
  },

  // edge-006: pbc-student-management → pbc-notification
  // Thông báo khi trạng thái sinh viên thay đổi
  {
    source: { pbcId: "pbc-student-management", event: EVENTS.STUDENT.STATUS_CHANGED },
    targets: [
      {
        event: EVENTS.NOTIFICATION.TRIGGERED,
        transform: (p) => {
          const payload = p as EventStudentStatusChanged;
          return {
            type: "info" as const,
            message: `Trạng thái sinh viên đã thay đổi: ${payload.newStatus}`,
            userId: payload.studentId,
          };
        },
      },
    ],
  },

  // edge-007: pbc-class-management → pbc-student-management
  // Cập nhật classId sinh viên khi được gán vào lớp
  {
    source: { pbcId: "pbc-class-management", event: EVENTS.CLASS.STUDENT_ASSIGNED },
    targets: [
      {
        event: EVENTS.STUDENT.CLASS_ASSIGNED,
        transform: (p) => {
          const payload = p as EventClassStudentAssigned;
          return { classId: payload.classId, studentId: payload.studentId };
        },
      },
    ],
  },

  // edge-008: pbc-class-management → pbc-notification
  // Thông báo khi lớp học mới được tạo
  {
    source: { pbcId: "pbc-class-management", event: EVENTS.CLASS.CREATED },
    targets: [
      {
        event: EVENTS.NOTIFICATION.TRIGGERED,
        transform: (p) => {
          const payload = p as EventClassCreated;
          return {
            type: "success" as const,
            message: `Lớp học mới được tạo: ${payload.className}`,
          };
        },
      },
    ],
  },

  // edge-009: pbc-class-management → pbc-notification
  // Thông báo khi sinh viên được gán vào lớp
  {
    source: { pbcId: "pbc-class-management", event: EVENTS.CLASS.STUDENT_ASSIGNED },
    targets: [
      {
        event: EVENTS.NOTIFICATION.TRIGGERED,
        transform: (p) => {
          const payload = p as EventClassStudentAssigned;
          return {
            type: "info" as const,
            message: `Sinh viên đã được gán vào lớp`,
            userId: payload.studentId,
          };
        },
      },
    ],
  },

  // edge-010: pbc-course-management → pbc-notification
  // Thông báo khi khóa học mới được tạo
  {
    source: { pbcId: "pbc-course-management", event: EVENTS.COURSE.CREATED },
    targets: [
      {
        event: EVENTS.NOTIFICATION.TRIGGERED,
        transform: (p) => {
          const payload = p as EventCourseCreated;
          return {
            type: "success" as const,
            message: `Khóa học mới được tạo: ${payload.courseName}`,
          };
        },
      },
    ],
  },

  // edge-011: pbc-subject-management → pbc-notification
  // Thông báo khi môn học được gán vào lớp
  {
    source: { pbcId: "pbc-subject-management", event: EVENTS.SUBJECT.ASSIGNED_TO_CLASS },
    targets: [
      {
        event: EVENTS.NOTIFICATION.TRIGGERED,
        transform: (p) => {
          const payload = p as EventSubjectAssignedToClass;
          return {
            type: "info" as const,
            message: `Môn học đã được gán vào lớp`,
            userId: payload.subjectId,
          };
        },
      },
    ],
  },
];

// AI-GENERATED
// Shared event type definitions dùng chung cho App Shell và các PBC

export interface StudentSelectedEvent {
  studentId: string;
  tenantId?: string;
}

export interface EnrollmentPrefillRequestedEvent {
  studentId: string;
  source: string;
  tenantId?: string;
}

// Topic constants — đồng bộ với app-asyncapi.yaml
export const TOPICS = {
  UI_STUDENT_SELECTED: "app.student-management.ui.student-selected",
  ENROLLMENT_PREFILL_REQUESTED: "pbc.enrollment-management.enrollment.prefill-requested",
} as const;

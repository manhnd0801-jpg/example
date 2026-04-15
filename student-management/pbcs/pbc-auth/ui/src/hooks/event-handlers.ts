// AI-GENERATED
// UI event handlers — lắng nghe/phát Kafka events từ App Shell event bus
// UI không gọi Kafka trực tiếp; giao tiếp qua window CustomEvent hoặc
// callback được App Shell inject vào slot props

export interface AuthEventHandlers {
  onUserLoggedIn?: (payload: { userId: string; username: string; role: string }) => void;
  onUserLoggedOut?: (payload: { userId: string }) => void;
  onUserCreated?: (payload: { userId: string; username: string; role: string }) => void;
  onUserRoleChanged?: (payload: { userId: string; oldRole: string; newRole: string }) => void;
}

/**
 * Phát CustomEvent lên window để App Shell lắng nghe và forward lên Kafka.
 * App Shell subscribe window event → publish lên Kafka topic tương ứng.
 */
export function emitAuthEvent(
  eventType: 'pbc.auth.user.logged-in' | 'pbc.auth.user.logged-out' | 'pbc.auth.user.created' | 'pbc.auth.user.role-changed',
  payload: Record<string, unknown>,
): void {
  window.dispatchEvent(
    new CustomEvent('pbc-event', {
      detail: { topic: eventType, payload },
      bubbles: true,
    }),
  );
}

/**
 * Đăng ký lắng nghe event từ App Shell (App Shell forward Kafka message → CustomEvent).
 * Trả về cleanup function để unsubscribe.
 */
export function onAuthEvent(
  topic: string,
  handler: (payload: Record<string, unknown>) => void,
): () => void {
  const listener = (e: Event) => {
    const { detail } = e as CustomEvent<{ topic: string; payload: Record<string, unknown> }>;
    if (detail.topic === topic) handler(detail.payload);
  };
  window.addEventListener('pbc-event', listener);
  return () => window.removeEventListener('pbc-event', listener);
}

// AI-GENERATED
// UI event handlers — lắng nghe/phát events từ App Shell event bus
// UI không gọi Kafka trực tiếp; giao tiếp qua window CustomEvent

export type SubjectEventType =
  | 'subject.created'
  | 'subject.updated'
  | 'subject.deleted';

/**
 * Phát CustomEvent lên window để App Shell lắng nghe và forward lên Kafka.
 */
export function emitSubjectEvent(
  eventType: SubjectEventType,
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
 * Đăng ký lắng nghe event từ App Shell.
 * Trả về cleanup function để unsubscribe.
 */
export function onSubjectEvent(
  topic: SubjectEventType,
  handler: (payload: Record<string, unknown>) => void,
): () => void {
  const listener = (e: Event) => {
    const { detail } = e as CustomEvent<{ topic: string; payload: Record<string, unknown> }>;
    if (detail.topic === topic) handler(detail.payload);
  };
  window.addEventListener('pbc-event', listener);
  return () => window.removeEventListener('pbc-event', listener);
}

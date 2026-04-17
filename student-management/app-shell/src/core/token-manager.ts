// app-shell/src/core/token-manager.ts
//
// Lưu token IN MEMORY (không dùng localStorage để tránh XSS)
// PBC nhận token qua session-context hoặc subscribe event auth.token.refreshed
// R-14 lesson: thống nhất key storage
//
import { subscribe } from "./event-bus";
import { EVENTS } from "@shared/shared-events";
import type { EventAuthUserLoggedIn, EventAuthTokenRefreshed } from "@shared/shared-events";

interface Session {
  accessToken: string;
  refreshToken: string;
  sub: string;
  name: string;
  roles: string[];
  expiresAt: number;
}

let _session: Session | null = null;

export function getSession(): Session | null {
  if (_session && Date.now() > _session.expiresAt) {
    _session = null; // Session hết hạn
  }
  return _session;
}

export function getAccessToken(): string | null {
  // Fallback sang localStorage để backward compat với pbc-auth hiện tại
  return getSession()?.accessToken ?? localStorage.getItem("accessToken") ?? null;
}

export function initTokenManager(): void {
  subscribe<EventAuthUserLoggedIn>(EVENTS.AUTH.USER_LOGGED_IN, (payload) => {
    _session = {
      accessToken:  payload.accessToken,
      refreshToken: payload.refreshToken,
      sub:          payload.sub,
      name:         payload.name ?? payload.username ?? "",
      roles:        payload.roles ?? (payload.role ? [payload.role] : []),
      expiresAt:    Date.now() + (payload.expiresIn ?? 3600) * 1000,
    };
    console.info("[TokenManager] Session initialized:", payload.sub);
  });

  subscribe<EventAuthTokenRefreshed>(EVENTS.AUTH.TOKEN_REFRESHED, (payload) => {
    if (_session) {
      _session.accessToken = payload.accessToken;
      _session.expiresAt   = Date.now() + payload.expiresIn * 1000;
    }
  });
}

export function clearSession(): void {
  _session = null;
}

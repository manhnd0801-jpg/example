// app-shell/src/core/session-context.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getSession } from "./token-manager";
import { subscribe } from "./event-bus";
import { EVENTS } from "@shared/shared-events";
import type { EventAuthUserLoggedIn } from "@shared/shared-events";

interface SessionContextValue {
  isAuthenticated: boolean;
  userId: string | null;
  userName: string | null;
  roles: string[];
  // Legacy field — backward compat với Navbar/Shell hiện tại
  role: string | null;
}

const SessionContext = createContext<SessionContextValue>({
  isAuthenticated: false,
  userId:          null,
  userName:        null,
  roles:           [],
  role:            null,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionContextValue>(() => {
    // Khởi tạo từ in-memory session hoặc sessionStorage (backward compat)
    const s = getSession();
    if (s) {
      return {
        isAuthenticated: true,
        userId:   s.sub,
        userName: s.name,
        roles:    s.roles,
        role:     s.roles[0] ?? null,
      };
    }
    const stored = sessionStorage.getItem("currentUser");
    if (stored) {
      const u = JSON.parse(stored) as { userId?: string; username?: string; role?: string };
      return {
        isAuthenticated: true,
        userId:   u.userId ?? null,
        userName: u.username ?? null,
        roles:    u.role ? [u.role] : [],
        role:     u.role ?? null,
      };
    }
    return { isAuthenticated: false, userId: null, userName: null, roles: [], role: null };
  });

  useEffect(() => {
    const sub = subscribe<EventAuthUserLoggedIn>(EVENTS.AUTH.USER_LOGGED_IN, (payload) => {
      setSession({
        isAuthenticated: true,
        userId:   payload.sub,
        userName: payload.name ?? payload.username ?? null,
        roles:    payload.roles ?? (payload.role ? [payload.role] : []),
        role:     payload.roles?.[0] ?? payload.role ?? null,
      });
    });

    // Lắng nghe CustomEvent từ pbc-auth (backward compat)
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ userId?: string; username?: string; role?: string } | null>).detail;
      if (!detail) {
        setSession({ isAuthenticated: false, userId: null, userName: null, roles: [], role: null });
      } else {
        setSession({
          isAuthenticated: true,
          userId:   detail.userId ?? null,
          userName: detail.username ?? null,
          roles:    detail.role ? [detail.role] : [],
          role:     detail.role ?? null,
        });
      }
    };
    window.addEventListener("shell:user-changed", handler);

    return () => {
      sub.unsubscribe();
      window.removeEventListener("shell:user-changed", handler);
    };
  }, []);

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);

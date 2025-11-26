import type { Session } from "@council/auth";

export interface Context {
  session: Session | null;
}

export function createContext(opts: { req: Request }): Context {
  // Session will be injected by the auth middleware
  return {
    session: null,
  };
}

export type Role = 'admin' | 'provider' | 'consumer';
export type Session = {
  token: string;
  email: string;
  role: Role;
  expiresAt: number; // timestamp ms
};

const KEY = 'ev.auth.session';

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (!s.token || !s.expiresAt || Date.now() > s.expiresAt) {
      localStorage.removeItem(KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function saveSession(s: Session) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

import { saveSession, type Session, type Role } from '../auth/session';

function makeSession(email: string, role: Role): Session {
  return {
    token: `demo-token-${role}`,
    email,
    role,
    // nhớ lưu hạn – ví dụ 7 ngày
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };
}

export async function login(email: string, password: string): Promise<Session> {
  // demo theo đúng UI của bạn
  const ok =
    (email === 'admin@evdata.vn' && password === 'admin123') ||
    (email === 'provider@evdata.vn' && password === 'provider123') ||
    (email === 'consumer@evdata.vn' && password === 'consumer123');

  if (!ok) throw new Error('Email hoặc mật khẩu không đúng');

  const role: Role =
    email.startsWith('admin') ? 'admin' :
    email.startsWith('provider') ? 'provider' : 'consumer';

  const s = makeSession(email, role);
  saveSession(s);
  return s;
}

export function logout() {
  // tuỳ bạn gọi ở menu user
  localStorage.removeItem('ev.auth.session');
}

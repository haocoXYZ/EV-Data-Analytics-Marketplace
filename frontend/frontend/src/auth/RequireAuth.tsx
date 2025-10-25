import { Navigate, useLocation } from 'react-router-dom';
import { loadSession } from './session';

export default function RequireAuth({
  children,
  roles,
}: { children: React.ReactNode; roles?: ('admin'|'provider'|'consumer')[] }) {
  const loc = useLocation();
  const s = loadSession(); // sync – không bị race khi F5
  if (!s) return <Navigate to="/login" replace state={{ from: loc }} />;
  if (roles && !roles.includes(s.role)) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

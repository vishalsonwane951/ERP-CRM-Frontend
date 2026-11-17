import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../api/index.js';
import { tokens } from '../api/client.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export const HR = ['SUPER_ADMIN', 'HR_ADMIN', 'HR_MANAGER'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(!!tokens.get());
  const qc = useQueryClient();

  const logout = useCallback(() => { tokens.clear(); setUser(null); qc.clear(); }, [qc]);

  useEffect(() => {
    if (!tokens.get()) return;
    api.auth.me().then(setUser).catch(() => tokens.clear()).finally(() => setBooting(false));
  }, []);
  useEffect(() => { window.addEventListener('muster:signout', logout); return () => window.removeEventListener('muster:signout', logout); }, [logout]);

  const login = async (email, password) => {
    const r = await api.auth.login({ email, password });
    tokens.set({ accessToken: r.accessToken, refreshToken: r.refreshToken });
    setUser(r.user);
  };

  const value = useMemo(() => ({
    user, booting, login, logout,
    is: (...roles) => !!user && (roles.includes(user.role) || user.role === 'SUPER_ADMIN'),
    isHR: !!user && HR.includes(user.role),
    isPlatform: !!user?.isPlatform, // platform staff (orgId "platform")
    // has('payroll'): is this feature switched on for the organization? (older tokens without `features` count as on)
    has: (feature) => !!user && user.features?.[feature] !== false,
  }), [user, booting, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

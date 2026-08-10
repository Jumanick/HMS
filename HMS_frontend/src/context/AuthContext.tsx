import { createContext, useContext, useState, useEffect}  from 'react';
import type { ReactNode } from 'react';
import apiClient from '../api/client';
import type { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On app load, if a token already exists, fetch who the user is
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    apiClient
      .get<User>('/accounts/users/me/')
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(username: string, password: string) {
  const res = await apiClient.post<{ access: string; refresh: string }>('/token/', {
    username,
    password,
  });
  localStorage.setItem('access_token', res.data.access);
  localStorage.setItem('refresh_token', res.data.refresh);

  const me = await apiClient.get<User>('/accounts/users/me/');   // ← this runs immediately after
  setUser(me.data);
}
  function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook so components just call useAuth() instead of importing useContext everywhere
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
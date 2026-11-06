import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, storage, TOKEN_KEY, setOnUnauthorizedCallback } from '../services/api';
import { AuthUser } from '../types';

interface AuthContextData {
  user: AuthUser | null;
  isTeacher: boolean;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

function decodeBase64(str: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  const cleanStr = str.replace(/=+$/, '');
  for (
    let bc = 0, bs = 0, buffer, idx = 0;
    (buffer = cleanStr.charAt(idx++));
    ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    buffer = chars.indexOf(buffer);
  }
  return output;
}

function decodeJwtPayload(token: string): AuthUser | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      decodeBase64(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);

    // Verifica se o token já expirou
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      id: Number(payload.sub),
      username: String(payload.username),
      role: payload.role === 'professor' ? 'professor' : 'aluno',
    };
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOnUnauthorizedCallback(() => {
      setUser(null);
    });
    return () => setOnUnauthorizedCallback(null);
  }, []);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const token = await storage.getItem(TOKEN_KEY);
        if (token) {
          const decoded = decodeJwtPayload(token);
          if (decoded) {
            api.defaults.headers.common.Authorization = `Bearer ${token}`;
            setUser(decoded);
          } else {
            await storage.removeItem(TOKEN_KEY);
            delete api.defaults.headers.common.Authorization;
          }
        }
      } finally {
        setLoading(false);
      }
    }
    loadStorageData();
  }, []);

  const signIn = async (username: string, password: string) => {
    const response = await api.post<{ access_token: string }>('/auth/login', {
      username,
      password,
    });
    const { access_token } = response.data;
    await storage.setItem(TOKEN_KEY, access_token);
    api.defaults.headers.common.Authorization = `Bearer ${access_token}`;

    const decoded = decodeJwtPayload(access_token);
    setUser(decoded);
  };

  const signOut = async () => {
    await storage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isTeacher: user?.role === 'professor',
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

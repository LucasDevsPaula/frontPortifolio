import { createContext, useEffect, useState, type ReactNode } from "react";
import api from "../server/api";

interface User {
  id: string;
  nome: string;
  email: string;
  fotoPerfil?: string;
  isGoogleUser?: boolean;
}

interface LoginResponse {
  id: string;
  nome: string;
  email: string;
  token: string;
}

interface AuthContextData {
  user: User | null;
  signed: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      return;
    }

    const profile = await api.get<User>("/me");
    setUser(profile.data);
  }

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await refreshUser();
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  async function login(email: string, senha: string) {
    try {
      const res = await api.post<LoginResponse>("/session", { email, senha });

      const { token } = res.data;

      localStorage.setItem("token", token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      await refreshUser();
    } catch (err) {
      throw err;
    }
  }

  async function loginWithGoogle(token: string) {
    try {
      localStorage.setItem("token", token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      await refreshUser();
    } catch (err) {
      logout();
    }
  }

  function logout() {
    localStorage.removeItem("token");
    // Garante que nenhuma requisição futura envie Authorization por padrão
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signed: !!user,
        loading,
        login,
        loginWithGoogle,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

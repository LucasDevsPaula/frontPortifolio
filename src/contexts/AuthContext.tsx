import { createContext, useEffect, useState, type ReactNode } from "react";
import api from "../server/api";

interface User {
  id: string;
  nome: string;
  email: string;
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
  logout: () => void;
}

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get<User>("/me");
        setUser(res.data);
      } catch (err) {
        console.log("Token inválido ou expirado", err);
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
      console.log("Resposta do login: ", res.data);

      const { token } = res.data;

      localStorage.setItem("token", token);

      const profile = await api.get<User>("/me");
      setUser(profile.data);
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      throw err;
    }
  }

  async function loginWithGoogle(token: string) {
    try {
      console.log("Login Google: recebendo token", token);

      localStorage.setItem("token", token);
      api.defaults.headers.Authorization = `Bearer ${token}`;

      const profile = await api.get<User>("/me");
      setUser(profile.data);
    } catch (err) {
      console.log("Erro ao carregar usuário do google: ", err);
      logout();
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, signed: !!user, loading, login, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

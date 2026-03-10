import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/App";

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
  name?: string;
  full_name?: string;
}

interface SignUpParams {
  email: string;
  password: string;
  name: string;
  oabNumber: string;
  specialty: string;
}

interface ResetPasswordParams {
  email: string;
  oabNumber: string;
  newPassword: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (params: SignUpParams) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (params: ResetPasswordParams) => Promise<{ error: Error | null }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos
const LAST_ACTIVITY_KEY = "last_activity_at";
const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar se existe token armazenado ao iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }

    setLoading(false);
  }, []);

  // Limpar cache quando usuário muda
  useEffect(() => {
    if (!user) {
      console.log('👤 Usuário deslogado - invalidando queries');
      queryClient.invalidateQueries();
    } else {
      // console.log('👤 Usuário logado:', { id: user.id }); // Mantendo apenas ID se necessário, ou removendo
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<{ user: User; token: string }>(
        "/login",
        { email, password }
      );

      const { user: userData, token: authToken } = response;

      // Armazenar token e user
      localStorage.setItem("auth_token", authToken);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());

      setToken(authToken);
      setUser(userData);

      return { error: null };
    } catch (error) {
      console.error("Login error:", error);
      return { error: error as Error };
    }
  };

  const signUp = async (params: SignUpParams) => {
    try {
      const response = await apiClient.post<User>("/register", {
        email: params.email,
        password: params.password,
        name: params.name,
        oabNumber: params.oabNumber,
        specialty: params.specialty,
      });
      

      // Após registrar, fazer login automaticamente
      const loginResult = await signIn(params.email, params.password);
      return loginResult;
    } catch (error) {
      console.error("❌ Erro no registro:", error);
      return { error: error as Error };
    }
  };

  const resetPassword = async (params: ResetPasswordParams) => {
    try {
      await apiClient.post("/forgot-password", {
        email: params.email,
        oabNumber: params.oabNumber,
        newPassword: params.newPassword,
      });
      return { error: null };
    } catch (error) {
      console.error("Password reset error:", error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    
    // Limpar todos os dados do localStorage relacionados a auth
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    
    // Limpar qualquer outro dado de sessão
    sessionStorage.clear();
    
    // Limpar cache do React Query
    queryClient.clear();
    
    // Resetar estado
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (!token || !user) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let intervalId: ReturnType<typeof setInterval>;

    const onIdle = () => {
      localStorage.setItem("session_expired_reason", "idle");
      void signOut();
    };

    const markActivity = () => {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    };

    const getLastActivity = () => {
      const stored = localStorage.getItem(LAST_ACTIVITY_KEY);
      const parsed = stored ? Number(stored) : Date.now();
      return Number.isFinite(parsed) ? parsed : Date.now();
    };

    const resetIdleTimer = () => {
      clearTimeout(timeoutId);
      markActivity();
      timeoutId = setTimeout(onIdle, IDLE_TIMEOUT_MS);
    };

    const checkIdleState = () => {
      const inactiveFor = Date.now() - getLastActivity();
      if (inactiveFor >= IDLE_TIMEOUT_MS) {
        onIdle();
      }
    };

    if (!localStorage.getItem(LAST_ACTIVITY_KEY)) {
      markActivity();
    }

    ACTIVITY_EVENTS.forEach((eventName) =>
      window.addEventListener(eventName, resetIdleTimer, { passive: true })
    );
    window.addEventListener("visibilitychange", checkIdleState);
    window.addEventListener("focus", checkIdleState);

    resetIdleTimer();
    intervalId = setInterval(checkIdleState, 60 * 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      ACTIVITY_EVENTS.forEach((eventName) =>
        window.removeEventListener(eventName, resetIdleTimer)
      );
      window.removeEventListener("visibilitychange", checkIdleState);
      window.removeEventListener("focus", checkIdleState);
    };
  }, [token, user]);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

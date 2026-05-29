import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import {
  fetchDashboardBootstrap,
  loginDashboardUser,
  logoutDashboardUser,
  registerDashboardUser,
  writeSessionToken,
  readSessionToken,
  type DashboardBootstrap,
  type DashboardUser
} from "./api-client";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  captcha_token: string;
};

type LoginInput = {
  email: string;
  password: string;
  captcha_token: string;
  remember?: boolean;
};

type AuthContextValue = {
  isReady: boolean;
  user: DashboardUser | null;
  bootstrap: DashboardBootstrap | null;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [bootstrap, setBootstrap] = useState<DashboardBootstrap | null>(null);

  useEffect(() => {
    async function restoreSession() {
      const token = readSessionToken();
      if (!token) {
        setIsReady(true);
        return;
      }

      try {
        const nextBootstrap = await fetchDashboardBootstrap();
        setBootstrap(nextBootstrap);
        setUser(nextBootstrap.user);
      } catch {
        writeSessionToken(null);
        setBootstrap(null);
        setUser(null);
      } finally {
        setIsReady(true);
      }
    }

    void restoreSession();
  }, []);

  const register = useCallback(async ({ name, email, password, captcha_token }: RegisterInput) => {
    const result = await registerDashboardUser({ name, email, password, captcha_token });
    writeSessionToken(result.session.token);
    const nextBootstrap = await fetchDashboardBootstrap();
    setBootstrap(nextBootstrap);
    setUser(nextBootstrap.user);
  }, []);

  const login = useCallback(async ({ email, password, captcha_token, remember = true }: LoginInput) => {
    const result = await loginDashboardUser({ email, password, captcha_token });
    writeSessionToken(result.session.token, remember);
    const nextBootstrap = await fetchDashboardBootstrap();
    setBootstrap(nextBootstrap);
    setUser(nextBootstrap.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutDashboardUser();
    } catch {
      // Local session must still be cleared if the API session already expired.
    }

    writeSessionToken(null);
    setBootstrap(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      user,
      bootstrap,
      login,
      logout,
      register
    }),
    [bootstrap, isReady, login, logout, register, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}

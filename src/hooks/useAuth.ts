import { useCallback, useMemo, useState } from "react";
import { loginApi } from "../api/auth.api";
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "../api/axios";

const parseStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getTokenFromResponse = (value: any) =>
  value?.token || value?.accessToken || value?.data?.token || "";

const getUserFromResponse = (value: any) =>
  value?.user || value?.data?.user || null;

export const useAuth = () => {
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_STORAGE_KEY) || "",
  );
  const [user, setUser] = useState(() => parseStoredUser());

  const login = useCallback(
    async ({
      identifier,
      password,
    }: {
      identifier: string;
      password: string;
    }) => {
      const response = await loginApi({ identifier, password });
      const nextToken = getTokenFromResponse(response);
      const nextUser = getUserFromResponse(response);

      if (!nextToken) {
        throw new Error("Token topilmadi");
      }

      localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
      localStorage.setItem("fw_auth", "1");
      setToken(nextToken);

      if (nextUser) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
      }

      return { token: nextToken, user: nextUser };
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem("fw_auth");
    setToken("");
    setUser(null);
  }, []);

  return useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
      setUser,
    }),
    [token, user, login, logout],
  );
};

import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const normalizeUserData = (userData) => {
  if (!userData) return null;

  if (userData.success && userData.data) {
    if (userData.data?.user) {
      return userData.data.user;
    }

    return userData.data;
  }

  if (userData.user && (userData.user.name || userData.user.email || userData.user._id)) {
    return userData.user;
  }

  if (userData.name || userData.email || userData._id) {
    return userData;
  }

  return userData;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser) {
      setUser(normalizeUserData(JSON.parse(storedUser)));
    }

    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const login = (authData) => {
    const payload = authData?.data || authData;
    const normalizedUser = normalizeUserData(authData?.user ? authData : payload);
    const authToken = payload?.token || authData?.token || null;
    const refreshToken = payload?.refreshToken || authData?.refreshToken || null;

    setUser(normalizedUser);
    localStorage.setItem("user", JSON.stringify(normalizedUser));

    if (authToken) {
      setToken(authToken);
      localStorage.setItem("token", authToken);
    }

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useEffect, useState } from "react";

type AuthContextType = {
  auth: { email?: string; pwd?: string; accessToken?: string };
  setAuth: React.Dispatch<
    React.SetStateAction<{ email?: string; pwd?: string; accessToken?: string }>
  >;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<{
    email?: string;
    pwd?: string;
    accessToken?: string;
  }>(() => {
    const savedToken = localStorage.getItem("accessToken");
    return savedToken ? { accessToken: savedToken } : {};
  });

  const logout = () => {
    setAuth({});
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  };

  useEffect(() => {
    if (auth.accessToken) {
      localStorage.setItem("accessToken", auth.accessToken);
    }
    console.log("Auth state updated:", auth);
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

import React, { createContext, useEffect, useState } from "react";

type AuthContextType = {
  auth: {
    email?: string;
    pwd?: string;
    accessToken?: string;
    role?: number;
  };
  setAuth: React.Dispatch<
    React.SetStateAction<{
      email?: string;
      pwd?: string;
      accessToken?: string;
      role?: number;
    }>
  >;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<{
    email?: string;
    pwd?: string;
    accessToken?: string;
    role?: number;
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
    if (auth.role) {
      localStorage.setItem("role", auth.role.toString());
    }
    // console.log("Auth state updated:", auth);
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

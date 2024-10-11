import React, { createContext, useState, useEffect } from "react";

type AuthContextType = {
  auth: { email?: string; pwd?: string };
  setAuth: React.Dispatch<
    React.SetStateAction<{ email?: string; pwd?: string }>
  >;
};

export const logout = () => {
  localStorage.removeItem("auth");
  window.location.href = "/login";
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<{ email?: string; pwd?: string }>(() => {
    // Load auth data from localStorage if it exists
    const storedAuth = localStorage.getItem("auth");
    return storedAuth ? JSON.parse(storedAuth) : {};
  });

  useEffect(() => {
    // Store auth data in localStorage whenever it changes
    if (auth?.pwd) {
      localStorage.setItem("auth", JSON.stringify(auth));
    } else {
      localStorage.removeItem("auth");
    }
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

import React, { createContext, useEffect, useState } from "react";

// s232976
// context for user authentication
// used for authentication and authorization
// contains the user's email, password, access token and role in machine storage and local storage
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

  // logout function
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
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

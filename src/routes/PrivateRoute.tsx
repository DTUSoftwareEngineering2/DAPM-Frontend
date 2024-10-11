import { useContext, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthProvider";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { auth } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    if (!auth?.pwd) {
      window.history.replaceState(null, "", "/login");
    }
  }, [auth]);

  console.log(auth.pwd);
  return auth?.pwd ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default PrivateRoute;

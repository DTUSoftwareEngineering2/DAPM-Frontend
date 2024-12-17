import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

// s232976
// component to ensure that only authenticated users have access to the application
// if the user is not authenticated, the user is redirected to the login page
const RequireAuth = () => {
  const { auth } = useAuth();
  const location = useLocation();

  if (auth?.accessToken) {
    localStorage.setItem("accessToken", auth.accessToken);
  }

  return auth.accessToken === undefined ? (
    <Navigate to="/login" state={{ from: location }} replace />
  ) : (
    <Outlet />
  );
};

export default RequireAuth;

import { Navigate, Outlet, useLocation } from "react-router";
import { canAccessPath } from "../admin/adminAccess"

function ProtectedAdminRoute() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  const isLoggedIn = !!token;
  const isAdminOrStaff = role === "admin" || role === "staff";

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdminOrStaff) {
    return <Navigate to="/" replace />;
  }

  if (!canAccessPath(role, location.pathname)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedAdminRoute;
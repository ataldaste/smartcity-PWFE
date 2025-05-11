import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
  const accessToken = localStorage.getItem("access_token");
  return accessToken ? <Outlet /> : <Navigate to="/" replace />;
}
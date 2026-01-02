// components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // Ambil token dari localStorage
  const token = localStorage.getItem("access_token");

  // Jika token tidak ada, redirect ke login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika token ada, render konten halaman
  return <Outlet />;
};

export default ProtectedRoute;

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./auth.context";

export function RequireAuth({ children }) {
  const { session } = useAuth();
  if (!session?.token) return <Navigate to="/login" replace />;
  return children;
}

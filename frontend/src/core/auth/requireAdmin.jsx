import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./auth.context";

export function RequireAdmin({ children }) {
  const { session } = useAuth();

  if (!session?.token) return <Navigate to="/login" replace />;
  if (session.role !== "admin") return <Navigate to="/me" replace />;

  return children;
}

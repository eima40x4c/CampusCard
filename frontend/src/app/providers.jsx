import React from "react";
import { AuthProvider } from "../core/auth/auth.context";

export function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

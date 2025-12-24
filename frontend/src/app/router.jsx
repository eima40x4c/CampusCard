import React from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../components/MainLayout";

import LoginPage from "../features/auth/LoginPage";
import SignupPage from "../features/auth/SignupPage";
import PendingStatusPage from "../features/auth/PendingStatusPage";
import StudentProfilePage from "../features/profile/StudentProfilePage";
import AdminDashboardPage from "../features/admin/AdminDashboardPage";
import AdminPendingUsersPage from "../features/admin/AdminPendingUsersPage";
import AdminReviewUserPage from "../features/admin/AdminReviewUserPage";
import StudentDirectoryPage from "../features/public/StudentDirectoryPage";
import PublicProfilePage from "../features/public/PublicProfilePage";

import { RequireAuth } from "../core/auth/requireAuth";
import { RequireAdmin } from "../core/auth/requireAdmin";
import { RequireApprovedStudent } from "../core/auth/requireApprovedStudent";

function NotFound() {
  return (
    <div style={{ padding: 40, textAlign: "center", color: "#fff" }}>
      <h2>404 - Page Not Found</h2>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <StudentDirectoryPage /> },
      { path: "directory", element: <StudentDirectoryPage /> },
      { path: "profile/:id", element: <PublicProfilePage /> },

      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },

      {
        path: "status",
        element: (
          <RequireAuth>
            <PendingStatusPage />
          </RequireAuth>
        ),
      },
      {
        path: "me",
        element: <StudentProfilePage />,
      },
      {
        path: "admin",
        children: [
          {
            index: true,
            element: (
              <RequireAdmin>
                <AdminDashboardPage />
              </RequireAdmin>
            ),
          },
          {
            path: "users",
            element: (
              <RequireAdmin>
                <AdminPendingUsersPage />
              </RequireAdmin>
            ),
          },
          {
            path: "review/:userId",
            element: (
              <RequireAdmin>
                <AdminReviewUserPage />
              </RequireAdmin>
            ),
          },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

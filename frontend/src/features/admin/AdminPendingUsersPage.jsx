import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllUsers, getPendingUsers } from "./admin.api";

export default function AdminPendingUsersPage() {
  const [allUsers, setAllUsers] = useState([]);
  const [q, setQ] = useState(""); // Search query
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // pending, approved, rejected, all, admins

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      let result;
      if (activeTab === "pending") {
        // Use the pending endpoint for pending users
        result = await getPendingUsers();
      } else {
        // Use all users endpoint for other tabs
        result = await getAllUsers();
      }

      const data = Array.isArray(result) ? result : result.data || [];
      setAllUsers(data);
    } catch (e) {
      setError("Failed to load users.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Filter users based on active tab
  const filtered = useMemo(() => {
    let users = allUsers;

    // Filter by status/role based on active tab
    if (activeTab === "pending") {
      users = users.filter(
        (u) =>
          String(u.status || "").toUpperCase() === "PENDING" &&
          String(u.role || "").toUpperCase() !== "ADMIN" &&
          String(u.role || "").toUpperCase() !== "ROLE_ADMIN"
      );
    } else if (activeTab === "approved") {
      users = users.filter(
        (u) =>
          String(u.status || "").toUpperCase() === "APPROVED" &&
          String(u.role || "").toUpperCase() !== "ADMIN" &&
          String(u.role || "").toUpperCase() !== "ROLE_ADMIN"
      );
    } else if (activeTab === "rejected") {
      users = users.filter(
        (u) =>
          String(u.status || "").toUpperCase() === "REJECTED" &&
          String(u.role || "").toUpperCase() !== "ADMIN" &&
          String(u.role || "").toUpperCase() !== "ROLE_ADMIN"
      );
    } else if (activeTab === "admins") {
      users = users.filter((u) => {
        const role = String(u.role || "").toUpperCase();
        return role === "ADMIN" || role === "ROLE_ADMIN";
      });
    }
    // "all" tab shows all users (no filter)

    // Apply search filter
    const query = q.trim().toLowerCase();
    if (!query) return users;

    return users.filter((u) => {
      const name = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
      const email = String(u.email || "").toLowerCase();
      const nid = String(u.nationalId || "");

      return (
        name.includes(query) || email.includes(query) || nid.includes(query)
      );
    });
  }, [allUsers, q, activeTab]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        backgroundImage: "radial-gradient(at 50% 0%, #1e293b 0%, #0f172a 100%)",
        color: "white",
        fontFamily: "'Segoe UI', sans-serif",
        paddingTop: "120px",
        paddingBottom: "60px",
        paddingLeft: "20px",
        paddingRight: "20px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 30,
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div>
            <Link
              to="/admin"
              style={{
                textDecoration: "none",
                color: "#94a3b8",
                fontSize: 14,
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginBottom: 10,
              }}
            >
              <span>⬅</span> Back to Dashboard
            </Link>
            <h1
              style={{
                margin: 0,
                fontSize: "2.2rem",
                fontWeight: "700",
                letterSpacing: "-0.5px",
              }}
            >
              User Management
            </h1>
            <p style={{ color: "#64748b", marginTop: 5, fontSize: "1.1rem" }}>
              Manage students and administrators
            </p>
          </div>

          {/* Search Bar */}
          <div style={{ position: "relative", minWidth: 300 }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="🔍 Search name, email, ID..."
              style={{
                width: "100%",
                padding: "12px 20px",
                paddingLeft: "45px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "white",
                outline: "none",
                fontSize: "15px",
                backdropFilter: "blur(5px)",
              }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 25,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            paddingBottom: 10,
          }}
        >
          {[
            {
              id: "pending",
              label: "Pending",
              count: allUsers.filter(
                (u) => String(u.status || "").toUpperCase() === "PENDING"
              ).length,
            },
            {
              id: "approved",
              label: "Approved",
              count: allUsers.filter(
                (u) =>
                  String(u.status || "").toUpperCase() === "APPROVED" &&
                  String(u.role || "").toUpperCase() !== "ADMIN" &&
                  String(u.role || "").toUpperCase() !== "ROLE_ADMIN"
              ).length,
            },
            {
              id: "rejected",
              label: "Rejected",
              count: allUsers.filter(
                (u) => String(u.status || "").toUpperCase() === "REJECTED"
              ).length,
            },
            { id: "all", label: "All Users", count: allUsers.length },
            {
              id: "admins",
              label: "Admins",
              count: allUsers.filter((u) => {
                const role = String(u.role || "").toUpperCase();
                return role === "ADMIN" || role === "ROLE_ADMIN";
              }).length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                background:
                  activeTab === tab.id
                    ? "rgba(59, 130, 246, 0.2)"
                    : "transparent",
                color: activeTab === tab.id ? "#60a5fa" : "#94a3b8",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: activeTab === tab.id ? "600" : "500",
                borderBottom:
                  activeTab === tab.id
                    ? "2px solid #3b82f6"
                    : "2px solid transparent",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {tab.label}
              <span
                style={{
                  background:
                    activeTab === tab.id
                      ? "rgba(59, 130, 246, 0.3)"
                      : "rgba(255,255,255,0.1)",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Loading & Error */}
        {loading && (
          <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
            Loading data...
          </div>
        )}
        {error && (
          <div
            style={{
              padding: 15,
              background: "rgba(239, 68, 68, 0.1)",
              color: "#fca5a5",
              borderRadius: 8,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                color: "#e2e8f0",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <th style={thStyle}>User Info</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Email Verification</th>
                  <th style={thStyle}>Academic</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: 40,
                        textAlign: "center",
                        color: "#64748b",
                      }}
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u, i) => (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom:
                          i === filtered.length - 1
                            ? "none"
                            : "1px solid rgba(255,255,255,0.05)",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.03)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* User Info */}
                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 15,
                          }}
                        >
                          <img
                            src={
                              u.profilePhotoUrl ||
                              u.profilePhoto ||
                              "https://via.placeholder.com/40"
                            }
                            alt="avatar"
                            style={{
                              width: 45,
                              height: 45,
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "2px solid rgba(255,255,255,0.1)",
                            }}
                            onError={(e) =>
                              (e.target.src = "https://via.placeholder.com/40")
                            }
                          />
                          <div>
                            <div
                              style={{
                                fontWeight: "600",
                                fontSize: 15,
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              {u.firstName} {u.lastName}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#94a3b8",
                                fontFamily: "monospace",
                              }}
                            >
                              {u.nationalId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role with Admin Icon */}
                      <td style={tdStyle}>
                        {String(u.role || "").toUpperCase() === "ADMIN" ||
                        String(u.role || "").toUpperCase() === "ROLE_ADMIN" ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "4px 12px",
                              borderRadius: "20px",
                              background: "rgba(234, 179, 8, 0.15)",
                              color: "#facc15",
                              border: "1px solid rgba(234, 179, 8, 0.3)",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            👑 ADMIN
                          </span>
                        ) : (
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: "20px",
                              background: "rgba(148, 163, 184, 0.15)",
                              color: "#cbd5e1",
                              border: "1px solid rgba(148, 163, 184, 0.2)",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            Student
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={tdStyle}>
                        <StatusBadge status={u.status} />
                      </td>

                      {/* Email Status */}
                      <td style={tdStyle}>
                        {u.emailVerified ? (
                          <span
                            style={{
                              color: "#4ade80",
                              fontSize: 13,
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            ✓ Verified
                          </span>
                        ) : (
                          <span
                            style={{
                              color: "#fca5a5",
                              fontSize: 13,
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            ⚠ Not Verified
                          </span>
                        )}
                        <div
                          style={{
                            fontSize: 11,
                            color: "#64748b",
                            marginTop: 3,
                          }}
                        >
                          {u.email}
                        </div>
                      </td>

                      {/* Academic */}
                      <td style={tdStyle}>
                        {u.faculty ? (
                          <>
                            <div style={{ fontSize: 14 }}>{u.faculty}</div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>
                              {u.department} • Year {u.year}
                            </div>
                          </>
                        ) : (
                          <span style={{ color: "#64748b", fontSize: 13 }}>
                            N/A
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <Link
                          to={`/admin/review/${u.id}`}
                          style={{
                            textDecoration: "none",
                            background: "rgba(59, 130, 246, 0.15)",
                            color: "#60a5fa",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: "600",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#3b82f6";
                            e.target.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background =
                              "rgba(59, 130, 246, 0.15)";
                            e.target.style.color = "#60a5fa";
                          }}
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// === Styles & Helpers ===

const thStyle = {
  padding: "18px 25px",
  textAlign: "left",
  fontSize: "13px",
  fontWeight: "600",
  textTransform: "uppercase",
  color: "#94a3b8",
  letterSpacing: "0.5px",
};

const tdStyle = {
  padding: "18px 25px",
  verticalAlign: "middle",
};

function StatusBadge({ status }) {
  let style = {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    textTransform: "uppercase",
  };

  if (String(status).toUpperCase() === "APPROVED") {
    style = {
      ...style,
      background: "rgba(34, 197, 94, 0.15)",
      color: "#4ade80",
      border: "1px solid rgba(34, 197, 94, 0.2)",
    };
  } else if (String(status).toUpperCase() === "PENDING") {
    style = {
      ...style,
      background: "rgba(234, 179, 8, 0.15)",
      color: "#facc15",
      border: "1px solid rgba(234, 179, 8, 0.2)",
    };
  } else if (String(status).toUpperCase() === "REJECTED") {
    style = {
      ...style,
      background: "rgba(239, 68, 68, 0.15)",
      color: "#f87171",
      border: "1px solid rgba(239, 68, 68, 0.2)",
    };
  } else {
    style = {
      ...style,
      background: "rgba(148, 163, 184, 0.15)",
      color: "#cbd5e1",
      border: "1px solid rgba(148, 163, 184, 0.2)",
    };
  }

  return <span style={style}>{status}</span>;
}

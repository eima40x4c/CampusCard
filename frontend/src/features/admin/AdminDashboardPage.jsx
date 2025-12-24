import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllUsers } from "./admin.api";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalStudents: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    byFaculty: {},
  });

  useEffect(() => {
    calculateStats();
  }, []);

  async function calculateStats() {
    setLoading(true);
    setError("");
    try {
      const response = await getAllUsers();
      let allData = [];
      if (Array.isArray(response)) {
        allData = response;
      } else if (response.data && Array.isArray(response.data)) {
        allData = response.data;
      }

      if (allData.length >= 0) {
        const studentsOnly = allData.filter((u) => {
          const role = String(u.role || "").toUpperCase();
          return role !== "ADMIN" && role !== "ROLE_ADMIN";
        });

        const total = studentsOnly.length;
        const pending = studentsOnly.filter(
          (u) => String(u.status || "").toUpperCase() === "PENDING"
        ).length;
        const approved = studentsOnly.filter(
          (u) => String(u.status || "").toUpperCase() === "APPROVED"
        ).length;
        const rejected = studentsOnly.filter(
          (u) => String(u.status || "").toUpperCase() === "REJECTED"
        ).length;

        const facultyMap = {};
        studentsOnly.forEach((student) => {
          const facultyName = student.faculty || "Unknown";
          if (!facultyMap[facultyName]) facultyMap[facultyName] = 0;
          facultyMap[facultyName]++;
        });

        setStats({
          totalStudents: total,
          pending,
          approved,
          rejected,
          byFaculty: facultyMap,
        });
      }
    } catch (err) {
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  }

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
            marginBottom: 40,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "2.5rem",
                fontWeight: "700",
                letterSpacing: "-0.5px",
              }}
            >
              Dashboard
            </h1>
            <p style={{ color: "#94a3b8", marginTop: 5, fontSize: "1.1rem" }}>
              System overview and statistics
            </p>
          </div>

          <Link
            to="/admin/users"
            style={{
              textDecoration: "none",
              background: "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)",
              color: "white",
              padding: "12px 24px",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: "600",
              boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)",
              transition: "transform 0.2s, box-shadow 0.2s",
              display: "inline-block",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(37, 99, 235, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(37, 99, 235, 0.4)";
            }}
          >
            Manage Users ➜
          </Link>
        </div>

        {loading && (
          <div style={{ textAlign: "center", color: "#94a3b8" }}>
            Loading stats...
          </div>
        )}
        {error && (
          <div style={{ textAlign: "center", color: "#fca5a5" }}>{error}</div>
        )}

        {!loading && !error && (
          <>
            {/* Stats Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 25,
                marginBottom: 40,
              }}
            >
              <StatCard
                title="Total Students"
                value={stats.totalStudents}
                color="blue"
              />
              <StatCard
                title="Pending Requests"
                value={stats.pending}
                color="yellow"
              />
              <StatCard
                title="Active Accounts"
                value={stats.approved}
                color="green"
              />
              <StatCard title="Rejected" value={stats.rejected} color="red" />
            </div>

            {/* Faculty Distribution Section */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "20px",
                padding: "30px",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 25px 0",
                  fontSize: "1.5rem",
                  color: "#e2e8f0",
                }}
              >
                📊 Students per Faculty
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: 20,
                }}
              >
                {Object.keys(stats.byFaculty).length === 0 ? (
                  <div style={{ color: "#64748b" }}>No data available yet.</div>
                ) : (
                  Object.entries(stats.byFaculty).map(([faculty, count]) => {
                    const percentage =
                      stats.totalStudents > 0
                        ? (count / stats.totalStudents) * 100
                        : 0;
                    return (
                      <div key={faculty} style={{ marginBottom: 15 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 8,
                            fontSize: 14,
                          }}
                        >
                          <span style={{ color: "#cbd5e1" }}>{faculty}</span>
                          <span style={{ color: "white", fontWeight: "bold" }}>
                            {count}
                          </span>
                        </div>
                        <div
                          style={{
                            height: 8,
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: 4,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${percentage}%`,
                              height: "100%",
                              background:
                                "linear-gradient(90deg, #38bdf8, #818cf8)",
                              borderRadius: 4,
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// === Components ===

function StatCard({ title, value, icon, color }) {
  let textCol = "white";
  let shadowColor = "rgba(255,255,255,0.1)";

  if (color === "blue") {
    textCol = "#60a5fa";
    shadowColor = "rgba(96, 165, 250, 0.3)";
  }
  if (color === "yellow") {
    textCol = "#facc15";
    shadowColor = "rgba(250, 204, 21, 0.3)";
  }
  if (color === "green") {
    textCol = "#4ade80";
    shadowColor = "rgba(74, 222, 128, 0.3)";
  }
  if (color === "red") {
    textCol = "#f87171";
    shadowColor = "rgba(248, 113, 113, 0.3)";
  }

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "16px",
        padding: "25px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "140px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "default",
      }}
      // ✅ Hover Effect Added
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px) scale(1.02)";
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
        e.currentTarget.style.boxShadow = `0 15px 30px -10px ${shadowColor}`;
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)";
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "1rem",
            color: "#94a3b8",
            fontWeight: "500",
          }}
        >
          {title}
        </h3>
        <span
          style={{
            fontSize: "1.5rem",
            filter: "drop-shadow(0 0 5px rgba(255,255,255,0.3))",
          }}
        >
          {icon}
        </span>
      </div>
      <div
        style={{
          fontSize: "2.5rem",
          fontWeight: "700",
          color: textCol,
          textShadow: `0 0 20px ${shadowColor}`,
        }}
      >
        {value}
      </div>
    </div>
  );
}

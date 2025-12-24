import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bg from "../../assets/login-bg.jpg";
import { authStorage } from "../../core/auth/auth.storage";
import { useAuth } from "../../core/auth/auth.context";
import { loginRequest } from "./auth.api"; // تأكدنا من استخدام نفس الاسم الموجود في ملفاتك

export default function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const result = await loginRequest({ identifier, password });
    setLoading(false);

    if (!result.ok) {
      setErrorMsg(result.error?.message || "Login failed");
      return;
    }

    const data = result.data;
    const session = {
      token: data.token,
      userId: data.id,
      email: data.email,
      firstName: data.firstName, // سنحاول حفظ الاسم إذا كان موجوداً
      role: data.role,
      status: data.status,
    };

    setSession(session);
    authStorage.set(session);

    if (String(data.role).toUpperCase() === "ADMIN") {
      navigate("/admin/users", { replace: true });
    } else if (data.status !== "APPROVED") {
      navigate("/status", { replace: true });
    } else {
      navigate("/me", { replace: true });
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 80, // مسافة للناف بار
      }}
    >
      {/* Glass Card */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(15px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "50px",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "450px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h2 style={{ color: "white", fontSize: 28, marginBottom: 10 }}>
            Welcome Back
          </h2>
          <p style={{ color: "#94a3b8" }}>
            Login with your university account.
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              color: "#fca5a5",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: 14,
              textAlign: "center",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          <div>
            <label
              style={{
                display: "block",
                color: "#cbd5e1",
                marginBottom: 8,
                fontSize: 14,
              }}
            >
              Email
            </label>
            <input
              type="email"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="student@eng.psu.edu.eg"
              style={inputStyle}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                color: "#cbd5e1",
                marginBottom: 8,
                fontSize: 14,
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={eyeBtnStyle}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={primaryBtnStyle}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div
          style={{
            marginTop: 25,
            textAlign: "center",
            color: "#94a3b8",
            fontSize: 14,
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{
              color: "#38bdf8",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  background: "rgba(0, 0, 0, 0.2)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "10px",
  color: "white",
  fontSize: "15px",
  outline: "none",
};
const primaryBtnStyle = {
  marginTop: 10,
  padding: "14px",
  background: "linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  fontSize: 16,
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 4px 15px rgba(0, 114, 255, 0.3)",
};
const eyeBtnStyle = {
  position: "absolute",
  right: 10,
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "1.2rem",
  color: "#94a3b8",
};

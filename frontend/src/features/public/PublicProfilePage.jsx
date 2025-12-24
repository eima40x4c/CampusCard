import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicProfile } from "./public.api";
// ✅ 1. استيراد نفس صورة الخلفية
import bgImage from "../../assets/login-bg.jpg";

export default function PublicProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, [id]);

  async function loadProfile() {
    try {
      setLoading(true);
      const res = await getPublicProfile(id);
      setProfile(res.data || res);
    } catch (err) {
      setError("Profile not found or restricted.");
    } finally {
      setLoading(false);
    }
  }

  // --- Loading State (Glass Style) ---
  if (loading) return (
    <div style={pageWrapperStyle}>
      <div style={{color: "rgba(255,255,255,0.7)", marginTop: 100, fontSize: 18}}>Loading Profile...</div>
    </div>
  );
  
  // --- Error/Private/Students Only State (Glass Style) ---
  // Backend handles visibility: PUBLIC (everyone), STUDENTS_ONLY (authenticated only), PRIVATE (owner/admin only)
  // If we get an error, it means access was denied
  if (error || (profile && (String(profile.visibility).toUpperCase() === "PRIVATE" || String(profile.visibility).toUpperCase() === "STUDENTS_ONLY"))) {
    const visibility = profile ? String(profile.visibility).toUpperCase() : null;
    const isStudentsOnly = visibility === "STUDENTS_ONLY";
    
    return (
      <div style={pageWrapperStyle}>
        <div style={glassCardStyle}>
          <div style={{ fontSize: 40, marginBottom: 15 }}>🔒</div>
          <h3 style={{color: "white", margin: 0}}>
            {error || (isStudentsOnly ? "This profile is for students only." : "This profile is private.")}
          </h3>
          <p style={{color: "rgba(255,255,255,0.6)", marginTop: 10}}>
            {isStudentsOnly 
              ? "Please sign in to view this student's profile." 
              : "You cannot view this student's information."}
          </p>
          <Link to="/" style={backBtnStyle}>Back to Directory</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrapperStyle}>
      {/* Container limits width */}
      <div style={{ maxWidth: 900, width: "100%" }}>
        
        {/* === MAIN GLASS CARD === */}
        <div style={{
          ...glassCardStyle,
          padding: 0, // Reset padding for internal layout
          overflow: "hidden"
        }}>
          
          {/* --- Header Section (Gradient Overlay) --- */}
          <div style={{ 
            background: "linear-gradient(to bottom, rgba(0,198,255,0.1), rgba(0,0,0,0))", 
            padding: "50px 40px 30px",
            display: "flex", 
            flexWrap: "wrap", 
            gap: 30, 
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)"
          }}>
            {/* Profile Image with Glow */}
            <div style={{ position: "relative" }}>
              <div style={{
                position: "absolute", top: -5, left: -5, right: -5, bottom: -5,
                background: "linear-gradient(45deg, #00c6ff, #0072ff)",
                borderRadius: "50%", opacity: 0.6, filter: "blur(15px)"
              }}></div>
              <img 
                src={profile.profilePhoto || profile.profilePhotoUrl || "https://via.placeholder.com/160"} 
                alt="Profile"
                style={{ 
                  width: 140, height: 140, borderRadius: "50%", 
                  border: "3px solid rgba(255,255,255,0.9)", 
                  objectFit: "cover", position: "relative", zIndex: 2
                }} 
              />
            </div>
            
            <div style={{ flex: 1, minWidth: 250 }}>
              <h1 style={{ margin: "0 0 8px", color: "white", fontSize: "2.2rem", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                {profile.firstName} {profile.lastName}
              </h1>
              
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", color: "rgba(255,255,255,0.8)" }}>
                <span style={{ 
                  background: "rgba(0,198,255,0.15)", border: "1px solid rgba(0,198,255,0.3)",
                  padding: "4px 12px", borderRadius: 20, color: "#4de1ff", fontWeight: "bold", fontSize: 13 
                }}>
                  {profile.faculty}
                </span>
                <span>•</span>
                <span style={{ fontSize: 15 }}>{profile.department}</span>
              </div>
            </div>

            {/* Social Actions */}
            <div style={{ display: "flex", gap: 10 }}>
              {profile.linkedin && (
                 <a href={profile.linkedin} target="_blank" rel="noreferrer" style={socialBtnStyle("#0077b5")}>LinkedIn</a>
              )}
              {profile.github && (
                 <a href={profile.github} target="_blank" rel="noreferrer" style={socialBtnStyle("#24292e")}>GitHub</a>
              )}
            </div>
          </div>

          {/* --- Body Content --- */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            
            {/* Left: Bio & Skills */}
            <div style={{ padding: 40, borderRight: "1px solid rgba(255,255,255,0.1)" }}>
              <SectionTitle icon="📝" title="Biography" />
              <p style={{ lineHeight: 1.8, color: "rgba(255,255,255,0.8)", fontSize: "1.05rem", whiteSpace: "pre-wrap" }}>
                {profile.bio || "This student hasn't written a bio yet."}
              </p>

              <div style={{ marginTop: 40 }}>
                <SectionTitle icon="💡" title="Skills & Interests" />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 15 }}>
                  {profile.interests ? (
                    profile.interests.split(/[,،\n]+/).map((tag, i) => (
                      tag.trim() && (
                        <span key={i} style={{ 
                          background: "rgba(255,255,255,0.1)", 
                          padding: "8px 16px", borderRadius: 30, 
                          fontSize: 14, color: "white", 
                          border: "1px solid rgba(255,255,255,0.2)"
                        }}>
                          {tag.trim()}
                        </span>
                      )
                    ))
                  ) : (
                     <span style={{ color: "rgba(255,255,255,0.5)" }}>No skills listed.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Info Sidebar */}
            <div style={{ padding: 40, background: "rgba(0,0,0,0.1)" }}>
              <SectionTitle icon="ℹ️" title="Information" />
              
              <InfoItem label="Academic Year" value={`Year ${profile.year}`} />
              <InfoItem label="Email" value={profile.email} />
              
              {profile.phone && (
                 <InfoItem label="Phone" value={profile.phone} />
              )}
              
              <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <Link to="/" style={backBtnStyle}>
                   ← Back to Directory
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// === Styles Objects ===

// 1. غلاف الصفحة (Background)
const pageWrapperStyle = {
  minHeight: "100vh",
  backgroundImage: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.85)), url(${bgImage})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
  display: "flex",
  justifyContent: "center",
  padding: "40px 20px 60px",
  fontFamily: "'Segoe UI', Roboto, sans-serif",
};

// 2. ستايل الكارت الزجاجي (Glassmorphism)
const glassCardStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  borderRadius: 24,
  boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.4)",
  color: "white",
  width: "100%",
  textAlign: "left",
};

// 3. مكون العنوان الداخلي
function SectionTitle({ icon, title }) {
  return (
    <h3 style={{ 
      color: "white", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10,
      fontSize: "1.3rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 10
    }}>
      <span>{icon}</span> {title}
    </h3>
  );
}

// 4. مكون عرض المعلومة
function InfoItem({ label, value }) {
  return (
    <div style={{ marginBottom: 25 }}>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 500, color: "white", wordBreak: "break-all" }}>{value || "N/A"}</div>
    </div>
  );
}

// 5. زر الرجوع
const backBtnStyle = {
  display: "inline-block",
  textDecoration: "none", 
  color: "#4de1ff", 
  fontSize: 15,
  fontWeight: "bold",
  background: "rgba(0,198,255,0.1)",
  padding: "10px 20px",
  borderRadius: 30,
  transition: "0.2s"
};

// 6. أزرار التواصل الاجتماعي
const socialBtnStyle = (bg) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 20px",
  background: bg === "#24292e" ? "rgba(255,255,255,0.15)" : bg, // GitHub transparent looks better on dark
  color: "white",
  textDecoration: "none",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 600,
  boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
});
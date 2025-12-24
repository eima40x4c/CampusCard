import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getPublicUsers } from "./public.api";
// ✅ استدعاء صورة الخلفية المستخدمة في اللوجن
import bgImage from "../../assets/login-bg.jpg"; 

export default function StudentDirectoryPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [search, setSearch] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("ALL");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");
      const res = await getPublicUsers();
      const data = Array.isArray(res) ? res : (res.data || []);
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load directory."); 
    } finally {
      setLoading(false);
    }
  }

  const faculties = useMemo(() => {
    const s = new Set(users.map(u => u.faculty).filter(Boolean));
    return ["ALL", ...Array.from(s)];
  }, [users]);

  const filtered = users.filter(u => {
    const term = search.toLowerCase();
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(term) || (u.faculty && u.faculty.toLowerCase().includes(term));
    const matchesFaculty = selectedFaculty === "ALL" || u.faculty === selectedFaculty;
    return matchesSearch && matchesFaculty;
  });

  return (
    <div style={{ 
      minHeight: "100vh",
      // ✅ 1. استخدام صورة الخلفية وتثبيتها وتغميقها بطبقة سوداء خفيفة
      backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url(${bgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed", // تثبيت الخلفية عند السكرول
      paddingBottom: 60,
      paddingTop: 140, // مسافة من الأعلى عشان الناف بار
      fontFamily: "'Segoe UI', Roboto, sans-serif",
    }}>
      
      {/* === Hero Header Area === */}
      <div style={{ textAlign: "center", marginBottom: 60, padding: "0 20px" }}>
        <h1 style={{ 
          color: "white", 
          fontSize: "3rem", 
          fontWeight: "800", 
          margin: "0 0 15px 0",
          textShadow: "0 4px 15px rgba(0,0,0,0.5)",
          letterSpacing: "1px"
        }}>
          Student Directory
        </h1>
        <p style={{ 
          color: "rgba(255,255,255,0.85)", 
          fontSize: "1.2rem", 
          maxWidth: 600, 
          margin: "0 auto",
          textShadow: "0 2px 4px rgba(0,0,0,0.5)"
        }}>
          Discover our talented community across all faculties.
        </p>

        {/* Search Toolbar */}
        <div style={{ 
          maxWidth: 750, margin: "40px auto 0", 
          display: "flex", gap: 15, flexWrap: "wrap",
          // تأثير زجاجي قوي لشريط البحث
          background: "rgba(255, 255, 255, 0.1)", 
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          padding: 20, borderRadius: 20,
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
        }}>
          <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
            <span style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", fontSize: 18, opacity: 0.6 }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "12px 12px 12px 45px", 
                borderRadius: 12, border: "none", 
                fontSize: 15, outline: "none", background: "rgba(255,255,255,0.9)",
                height: 48
              }}
            />
          </div>
          
          <select 
            value={selectedFaculty}
            onChange={e => setSelectedFaculty(e.target.value)}
            style={{
              padding: "0 20px", borderRadius: 12, border: "none",
              background: "rgba(255,255,255,0.9)", fontSize: 15, outline: "none", cursor: "pointer",
              minWidth: 180, height: 48, fontWeight: "600", color: "#333"
            }}
          >
            {faculties.map(f => <option key={f} value={f}>{f === "ALL" ? "All Faculties" : f}</option>)}
          </select>
        </div>
      </div>

      {/* === Grid Content === */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        
        {loading && <div style={{textAlign:"center", padding: 40, color: "rgba(255,255,255,0.7)", fontSize: 18}}>Loading students...</div>}
        
        {!loading && !error && (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
            gap: 30 
          }}>
            {filtered.length > 0 ? (
              filtered.map(user => (
                <div key={user.id} style={{
                  // ✅ 2. كروت بتأثير الزجاج (Frosted Glass)
                  background: "rgba(255, 255, 255, 0.07)", 
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: 24,
                  overflow: "hidden",
                  display: "flex", flexDirection: "column",
                  transition: "all 0.3s ease",
                  color: "white",
                  boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-10px)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)"; // تفتيح بسيط عند الهوفر
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.07)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                }}
                >
                  {/* Card Body */}
                  <div style={{ padding: 30, display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                    {/* Image with Glow */}
                    <div style={{ position: "relative", marginBottom: 20 }}>
                      <div style={{
                        position: "absolute", top: -5, left: -5, right: -5, bottom: -5,
                        background: "linear-gradient(45deg, #00c6ff, #0072ff)",
                        borderRadius: "50%", zIndex: 0, opacity: 0.7, filter: "blur(10px)"
                      }}></div>
                      <img 
                        src={user.profilePhotoUrl || user.profilePhoto || "https://via.placeholder.com/120"} 
                        alt={user.firstName}
                        style={{ 
                          width: 110, height: 110, borderRadius: "50%", 
                          objectFit: "cover", position: "relative", zIndex: 1,
                          border: "3px solid rgba(255,255,255,0.9)"
                        }}
                        onError={(e) => e.target.src = "https://via.placeholder.com/120"}
                      />
                    </div>
                    
                    <h3 style={{ margin: "5px 0", fontSize: "1.4rem", fontWeight: "700", textAlign: "center", letterSpacing: "0.5px" }}>
                      {user.firstName} {user.lastName}
                    </h3>
                    
                    {/* Faculty Badge */}
                    <div style={{ 
                      fontSize: 12, color: "#fff", 
                      background: "linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)", 
                      padding: "6px 16px", borderRadius: 20, marginBottom: 15, marginTop: 10,
                      fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px",
                      boxShadow: "0 4px 10px rgba(0, 114, 255, 0.4)"
                    }}>
                      {user.faculty}
                    </div>
                    
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", textAlign: "center", fontWeight: 500 }}>
                      {user.department} • Year {user.year}
                    </div>
                  </div>

                  {/* Card Footer Button */}
                  <Link 
                    to={`/profile/${user.id}`}
                    style={{
                      display: "block", padding: "18px", textAlign: "center",
                      background: "rgba(0, 0, 0, 0.2)", 
                      borderTop: "1px solid rgba(255,255,255,0.1)",
                      textDecoration: "none", color: "white", fontWeight: "600", letterSpacing: "1.5px", fontSize: 12,
                      textTransform: "uppercase",
                      transition: "background 0.2s"
                    }}
                    onMouseOver={(e) => { 
                      e.target.style.background = "rgba(255,255,255,0.1)"; 
                      e.target.style.color = "#00c6ff";
                    }}
                    onMouseOut={(e) => { 
                      e.target.style.background = "rgba(0, 0, 0, 0.2)"; 
                      e.target.style.color = "white";
                    }}
                  >
                    View Profile
                  </Link>
                </div>
              ))
            ) : (
              <div style={{ 
                gridColumn: "1 / -1", textAlign: "center", padding: 60, 
                color: "rgba(255,255,255,0.6)", background: "rgba(0,0,0,0.3)", borderRadius: 20 
              }}>
                <div style={{fontSize: 40, marginBottom: 15, opacity: 0.8}}>🕵️‍♂️</div>
                No students found matching your search.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
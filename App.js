import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  // ── Auth ──────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode]       = useState("login");
  const [loginData, setLoginData]     = useState({ email: "", password: "" });
  const [signupData, setSignupData]   = useState({ name: "", email: "", password: "", role: "user" });
  const [authLoading, setAuthLoading] = useState(false);

  // ── App ───────────────────────────────────────────────
  const [services, setServices]             = useState([]);
  const [form, setForm]                     = useState({ title: "", description: "", role: "", location: "", contact: "" });
  const [editId, setEditId]                 = useState(null);
  const [search, setSearch]                 = useState("");
  const [viewRole, setViewRole]             = useState("user");
  const [selectedService, setSelectedService] = useState(null);
  const [booking, setBooking]               = useState({ name: "", phone: "", message: "" });

  // ── Fetch Services ────────────────────────────────────
  const fetchServices = async () => {
    try {
      const res  = await fetch("http://127.0.0.1:8000/services/");
      const data = await res.json();
      setServices(data);
    } catch { /* backend not running */ }
  };

  useEffect(() => { fetchServices(); }, []);

  // ── Login ─────────────────────────────────────────────
  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) { alert("Please enter email and password"); return; }
    setAuthLoading(true);
    try {
      const res  = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      if (res.ok && data.user_id) {
        setCurrentUser({ user_id: data.user_id, name: data.name, role: data.role });
        setViewRole(data.role);
        setLoginData({ email: "", password: "" });
      } else {
        alert("Login failed — check your email and password");
      }
    } catch { alert("Cannot connect to server. Is the backend running?"); }
    setAuthLoading(false);
  };

  // ── Signup ────────────────────────────────────────────
  const handleSignup = async () => {
    if (!signupData.name || !signupData.email || !signupData.password) { alert("Please fill all fields"); return; }
    setAuthLoading(true);
    try {
      const res  = await fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Account created ✅ Please login now");
        setAuthMode("login");
        setSignupData({ name: "", email: "", password: "", role: "user" });
      } else {
        alert(data.detail || "Signup failed");
      }
    } catch { alert("Cannot connect to server."); }
    setAuthLoading(false);
  };

  // ── Logout ────────────────────────────────────────────
  const handleLogout = () => {
    setCurrentUser(null);
    setViewRole("user");
    setSelectedService(null);
    setEditId(null);
  };

  // ── Service CRUD ──────────────────────────────────────
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) { alert("Please login first"); return; }

    const url    = editId ? `http://127.0.0.1:8000/services/${editId}` : "http://127.0.0.1:8000/services/";
    const method = editId ? "PUT" : "POST";
    const body   = editId ? JSON.stringify({ ...form }) : JSON.stringify({ ...form, user_id: currentUser.user_id });

    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body });
      if (res.ok) {
        fetchServices();
        setForm({ title: "", description: "", role: "", location: "", contact: "" });
        setEditId(null);
      } else { alert("Failed to save service"); }
    } catch { alert("Cannot connect to server"); }
  };

  const handleEdit = (service) => {
    setForm({ title: service.title, description: service.description, role: service.role, location: service.location, contact: service.contact });
    setEditId(service.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ title: "", description: "", role: "", location: "", contact: "" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      await fetch(`http://127.0.0.1:8000/services/${id}`, { method: "DELETE" });
      fetchServices();
    } catch { alert("Could not delete"); }
  };

  // ── Booking ───────────────────────────────────────────
  const submitBooking = async () => {
    if (!booking.name || !booking.phone) { alert("Please enter name and phone"); return; }
    try {
      const res = await fetch("http://127.0.0.1:8000/bookings/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_id: selectedService, ...booking }),
      });
      if (res.ok) {
        alert("Booking sent ✅");
        setBooking({ name: "", phone: "", message: "" });
        setSelectedService(null);
      } else { alert("Booking failed"); }
    } catch { alert("Cannot connect to server"); }
  };

  // ── Filter ────────────────────────────────────────────
  const filtered = services.filter((s) =>
    [s.title, s.description, s.role, s.location].some((f) =>
      f?.toLowerCase().includes(search.toLowerCase())
    )
  );

  // ─────────────────────────────────────────────────────
  // AUTH SCREEN
  // ─────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">LocalSkill</div>
          <div className="auth-tagline">Connect with skilled local professionals</div>

          <div className="auth-tabs">
            <button className={`tab ${authMode === "login" ? "active" : ""}`} onClick={() => setAuthMode("login")}>Login</button>
            <button className={`tab ${authMode === "signup" ? "active" : ""}`} onClick={() => setAuthMode("signup")}>Sign Up</button>
          </div>

          {authMode === "login" ? (
            <>
              <div className="auth-form-title">Welcome back</div>

              <div className="field-group">
                <label className="field-label">Email</label>
                <input placeholder="you@example.com" value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} />
              </div>

              <div className="field-group">
                <label className="field-label">Password</label>
                <input type="password" placeholder="Your password" value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
              </div>

              <button className="btn btn-primary btn-full" onClick={handleLogin} disabled={authLoading}>
                {authLoading ? "Logging in…" : "Login"}
              </button>

              <p className="auth-switch">No account? <span onClick={() => setAuthMode("signup")}>Sign up here</span></p>
            </>
          ) : (
            <>
              <div className="auth-form-title">Create your account</div>

              <div className="field-group">
                <label className="field-label">Full Name</label>
                <input placeholder="Vishnu Mohan" value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })} />
              </div>

              <div className="field-group">
                <label className="field-label">Email</label>
                <input placeholder="you@example.com" value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} />
              </div>

              <div className="field-group">
                <label className="field-label">Password</label>
                <input type="password" placeholder="Choose a password" value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} />
              </div>

              <div className="field-group">
                <label className="field-label">I want to</label>
                <select value={signupData.role} onChange={(e) => setSignupData({ ...signupData, role: e.target.value })}>
                  <option value="user">Book services (User)</option>
                  <option value="provider">Offer my services (Provider)</option>
                </select>
              </div>

              <button className="btn btn-primary btn-full" onClick={handleSignup} disabled={authLoading}>
                {authLoading ? "Creating account…" : "Create Account"}
              </button>

              <p className="auth-switch">Already have an account? <span onClick={() => setAuthMode("login")}>Login here</span></p>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // MAIN APP
  // ─────────────────────────────────────────────────────
  return (
    <div>
      {/* Top Nav */}
      <nav className="topbar">
        <div className="topbar-brand">LocalSkill</div>
        <div className="topbar-right">
          <div className="topbar-user">
            Hello, <strong>{currentUser.name}</strong>
            <span className="role-badge">{currentUser.role}</span>
          </div>
          <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="page-content">

        {/* Toolbar — view toggle */}
        <div className="toolbar">
          <div className="view-toggle">
            <span>View as:</span>
            <select value={viewRole} onChange={(e) => { setViewRole(e.target.value); setSelectedService(null); }}>
              <option value="user">User</option>
              <option value="provider">Service Provider</option>
            </select>
          </div>
          {viewRole === "provider" && (
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              You can add, edit and delete services
            </span>
          )}
        </div>

        {/* Add / Edit Service Form */}
        {viewRole === "provider" && (
          <div className="form-card">
            <div className="form-card-title">
              {editId ? "✏️ Edit Service" : "➕ Add New Service"}
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field-group">
                  <label className="field-label">Title</label>
                  <input name="title" placeholder="e.g. Home Electrical Repair" value={form.title} onChange={handleChange} required />
                </div>
                <div className="field-group">
                  <label className="field-label">Your Role</label>
                  <input name="role" placeholder="e.g. Electrician" value={form.role} onChange={handleChange} required />
                </div>
                <div className="field-group">
                  <label className="field-label">Location</label>
                  <input name="location" placeholder="e.g. Kochi, Kerala" value={form.location} onChange={handleChange} required />
                </div>
                <div className="field-group">
                  <label className="field-label">Phone / WhatsApp</label>
                  <input name="contact" placeholder="e.g. 9876543210" value={form.contact} onChange={handleChange} required />
                </div>
                <div className="field-group span-2">
                  <label className="field-label">Description</label>
                  <input name="description" placeholder="What do you offer? Briefly describe your service" value={form.description} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editId ? "Update Service" : "Add Service"}
                </button>
                {editId && (
                  <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search by title, role, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Services */}
        <div className="section-header">
          <div className="section-title">Available Services</div>
          <span className="count-pill">{filtered.length} found</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔎</div>
            <div className="empty-title">No services found</div>
            <div className="empty-desc">
              {viewRole === "provider" ? "Add your first service above." : "Try a different search term."}
            </div>
          </div>
        ) : (
          <div className="service-list">
            {filtered.map((s) => (
              <div className="card" key={s.id}>
                <div className="card-title">{s.title}</div>
                <div className="card-desc">{s.description}</div>

                <div className="card-meta">
                  <span className="meta-tag green">⚡ {s.role}</span>
                  <span className="meta-tag blue">📍 {s.location}</span>
                </div>

                <div className="card-contact">📞 {s.contact}</div>

                <div className="card-actions">
                  <a href={`tel:${s.contact}`} style={{ textDecoration: "none" }}>
                    <button className="btn btn-call">📞 Call</button>
                  </a>

                  {viewRole === "provider" && (
                    <>
                      <button className="btn btn-secondary" onClick={() => handleEdit(s)}>✏️ Edit</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(s.id)}>🗑️ Delete</button>
                    </>
                  )}

                  {viewRole === "user" && (
                    <button
                      className="btn btn-primary"
                      onClick={() => setSelectedService(selectedService === s.id ? null : s.id)}
                    >
                      {selectedService === s.id ? "✕ Cancel" : "📩 Book"}
                    </button>
                  )}
                </div>

                {/* Inline Booking Form — expands under the card */}
                {viewRole === "user" && selectedService === s.id && (
                  <div className="booking-card">
                    <div className="booking-title">Book — {s.title}</div>
                    <div className="booking-grid">
                      <div className="field-group">
                        <label className="field-label">Your Name</label>
                        <input placeholder="Full name" value={booking.name}
                          onChange={(e) => setBooking({ ...booking, name: e.target.value })} />
                      </div>
                      <div className="field-group">
                        <label className="field-label">Phone Number</label>
                        <input placeholder="9876543210" value={booking.phone}
                          onChange={(e) => setBooking({ ...booking, phone: e.target.value })} />
                      </div>
                      <div className="field-group span-2">
                        <label className="field-label">Message (optional)</label>
                        <input placeholder="Describe what you need…" value={booking.message}
                          onChange={(e) => setBooking({ ...booking, message: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-actions" style={{ marginTop: 14 }}>
                      <button className="btn btn-primary" onClick={submitBooking}>Submit Booking</button>
                      <button className="btn btn-secondary" onClick={() => setSelectedService(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

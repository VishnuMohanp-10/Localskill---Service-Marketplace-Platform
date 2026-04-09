import React, { useEffect, useState } from "react";

import "./App.css";

function App() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    role: "",
    location: "",
    contact: ""
  });

  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("user");

  const [selectedService, setSelectedService] = useState(null);
  const [booking, setBooking] = useState({
    name: "",
    phone: "",
    message: ""
  });
  
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const handleLogin = async () => {
    const res = await fetch("http://127.0.0.1:8000/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginData)
    });

    const data = await res.json();

    if (data.user_id) {
      localStorage.setItem("user_id", data.user_id);
      alert("Login successful ✅");
    } else {
      alert("Login failed ❌");
    }
  };
  // 🔄 Fetch services
  const fetchServices = async () => {
    const res = await fetch("http://127.0.0.1:8000/services/");
    const data = await res.json();
    setServices(data);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // ✍️ Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    alert("Logged out");
  };

  // ➕ Add / Update service
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!localStorage.getItem("user_id")) {
      alert("Please login first");
      return;
    }

    const url = editId
      ? `http://127.0.0.1:8000/services/${editId}`
      : "http://127.0.0.1:8000/services/";

    const method = editId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({form,
        user_id: Number(localStorage.getItem("user_id"))
      }) 
    });

    fetchServices();

    setForm({
      title: "",
      description: "",
      role: "",
      location: "",
      contact: ""
    });

    setEditId(null);
  };

  // ✏️ Edit
  const handleEdit = (service) => {
    setForm(service);
    setEditId(service.id);
  };

  // ❌ Delete
  const handleDelete = async (id) => {
    await fetch(`http://127.0.0.1:8000/services/${id}`, {
      method: "DELETE"
    });

    fetchServices();
  };

  // 📌 Select for booking
  const handleBook = (id) => {
    console.log("Booking clicked for:", id);
    setSelectedService(id);
  };

  // 📩 Submit booking
  const submitBooking = async () => {
    try {
      await fetch("http://127.0.0.1:8000/bookings/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          service_id: selectedService,
          name: booking.name,
          phone: booking.phone,
          message: booking.message
        })
      });

      alert("Booking sent ✅");

      setBooking({
        name: "",
        phone: "",
        message: ""
      });

      setSelectedService(null);
    } catch (err) {
      console.error(err);
      alert("Error sending booking ❌");
    }
  };

  return (
    <div className="container">
      <h1>LocalSkill</h1>

      <div className="login-box">
        <h3>Login</h3>

        <input
          placeholder="Email"
          onChange={(e) =>
            setLoginData({ ...loginData, email: e.target.value })
          }
        />

        <input
          placeholder="Password"
          type="password"
          onChange={(e) =>
            setLoginData({ ...loginData, password: e.target.value })
          }
        />

        <button onClick={handleLogin}>Login</button>
      </div>

      {/* 🔥 ROLE SELECT */}
      <div className="role-select">
        <label>Select Role: </label>
        <select onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="provider">Service Provider</option>
        </select>
      </div>
    
      {/* 🧾 FORM (only provider) */}
      {role === "provider" && (
        <div className="form-box">
          <h2>{editId ? "Edit Service" : "Add Service"}</h2>

          <form onSubmit={handleSubmit}>
            <input
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
            />
            <input
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
            />
            <input
              name="role"
              placeholder="Role"
              value={form.role}
              onChange={handleChange}
            />
            <input
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
            />
            <input
              name="contact"
              placeholder="Phone / WhatsApp"
              value={form.contact}
              onChange={handleChange}
            />

            <button type="submit">
              {editId ? "Update Service" : "Add Service"}
            </button>
          </form>
        </div>
      )}

      {/* 🔍 SEARCH */}
      <input
        className="search"
        placeholder="Search services..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* 📋 SERVICES */}
      <h2>Available Services</h2>

      <div className="service-list">
        {services
          .filter(
            (s) =>
              s.title.toLowerCase().includes(search.toLowerCase()) ||
              s.description.toLowerCase().includes(search.toLowerCase()) ||
              s.role.toLowerCase().includes(search.toLowerCase()) ||
              s.location.toLowerCase().includes(search.toLowerCase())
          )
          .map((s) => (
            <div className="card" key={s.id}>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
              <span>
                {s.role} - {s.location}
              </span>
              <p>{s.contact}</p>

              <a href={`tel:${s.contact}`}>
                <button>Call / WhatsApp</button>
              </a>

              <div className="btn-group">
                {/* 👇 Provider only */}
                {role === "provider" && (
                  <>
                    <button onClick={() => handleEdit(s)}>Edit</button>
                    <button onClick={() => handleDelete(s.id)}>
                      Delete
                    </button>
                  </>
                )}

                {/* 👇 User only */}
                {role === "user" && (
                  <button onClick={() => handleBook(s.id)}>
                    Book your service
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* 📦 BOOKING UI */}
      {role === "user" && selectedService && (
        <div className="booking-box">
          <h3>Book Service</h3>

          <input
            placeholder="Your Name"
            onChange={(e) =>
              setBooking({ ...booking, name: e.target.value })
            }
          />

          <input
            placeholder="Phone"
            onChange={(e) =>
              setBooking({ ...booking, phone: e.target.value })
            }
          />

          <input
            placeholder="Message"
            onChange={(e) =>
              setBooking({ ...booking, message: e.target.value })
            }
          />

          <button onClick={submitBooking}>Submit</button>
          <button onClick={handleLogout}>Logout </button>
        </div>
      )}
    </div>
  );
}

export default App;

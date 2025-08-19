"use client"
import React, { useState } from "react";
import{ useRouter } from "next/navigation";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    // Replace with your authentication logic
 router.push("/pages/users"); // Redirect to cars page on successful login
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          width: "300px",
          padding: "2rem",
          border: "1px solid #000000ff",
          borderRadius: "8px",
          background: "#ffffffff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        }}
      >
        <h2 style={{ textAlign: "center" , color: "#000000ff"}}>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #000000ff" }}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #000000ff" }}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div style={{ color: "red", fontSize: "0.9rem" }}>{error}</div>}
        <button
          type="submit"
          style={{
            padding: "0.75rem",
            borderRadius: "4px",
            border: "none",
            background: "#1b84f5ff",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginScreen;
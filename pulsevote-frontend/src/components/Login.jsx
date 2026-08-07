import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { saveToken } from "../utils/auth";
import { getErrorMessage } from "../utils/messages";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Matches app.use("/api", authRoutes) + router.post("/auth/login")
      const response = await api.post("/auth/login", { email, password });
      
      saveToken(response.data.token);
      navigate("/dashboard");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-stack" noValidate>
      <h2>Login</h2>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        disabled={loading}
        required
      />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        disabled={loading}
        required
      />

      <label className="inline-control">
        <input
          type="checkbox"
          checked={showPassword}
          onChange={(e) => setShowPassword(e.target.checked)}
          disabled={loading}
        />
        Show password
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
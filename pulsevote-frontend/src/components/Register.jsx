import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { saveToken } from "../utils/auth";
import { getErrorMessage } from "../utils/messages";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validate password rules matching backend express-validator
  function validateInputs() {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }

    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasLetter || !hasNumber) {
      setError("Password must contain at least one letter and one number.");
      return false;
    }

    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register-user", {
        email: email.trim(),
        password
      });

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
      <h2>Create Account</h2>

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
        placeholder="At least 8 chars, 1 letter, 1 number"
        autoComplete="new-password"
        disabled={loading}
        required
      />

      <label htmlFor="confirmPassword">Confirm Password</label>
      <input
        id="confirmPassword"
        type={showPassword ? "text" : "password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        autoComplete="new-password"
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
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
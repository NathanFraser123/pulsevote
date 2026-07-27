import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");

    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="card">
      <h2>Logged Out</h2>

      <p>
        You have been successfully logged out.
        Redirecting to the homepage...
      </p>
    </div>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Sparkles,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("campusflow_token", data.token);
      localStorage.setItem(
        "campusflow_user",
        JSON.stringify(data.user)
      );

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* LEFT SIDE */}
      <div className="login-brand">

        <div className="brand-logo">
          <div className="brand-icon">
            <GraduationCap size={26} />
          </div>

          <span>CampusFlow</span>
        </div>

        <div className="brand-content">

          <div className="brand-badge">
            <Sparkles size={15} />
            AI-Powered Campus Platform
          </div>

          <h1>
            Your college journey,
            <span> connected.</span>
          </h1>

          <p>
            Manage courses, registrations, schedules, grades
            and opportunities from one intelligent platform.
          </p>

          <div className="brand-features">

            <div className="brand-feature">
              <BookOpen size={20} />
              <div>
                <strong>Smart Course Planning</strong>
                <span>Plan your academic journey with ease.</span>
              </div>
            </div>

            <div className="brand-feature">
              <Sparkles size={20} />
              <div>
                <strong>AI Academic Guidance</strong>
                <span>Get personalized academic insights.</span>
              </div>
            </div>

          </div>

        </div>

        <div className="brand-footer">
          © 2026 CampusFlow
        </div>

      </div>


      {/* RIGHT SIDE */}
      <div className="login-section">

        <div className="login-card">

          <div className="mobile-logo">
            <div className="brand-icon">
              <GraduationCap size={23} />
            </div>
            CampusFlow
          </div>

          <div className="login-heading">
            <h2>Welcome back</h2>
            <p>
              Sign in to continue to your dashboard
            </p>
          </div>

          <form onSubmit={handleLogin}>

            <div className="form-group">
              <label>Email address</label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>


            <div className="form-group">
              <div className="password-label">
                <label>Password</label>
                <button
                  type="button"
                  className="forgot-password"
                >
                  Forgot password?
                </button>
              </div>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>


            {error && (
              <div className="login-error">
                {error}
              </div>
            )}


            <button
              className="login-button"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>


          <div className="login-divider">
            <span>CampusFlow</span>
          </div>

          <p className="login-help">
            Student and faculty accounts are managed securely
            through CampusFlow.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;
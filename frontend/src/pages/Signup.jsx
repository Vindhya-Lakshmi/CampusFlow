import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Sparkles,
  UserPlus,
} from "lucide-react";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    contact_number: "",
    department: "",
    year_of_study: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: formData.full_name,
            email: formData.email,
            password: formData.password,
            role: "student",
            contact_number: formData.contact_number,
            department: formData.department,
            year_of_study: Number(formData.year_of_study),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">

      {/* LEFT BRANDING */}
      <div className="signup-brand">

        <div className="brand-logo">
          <div className="brand-icon">
            <GraduationCap size={26} />
          </div>

          <span>CampusFlow</span>
        </div>

        <div className="signup-brand-content">

          <div className="brand-badge">
            <Sparkles size={15} />
            AI-Powered Campus Platform
          </div>

          <h1>
            Start your college
            <span> journey today.</span>
          </h1>

          <p>
            Create your CampusFlow account and manage your
            courses, registrations, grades and academic journey
            from one intelligent platform.
          </p>

          <div className="brand-features">

            <div className="brand-feature">
              <BookOpen size={20} />

              <div>
                <strong>Everything in one place</strong>

                <span>
                  Courses, grades, attendance and schedules.
                </span>
              </div>
            </div>

            <div className="brand-feature">
              <Sparkles size={20} />

              <div>
                <strong>Smarter academic planning</strong>

                <span>
                  Get guidance throughout your college journey.
                </span>
              </div>
            </div>

          </div>

        </div>

        <div className="brand-footer">
          © 2026 CampusFlow
        </div>

      </div>

      {/* SIGNUP FORM */}
      <div className="signup-section">

        <div className="signup-card">

          <div className="mobile-signup-logo">
            <div className="brand-icon">
              <GraduationCap size={23} />
            </div>

            CampusFlow
          </div>

          <div className="signup-heading">

            <div className="signup-icon">
              <UserPlus size={20} />
            </div>

            <div>
              <h2>Create your account</h2>

              <p>
                Join CampusFlow to manage your academic journey
              </p>
            </div>

          </div>

          <form onSubmit={handleSignup}>

            {/* NAME + EMAIL */}

            <div className="signup-form-row">

              <div className="signup-form-group">
                <label>Full name</label>

                <input
                  type="text"
                  name="full_name"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="signup-form-group">
                <label>Email address</label>

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            {/* CONTACT */}

            <div className="signup-form-group">
              <label>Contact number</label>

              <input
                type="tel"
                name="contact_number"
                placeholder="Enter your phone number"
                value={formData.contact_number}
                onChange={handleChange}
                required
              />
            </div>

            {/* DEPARTMENT + YEAR */}

            <div className="signup-form-row">

              <div className="signup-form-group">
                <label>Department</label>

                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select department
                  </option>

                  <option value="Computer Science">
                    Computer Science
                  </option>

                  <option value="Information Technology">
                    Information Technology
                  </option>

                  <option value="Commerce">
                    Commerce
                  </option>

                  <option value="Mathematics">
                    Mathematics
                  </option>

                  <option value="Physics">
                    Physics
                  </option>

                  <option value="Chemistry">
                    Chemistry
                  </option>

                  <option value="English">
                    English
                  </option>
                </select>
              </div>

              <div className="signup-form-group">
                <label>Year of study</label>

                <select
                  name="year_of_study"
                  value={formData.year_of_study}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select year
                  </option>

                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

            </div>

            {/* PASSWORD */}

            <div className="signup-form-row">

              <div className="signup-form-group">
                <label>Password</label>

                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="signup-form-group">
                <label>Confirm password</label>

                <input
                  type="password"
                  name="confirm_password"
                  placeholder="Confirm password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="signup-error">
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="signup-success">
                {success}
              </div>
            )}

            {/* BUTTON */}

            <button
              className="signup-button"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Create account
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>

          <div className="signup-divider">
            <span>CampusFlow</span>
          </div>

          <p className="signup-login-text">
            Already have an account?{" "}

            <Link to="/login">
              Sign in
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Signup;
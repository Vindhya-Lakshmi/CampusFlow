
import { useEffect, useState } from "react";
import {
  User,
  Mail,
  GraduationCap,
  ShieldCheck,
  Phone,
  Building2,
  ArrowLeft,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../services/api";

function Profile() {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userResponse = await api.get("/auth/me");
        const currentUser = userResponse.data.user;

        setUser(currentUser);

        if (currentUser.student_id) {
          const response = await api.get(
            `/students/${currentUser.student_id}`
          );

          setStudent(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  const fullName = user?.full_name || "Student";
  const role = user?.role || "student";

  return (
    <div className="profile-page">

      {/* Back Button */}
      <Link to="/dashboard" className="profile-back-btn">
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>

      {/* Page Header */}
      <div className="profile-page-header">
        <div>
          <span className="profile-eyebrow">ACCOUNT</span>
          <h1>My Profile</h1>
          <p>
            View and manage your CampusFlow account information.
          </p>
        </div>

        <div className="profile-header-icon">
          <UserRound size={28} />
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="profile-main-card">

        {/* Profile Banner */}
        <div className="profile-banner"></div>

        {/* Profile Identity */}
        <div className="profile-identity">

          <div className="profile-avatar-large">
            <User size={42} />
          </div>

          <div className="profile-identity-info">
            <h2>{fullName}</h2>

            <div className="profile-role-badge">
              <ShieldCheck size={15} />
              {role}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="profile-content">

          <div className="profile-section-title">
            <div className="section-title-icon">
              <UserRound size={18} />
            </div>

            <div>
              <h3>Personal Information</h3>
              <p>Your registered account details</p>
            </div>
          </div>

          <div className="profile-details-grid">

            {/* Email */}
            <div className="profile-info-item">
              <div className="profile-info-icon">
                <Mail size={20} />
              </div>

              <div>
                <span>Email Address</span>
                <strong>
                  {user?.email || "Not available"}
                </strong>
              </div>
            </div>

            {/* Student ID */}
            <div className="profile-info-item">
              <div className="profile-info-icon">
                <GraduationCap size={20} />
              </div>

              <div>
                <span>Student ID</span>
                <strong>
                  {student?.student_id ||
                    user?.student_id ||
                    "Not available"}
                </strong>
              </div>
            </div>

            {/* Contact */}
            <div className="profile-info-item">
              <div className="profile-info-icon">
                <Phone size={20} />
              </div>

              <div>
                <span>Contact Number</span>
                <strong>
                  {student?.phone ||
                    student?.contact_number ||
                    user?.contact_number ||
                    "Not available"}
                </strong>
              </div>
            </div>

            {/* Department */}
            <div className="profile-info-item">
              <div className="profile-info-icon">
                <Building2 size={20} />
              </div>

              <div>
                <span>Department</span>
                <strong>
                  {student?.department ||
                    user?.department ||
                    "Not available"}
                </strong>
              </div>
            </div>

            {/* Year */}
            <div className="profile-info-item">
              <div className="profile-info-icon">
                <GraduationCap size={20} />
              </div>

              <div>
                <span>Year of Study</span>
                <strong>
                  {student?.year_of_study ||
                    user?.year_of_study ||
                    "Not available"}
                </strong>
              </div>
            </div>

            {/* Role */}
            <div className="profile-info-item">
              <div className="profile-info-icon">
                <ShieldCheck size={20} />
              </div>

              <div>
                <span>Account Role</span>
                <strong className="role-text">
                  {role}
                </strong>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="profile-status-card">
        <div className="status-indicator"></div>

        <div>
          <h4>Account Active</h4>
          <p>
            Your CampusFlow account is currently active and
            ready to use.
          </p>
        </div>
      </div>

    </div>
  );
}

export default Profile;


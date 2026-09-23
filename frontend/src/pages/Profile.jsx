
import { useEffect, useState } from "react";
import {
  User,
  Mail,
  GraduationCap,
  ShieldCheck,
  Phone,
  Building2,
} from "lucide-react";
import api from "../services/api";

function Profile() {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get authenticated user
        const userResponse = await api.get("/auth/me");
        const currentUser = userResponse.data.user;

        setUser(currentUser);

        // Get student details
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
    return <div className="page-loading">Loading profile...</div>;
  }

  return (
    <div className="inner-page">
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p>View your CampusFlow account information.</p>
        </div>

        <div className="page-header-icon">
          <User size={28} />
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          <User size={42} />
        </div>

        <h2>{user?.full_name || "Student"}</h2>

        <span className="profile-role">
          {user?.role || "student"}
        </span>

        <div className="profile-details">

          {/* Email */}
          <div className="profile-detail">
            <Mail size={20} />

            <div>
              <span>Email</span>
              <strong>
                {user?.email || "Not available"}
              </strong>
            </div>
          </div>

          {/* Student ID */}
          <div className="profile-detail">
            <GraduationCap size={20} />

            <div>
              <span>Student ID</span>
              <strong>
                {student?.student_id || user?.student_id || "Not available"}
              </strong>
            </div>
          </div>

          {/* Contact Number */}
          <div className="profile-detail">
            <Phone size={20} />

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
          <div className="profile-detail">
            <Building2 size={20} />

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
          <div className="profile-detail">
            <GraduationCap size={20} />

            <div>
              <span>Year of Study</span>
              <strong>
                {student?.year_of_study ||
                  user?.year_of_study ||
                  "Not available"}
              </strong>
            </div>
          </div>

          {/* Account Role */}
          <div className="profile-detail">
            <ShieldCheck size={20} />

            <div>
              <span>Account Role</span>
              <strong>
                {user?.role || "student"}
              </strong>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;


import { useEffect, useState } from "react";
import api from "../services/api";
import {
  ArrowLeft,
  ClipboardList,
  CheckCircle2,
  Clock3,
} from "lucide-react";

function RegistrationHistory() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchRegistrations = async () => {
    try {
      // Get authenticated student
      const userResponse = await api.get("/auth/me");
      const user = userResponse.data.user;

      if (!user.student_id) {
        console.error("Student ID not found");
        return;
      }

      // Get registration history
      const response = await api.get(
        `/registrations/student/${user.student_id}`
      );

      setRegistrations(response.data.data || []);
    } catch (error) {
      console.error(
        "Failed to fetch registration history:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  fetchRegistrations();
}, []);

  const totalCredits = registrations.reduce(
    (total, registration) =>
      total + registration.credits,
    0
  );

  return (
    <div className="registration-history-page">
      <div className="registration-history-header">
        <div>
          <a href="/dashboard" className="back-link">
            <ArrowLeft size={18} />
            Back to Dashboard
          </a>

          <p className="header-small">ACADEMIC PORTAL</p>

          <h1>Registration History</h1>

          <p>
            View your registered courses and enrollment details.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="registration-history-card">
          <p className="empty-course-message">
            Loading registration history...
          </p>
        </div>
      ) : (
        <>
          <div className="registration-summary">
            <div className="registration-summary-card">
              <div className="summary-icon blue">
                <ClipboardList size={22} />
              </div>

              <div>
                <span>Registered Courses</span>
                <strong>{registrations.length}</strong>
              </div>
            </div>

            <div className="registration-summary-card">
              <div className="summary-icon purple">
                <CheckCircle2 size={22} />
              </div>

              <div>
                <span>Registered Credits</span>
                <strong>{totalCredits}</strong>
              </div>
            </div>
          </div>

          <div className="registration-history-card">
            <div className="card-heading">
              <div>
                <h2>Course Registrations</h2>
                <p>Your current course registrations</p>
              </div>

              <ClipboardList size={21} />
            </div>

            {registrations.length === 0 ? (
              <p className="empty-course-message">
                No registration records found.
              </p>
            ) : (
              <div className="registration-list">
                {registrations.map((registration) => (
                  <div
                    className="registration-row"
                    key={registration.registration_id}
                  >
                    <div className="registration-course-code">
                      {registration.course_code}
                    </div>

                    <div className="registration-course-info">
                      <strong>
                        {registration.course_name}
                      </strong>

                      <span>
                        {registration.credits} Credits
                      </span>

                      <small>
                        Registered on{" "}
                        {new Date(
                          registration.registration_date
                        ).toLocaleDateString()}
                      </small>
                    </div>

                    <div className="registration-status">
                      <CheckCircle2 size={16} />
                      {registration.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default RegistrationHistory;
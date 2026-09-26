import { useEffect, useState } from "react";
import { CalendarCheck, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../services/api";
import { Link } from "react-router-dom";

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        // Get authenticated student
        const userResponse = await api.get("/auth/me");
        const user = userResponse.data.user;

        if (!user.student_id) {
          console.error("Student ID not found");
          return;
        }

        // Get attendance for authenticated student
        const response = await api.get(
          `/attendance/student/${user.student_id}`
        );

        setAttendance(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const getPercentage = (attended, total) => {
    if (total === 0) return 0;
    return Math.round((attended / total) * 100);
  };

  if (loading) {
    return (
      <div className="page-loading">
        Loading attendance...
      </div>
    );
  }

  return (
    <div className="inner-page">
      <Link to="/dashboard">
          ← Back to Dashboard
        </Link>
      <div className="page-header">
        
        <div>
          <h1>Attendance</h1>
          <p>Track your attendance for each course.</p>
        </div>

        <div className="page-header-icon">
          <CalendarCheck size={28} />
        </div>
      </div>

      {attendance.length === 0 ? (
        <div className="empty-state">
          <CalendarCheck size={42} />
          <h3>No attendance records</h3>
          <p>Your attendance information will appear here.</p>
        </div>
      ) : (
        <div className="attendance-grid">
          {attendance.map((item) => {
            const percentage = getPercentage(
              item.attended_classes,
              item.total_classes
            );

            const isGood = percentage >= 75;

            return (
              <div className="attendance-card" key={item.attendance_id}>
                <div className="attendance-card-header">
                  <div>
                    <span className="course-code">
                      {item.course_code}
                    </span>

                    <h3>{item.course_name}</h3>
                  </div>

                  {isGood ? (
                    <CheckCircle2 size={24} />
                  ) : (
                    <AlertCircle size={24} />
                  )}
                </div>

                <div className="attendance-percentage">
                  {percentage}%
                </div>

                <div className="attendance-progress">
                  <div
                    className="attendance-progress-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                <div className="attendance-details">
                  <span>
                    Attended: <strong>{item.attended_classes}</strong>
                  </span>

                  <span>
                    Total: <strong>{item.total_classes}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Attendance;
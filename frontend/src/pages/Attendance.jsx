


import { useEffect, useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import api from "../services/api";
import { Link } from "react-router-dom";

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const userResponse = await api.get("/auth/me");
        const user = userResponse.data.user;

        if (!user.student_id) {
          console.error("Student ID not found");
          return;
        }

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

  // Overall attendance
  const totalAttended = attendance.reduce(
    (sum, item) => sum + Number(item.attended_classes || 0),
    0
  );

  const totalClasses = attendance.reduce(
    (sum, item) => sum + Number(item.total_classes || 0),
    0
  );

  const overallPercentage =
    totalClasses > 0
      ? Math.round((totalAttended / totalClasses) * 100)
      : 0;

  const goodSubjects = attendance.filter(
    (item) =>
      getPercentage(item.attended_classes, item.total_classes) >= 75
  ).length;

  if (loading) {
    return (
      <div className="attendance-loading">
        <div className="loading-spinner"></div>
        <p>Loading attendance...</p>
      </div>
    );
  }

  return (
    <div className="attendance-page">

      {/* Top Navigation */}
      <div className="attendance-topbar">
        <Link to="/dashboard" className="back-dashboard">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
      </div>

      {/* Hero Header */}
      <div className="attendance-hero">
        <div className="attendance-hero-content">
          <div className="attendance-icon-box">
            <CalendarCheck size={30} />
          </div>

          <div>
            <span className="attendance-label">
              ACADEMIC OVERVIEW
            </span>

            <h1>Attendance</h1>

            <p>
              Keep track of your attendance and stay on top of
              your academic progress.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      {attendance.length > 0 && (
        <div className="attendance-summary">

          {/* Overall Percentage */}
          <div className="summary-card overall-card">
            <div className="summary-card-top">
              <div>
                <span>Overall Attendance</span>
                <h2>{overallPercentage}%</h2>
              </div>

              <div className="summary-icon">
                <TrendingUp size={22} />
              </div>
            </div>

            <div className="summary-progress">
              <div
                className="summary-progress-fill"
                style={{ width: `${overallPercentage}%` }}
              ></div>
            </div>

            <p>
              {totalAttended} of {totalClasses} classes attended
            </p>
          </div>

          {/* Courses */}
          <div className="summary-card">
            <div className="summary-card-top">
              <div>
                <span>Total Courses</span>
                <h2>{attendance.length}</h2>
              </div>

              <div className="summary-icon purple">
                <BookOpen size={22} />
              </div>
            </div>

            <p>Courses with attendance records</p>
          </div>

          {/* Good Attendance */}
          <div className="summary-card">
            <div className="summary-card-top">
              <div>
                <span>Attendance Status</span>
                <h2>{goodSubjects}</h2>
              </div>

              <div className="summary-icon green">
                <CheckCircle2 size={22} />
              </div>
            </div>

            <p>Courses above 75% attendance</p>
          </div>
        </div>
      )}

      {/* Course Attendance */}
      <div className="attendance-section">

        <div className="section-heading">
          <div>
            <h2>Course Attendance</h2>
            <p>Detailed attendance for each registered course.</p>
          </div>
        </div>

        {attendance.length === 0 ? (
          <div className="attendance-empty">
            <div className="empty-icon">
              <CalendarCheck size={40} />
            </div>

            <h3>No attendance records</h3>

            <p>
              Your attendance information will appear here
              once records are available.
            </p>
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
                <div
                  className="attendance-card"
                  key={item.attendance_id}
                >
                  {/* Card Header */}
                  <div className="attendance-card-header">
                    <div>
                      <span className="course-code">
                        {item.course_code}
                      </span>

                      <h3>{item.course_name}</h3>
                    </div>

                    <div
                      className={`status-icon ${
                        isGood ? "good" : "warning"
                      }`}
                    >
                      {isGood ? (
                        <CheckCircle2 size={22} />
                      ) : (
                        <AlertCircle size={22} />
                      )}
                    </div>
                  </div>

                  {/* Percentage */}
                  <div className="percentage-row">
                    <div
                      className={`percentage-circle ${
                        isGood ? "circle-good" : "circle-warning"
                      }`}
                    >
                      <strong>{percentage}%</strong>
                      <span>Attendance</span>
                    </div>

                    <div className="attendance-status">
                      <span
                        className={`status-badge ${
                          isGood ? "badge-good" : "badge-warning"
                        }`}
                      >
                        {isGood ? "Good Standing" : "Needs Attention"}
                      </span>

                      <p>
                        {isGood
                          ? "Your attendance is on track."
                          : "Try to attend more classes."}
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="course-progress-section">
                    <div className="progress-label">
                      <span>Attendance Progress</span>
                      <strong>{percentage}%</strong>
                    </div>

                    <div className="attendance-progress">
                      <div
                        className={`attendance-progress-fill ${
                          isGood ? "progress-good" : "progress-warning"
                        }`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="attendance-details">
                    <div>
                      <span>Attended</span>
                      <strong>{item.attended_classes}</strong>
                    </div>

                    <div>
                      <span>Total Classes</span>
                      <strong>{item.total_classes}</strong>
                    </div>

                    <div>
                      <span>Missed</span>
                      <strong>
                        {item.total_classes -
                          item.attended_classes}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Attendance;






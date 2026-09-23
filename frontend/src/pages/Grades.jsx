import { useEffect, useState } from "react";
import api from "../services/api";
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Award,
} from "lucide-react";

function Grades() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchGrades = async () => {
    try {
      // Get authenticated student
      const userResponse = await api.get("/auth/me");
      const user = userResponse.data.user;

      if (!user.student_id) {
        console.error("Student ID not found");
        return;
      }

      // Get grades for authenticated student
      const response = await api.get(
        `/grades/student/${user.student_id}`
      );

      setGrades(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch grades:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchGrades();
}, []);

  const totalCredits = grades.reduce(
    (total, course) => total + course.credits,
    0
  );

  const totalPoints = grades.reduce(
    (total, course) =>
      total + course.credits * Number(course.grade_point),
    0
  );

  const gpa =
    totalCredits > 0
      ? (totalPoints / totalCredits).toFixed(2)
      : "0.00";

  return (
    <div className="grades-page">
      <div className="grades-header">
        <div>
          <a href="/dashboard" className="back-link">
            <ArrowLeft size={18} />
            Back to Dashboard
          </a>

          <p className="header-small">ACADEMIC PORTAL</p>

          <h1>Grades & GPA</h1>

          <p>
            View your academic performance and grade details.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grades-card">
          <p className="empty-course-message">
            Loading grades...
          </p>
        </div>
      ) : (
        <>
          <div className="grade-summary">
            <div className="grade-summary-card">
              <div className="summary-icon blue">
                <Award size={22} />
              </div>

              <div>
                <span>Current GPA</span>
                <strong>{gpa}</strong>
              </div>
            </div>

            <div className="grade-summary-card">
              <div className="summary-icon purple">
                <BookOpen size={22} />
              </div>

              <div>
                <span>Completed Courses</span>
                <strong>{grades.length}</strong>
              </div>
            </div>

            <div className="grade-summary-card">
              <div className="summary-icon blue">
                <GraduationCap size={22} />
              </div>

              <div>
                <span>Credits Completed</span>
                <strong>{totalCredits}</strong>
              </div>
            </div>
          </div>

          <div className="grades-card">
            <div className="card-heading">
              <div>
                <h2>Course Grades</h2>
                <p>Your academic results</p>
              </div>

              <GraduationCap size={21} />
            </div>

            {grades.length === 0 ? (
              <p className="empty-course-message">
                No grades available yet.
              </p>
            ) : (
              <div className="grades-list">
                {grades.map((course) => (
                  <div
                    className="grade-row"
                    key={course.grade_id}
                  >
                    <div className="grade-course-code">
                      {course.course_code}
                    </div>

                    <div className="grade-course-info">
                      <strong>{course.course_name}</strong>

                      <span>
                        {course.credits} Credits
                      </span>
                    </div>

                    <div className="grade-value">
                      <strong>{course.grade}</strong>
                      <span>
                        {Number(course.grade_point).toFixed(2)} GP
                      </span>
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

export default Grades;
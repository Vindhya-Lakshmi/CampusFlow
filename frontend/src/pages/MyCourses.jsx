import { useEffect, useState } from "react";
import api from "../services/api";
import {
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [droppingCourse, setDroppingCourse] = useState(null);

 useEffect(() => {
  const fetchStudentCourses = async () => {
    try {
      // Get the authenticated user from the backend
      const userResponse = await api.get("/auth/me");

      const user = userResponse.data.user;

      if (!user.student_id) {
        console.error("Student ID not found");
        return;
      }

      // Fetch courses for this student
      const response = await api.get(
        `/registrations/student/${user.student_id}`
      );
      console.log("MY COURSES API RESPONSE:", response.data);

      setCourses(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchStudentCourses();
}, []);

  const totalCredits = courses.reduce(
    (total, course) => total + course.credits,
    0
  );

  const handleDropCourse = async (registrationId) => {
  const confirmDrop = window.confirm(
    "Are you sure you want to drop this course?"
  );

  if (!confirmDrop) {
    return;
  }

  try {
    setDroppingCourse(registrationId);

    await api.delete(`/registrations/${registrationId}`);

    setCourses((prevCourses) =>
      prevCourses.filter(
        (course) => course.registration_id !== registrationId
      )
    );
  } catch (error) {
    console.error("Failed to drop course:", error);

    alert(
      error.response?.data?.message ||
        "Failed to drop the course."
    );
  } finally {
    setDroppingCourse(null);
  }
};

  return (
    <div className="my-courses-page">
      <div className="my-courses-header">
        <div>
          <a href="/dashboard" className="back-link">
            <ArrowLeft size={18} />
            Back to Dashboard
          </a>

          <p className="header-small">ACADEMIC PORTAL</p>

          <h1>My Courses</h1>

          <p>
            Manage and view the courses you are registered for this semester.
          </p>
        </div>
      </div>

      <div className="course-summary">
        <div className="course-summary-card">
          <div className="summary-icon blue">
            <BookOpen size={22} />
          </div>

          <div>
            <span>Enrolled Courses</span>
            <strong>{courses.length}</strong>
          </div>
        </div>

        <div className="course-summary-card">
          <div className="summary-icon purple">
            <CalendarDays size={22} />
          </div>

          <div>
            <span>Registered Credits</span>
            <strong>{totalCredits}</strong>
          </div>
        </div>
      </div>

      <div className="my-courses-card">
        <div className="card-heading">
          <div>
            <h2>Registered Courses</h2>
            <p>Your courses for the current semester</p>
          </div>

          <BookOpen size={21} />
        </div>

        {loading ? (
          <p className="empty-course-message">Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="empty-course-message">
            You are not registered for any courses yet.
          </p>
        ) : (
          <div className="my-course-list">
            
            {courses.map((course) => (
              <div className="my-course-row" key={course.course_id}>
                <div className="my-course-code">
                  {course.course_code}
                </div>

                <div className="my-course-info">
                  <strong>{course.course_name}</strong>

                  <span>
                    {course.credits} Credits
                  </span>

                  <small>
                    Registered on{" "}
                    {new Date(
                      course.registration_date
                    ).toLocaleDateString()}
                  </small>
                </div>

                <div className="my-course-actions">
  <div className="my-course-status">
    <CheckCircle2 size={17} />
    {course.status}
  </div>

  <button
    className="drop-course-button"
    onClick={() => handleDropCourse(course.registration_id)}
    disabled={droppingCourse === course.registration_id}
  >
    {droppingCourse === course.registration_id
      ? "Dropping..."
      : "Drop Course"}
  </button>
</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCourses;
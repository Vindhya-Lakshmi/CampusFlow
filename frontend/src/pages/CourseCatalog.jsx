import { useEffect, useState } from "react";
import api from "../services/api";
import {
    BookOpen,
    ArrowLeft,
    GraduationCap,
    Search,
} from "lucide-react";

function CourseCatalog() {
    const [courses, setCourses] = useState([]);
    const [registeredCourses, setRegisteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [creditFilter, setCreditFilter] = useState("all");
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Get authenticated student
                const userResponse = await api.get("/auth/me");

                const user = userResponse.data.user;

                // Get all available courses
                const response = await api.get("/courses");

                setCourses(response.data.data || []);

                if (user.student_id) {
                    // Get courses already registered by this student
                    const registeredResponse = await api.get(
                        `/registrations/student/${user.student_id}`
                    );

                    setRegisteredCourses(registeredResponse.data.data || []);
                    console.log("REGISTERED COURSES:", registeredResponse.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const handleRegister = async (courseId) => {
  try {
    // Get authenticated student
    const userResponse = await api.get("/auth/me");

    const user = userResponse.data.user;

    if (!user.student_id) {
      alert("Student information not found.");
      return;
    }

    const response = await api.post("/registrations", {
      student_id: user.student_id,
      course_id: courseId,
      registration_date: new Date().toISOString().split("T")[0],
      status: "Registered",
    });

    alert(response.data.message);

    const registeredCourse = courses.find(
      (course) => course.course_id === courseId
    );

    if (registeredCourse) {
      setRegisteredCourses((prev) => [
        ...prev,
        registeredCourse,
      ]);
    }
  } catch (error) {
    console.error("Registration failed:", error);

    alert(
      error.response?.data?.message ||
        "Failed to register for the course."
    );
  }
};
    const filteredCourses = courses.filter((course) => {
        const matchesSearch =
            course.course_name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            course.course_code
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesCredits =
            creditFilter === "all" ||
            course.credits.toString() === creditFilter;

        return matchesSearch && matchesCredits;
    });

    return (
        <div className="course-catalog-page">
            <div className="course-catalog-header">
                <div>
                    <a href="/dashboard" className="back-link">
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </a>

                    <p className="header-small">ACADEMIC PORTAL</p>

                    <h1>Course Catalog</h1>

                    <p>
                        Explore the courses available for registration.
                    </p>
                </div>
            </div>

            <div className="course-catalog-card">
                <div className="course-filters">
                    <div className="search-input-wrapper">
                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search by course name or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        value={creditFilter}
                        onChange={(e) => setCreditFilter(e.target.value)}
                    >
                        <option value="all">All Credits</option>
                        <option value="3">3 Credits</option>
                        <option value="4">4 Credits</option>
                    </select>
                </div>
                <div className="card-heading">
                    <div>
                        <h2>Available Courses</h2>
                        <p>Choose courses for your academic journey</p>
                    </div>

                    <GraduationCap size={21} />
                </div>

                {loading ? (
                    <p className="empty-course-message">
                        Loading courses...
                    </p>
                ) : courses.length === 0 ? (
                    <p className="empty-course-message">
                        No courses available.
                    </p>
                ) : (
                    <div className="catalog-list">
                        {filteredCourses.map((course) => {
                            const isRegistered = registeredCourses.some(
                                (registeredCourse) =>
                                    registeredCourse.course_id === course.course_id
                            );
                            return (
                                <div
                                    className="catalog-course-row"
                                    key={course.course_id}
                                >
                                    <div className="catalog-course-icon">
                                        <BookOpen size={22} />
                                    </div>

                                    <div className="catalog-course-info">
                                        <strong>{course.course_name}</strong>

                                        <span>
                                            {course.course_code} • {course.credits} Credits
                                        </span>
                                    </div>

                                    <button
                                        className={
                                            isRegistered
                                                ? "register-course-button registered"
                                                : "register-course-button"
                                        }
                                        onClick={() => handleRegister(course.course_id)}
                                        disabled={isRegistered}
                                    >
                                        {isRegistered ? "✓ Already Registered" : "Register"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CourseCatalog;
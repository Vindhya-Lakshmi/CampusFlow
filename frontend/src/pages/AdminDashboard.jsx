
import { useEffect, useState } from "react";
import {
    Users,
    GraduationCap,
    BookOpen,
    ClipboardList,
    BarChart3,
    LogOut,
    Bell,
} from "lucide-react";
import api from "../services/api";

function AdminDashboard() {
    const handleLogout = () => {
        localStorage.removeItem("campusflow_token");
        localStorage.removeItem("campusflow_user");

        window.location.href = "/login";
    };
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalFaculty: 0,
        totalCourses: 0,
        totalRegistrations: 0,
    });

    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [loadingRegistrations, setLoadingRegistrations] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [facultySearchTerm, setFacultySearchTerm] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [registrationSearchTerm, setRegistrationSearchTerm] = useState("");
    const [studentRegistrations, setStudentRegistrations] = useState([]);
    const [selectedStudentLoading, setSelectedStudentLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [showAddCourse, setShowAddCourse] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [showEditCourse, setShowEditCourse] = useState(false);
    const [showAddFaculty, setShowAddFaculty] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [showEditFaculty, setShowEditFaculty] = useState(false);

    const [notificationForm, setNotificationForm] = useState({
        student_id: "",
        title: "",
        message: "",
    });

    const [addingNotification, setAddingNotification] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    const [courseForm, setCourseForm] = useState({
        course_code: "",
        course_name: "",
        credits: "",
        faculty_id: "",
    });

    const [addingCourse, setAddingCourse] = useState(false);

    const fetchAdminData = async () => {
        setRefreshing(true);

        try {
            const statsResponse = await api.get("/admin/stats");
            setStats(statsResponse.data.data);

            const studentsResponse = await api.get("/admin/students");
            setStudents(studentsResponse.data.data);

            const coursesResponse = await api.get("/admin/courses");
            setCourses(coursesResponse.data.data);

            const facultyResponse = await api.get("/admin/faculty");
            setFaculty(facultyResponse.data.data);

            const registrationsResponse = await api.get("/registrations");
            setRegistrations(registrationsResponse.data.data || []);

            // Keep the loading message visible briefly
            await new Promise((resolve) => setTimeout(resolve, 800));

            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to fetch admin data:", error);
        } finally {
            setRefreshing(false);
        }
    };

    const fetchNotifications = async () => {
        setLoadingNotifications(true);

        try {
            const response = await api.get("/notifications/admin/all");

            setNotifications(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoadingNotifications(false);
        }
    };

    const handleAddNotification = async (e) => {
        e.preventDefault();

        if (
            !notificationForm.student_id ||
            !notificationForm.title ||
            !notificationForm.message
        ) {
            alert("Please fill in all notification fields.");
            return;
        }

        setAddingNotification(true);

        try {
            await api.post("/notifications", {
                student_id: Number(notificationForm.student_id),
                title: notificationForm.title,
                message: notificationForm.message,
            });

            alert("Notification sent successfully.");

            setNotificationForm({
                student_id: "",
                title: "",
                message: "",
            });

            // Refresh notification history
            fetchNotifications();
        } catch (error) {
            console.error("Failed to create notification:", error);

            alert(
                error.response?.data?.message ||
                "Failed to send notification."
            );
        } finally {
            setAddingNotification(false);
        }
    };
    const fetchStudentRegistrations = async (studentId) => {
        setSelectedStudentLoading(true);

        try {
            const response = await api.get(
                `/admin/students/${studentId}/registrations`
            );

            setStudentRegistrations(response.data.data);
        } catch (error) {
            console.error(
                "Failed to fetch student registrations:",
                error
            );

            setStudentRegistrations([]);
        } finally {
            setSelectedStudentLoading(false);
        }
    };


    useEffect(() => {
        fetchAdminData();
        fetchNotifications();
    }, []);

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        fetchStudentRegistrations(student.student_id);
    };

    const handleCloseStudent = () => {
        setSelectedStudent(null);
        setStudentRegistrations([]);
    };
    const handleAddCourse = async (e) => {
        e.preventDefault();

        if (
            !courseForm.course_code ||
            !courseForm.course_name ||
            !courseForm.credits ||
            !courseForm.faculty_id
        ) {
            alert("Please fill in all course fields.");
            return;
        }

        setAddingCourse(true);

        try {
            const response = await api.post("/admin/courses", {
                course_code: courseForm.course_code,
                course_name: courseForm.course_name,
                credits: Number(courseForm.credits),
                faculty_id: Number(courseForm.faculty_id),
            });

            alert(response.data.message);

            setCourseForm({
                course_code: "",
                course_name: "",
                credits: "",
                faculty_id: "",
            });

            setShowAddCourse(false);

            fetchAdminData();
        } catch (error) {
            console.error("Failed to add course:", error);

            alert(
                error.response?.data?.message ||
                "Failed to add course."
            );
        } finally {
            setAddingCourse(false);
        }
    };


    const handleEditCourse = (course) => {
        setEditingCourse({
            course_id: course.course_id,
            course_code: course.course_code,
            course_name: course.course_name,
            credits: course.credits,
            faculty_id: course.faculty_id || "",
        });

        setShowEditCourse(true);
    };

    const totalCredits = studentRegistrations.reduce(
        (total, course) => total + Number(course.credits),
        0
    );

    const filteredStudents = students.filter((student) => {
        const search = searchTerm.toLowerCase();

        return (
            student.student_name.toLowerCase().includes(search) ||
            student.email.toLowerCase().includes(search) ||
            student.department.toLowerCase().includes(search)
        );
    });

    const filteredFaculty = faculty.filter((member) => {
        const search = facultySearchTerm.toLowerCase();

        return (
            member.faculty_name.toLowerCase().includes(search) ||
            member.email.toLowerCase().includes(search) ||
            member.department.toLowerCase().includes(search)
        );
    });
    const filteredRegistrations = registrations.filter((registration) => {
        const search = registrationSearchTerm.toLowerCase();

        return (
            registration.student_name
                ?.toLowerCase()
                .includes(search) ||
            String(registration.student_id)
                .includes(search) ||
            registration.course_code
                ?.toLowerCase()
                .includes(search) ||
            registration.course_name
                ?.toLowerCase()
                .includes(search)
        );
    });

    return (
        <div className="inner-page">

            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="page-header">

                <div>
                    <h1>Admin Dashboard</h1>

                    <p>
                        Manage CampusFlow academic activities.

                        {lastUpdated && (
                            <span className="admin-last-updated">
                                {" "}
                                Last updated:{" "}
                                {lastUpdated.toLocaleTimeString()}
                            </span>
                        )}
                    </p>
                </div>

                <div className="admin-header-actions">

                    <button
                        className="admin-refresh-btn"
                        onClick={fetchAdminData}
                        disabled={refreshing}
                    >
                        {refreshing
                            ? "Refreshing..."
                            : "Refresh Data"}
                    </button>

                    <button
                        className="admin-logout-btn"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} />
                        Logout
                    </button>

                    <div className="page-header-icon">
                        <GraduationCap size={28} />
                    </div>

                </div>

            </div>

            {/* =========================
                STATISTICS
            ========================= */}

            <div className="admin-stats-grid">

                <div className="admin-stat-card">

                    <div className="admin-stat-icon">
                        <Users size={24} />
                    </div>

                    <div>
                        <span>Total Students</span>

                        <strong>
                            {stats.totalStudents}
                        </strong>
                    </div>

                </div>

                <div className="admin-stat-card">

                    <div className="admin-stat-icon">
                        <GraduationCap size={24} />
                    </div>

                    <div>
                        <span>Total Faculty</span>

                        <strong>
                            {stats.totalFaculty}
                        </strong>
                    </div>

                </div>

                <div className="admin-stat-card">

                    <div className="admin-stat-icon">
                        <BookOpen size={24} />
                    </div>

                    <div>
                        <span>Total Courses</span>

                        <strong>
                            {stats.totalCourses}
                        </strong>
                    </div>

                </div>

                <div className="admin-stat-card">

                    <div className="admin-stat-icon">
                        <ClipboardList size={24} />
                    </div>

                    <div>
                        <span>Total Registrations</span>

                        <strong>
                            {stats.totalRegistrations}
                        </strong>
                    </div>

                </div>

                <div className="admin-stat-card">

                    <div className="admin-stat-icon">
                        <BarChart3 size={24} />
                    </div>

                    <div>
                        <span>Active Courses</span>

                        <strong>
                            {courses.length}
                        </strong>
                    </div>

                </div>

            </div>

            {/* =========================
                SELECTED STUDENT DETAILS
            ========================= */}

            {selectedStudent && (

                <div className="admin-student-details">

                    <div className="admin-details-header">

                        <h2>Student Details</h2>

                        <button
                            onClick={handleCloseStudent}
                        >
                            Close
                        </button>

                    </div>

                    <p>
                        <strong>Name:</strong>{" "}
                        {selectedStudent.student_name}
                    </p>

                    <p>
                        <strong>Student ID:</strong>{" "}
                        {selectedStudent.student_id}
                    </p>

                    <p>
                        <strong>Email:</strong>{" "}
                        {selectedStudent.email}
                    </p>

                    <p>
                        <strong>Department:</strong>{" "}
                        {selectedStudent.department}
                    </p>

                    <p>
                        <strong>Year:</strong>{" "}
                        {selectedStudent.year_of_study}
                    </p>

                    {/* =========================
                        REGISTERED COURSES
                    ========================= */}

                    <div className="admin-registered-courses">

                        <h3>Registered Courses</h3>

                        {selectedStudentLoading && (
                            <p className="admin-loading-text">
                                Loading registered courses...
                            </p>
                        )}

                        {!selectedStudentLoading &&
                            studentRegistrations.length === 0 && (
                                <p>
                                    No courses registered.
                                </p>
                            )}

                        {!selectedStudentLoading &&
                            studentRegistrations.length > 0 && (
                                <>

                                    <div className="admin-course-list">

                                        {studentRegistrations.map(
                                            (course) => (

                                                <div
                                                    className="admin-course-item"
                                                    key={
                                                        course.registration_id
                                                    }
                                                >

                                                    <div>

                                                        <strong>
                                                            {
                                                                course.course_code
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                course.course_name
                                                            }
                                                        </span>

                                                    </div>

                                                    <span>
                                                        {
                                                            course.credits
                                                        }{" "}
                                                        Credits
                                                    </span>

                                                </div>

                                            )
                                        )}

                                    </div>

                                    <div className="admin-course-summary">

                                        <span>
                                            Registered Courses:{" "}
                                            <strong>
                                                {
                                                    studentRegistrations.length
                                                }
                                            </strong>
                                        </span>

                                        <span>
                                            Total Credits:{" "}
                                            <strong>
                                                {totalCredits}
                                            </strong>
                                        </span>

                                    </div>

                                    <div className="admin-registration-status">
                                        Registration active
                                    </div>

                                </>
                            )}

                    </div>

                </div>

            )}

            {/* =========================
                STUDENTS SECTION
            ========================= */}

            <div className="admin-students-section">

                <div className="admin-section-header">

                    <div>

                        <h2>Students</h2>

                        <p>
                            View all registered students.
                        </p>

                    </div>

                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(e.target.value)
                        }
                    />

                </div>

                {/* =========================
                    STUDENT TABLE
                ========================= */}

                <div className="admin-students-table">

                    <div className="admin-student-header">

                        <span>Student</span>
                        <span>Department</span>
                        <span>Year</span>

                    </div>

                    {filteredStudents.length === 0 ? (

                        <div className="admin-no-students">
                            No students found.
                        </div>

                    ) : (

                        filteredStudents.map((student) => (

                            <div
                                className="admin-student-row"
                                key={student.student_id}
                                onClick={() =>
                                    handleStudentClick(student)
                                }
                            >

                                <div>

                                    <strong>
                                        {student.student_name}
                                    </strong>

                                    <span>
                                        {student.email}
                                    </span>

                                </div>

                                <span>
                                    {student.department}
                                </span>

                                <div className="admin-student-action">

                                    <span>
                                        Year{" "}
                                        {student.year_of_study}
                                    </span>

                                    <small>
                                        View details →
                                    </small>

                                </div>

                            </div>

                        ))

                    )}

                </div>

            </div>

            {/* =========================
                COURSES SECTION
            ========================= */}

            <div className="admin-courses-section">

                <div className="admin-section-header">
                    <div>
                        <h2>Courses</h2>
                        <p>Available courses</p>
                    </div>

                    <button
                        className="admin-add-course-btn"
                        onClick={() => setShowAddCourse(true)}
                    >
                        + Add Course
                    </button>
                </div>
                {showAddCourse && (
                    <form
                        className="admin-add-course-form"
                        onSubmit={handleAddCourse}
                    >
                        <div className="admin-add-course-field">
                            <label>Course Code</label>
                            <input
                                type="text"
                                placeholder="e.g. CS402"
                                value={courseForm.course_code}
                                onChange={(e) =>
                                    setCourseForm({
                                        ...courseForm,
                                        course_code: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="admin-add-course-field">
                            <label>Course Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Data Structures"
                                value={courseForm.course_name}
                                onChange={(e) =>
                                    setCourseForm({
                                        ...courseForm,
                                        course_name: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="admin-add-course-field">
                            <label>Credits</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                placeholder="e.g. 4"
                                value={courseForm.credits}
                                onChange={(e) =>
                                    setCourseForm({
                                        ...courseForm,
                                        credits: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="admin-add-course-field">
                            <label>Faculty</label>
                            <select
                                value={courseForm.faculty_id}
                                onChange={(e) =>
                                    setCourseForm({
                                        ...courseForm,
                                        faculty_id: e.target.value,
                                    })
                                }
                            >
                                <option value="">Select Faculty</option>

                                {faculty.map((member) => (
                                    <option
                                        key={member.faculty_id}
                                        value={member.faculty_id}
                                    >
                                        {member.faculty_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="admin-add-course-actions">
                            <button
                                type="button"
                                className="admin-cancel-course-btn"
                                onClick={() => setShowAddCourse(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="admin-save-course-btn"
                                disabled={addingCourse}
                            >
                                {addingCourse ? "Adding..." : "Add Course"}
                            </button>
                        </div>
                    </form>
                )}

                {showEditCourse && editingCourse && (
                    <form
                        className="admin-add-course-form"
                        onSubmit={async (e) => {
                            e.preventDefault();

                            try {
                                const response = await api.put(
                                    `/admin/courses/${editingCourse.course_id}`,
                                    {
                                        course_code: editingCourse.course_code,
                                        course_name: editingCourse.course_name,
                                        credits: Number(editingCourse.credits),
                                        faculty_id: Number(editingCourse.faculty_id),
                                    }
                                );

                                alert(response.data.message);

                                setShowEditCourse(false);
                                setEditingCourse(null);

                                fetchAdminData();
                            } catch (error) {
                                console.error("Failed to update course:", error);

                                alert(
                                    error.response?.data?.message ||
                                    "Failed to update course."
                                );
                            }
                        }}
                    >
                        <div className="admin-add-course-field">
                            <label>Course Code</label>

                            <input
                                type="text"
                                value={editingCourse.course_code}
                                onChange={(e) =>
                                    setEditingCourse({
                                        ...editingCourse,
                                        course_code: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="admin-add-course-field">
                            <label>Course Name</label>

                            <input
                                type="text"
                                value={editingCourse.course_name}
                                onChange={(e) =>
                                    setEditingCourse({
                                        ...editingCourse,
                                        course_name: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="admin-add-course-field">
                            <label>Credits</label>

                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={editingCourse.credits}
                                onChange={(e) =>
                                    setEditingCourse({
                                        ...editingCourse,
                                        credits: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="admin-add-course-field">
                            <label>Faculty</label>

                            <select
                                value={editingCourse.faculty_id}
                                onChange={(e) =>
                                    setEditingCourse({
                                        ...editingCourse,
                                        faculty_id: e.target.value,
                                    })
                                }
                            >
                                <option value="">Select Faculty</option>

                                {faculty.map((member) => (
                                    <option
                                        key={member.faculty_id}
                                        value={member.faculty_id}
                                    >
                                        {member.faculty_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="admin-add-course-actions">
                            <button
                                type="button"
                                className="admin-cancel-course-btn"
                                onClick={() => {
                                    setShowEditCourse(false);
                                    setEditingCourse(null);
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="admin-save-course-btn"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}

                <div className="admin-courses-grid">

                    {courses.map((course) => (

                        <div
                            className="admin-course-card"
                            key={course.course_id}
                        >

                            <div>
                                <span className="admin-course-code">
                                    {course.course_code}
                                </span>

                                <h3>
                                    {course.course_name}
                                </h3>

                                <span className="admin-course-faculty">
                                    Faculty: {course.faculty_name || "Not assigned"}
                                </span>
                            </div>

                            <div className="admin-course-actions">
                                <span className="admin-course-credits">
                                    {course.credits} Credits
                                </span>

                                <button
                                    className="admin-edit-course-btn"
                                    onClick={() => handleEditCourse(course)}
                                >
                                    Edit
                                </button>

                                <button
                                    className="admin-delete-course-btn"
                                    onClick={async () => {
                                        const confirmed = window.confirm(
                                            `Are you sure you want to delete ${course.course_code}?`
                                        );

                                        if (!confirmed) {
                                            return;
                                        }

                                        try {
                                            const response = await api.delete(
                                                `/admin/courses/${course.course_id}`
                                            );

                                            alert(response.data.message);

                                            fetchAdminData();
                                        } catch (error) {
                                            console.error("Failed to delete course:", error);

                                            alert(
                                                error.response?.data?.message ||
                                                "Failed to delete course."
                                            );
                                        }
                                    }}
                                >
                                    Delete
                                </button>
                            </div>

                        </div>

                    ))}

                </div>

            </div>

            {/* =========================
                FACULTY SECTION
            ========================= */}

            <div className="admin-faculty-section">

                <div className="admin-section-header">

                    <div>

                        <h2>Faculty</h2>

                        <p>
                            View all faculty members in CampusFlow.
                        </p>

                    </div>
                    <div className="admin-faculty-header-actions">

                        <button
                            className="admin-add-course-btn"
                            onClick={() => setShowAddFaculty(!showAddFaculty)}
                        >
                            + Add Faculty
                        </button>

                        <input
                            type="text"
                            placeholder="Search faculty..."
                            value={facultySearchTerm}
                            onChange={(e) =>
                                setFacultySearchTerm(e.target.value)
                            }
                        />

                    </div>

                </div>
                {showAddFaculty && (
                    <form
                        className="admin-add-course-form"
                        onSubmit={async (e) => {
                            e.preventDefault();

                            const formData = new FormData(e.target);

                            try {
                                const response = await api.post("/admin/faculty", {
                                    faculty_name: formData.get("faculty_name"),
                                    email: formData.get("email"),
                                    department: formData.get("department"),
                                    designation: formData.get("designation"),
                                });

                                alert(response.data.message);

                                setShowAddFaculty(false);

                                e.target.reset();

                                fetchAdminData();
                            } catch (error) {
                                console.error("Failed to add faculty:", error);

                                alert(
                                    error.response?.data?.message ||
                                    "Failed to add faculty."
                                );
                            }
                        }}
                    >
                        <div className="admin-add-course-field">
                            <label>Faculty Name</label>
                            <input
                                type="text"
                                name="faculty_name"
                                placeholder="Enter faculty name"
                                required
                            />
                        </div>

                        <div className="admin-add-course-field">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter faculty email"
                                required
                            />
                        </div>

                        <div className="admin-add-course-field">
                            <label>Department</label>
                            <input
                                type="text"
                                name="department"
                                placeholder="Enter department"
                                required
                            />
                        </div>

                        <div className="admin-add-course-field">
                            <label>Designation</label>
                            <input
                                type="text"
                                name="designation"
                                placeholder="Enter designation"
                            />
                        </div>

                        <div className="admin-add-course-actions">
                            <button
                                type="button"
                                className="admin-cancel-course-btn"
                                onClick={() => setShowAddFaculty(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="admin-save-course-btn"
                            >
                                Add Faculty
                            </button>
                        </div>
                    </form>
                )}

                {showEditFaculty && editingFaculty && (
                    <form
                        className="admin-add-course-form"
                        onSubmit={async (e) => {
                            e.preventDefault();

                            try {
                                const response = await api.put(
                                    `/admin/faculty/${editingFaculty.faculty_id}`,
                                    {
                                        faculty_name: editingFaculty.faculty_name,
                                        email: editingFaculty.email,
                                        department: editingFaculty.department,
                                        designation: editingFaculty.designation,
                                    }
                                );

                                alert(response.data.message);

                                setShowEditFaculty(false);
                                setEditingFaculty(null);

                                fetchAdminData();
                            } catch (error) {
                                console.error(
                                    "Failed to update faculty:",
                                    error
                                );

                                alert(
                                    error.response?.data?.message ||
                                    "Failed to update faculty."
                                );
                            }
                        }}
                    >
                        <div className="admin-add-course-field">
                            <label>Faculty Name</label>

                            <input
                                type="text"
                                value={editingFaculty.faculty_name}
                                onChange={(e) =>
                                    setEditingFaculty({
                                        ...editingFaculty,
                                        faculty_name: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="admin-add-course-field">
                            <label>Email</label>

                            <input
                                type="email"
                                value={editingFaculty.email}
                                onChange={(e) =>
                                    setEditingFaculty({
                                        ...editingFaculty,
                                        email: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="admin-add-course-field">
                            <label>Department</label>

                            <input
                                type="text"
                                value={editingFaculty.department}
                                onChange={(e) =>
                                    setEditingFaculty({
                                        ...editingFaculty,
                                        department: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="admin-add-course-field">
                            <label>Designation</label>

                            <input
                                type="text"
                                value={editingFaculty.designation}
                                onChange={(e) =>
                                    setEditingFaculty({
                                        ...editingFaculty,
                                        designation: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="admin-add-course-actions">
                            <button
                                type="button"
                                className="admin-cancel-course-btn"
                                onClick={() => {
                                    setShowEditFaculty(false);
                                    setEditingFaculty(null);
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="admin-save-course-btn"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}

                <div className="admin-faculty-grid">

                    {filteredFaculty.length === 0 ? (

                        <div className="admin-no-faculty">
                            No faculty found.
                        </div>

                    ) : (

                        filteredFaculty.map((member) => (

                            <div
                                className="admin-faculty-card"
                                key={member.faculty_id}
                            >

                                <div className="admin-faculty-avatar">
                                    <GraduationCap size={22} />
                                </div>

                                <div className="admin-faculty-info">

                                    <h3>
                                        {member.faculty_name}
                                    </h3>

                                    <span>
                                        {member.department}
                                    </span>

                                    <small>
                                        {member.designation || "Faculty"}
                                    </small>

                                    <small>
                                        {member.email}
                                    </small>

                                </div>
                                <div className="admin-faculty-actions">

                                    <button
                                        className="admin-edit-course-btn"
                                        onClick={() => {
                                            setEditingFaculty({
                                                faculty_id: member.faculty_id,
                                                faculty_name: member.faculty_name,
                                                email: member.email,
                                                department: member.department,
                                                designation: member.designation || "",
                                            });

                                            setShowEditFaculty(true);
                                        }}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="admin-delete-course-btn"
                                        onClick={async () => {
                                            const confirmed = window.confirm(
                                                `Are you sure you want to delete ${member.faculty_name}?`
                                            );

                                            if (!confirmed) {
                                                return;
                                            }

                                            try {
                                                const response = await api.delete(
                                                    `/admin/faculty/${member.faculty_id}`
                                                );

                                                alert(response.data.message);

                                                fetchAdminData();
                                            } catch (error) {
                                                console.error(
                                                    "Failed to delete faculty:",
                                                    error
                                                );

                                                alert(
                                                    error.response?.data?.message ||
                                                    "Failed to delete faculty."
                                                );
                                            }
                                        }}
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        ))

                    )}

                </div>

            </div>

            {/* =========================
    REGISTRATION MANAGEMENT
========================= */}

            <div className="admin-notifications-section">

                <div className="admin-section-header">

                    <div>
                        <h2>
                            <ClipboardList size={22} />
                            Registration Management
                        </h2>

                        <p>
                            View all student course registrations.
                        </p>
                    </div>

                </div>
                <input
                    type="text"
                    placeholder="Search by student, ID, or course..."
                    value={registrationSearchTerm}
                    onChange={(e) =>
                        setRegistrationSearchTerm(e.target.value)
                    }
                    className="admin-registration-search"
                />

                {registrations.length === 0 ? (

                    <p>No registrations found.</p>

                ) : (

                    <div className="admin-registration-table-wrapper">

                        <table className="admin-registration-table">

                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Student ID</th>
                                    <th>Course</th>
                                    <th>Credits</th>
                                    <th>Registration Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>

    {filteredRegistrations.length === 0 ? (

        <tr>
            <td
                colSpan="6"
                className="admin-no-registrations"
            >
                No registrations match your search.
            </td>
        </tr>

    ) : (

        filteredRegistrations.map((registration) => (

            <tr
                key={registration.registration_id}
            >

                <td>
                    <strong>
                        {registration.student_name}
                    </strong>
                </td>

                <td>
                    {registration.student_id}
                </td>

                <td>
                    <strong>
                        {registration.course_code}
                    </strong>

                    <span className="registration-course-name">
                        {registration.course_name}
                    </span>
                </td>

                <td>
                    {registration.credits}
                </td>

                <td>
                    {new Date(
                        registration.registration_date
                    ).toLocaleDateString()}
                </td>

                <td>
                    <span
                        className={`registration-status ${registration.status
                            ?.toLowerCase()
                            .replace(/\s+/g, "-")}`}
                    >
                        {registration.status}
                    </span>
                </td>

            </tr>

        ))

    )}

</tbody>

                        </table>

                    </div>

                )}

            </div>

            {/* =========================
                ADMIN ANALYTICS
            ========================= */}
            <div className="admin-notifications-section">
                <div className="admin-section-header">
                    <div>
                        <h2>
                            <Bell size={22} />
                            Send Notification
                        </h2>
                        <p>Send an announcement directly to a student.</p>
                    </div>
                </div>

                <form
                    className="admin-add-course-form"
                    onSubmit={handleAddNotification}
                >
                    <div className="admin-add-course-field">
                        <label>Student</label>

                        <select
                            value={notificationForm.student_id}
                            onChange={(e) =>
                                setNotificationForm({
                                    ...notificationForm,
                                    student_id: e.target.value,
                                })
                            }
                        >
                            <option value="">Select Student</option>

                            {students.map((student) => (
                                <option
                                    key={student.student_id}
                                    value={student.student_id}
                                >
                                    {student.student_name} - ID {student.student_id}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-add-course-field">
                        <label>Title</label>

                        <input
                            type="text"
                            placeholder="Enter notification title"
                            value={notificationForm.title}
                            onChange={(e) =>
                                setNotificationForm({
                                    ...notificationForm,
                                    title: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="admin-add-course-field">
                        <label>Message</label>

                        <textarea
                            placeholder="Enter notification message"
                            value={notificationForm.message}
                            onChange={(e) =>
                                setNotificationForm({
                                    ...notificationForm,
                                    message: e.target.value,
                                })
                            }
                            rows="4"
                        />
                    </div>

                    <div className="admin-add-course-actions">
                        <button
                            type="submit"
                            className="admin-save-course-btn"
                            disabled={addingNotification}
                        >
                            {addingNotification
                                ? "Sending..."
                                : "Send Notification"}
                        </button>
                    </div>
                </form>
            </div>
            <div className="admin-notifications-section">
                <div className="admin-section-header">
                    <div>
                        <h2>
                            <Bell size={22} />
                            Notification History
                        </h2>
                        <p>View notifications sent to students.</p>
                    </div>
                </div>

                {loadingNotifications ? (
                    <p>Loading notifications...</p>
                ) : notifications.length === 0 ? (
                    <p>No notifications found.</p>
                ) : (
                    <div className="admin-notification-history">
                        {notifications.map((notification) => (
                            <div
                                key={notification.notification_id}
                                className="admin-notification-card"
                            >
                                <div>
                                    <h3>{notification.title}</h3>

                                    <p>{notification.message}</p>

                                    <small>
                                        To: {notification.student_name}{" "}
                                        (ID {notification.student_id})
                                    </small>
                                </div>

                                <div>
                                    <span>
                                        {notification.is_read
                                            ? "Read"
                                            : "Unread"}
                                    </span>

                                    <small>
                                        {new Date(
                                            notification.created_at
                                        ).toLocaleString()}
                                    </small>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="admin-analytics-section">

                <div className="admin-section-header">

                    <div>

                        <h2>Registration Overview</h2>

                        <p>
                            Overview of course registrations in CampusFlow.
                        </p>

                    </div>

                    <div className="admin-analytics-icon">
                        <BarChart3 size={22} />
                    </div>

                </div>

                <div className="admin-analytics-grid">

                    <div className="admin-analytics-card">

                        <span>Avg. Registrations</span>

                        <strong>
                            {stats.totalStudents > 0
                                ? (
                                    stats.totalRegistrations /
                                    stats.totalStudents
                                ).toFixed(2)
                                : "0.00"}
                        </strong>

                        <small>
                            Per student
                        </small>

                    </div>

                    <div className="admin-analytics-card">

                        <span>Total Registrations</span>

                        <strong>
                            {stats.totalRegistrations}
                        </strong>

                        <small>
                            Across all students
                        </small>

                    </div>

                    <div className="admin-analytics-card">

                        <span>Students</span>

                        <strong>
                            {stats.totalStudents}
                        </strong>

                        <small>
                            Registered students
                        </small>

                    </div>

                    <div className="admin-analytics-card">

                        <span>Courses</span>

                        <strong>
                            {stats.totalCourses}
                        </strong>

                        <small>
                            Available courses
                        </small>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default AdminDashboard;


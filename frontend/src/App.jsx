import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyCourses from "./pages/MyCourses";
import CourseCatalog from "./pages/CourseCatalog";
import Timetable from "./pages/Timetable";
import Grades from "./pages/Grades";
import AIAdvisor from "./pages/AIAdvisor";
import RegistrationHistory from "./pages/RegistrationHistory";
import Notifications from "./pages/Notifications";
import Attendance from "./pages/Attendance";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import api from "./services/api";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Sparkles,
  Bell,
  User,
  LogOut,
  ShieldCheck,
} from "lucide-react";

function AdminRoute() {
  const user = JSON.parse(
    localStorage.getItem("campusflow_user") || "{}"
  );

  if (user.role !== "admin") {
    window.location.href = "/dashboard";
    return null;
  }

  return <AdminDashboard />;
}

function Home() {
  return (
    <div className="home-page">

      {/* Navbar */}
      <header className="home-navbar">
        <div className="home-logo">
          <div className="home-logo-icon">
            <GraduationCap size={22} />
          </div>
          <span>CampusFlow</span>
        </div>

        <div className="home-nav-links">
          <Link to="/login" className="home-login-link">
            Login
          </Link>

          <Link to="/signup" className="home-signup-button">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="home-hero">

        <div className="hero-content">

          <div className="hero-badge">
            <Sparkles size={16} />
            Smart College Management Platform
          </div>

          <h1>
            Manage your college journey
            <span> smarter with CampusFlow.</span>
          </h1>

          <p>
            A modern college course registration and management system
            designed to simplify course registration, academic tracking,
            attendance, grades, timetable and campus updates.
          </p>

          <div className="hero-buttons">

            <Link to="/signup" className="hero-primary-button">
              Create Account
              <span>→</span>
            </Link>

            <Link to="/login" className="hero-secondary-button">
              Login to CampusFlow
            </Link>

          </div>

          <div className="hero-features">

            <div className="hero-feature">
              <BookOpen size={19} />
              <span>Course Registration</span>
            </div>

            <div className="hero-feature">
              <CalendarDays size={19} />
              <span>Smart Timetable</span>
            </div>

            <div className="hero-feature">
              <GraduationCap size={19} />
              <span>Academic Tracking</span>
            </div>

          </div>

        </div>

        {/* Right side visual */}
        <div className="hero-visual">

          <div className="hero-card main-preview">

            <div className="preview-header">
              <div>
                <span className="preview-small">STUDENT PORTAL</span>
                <h3>Academic Overview</h3>
              </div>

              <div className="preview-avatar">
                V
              </div>
            </div>

            <div className="preview-stats">

              <div className="preview-stat">
                <div className="preview-stat-icon">
                  <BookOpen size={18} />
                </div>
                <div>
                  <strong>5</strong>
                  <span>Courses</span>
                </div>
              </div>

              <div className="preview-stat">
                <div className="preview-stat-icon">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <strong>8.6</strong>
                  <span>GPA</span>
                </div>
              </div>

              <div className="preview-stat">
                <div className="preview-stat-icon">
                  <CalendarDays size={18} />
                </div>
                <div>
                  <strong>90%</strong>
                  <span>Attendance</span>
                </div>
              </div>

            </div>

            <div className="preview-course">

              <div className="preview-course-title">
                <div className="preview-course-code">
                  CS201
                </div>

                <div>
                  <strong>Database Management Systems</strong>
                  <span>4 Credits</span>
                </div>
              </div>

              <span className="preview-status">
                Registered
              </span>

            </div>

            <div className="preview-course">

              <div className="preview-course-title">
                <div className="preview-course-code">
                  CS301
                </div>

                <div>
                  <strong>Web Technologies</strong>
                  <span>4 Credits</span>
                </div>
              </div>

              <span className="preview-status">
                Registered
              </span>

            </div>

          </div>

          <div className="floating-card floating-card-one">
            <Bell size={18} />
            <div>
              <strong>Campus Updates</strong>
              <span>Stay informed</span>
            </div>
          </div>

          <div className="floating-card floating-card-two">
            <Sparkles size={18} />
            <div>
              <strong>AI Advisor</strong>
              <span>Plan smarter</span>
            </div>
          </div>

        </div>

      </main>

      {/* Bottom section */}
      <section className="home-bottom">

        <p>
          One platform for your complete academic journey
        </p>

        <div className="home-bottom-items">
          <span>Course Registration</span>
          <span>Attendance</span>
          <span>Grades</span>
          <span>Timetable</span>
          <span>Notifications</span>
        </div>

      </section>

    </div>
  );
}

function Dashboard() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("campusflow_user") || "{}")
  );
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [aiMessage, setAiMessage] = useState("");
  const [gpa, setGpa] = useState("0.00");
  const [totalCredits, setTotalCredits] = useState(0);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [attendance, setAttendance] = useState(0);

  useEffect(() => {
    const fetchStudentCourses = async () => {
      try {
        const userResponse = await api.get("/auth/me");

        const currentUser = userResponse.data.user;

        setUser(currentUser);

        if (!currentUser.student_id) {
          console.error("Student ID not found");
          return;
        }
        const [
          coursesResponse,
          gradesResponse,
          timetableResponse,
          notificationsResponse,
          attendanceResponse,
        ] = await Promise.all([
          api.get(`/registrations/student/${currentUser.student_id}`),
          api.get(`/grades/student/${currentUser.student_id}`),
          api.get(`/timetable/student/${currentUser.student_id}`),
          api.get(`/notifications/student/${currentUser.student_id}`),
          api.get(`/attendance/student/${currentUser.student_id}`),
        ]);

        setCourses(coursesResponse.data.data);
        const timetable = timetableResponse.data.data;
        setNotifications(notificationsResponse.data.data);
        const attendanceData = attendanceResponse.data.data;

        if (attendanceData.length > 0) {
          const totalClasses = attendanceData.reduce(
            (total, item) => total + item.total_classes,
            0
          );

          const attendedClasses = attendanceData.reduce(
            (total, item) => total + item.attended_classes,
            0
          );

          const attendancePercentage =
            totalClasses > 0
              ? Math.round((attendedClasses / totalClasses) * 100)
              : 0;

          setAttendance(attendancePercentage);
        }

        const today = new Date().toLocaleDateString("en-US", {
          weekday: "long",
        });

        const todayClasses = timetable.filter(
          (item) => item.day_of_week === today
        );

        setTodaySchedule(todayClasses);

        const courses = coursesResponse.data.data;

        const credits = courses.reduce(
          (total, course) => total + course.credits,
          0
        );

        setTotalCredits(credits);

        const grades = gradesResponse.data.data;

        const gradedCredits = grades.reduce(
          (total, course) => total + course.credits,
          0
        );

        const totalPoints = grades.reduce(
          (total, course) =>
            total + course.credits * Number(course.grade_point),
          0
        );

        const calculatedGpa =
          gradedCredits > 0
            ? (totalPoints / gradedCredits).toFixed(2)
            : "0.00";

        setGpa(calculatedGpa);
      } catch (error) {
        console.error("Failed to fetch student courses:", error);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchStudentCourses();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("campusflow_token");
    localStorage.removeItem("campusflow_user");
    window.location.href = "/login";
  };
  const unreadNotifications = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">
          <div className="dashboard-logo-icon">
            <GraduationCap size={23} />
          </div>
          <span>CampusFlow</span>
        </div>

        <nav className="dashboard-nav">
          <p className="nav-title">MAIN</p>

          <a href="/dashboard" className="nav-item active">
            <LayoutDashboard size={19} />
            Dashboard
          </a>

          <a href="/my-courses" className="nav-item">
            <BookOpen size={19} />
            My Courses
          </a>
          <a href="/courses" className="nav-item">
            <BookOpen size={19} />
            Course Catalog
          </a>
          <a href="/timetable" className="nav-item">
            <CalendarDays size={19} />
            Timetable
          </a>

          <a href="/registrations" className="nav-item">
            <ClipboardList size={19} />
            Registrations
          </a>

          <p className="nav-title">ACADEMICS</p>

          <a href="/grades" className="nav-item">
            <GraduationCap size={19} />
            Grades & GPA
          </a>
          <a href="/attendance" className="nav-item">
            <CalendarDays size={19} />
            Attendance
          </a>

          <a href="/ai-advisor" className="nav-item">
            <Sparkles size={19} />
            AI Advisor
          </a>
          <p className="nav-title">ACCOUNT</p>

          <a href="/profile" className="nav-item">
            <User size={19} />
            Profile
          </a>
          <a href="/admin" className="nav-item">
            <ShieldCheck size={19} />
            Admin Panel
          </a>
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item logout-button" onClick={handleLogout}>
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="header-small">STUDENT PORTAL</p>
            <h1>Good morning, {user.full_name || "Student"} 👋</h1>
            <p className="header-subtitle">
              Here's what's happening with your academic journey.
            </p>
          </div>

          <div className="header-actions">
            <a href="/notifications" className="notification-button">
              <Bell size={19} strokeWidth={2.2} />

              {unreadNotifications > 0 && (
                <span className="notification-badge">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </a>

            <div className="profile-button">
              <div className="profile-avatar">
                <User size={19} />
              </div>

              <div>
                <strong>{user.full_name || "Student"}</strong>
                <small>{user.email || "student@example.com"}</small>
              </div>
            </div>
          </div>
        </header>

        {/* Stats */}
        <section className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon blue">
              <BookOpen size={21} />
            </div>
            <div>
              <span>Enrolled Courses</span>
              <strong>{courses.length}</strong>
              <small>This semester</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <GraduationCap size={21} />
            </div>
            <div>
              <span>Current GPA</span>
              <strong>{gpa}</strong>
              <small>Out of 10.0</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <ClipboardList size={21} />
            </div>
            <div>
              <span>Credits Earned</span>
              <strong>{totalCredits}</strong>
              <small>120 required</small>
            </div>
          </div>

          <div className="stat-card attendance-stat-card">
            <div className="stat-icon orange">
              <CalendarDays size={21} />
            </div>

            <div className="attendance-content">
              <span>Attendance</span>

              <div className="attendance-value-row">
                <strong>{attendance}%</strong>
                <small>Overall</small>
              </div>

              <div className="attendance-progress">
                <div
                  className="attendance-progress-fill"
                  style={{ width: `${attendance}%` }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        {/* Main grid */}
        <section className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-heading">
              <div>
                <h2>Today's Schedule</h2>
                <p>Your classes for today</p>
              </div>

              <a href="/timetable" className="schedule-view-link">
                View timetable
              </a>
            </div>

            {todaySchedule.length === 0 ? (
              <div className="schedule-empty">
                <div className="schedule-empty-icon">
                  <CalendarDays size={22} />
                </div>

                <strong>No classes today</strong>

                <p>
                  Enjoy your free time or review your upcoming schedule.
                </p>

                <a href="/timetable" className="schedule-empty-link">
                  View full timetable
                </a>
              </div>
            ) : (
              todaySchedule.map((item) => (
                <div className="schedule-item" key={item.timetable_id}>
                  <div className="schedule-time">
                    <strong>{item.start_time.slice(0, 5)}</strong>
                    <span>{item.end_time.slice(0, 5)}</span>
                  </div>

                  <div className="schedule-line"></div>

                  <div className="schedule-info">
                    <strong>{item.course_name}</strong>

                    <span>
                      {item.course_code}
                    </span>

                    <small>
                      Room {item.room_number}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="dashboard-card ai-card">
            <div className="ai-icon">
              <Sparkles size={23} />
            </div>

            <span className="ai-label">AI ACADEMIC ADVISOR</span>

            <h2>Plan your next semester smarter.</h2>

            <p>
              Get personalized course recommendations based on your
              academic progress, interests and career goals.
            </p>

            <button
              className="ai-button"
              onClick={() =>
                setAiMessage(
                  "Based on your current courses, you can explore Web Technologies and Database Management Systems next."
                )
              }
            >
              Open AI Advisor
              <Sparkles size={17} />
            </button>
            {aiMessage && (
              <p className="ai-response">
                {aiMessage}
              </p>
            )}
          </div>
        </section>

        {/* Courses and announcements */}
        <section className="dashboard-grid bottom-grid">

          {/* Current Courses */}
          <div className="dashboard-card">
            <div className="card-heading">
              <div>
                <h2>Current Courses</h2>
                <p>Your enrolled courses this semester</p>
              </div>

              <a href="/my-courses" className="view-all">
                View all
              </a>
            </div>

            <div className="course-list">
              {coursesLoading ? (
                <div className="course-empty-state">
                  <div className="course-loading-dot"></div>
                  <p>Loading your courses...</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="course-empty-state">
                  <div className="course-empty-icon">
                    <BookOpen size={21} />
                  </div>

                  <strong>No courses yet</strong>

                  <p>You are not registered for any courses this semester.</p>

                  <a href="/courses" className="course-empty-link">
                    Browse courses
                  </a>
                </div>
              ) : (
                courses.map((course) => (
                  <div
                    className="course-row"
                    key={course.course_id}
                  >
                    <div className="course-code">
                      {course.course_code}
                    </div>

                    <div className="course-details">
                      <strong>{course.course_name}</strong>

                      <span>
                        {course.credits} Credits • Registered{" "}
                        {new Date(course.registration_date).toLocaleDateString()}
                      </span>
                    </div>

                    <span
                      className={`course-status ${course.status?.toLowerCase() === "registered"
                        ? "registered"
                        : ""
                        }`}
                    >
                      {course.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Announcements */}
          <div className="dashboard-card">
            <div className="card-heading">
              <div className="announcement-heading">
                <div className="announcement-heading-icon">
                  <Bell size={20} />
                </div>

                <div>
                  <h2>Announcements</h2>
                  <p>Latest campus updates</p>
                </div>
              </div>

              <a href="/notifications" className="view-all">
                View all
              </a>
            </div>

            {notifications.length === 0 ? (
              <div className="announcement">
                <p>No new announcements.</p>
              </div>
            ) : (
              notifications.slice(0, 3).map((notification) => (
                <div
                  className="announcement"
                  key={notification.notification_id}
                >
                  <div className="announcement-content">
                    <div className="announcement-title-row">
                      <span className="announcement-dot"></span>
                      <strong>{notification.title}</strong>
                    </div>

                    <p>{notification.message}</p>
                  </div>

                  <span className="announcement-date">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>

        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/courses" element={<CourseCatalog />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/grades" element={<Grades />} />
        <Route path="/ai-advisor" element={<AIAdvisor />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route
          path="/registrations"
          element={<RegistrationHistory />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
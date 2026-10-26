
import { useEffect, useState } from "react";
import { BookOpen, ArrowLeft, GraduationCap, Search } from "lucide-react";
import api from "../services/api";

function CourseCatalog() {
  const [offerings, setOfferings] = useState([]);
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [creditFilter, setCreditFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await api.get("/auth/me");
        const currentUser = userResponse.data.user;
        setUser(currentUser);

        const [offeringResponse, registrationResponse] =
          await Promise.all([
            api.get("/courses/offerings"),
            api.get(`/registrations/student/${currentUser.student_id}`),
          ]);

        setOfferings(offeringResponse.data.data || []);
        setRegisteredCourses(registrationResponse.data.data || []);
      } catch (error) {
        console.error("Failed to load course catalog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRegister = async (offeringId) => {
    if (!user?.student_id) {
      alert("Unable to identify your student account. Please log in again.");
      return;
    }

    try {
      await api.post("/registrations", {
        student_id: user.student_id,
        offering_id: offeringId,
      });

      alert("Registration request submitted successfully.");

      const [registrationResponse, offeringResponse] =
        await Promise.all([
          api.get(`/registrations/student/${user.student_id}`),
          api.get("/courses/offerings"),
        ]);

      setRegisteredCourses(registrationResponse.data.data || []);
      setOfferings(offeringResponse.data.data || []);
    } catch (error) {
      console.error("Registration failed:", error);
      alert(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    }
  };

  const filteredOfferings = offerings.filter((offering) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      offering.course_name?.toLowerCase().includes(search) ||
      offering.course_code?.toLowerCase().includes(search);

    const matchesCredits =
      creditFilter === "all" ||
      String(offering.credits) === creditFilter;

    return matchesSearch && matchesCredits;
  });

  if (loading) {
    return (
      <div className="course-catalog-page">
        <div className="catalog-message">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="course-catalog-page">
        
<button
  type="button"
  className="back-dashboard-button"
  onClick={() => (window.location.href = "/dashboard")}
>
  <ArrowLeft size={18} />
  Back to Dashboard
</button>

      <div className="course-catalog-header">
        
        <div className="catalog-heading-icon">
          <GraduationCap size={30} />
        </div>

        <h1>Course Catalog</h1>
        <p>Explore available courses and register for your classes.</p>
      </div>

      <div className="course-catalog-card">
        <div className="course-filters">
          <div className="search-input-wrapper">
            <Search size={18} />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by course name or code..."
            />
          </div>

          <select
            value={creditFilter}
            onChange={(event) => setCreditFilter(event.target.value)}
          >
            <option value="all">All credits</option>
            <option value="3">3 credits</option>
            <option value="4">4 credits</option>
            <option value="5">5 credits</option>
          </select>
        </div>

        <div className="catalog-list">
          {filteredOfferings.length === 0 ? (
            <div className="catalog-message">
              No course offerings found.
            </div>
          ) : (
            filteredOfferings.map((offering) => {
              const alreadyRegistered = registeredCourses.some(
                (registration) =>
                  Number(registration.course_id) ===
                  Number(offering.course_id)
              );

              const isFull =
                Number(offering.available_seats) <= 0;

              const seatPercentage =
                Number(offering.capacity) > 0
                  ? Math.min(
                      100,
                      (Number(offering.enrolled_count) /
                        Number(offering.capacity)) *
                        100
                    )
                  : 0;

              return (
                <div
                  className="catalog-course-row"
                  key={offering.offering_id}
                >
                  <div className="catalog-course-icon">
                    <BookOpen size={23} />
                  </div>

                  <div className="catalog-course-info">
                    <strong>{offering.course_name}</strong>

                    <span>
                      {offering.course_code} · {offering.credits} credits
                    </span>

                    <span>
                      Faculty: {offering.faculty_name}
                    </span>

                    <span>
                      {offering.semester} · {offering.academic_year}
                    </span>

                    <span>
                      Capacity: {offering.capacity} · Enrolled:{" "}
                      {offering.enrolled_count}
                    </span>

                    <div className="catalog-seat-info">
                      <div className="catalog-seat-label">
                        <span>Available seats</span>
                        <strong>{offering.available_seats}</strong>
                      </div>

                      <div className="catalog-seat-track">
                        <div
                          className={`catalog-seat-progress ${
                            isFull ? "full" : ""
                          }`}
                          style={{ width: `${seatPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    className={`register-course-button ${
                      alreadyRegistered ? "registered" : ""
                    }`}
                    onClick={() =>
                      handleRegister(offering.offering_id)
                    }
                    disabled={alreadyRegistered || isFull}
                  >
                    {alreadyRegistered
                      ? "Registered"
                      : isFull
                        ? "Course Full"
                        : "Register"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseCatalog;

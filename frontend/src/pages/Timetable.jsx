import { useEffect, useState } from "react";
import api from "../services/api";
import {
  CalendarDays,
  ArrowLeft,
  Clock3,
  MapPin,
} from "lucide-react";

function Timetable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        // Get the currently logged-in student
        const userResponse = await api.get("/auth/me");

        const user = userResponse.data.user;

        if (!user.student_id) {
          console.error("Student ID not found");
          return;
        }

        // Fetch timetable using the student's ID
        const response = await api.get(
          `/timetable/student/${user.student_id}`
        );

        setTimetable(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch timetable:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const getDayClasses = (day) => {
    return timetable.filter(
      (item) => item.day_of_week === day
    );
  };

  return (
    <div className="timetable-page">
      <div className="timetable-header">
        <div>
          <a href="/dashboard" className="back-link">
            <ArrowLeft size={18} />
            Back to Dashboard
          </a>

          <p className="header-small">ACADEMIC PORTAL</p>

          <h1>Timetable</h1>

          <p>
            View your weekly class schedule and classroom details.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="timetable-card">
          <p className="empty-course-message">
            Loading timetable...
          </p>
        </div>
      ) : (
        <div className="timetable-grid">
          {days.map((day) => {
            const classes = getDayClasses(day);

            return (
              <div className="day-card" key={day}>
                <div className="day-card-header">
                  <CalendarDays size={19} />
                  <h2>{day}</h2>
                </div>

                {classes.length === 0 ? (
                  <p className="no-class">
                    No classes
                  </p>
                ) : (
                  <div className="day-class-list">
                    {classes.map((item) => (
                      <div
                        className="timetable-class"
                        key={item.timetable_id}
                      >
                        <div className="class-code">
                          {item.course_code}
                        </div>

                        <strong>
                          {item.course_name}
                        </strong>

                        <div className="class-detail">
                          <Clock3 size={14} />
                          {item.start_time.slice(0, 5)} -{" "}
                          {item.end_time.slice(0, 5)}
                        </div>

                        <div className="class-detail">
                          <MapPin size={14} />
                          {item.room_number}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Timetable;

import { useEffect, useState } from "react";
import api from "../services/api";
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  GraduationCap,
  Send,
} from "lucide-react";

function AIAdvisor() {
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    const fetchAcademicData = async () => {
      try {
        const userResponse = await api.get("/auth/me");
        const user = userResponse.data.user;

        if (!user.student_id) {
          console.error("Student ID not found");
          return;
        }

        const [coursesResponse, gradesResponse, attendanceResponse] =
  await Promise.all([
    api.get(
      `/registrations/student/${user.student_id}`
    ),
    api.get(
      `/grades/student/${user.student_id}`
    ),
    api.get(
      `/attendance/student/${user.student_id}`
    ),
  ]);

setCourses(coursesResponse.data.data || []);
setGrades(gradesResponse.data.data || []);
setAttendance(attendanceResponse.data.data || []);

console.log(
  "AI ATTENDANCE RESPONSE:",
  attendanceResponse.data
);

      } catch (error) {
        console.error(
          "Failed to fetch advisor data:",
          error
        );
      }
    };

    fetchAcademicData();
  }, []);

  const calculateGPA = () => {
    const totalCredits = grades.reduce(
      (total, course) =>
        total + Number(course.credits),
      0
    );

    const totalPoints = grades.reduce(
      (total, course) =>
        total +
        Number(course.credits) *
          Number(course.grade_point),
      0
    );

    return totalCredits > 0
      ? (totalPoints / totalCredits).toFixed(2)
      : "0.00";
  };

  const generateAnswer = () => {
    const q = question.toLowerCase().trim();
    const gpa = calculateGPA();

    if (!q) {
      setAnswer(
        "Ask me something about your courses, GPA, or academic progress."
      );
      return;
    }

    // Academic Summary
    if (
      q.includes("summary") ||
      q.includes("academic progress") ||
      q.includes("overall progress")
    ) {
      const totalCredits = courses.reduce(
        (total, course) =>
          total + Number(course.credits),
        0
      );

      const gradeDetails =
        grades.length > 0
          ? grades
              .map(
                (course) =>
                  `${course.course_code}: ${course.grade} (${Number(
                    course.grade_point
                  ).toFixed(2)} GP)`
              )
              .join(", ")
          : "No grades available yet";

      setAnswer(
        `Your academic summary: GPA ${gpa}, ${courses.length} registered course(s), ${totalCredits} total credit(s), and ${grades.length} graded course(s). Current grades: ${gradeDetails}.`
      );

      return;
    }

    // Course-specific questions
    const matchedCourse = courses.find(
      (course) =>
        q.includes(
          course.course_code.toLowerCase()
        ) ||
        q.includes(
          course.course_name.toLowerCase()
        )
    );

    if (matchedCourse) {
      const matchingGrade = grades.find(
        (grade) =>
          Number(grade.course_id) ===
          Number(matchedCourse.course_id)
      );

      if (
        q.includes("grade") ||
        q.includes("mark") ||
        q.includes("score")
      ) {
        if (matchingGrade) {
          setAnswer(
            `Your grade for ${matchedCourse.course_code} - ${matchedCourse.course_name} is ${matchingGrade.grade} with a grade point of ${Number(
              matchingGrade.grade_point
            ).toFixed(2)}.`
          );
        } else {
          setAnswer(
            `You do not have a grade available yet for ${matchedCourse.course_code} - ${matchedCourse.course_name}.`
          );
        }

        return;
      }

      if (
        q.includes("credit") ||
        q.includes("credits")
      ) {
        setAnswer(
          `${matchedCourse.course_code} - ${matchedCourse.course_name} carries ${matchedCourse.credits} credit(s).`
        );

        return;
      }

      setAnswer(
        `${matchedCourse.course_code} - ${matchedCourse.course_name} carries ${matchedCourse.credits} credit(s). ${
          matchingGrade
            ? `Your grade is ${matchingGrade.grade} with a grade point of ${Number(
                matchingGrade.grade_point
              ).toFixed(2)}.`
            : "You do not have a grade available for this course yet."
        }`
      );

      return;
    }

    // Advice / Improvement
    if (
      q.includes("advice") ||
      q.includes("improve") ||
      q.includes("focus") ||
      q.includes("study")
    ) {
      if (grades.length === 0) {
        setAnswer(
          "You do not have graded courses yet. Focus on regular attendance, completing assignments on time, and preparing consistently for assessments."
        );
      } else {
        const lowestGrade = [...grades].sort(
          (a, b) =>
            Number(a.grade_point) -
            Number(b.grade_point)
        )[0];

        setAnswer(
          `Your current GPA is ${gpa}. Keep building on your progress by reviewing your graded subjects regularly, attending classes consistently, and giving extra study time to ${lowestGrade.course_code} - ${lowestGrade.course_name}.`
        );
      }

      return;
    }
    // Attendance
if (
  q.includes("attendance") ||
  q.includes("attending") ||
  q.includes("present")
) {
  if (attendance.length === 0) {
    setAnswer(
      "You do not have any attendance records available yet."
    );
    return;
  }
  const averageAttendance =
  attendance.reduce((total, item) => {
    const percentage =
      item.total_classes > 0
        ? (item.attended_classes / item.total_classes) * 100
        : 0;

    return total + percentage;
  }, 0) / attendance.length;

const roundedAttendance = Math.round(averageAttendance);

if (
  q.includes("regularly") ||
  q.includes("regular") ||
  q.includes("good") ||
  q.includes("okay")
) {
  setAnswer(
    roundedAttendance >= 75
      ? `Yes. Your current attendance is ${roundedAttendance}%, which is above the 75% attendance threshold.`
      : `Your current attendance is ${roundedAttendance}%, which is below the 75% attendance threshold. Try to attend classes more regularly.`
  );

  return;
}

  const attendanceDetails = attendance
    .map((item) => {
      const percentage =
        item.total_classes > 0
          ? Math.round(
              (item.attended_classes /
                item.total_classes) *
                100
            )
          : 0;

      return `${item.course_code} - ${item.course_name}: ${percentage}% (${item.attended_classes}/${item.total_classes})`;
    })
    .join(", ");

  setAnswer(
    `Your current attendance is: ${attendanceDetails}.`
  );

  return;
}

    // GPA / Performance
    if (
      q.includes("gpa") ||
      q.includes("performance")
    ) {
      setAnswer(
        `Your current GPA is ${gpa}. You currently have ${grades.length} graded course(s). Keep reviewing your course performance regularly.`
      );

      return;
    }

    // Grades
    if (
      q.includes("grade") ||
      q.includes("grades") ||
      q.includes("marks") ||
      q.includes("scores")
    ) {
      if (grades.length === 0) {
        setAnswer(
          "You do not have any grades available yet."
        );
      } else {
        const gradeDetails = grades
          .map(
            (course) =>
              `${course.course_code} - ${course.course_name}: Grade ${course.grade} (${Number(
                course.grade_point
              ).toFixed(2)} GP)`
          )
          .join(", ");

        setAnswer(
          `Your current grades are: ${gradeDetails}.`
        );
      }

      return;
    }

    // Courses
    if (
      q.includes("course") ||
      q.includes("subject") ||
      q.includes("registered")
    ) {
      if (courses.length === 0) {
        setAnswer(
          "You are not currently registered for any courses."
        );
      } else {
        const courseNames = courses
          .map(
            (course) =>
              `${course.course_code} - ${course.course_name}`
          )
          .join(", ");

        setAnswer(
          `You are currently registered for: ${courseNames}.`
        );
      }

      return;
    }

    // Credits
    if (
      q.includes("credit") ||
      q.includes("credits")
    ) {
      const totalCredits = courses.reduce(
        (total, course) =>
          total + Number(course.credits),
        0
      );

      setAnswer(
        `You are currently registered for ${totalCredits} credit(s).`
      );

      return;
    }

    // Fallback
    setAnswer(
      'I can help you understand your GPA, registered courses, credits, grades, specific courses, and academic progress. Try asking: "Tell me about CS201".'
    );
  };

  return (
    <div className="ai-advisor-page">
      <div className="ai-advisor-header">
        <div>
          <a href="/dashboard" className="back-link">
            <ArrowLeft size={18} />
            Back to Dashboard
          </a>

          <p className="header-small">
            CAMPUSFLOW AI
          </p>

          <h1>AI Academic Advisor</h1>

          <p>
            Get quick insights about your courses and
            academic progress.
          </p>
        </div>
      </div>

      <div className="ai-advisor-container">
        <div className="ai-welcome-card">
          <div className="ai-icon">
            <Sparkles size={28} />
          </div>

          <div>
            <h2>How can I help you?</h2>

            <p>
              Ask about your GPA, courses, credits,
              grades, or academic progress.
            </p>
          </div>
        </div>

        <div className="ai-question-card">
          <div className="ai-input-wrapper">
            <input
              type="text"
              placeholder="Ask something like: What is my GPA?"
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  generateAnswer();
                }
              }}
            />

            <button onClick={generateAnswer}>
              <Send size={18} />
            </button>
          </div>
        </div>

        {answer && (
          <div className="ai-answer-card">
            <div className="ai-answer-icon">
              <Sparkles size={20} />
            </div>

            <div>
              <span>CampusFlow AI</span>
              <p>{answer}</p>
            </div>
          </div>
        )}

        <div className="ai-suggestions">
          <h3>Try asking</h3>

          <div className="ai-suggestion-grid">
            {/* GPA */}
            <button
              onClick={() => {
                setQuestion("What is my GPA?");
                setAnswer(
                  `Your current GPA is ${calculateGPA()}.`
                );
              }}
            >
              <GraduationCap size={18} />
              What is my GPA?
            </button>

            {/* Courses */}
            <button
              onClick={() => {
                const newQuestion =
                  "What courses am I taking?";

                setQuestion(newQuestion);

                const courseNames = courses
                  .map(
                    (course) =>
                      `${course.course_code} - ${course.course_name}`
                  )
                  .join(", ");

                setAnswer(
                  courses.length === 0
                    ? "You are not currently registered for any courses."
                    : `You are currently registered for: ${courseNames}.`
                );
              }}
            >
              <BookOpen size={18} />
              What courses am I taking?
            </button>

            {/* Credits */}
            <button
              onClick={() => {
                const newQuestion =
                  "How many credits do I have?";

                setQuestion(newQuestion);

                const totalCredits = courses.reduce(
                  (total, course) =>
                    total + Number(course.credits),
                  0
                );

                setAnswer(
                  `You are currently registered for ${totalCredits} credit(s).`
                );
              }}
            >
              <BookOpen size={18} />
              How many credits?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIAdvisor;


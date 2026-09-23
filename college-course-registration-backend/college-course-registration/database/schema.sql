-- ==========================================
-- College Course Registration Database
-- ==========================================

-- Database Creation
CREATE DATABASE IF NOT EXISTS college_course_db;
USE college_course_db;

-- ==========================================
-- Table: Student
-- ==========================================
CREATE TABLE Student (
    student_id      INT PRIMARY KEY AUTO_INCREMENT,
    student_name    VARCHAR(100) NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    contact_number  VARCHAR(15) NOT NULL UNIQUE,
    department      VARCHAR(100) NOT NULL,
    year_of_study   INT NOT NULL
);

-- ==========================================
-- Table: Faculty
-- ==========================================
CREATE TABLE Faculty (
    faculty_id      INT PRIMARY KEY AUTO_INCREMENT,
    faculty_name    VARCHAR(100) NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    department      VARCHAR(100) NOT NULL,
    designation     VARCHAR(100)
);

-- ==========================================
-- Table: Course
-- ==========================================
CREATE TABLE Course (
    course_id       INT PRIMARY KEY AUTO_INCREMENT,
    course_code     VARCHAR(20) NOT NULL UNIQUE,
    course_name     VARCHAR(150) NOT NULL,
    credits         INT NOT NULL,
    faculty_id      INT NOT NULL,
    FOREIGN KEY (faculty_id) REFERENCES Faculty(faculty_id) ON DELETE CASCADE
);

-- ==========================================
-- Table: Registration (Student <-> Course, many-to-many)
-- ==========================================
CREATE TABLE Registration (
    registration_id     INT PRIMARY KEY AUTO_INCREMENT,
    student_id          INT NOT NULL,
    course_id            INT NOT NULL,
    registration_date   DATE NOT NULL,
    status               ENUM('Registered','Completed','Dropped') DEFAULT 'Registered',
    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Course(course_id) ON DELETE CASCADE,
    UNIQUE (student_id, course_id)   -- prevents duplicate registration for same course
);

-- ==========================================
-- Sample Data
-- ==========================================

-- Faculty
INSERT INTO Faculty (faculty_name, email, department, designation) VALUES
('Dr. Ramesh Kumar', 'ramesh.kumar@college.edu', 'Computer Science', 'Professor'),
('Dr. Anitha Raj', 'anitha.raj@college.edu', 'Computer Science', 'Associate Professor'),
('Mr. Suresh Babu', 'suresh.babu@college.edu', 'Mathematics', 'Assistant Professor'),
('Dr. Priya Menon', 'priya.menon@college.edu', 'Physics', 'Professor');

-- Course
INSERT INTO Course (course_code, course_name, credits, faculty_id) VALUES
('CS101', 'Introduction to Programming', 4, 1),
('CS201', 'Database Management Systems', 4, 2),
('MA101', 'Discrete Mathematics', 3, 3),
('PH101', 'Engineering Physics', 3, 4),
('CS301', 'Web Technologies', 4, 2);

-- Student
INSERT INTO Student (student_name, email, contact_number, department, year_of_study) VALUES
('Arun Kumar', 'arun.kumar@student.edu', '9876543210', 'Computer Science', 2),
('Divya Sri', 'divya.sri@student.edu', '9876543211', 'Computer Science', 2),
('Karthik Raja', 'karthik.raja@student.edu', '9876543212', 'Computer Science', 3),
('Meena Loshini', 'meena.l@student.edu', '9876543213', 'Mathematics', 1),
('Naveen S', 'naveen.s@student.edu', '9876543214', 'Physics', 2);

-- Registration
INSERT INTO Registration (student_id, course_id, registration_date, status) VALUES
(1, 1, '2026-06-15', 'Registered'),
(1, 2, '2026-06-15', 'Registered'),
(2, 1, '2026-06-16', 'Registered'),
(2, 5, '2026-06-16', 'Registered'),
(3, 2, '2026-06-17', 'Completed'),
(3, 5, '2026-06-17', 'Registered'),
(4, 3, '2026-06-18', 'Registered'),
(5, 4, '2026-06-18', 'Registered');

-- ==========================================
-- SQL Operations to Demonstrate
-- ==========================================

-- INSERT
INSERT INTO Student (student_name, email, contact_number, department, year_of_study)
VALUES ('Vindhya Lakshmi', 'vindhya@student.edu', '9876543299', 'Computer Science', 2);

-- SELECT
SELECT * FROM Student;

-- UPDATE
UPDATE Registration SET status = 'Completed' WHERE registration_id = 1;

-- DELETE
DELETE FROM Registration WHERE registration_id = 8;

-- WHERE
SELECT * FROM Registration WHERE status = 'Registered';

-- ORDER BY
SELECT * FROM Course ORDER BY credits DESC;

-- LIKE
SELECT * FROM Student WHERE student_name LIKE '%Kumar%';

-- BETWEEN
SELECT * FROM Registration WHERE registration_date BETWEEN '2026-06-15' AND '2026-06-17';

-- Aggregate Functions
SELECT COUNT(*) AS total_registrations FROM Registration;
SELECT department, COUNT(*) AS student_count FROM Student GROUP BY department;

-- GROUP BY
SELECT course_id, COUNT(*) AS total_students FROM Registration GROUP BY course_id;

-- Student-Course relationship (INNER JOIN)
SELECT s.student_name, c.course_name, c.course_code, r.status
FROM Registration r
JOIN Student s ON r.student_id = s.student_id
JOIN Course c ON r.course_id = c.course_id;

-- Course-wise student list
SELECT c.course_name, s.student_name, s.department
FROM Registration r
JOIN Course c ON r.course_id = c.course_id
JOIN Student s ON r.student_id = s.student_id
ORDER BY c.course_name;

-- Faculty teaching load (bonus useful query)
SELECT f.faculty_name, COUNT(c.course_id) AS courses_taught
FROM Faculty f
LEFT JOIN Course c ON f.faculty_id = c.faculty_id
GROUP BY f.faculty_name;

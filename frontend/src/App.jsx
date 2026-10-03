import { useState } from "react";
import "./App.css";

import Login from "./pages/Login";

// Teacher pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import CreateAssessment from "./pages/teacher/CreateAssessment";
import Assessments from "./pages/teacher/Assessments";
import AssessmentDetails from "./pages/teacher/AssessmentDetails";
import ReviewAnswers from "./pages/teacher/ReviewAnswers";
import ClassAnalytics from "./pages/teacher/ClassAnalytics";
import Students from "./pages/teacher/Students";

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAssessment from "./pages/student/StudentAssessment";
import AssessmentResults from "./pages/student/AssessmentResults";
import AvailableAssessments from "./pages/student/AvailableAssessments";
import Practice from "./pages/student/Practice";
import WeeklyRevision from "./pages/student/WeeklyRevision";
import QuickRevision from "./pages/student/QuickRevision";

function App() {
  const [role, setRole] = useState(null);

  const [teacherPage, setTeacherPage] =
    useState("dashboard");

  const [studentPage, setStudentPage] =
    useState("dashboard");

  const [selectedAssessment, setSelectedAssessment] =
    useState(null);

  const [selectedConcept, setSelectedConcept] =
    useState(null);


  /* =====================================================
     LOGIN
  ===================================================== */

  if (!role) {
    return (
      <Login
        onSelectRole={(selectedRole) => {
          setRole(selectedRole);

          if (selectedRole === "teacher") {
            setTeacherPage("dashboard");
          }

          if (selectedRole === "student") {
            setStudentPage("dashboard");
          }
        }}
      />
    );
  }


  /* =====================================================
     TEACHER
  ===================================================== */

  if (role === "teacher") {

    /* ---------- ASSESSMENT DETAILS ---------- */

    if (teacherPage === "assessment-details") {
      return (
        <AssessmentDetails
          assessment={selectedAssessment}
          onBack={() => {
            setTeacherPage("assessments");
            setSelectedAssessment(null);
          }}
        />
      );
    }


    /* ---------- CREATE ASSESSMENT ---------- */

    if (teacherPage === "create-assessment") {
      return (
        <CreateAssessment
          onBack={() => {
            setTeacherPage("dashboard");
          }}
        />
      );
    }


    /* ---------- ASSESSMENTS ---------- */

    if (teacherPage === "assessments") {
      return (
        <Assessments
          onBack={() => {
            setTeacherPage("dashboard");
          }}
          onCreateAssessment={() => {
            setTeacherPage("create-assessment");
          }}
          onViewAssessment={(assessment) => {
            setSelectedAssessment(assessment);
            setTeacherPage("assessment-details");
          }}
        />
      );
    }


    /* ---------- REVIEW ANSWERS ---------- */

    if (teacherPage === "review-answers") {
      return (
        <ReviewAnswers
          onBack={() => {
            setTeacherPage("dashboard");
          }}
        />
      );
    }


    /* ---------- CLASS ANALYTICS ---------- */

    if (teacherPage === "class-analytics") {
      return (
        <ClassAnalytics
          onBack={() => {
            setTeacherPage("dashboard");
          }}
        />
      );
    }


    /* ---------- STUDENTS ---------- */

    if (teacherPage === "students") {
      return (
        <Students
          onBack={() => {
            setTeacherPage("dashboard");
          }}
        />
      );
    }


    /* ---------- TEACHER DASHBOARD ---------- */

    return (
      <TeacherDashboard
        onLogout={() => {
          setRole(null);
          setTeacherPage("dashboard");
          setSelectedAssessment(null);
        }}

        onCreateAssessment={() => {
          setTeacherPage("create-assessment");
        }}

        onAssessments={() => {
          setTeacherPage("assessments");
        }}

        onReviewAnswers={() => {
          setTeacherPage("review-answers");
        }}

        onClassAnalytics={() => {
          setTeacherPage("class-analytics");
        }}

        onStudents={() => {
          setTeacherPage("students");
        }}
      />
    );
  }


  /* =====================================================
     STUDENT
  ===================================================== */

  if (role === "student") {

    /* ---------- AVAILABLE ASSESSMENTS ---------- */

    if (studentPage === "available-assessments") {
      return (
        <AvailableAssessments
          onBack={() => {
            setStudentPage("dashboard");
          }}

          onStartAssessment={(assessment) => {
            setSelectedAssessment(assessment);
            setStudentPage("assessment");
          }}

          onAssessmentResults={() => {
            setStudentPage("assessment-results");
          }}
        />
      );
    }


    /* ---------- ASSESSMENT RESULTS ---------- */

    if (studentPage === "assessment-results") {
      return (
        <AssessmentResults
          onBack={() => {
            setStudentPage("dashboard");
          }}

          onAvailableAssessments={() => {
            setStudentPage("available-assessments");
          }}
        />
      );
    }


    /* ---------- QUICK REVISION ---------- */

    if (studentPage === "quick-revision") {
      return (
        <QuickRevision
          concept={selectedConcept}

          onBack={() => {
            setStudentPage("weekly-revision");
          }}

          onStartPractice={(concept) => {
            setSelectedConcept(concept);
            setStudentPage("practice");
          }}
        />
      );
    }


    /* ---------- PRACTICE ---------- */

    if (studentPage === "practice") {
      return (
        <Practice
          concept={selectedConcept}

          onBack={() => {
            setStudentPage("dashboard");
            setSelectedConcept(null);
          }}
        />
      );
    }


    /* ---------- STUDENT ASSESSMENT ---------- */

    if (studentPage === "assessment") {
      return (
        <StudentAssessment
          assessment={selectedAssessment}

          onBack={() => {
            setStudentPage("available-assessments");
            setSelectedAssessment(null);
          }}

          onSubmit={() => {
            alert("Assessment submitted successfully!");

            setStudentPage("available-assessments");
            setSelectedAssessment(null);
          }}
        />
      );
    }


    /* ---------- WEEKLY REVISION ---------- */

    if (studentPage === "weekly-revision") {
      return (
        <WeeklyRevision
          onBack={() => {
            setStudentPage("dashboard");
          }}

          onPractice={(concept) => {
            console.log(
              "OPENING QUICK REVISION:",
              concept
            );

            setSelectedConcept(concept);
            setStudentPage("quick-revision");
          }}
        />
      );
    }


    /* ---------- STUDENT DASHBOARD ---------- */

    return (
      <StudentDashboard
        onLogout={() => {
          setRole(null);
          setStudentPage("dashboard");
          setSelectedConcept(null);
          setSelectedAssessment(null);
        }}

        onStartAssessment={(assessment) => {
          setSelectedAssessment(assessment);
          setStudentPage("assessment");
        }}

        onPractice={(concept) => {
          console.log(
            "PRACTICE CLICKED:",
            concept
          );

          setSelectedConcept(concept);
          setStudentPage("practice");
        }}

        onWeeklyRevision={() => {
          console.log(
            "WEEKLY REVISION CLICKED"
          );

          setStudentPage("weekly-revision");
        }}

        onAssessmentResults={() => {
          setStudentPage("assessment-results");
        }}

        onAvailableAssessments={() => {
          setStudentPage("available-assessments");
        }}
      />
    );
  }


  return null;
}

export default App;
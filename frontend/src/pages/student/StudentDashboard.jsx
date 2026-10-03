import { useState } from "react";

import {
  BookOpen,
  Target,
  TrendingUp,
  AlertTriangle,
  Brain,
  RefreshCw,
  LogOut,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  BarChart3,
} from "lucide-react";

function StudentDashboard({
  onLogout,
  onPractice,
  onWeeklyRevision,
  onAssessmentResults,
  onAvailableAssessments,
}) {

  const userEmail = localStorage.getItem("learntrace_user_email");

const studentName =
  userEmail === "samprithi@learntrace.edu"
    ? "Samprithi"
    : "Student";
  const [assessmentsOpen, setAssessmentsOpen] = useState(false);

  /* =========================
     LOAD DATA
  ========================= */

  const assessments =
    JSON.parse(
      localStorage.getItem("learntrace_assessments")
    ) || [];

  const submissions =
    JSON.parse(
      localStorage.getItem("learntrace_submissions")
    ) || [];

  /* =========================
     APPROVED SUBMISSIONS
  ========================= */

  const approvedSubmissions =
    submissions.filter(
      (submission) =>
        submission.status === "approved" &&
        submission.evaluation
    );

    const latestSubmission = approvedSubmissions[0];

const latestEvaluation = latestSubmission?.evaluation || null;

  /* =========================
     PRACTICE RESULTS
  ========================= */

  const practiceResults =
    JSON.parse(
      localStorage.getItem("learntrace_practice_results")
    ) || [];

  /* =========================
     DYNAMIC PRACTICE STREAK
  ========================= */

  const getDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const practiceDates = [
    ...new Set(
      practiceResults
        .map((result) => {
          const timestamp = Number(result.id);

          if (!Number.isFinite(timestamp)) {
            return null;
          }

          const date = new Date(timestamp);

          if (Number.isNaN(date.getTime())) {
            return null;
          }

          return getDateKey(date);
        })
        .filter(Boolean)
    ),
  ].sort((a, b) => b.localeCompare(a));

  const today = new Date();
  const todayKey = getDateKey(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayKey = getDateKey(yesterday);

  let practiceStreak = 0;

  if (
    practiceDates.length > 0 &&
    (
      practiceDates[0] === todayKey ||
      practiceDates[0] === yesterdayKey
    )
  ) {
    let expectedDate = new Date(
      practiceDates[0] + "T00:00:00"
    );

    for (const dateKey of practiceDates) {
      if (dateKey !== getDateKey(expectedDate)) {
        break;
      }

      practiceStreak++;

      expectedDate.setDate(
        expectedDate.getDate() - 1
      );
    }
  }

  /* =========================
     DYNAMIC CONCEPT MASTERY
  ========================= */

  const conceptScores = {};

  approvedSubmissions.forEach((submission) => {
    const evaluatedConcepts =
      submission.evaluation?.concepts || [];

    evaluatedConcepts.forEach((concept) => {
      const name = concept.concept;
      const score = Number(concept.mastery);

      if (
        !name ||
        !Number.isFinite(score)
      ) {
        return;
      }

      if (!conceptScores[name]) {
        conceptScores[name] = [];
      }

      conceptScores[name].push(score);
    });
  });

  const conceptsFromAssessments =
    Object.entries(conceptScores).map(
      ([name, scores]) => ({
        name,
        score: Math.round(
          scores.reduce(
            (total, score) => total + score,
            0
          ) / scores.length
        ),
      })
    );

  const baseConcepts = conceptsFromAssessments;

  const concepts = baseConcepts.map(
    (concept) => {
      const latestPractice =
        [...practiceResults]
          .reverse()
          .find(
            (result) =>
              result.concept === concept.name
          );

      let updatedScore = concept.score;

      if (
        latestPractice &&
        Number.isFinite(
          Number(latestPractice.percentage)
        )
      ) {
        updatedScore = Math.round(
          concept.score * 0.7 +
            Number(latestPractice.percentage) * 0.3
        );
      }

      updatedScore = Math.max(
        0,
        Math.min(100, updatedScore)
      );

      let updatedStatus;

      if (updatedScore >= 80) {
        updatedStatus = "Strong";
      } else if (updatedScore >= 65) {
        updatedStatus = "Good";
      } else if (updatedScore >= 45) {
        updatedStatus = "Practice";
      } else {
        updatedStatus = "Needs Attention";
      }

      return {
        name: concept.name,
        score: updatedScore,
        status: updatedStatus,
      };
    }
  );

  /* =========================
     OVERALL SCORE
  ========================= */

  const overallScore =
  latestEvaluation
    ? latestEvaluation.percentage
    : 0;

  /* =========================
     MASTERED CONCEPTS
  ========================= */

  const masteredCount =
    concepts.filter(
      (concept) =>
        concept.score >= 80
    ).length;

  const totalConcepts = 6; // Assuming there are 6 concepts in total

  /* =========================
     LEARNING GAPS
  ========================= */

  const learningGaps = concepts
    .filter((concept) => concept.score < 65)
    .sort((a, b) => a.score - b.score);

  /* =========================
     WEEKLY REVISION
  ========================= */

  const weeklyRevision =
    learningGaps.slice(0, 3);

  /* =========================
     PRACTICE CONCEPT
  ========================= */

  const practiceConcept =
    learningGaps.length > 0
      ? learningGaps[0].name
      : concepts[0]?.name || "Arrays";

  /* =========================
     PRACTICE HANDLER
  ========================= */

  const handlePractice = (conceptName) => {
    if (!conceptName) {
      return;
    }

    console.log(
      "Opening Practice:",
      conceptName
    );

    onPractice(conceptName);
  };

  /* =========================
     WEEKLY REVISION HANDLER
  ========================= */

  const handleWeeklyRevision = () => {
    if (!onWeeklyRevision) {
      return;
    }

    onWeeklyRevision();
  };

  /* =========================
     ASSESSMENT NAVIGATION
  ========================= */

  const handleAvailableAssessments = () => {
  if (onAvailableAssessments) {
    onAvailableAssessments();
  }
};

const handleAssessmentResults = () => {
  if (onAssessmentResults) {
    onAssessmentResults();
  }
};

  return (
    <div className="student-layout">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className="student-sidebar">

        {/* BRAND */}

        <div className="student-brand">
          <div className="student-logo">
            <BookOpen size={22} />
          </div>

          <span>LearnTrace</span>
        </div>

        {/* NAVIGATION */}

        <nav className="student-nav">

          {/* DASHBOARD */}

          <button
            type="button"
            className="student-nav-item active"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            <BookOpen size={18} />
            <span>Dashboard</span>
          </button>

          {/* ASSESSMENTS DROPDOWN */}

          <div className="student-nav-group">

            <button
              type="button"
              className="student-nav-item"
              onClick={() =>
                setAssessmentsOpen((open) => !open)
              }
              aria-expanded={assessmentsOpen}
            >
              <Target size={18} />

              <span>Assessments</span>

              <span className="student-nav-arrow">
                {assessmentsOpen ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </span>
            </button>

            {assessmentsOpen && (
              <div className="student-nav-submenu">

                <button
                  type="button"
                  className="student-nav-subitem"
                  onClick={handleAvailableAssessments}
                >
                  <ClipboardList size={16} />
                  <span>Available Assessments</span>
                </button>

                <button
                  type="button"
                  className="student-nav-subitem"
                  onClick={handleAssessmentResults}
                >
                  <BarChart3 size={16} />
                  <span>Assessment Results</span>
                </button>

              </div>
            )}

          </div>

          {/* PRACTICE */}

          <button
            type="button"
            className="student-nav-item"
            onClick={() =>
              handlePractice(practiceConcept)
            }
          >
            <Brain size={18} />
            <span>Practice</span>
          </button>

          {/* WEEKLY REVISION */}

          <button
            type="button"
            className="student-nav-item"
            onClick={handleWeeklyRevision}
          >
            <RefreshCw size={18} />
            <span>Weekly Revision</span>
          </button>

        </nav>

        {/* LOGOUT */}

        <button
          type="button"
          className="student-logout"
          onClick={onLogout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>

      </aside>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main className="student-main">

        {/* HEADER */}

        <header className="student-header">

          <div>
            <h1>
              Good afternoon, Samprithi 👋
            </h1>

            <p>
              Here's your learning progress.
            </p>
          </div>

          <div className="profile-avatar">
  {studentName.charAt(0).toUpperCase()}
</div>

        </header>

        {/* ==================================================
            STAT CARDS
        ================================================== */}

        <section className="student-stats">

          {/* OVERALL SCORE */}

          <div className="student-stat-card">
            <div className="student-stat-icon">
              <TrendingUp size={20} />
            </div>

            <div>
              <span>Overall Score</span>
              <strong>{overallScore}%</strong>
            </div>
          </div>

          {/* CONCEPTS MASTERED */}

          <div className="student-stat-card">
            <div className="student-stat-icon">
              <Target size={20} />
            </div>

            <div>
              <span>Concepts Mastered</span>
              <strong>
                {masteredCount} / {totalConcepts}
              </strong>
            </div>
          </div>

          {/* ASSESSMENTS */}

          <div className="student-stat-card">
            <div className="student-stat-icon">
              <BookOpen size={20} />
            </div>

            <div>
              <span>Assessments</span>
              <strong>
                {approvedSubmissions.length}
              </strong>
            </div>
          </div>

          {/* PRACTICE STREAK */}

          <div className="student-stat-card">
            <div className="student-stat-icon">
              <Brain size={20} />
            </div>

            <div>
              <span>Practice Streak</span>
              <strong>
                {practiceStreak}{" "}
                {practiceStreak === 1 ? "day" : "days"}
              </strong>
            </div>
          </div>

        </section>

        {/* ==================================================
            CONCEPT MASTERY
        ================================================== */}

        <section className="student-section">

          <div className="student-section-header">
            <div>
              <h2>Concept Mastery</h2>

              <p>
                Your understanding across important concepts.
              </p>
            </div>
          </div>

          <div className="concept-list">

            {concepts.map((concept) => (

              <div
                className="student-concept"
                key={concept.name}
              >

                <div className="concept-info">
                  <span>{concept.name}</span>
                  <strong>{concept.score}%</strong>
                </div>

                <div className="concept-progress">
                  <div
                    className="concept-progress-fill"
                    style={{
                      width: `${concept.score}%`,
                    }}
                  />
                </div>

                <span
                  className={`concept-status ${concept.status
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                >
                  {concept.status}
                </span>

              </div>

            ))}

          </div>

        </section>


        {/* ==================================================
            BOTTOM GRID
        ================================================== */}

        <div className="student-dashboard-grid">

          {/* ==================================================
              LEARNING GAPS
          ================================================== */}

          <section className="student-section">

            <div className="student-section-header">

              <div>
                <h2>Learning Gaps</h2>

                <p>
                  Concepts that need more attention.
                </p>
              </div>

              <AlertTriangle size={20} />

            </div>

            <div className="gap-list">

              {learningGaps.length === 0 ? (

                <div className="gap-item">

                  <div>
                    <strong>
                      No major learning gaps
                    </strong>

                    <span>
                      Your concepts are currently on track.
                    </span>
                  </div>

                  <button
                    type="button"
                    className="gap-practice-button"
                    onClick={() =>
                      handlePractice(practiceConcept)
                    }
                  >
                    Practice
                  </button>

                </div>

              ) : (

                learningGaps
                  .slice(0, 3)
                  .map((concept) => (

                    <div
                      className="gap-item"
                      key={concept.name}
                    >

                      <div>
                        <strong>{concept.name}</strong>

                        <span>
                          {concept.score}% mastery
                        </span>
                      </div>

                      <button
                        type="button"
                        className="gap-practice-button"
                        onClick={() =>
                          handlePractice(concept.name)
                        }
                      >
                        Practice
                      </button>

                    </div>

                  ))

              )}

            </div>

          </section>

          {/* ==================================================
              WEEKLY AI REVISION
          ================================================== */}

          <section className="student-section">

            <div className="student-section-header">

              <div>
                <h2>Weekly Revision</h2>

                <p>
                  Personalized focus for this week.
                </p>
              </div>

              <RefreshCw size={20} />

            </div>

            <div className="revision-list">

              {weeklyRevision.length === 0 ? (

                <div className="revision-item">

                  <span>✓</span>

                  <div>
                    <strong>You're on track</strong>

                    <p>
                      Continue practicing your concepts.
                    </p>
                  </div>

                </div>

              ) : (

                weeklyRevision.map((concept, index) => (

                  <div
                    className="revision-item"
                    key={concept.name}
                  >

                    <span>
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div>

                      <strong>
                        Revise {concept.name}
                      </strong>

                      <p>
                        {concept.score < 65
                          ? "Low mastery detected"
                          : "Additional practice recommended"}
                      </p>

                    </div>

                  </div>

                ))

              )}

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default StudentDashboard;
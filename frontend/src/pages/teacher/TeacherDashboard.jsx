import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  FileCheck2,
  BarChart3,
  Users,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

function TeacherDashboard({
  onLogout,
  onCreateAssessment,
  onAssessments,
  onReviewAnswers,
  onClassAnalytics,
  onStudents,
}) {
  const [refreshKey, setRefreshKey] = useState(0);

  const getStoredData = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  };

  const assessments = useMemo(
    () => getStoredData("learntrace_assessments"),
    [refreshKey]
  );

  const submissions = useMemo(
    () => getStoredData("learntrace_submissions"),
    [refreshKey]
  );

  const getAssessmentId = (submission) => {
    return (
      submission?.assessmentId ||
      submission?.assessment?.id ||
      submission?.assessmentID
    );
  };

  const getStudentName = (submission) => {
    return (
      submission?.studentName ||
      submission?.name ||
      submission?.student?.name ||
      "Student"
    );
  };

  const getStudentKey = (submission) => {
    return (
      submission?.studentEmail ||
      submission?.email ||
      submission?.student?.email ||
      getStudentName(submission)
    );
  };

  const getAssessmentTitle = (submission) => {
    const assessmentId = getAssessmentId(submission);

    const assessment = assessments.find(
      (item) => String(item.id) === String(assessmentId)
    );

    return (
      assessment?.name ||
      submission?.assessmentTitle ||
      submission?.assessment?.name ||
      "Assessment"
    );
  };

  const getSubmissionPercentage = (submission) => {
    return Number(
      submission?.evaluation?.percentage ??
        submission?.evaluation?.scorePercentage ??
        0
    );
  };

  const approvedSubmissions = submissions.filter(
    (submission) =>
      submission?.status === "approved" && submission?.evaluation
  );

  const pendingSubmissions = submissions.filter(
    (submission) => submission?.status !== "approved"
  );

  const studentCount = new Set(
    submissions.map((submission) => getStudentKey(submission))
  ).size;

  const classAverage = useMemo(() => {
    if (approvedSubmissions.length === 0) {
      return null;
    }

    const total = approvedSubmissions.reduce(
      (sum, submission) => sum + getSubmissionPercentage(submission),
      0
    );

    return Math.round(total / approvedSubmissions.length);
  }, [approvedSubmissions]);

  /*
   * Build class-level concept mastery
   * from approved assessment evaluations.
   */
  const learningGaps = useMemo(() => {
    const conceptMap = {};

    approvedSubmissions.forEach((submission) => {
      const concepts = submission?.evaluation?.concepts || [];

      concepts.forEach((conceptData) => {
        const conceptName =
          conceptData?.concept ||
          conceptData?.name ||
          "General";

        const mastery = Number(
          conceptData?.mastery ??
            conceptData?.percentage ??
            conceptData?.score ??
            0
        );

        if (!conceptMap[conceptName]) {
          conceptMap[conceptName] = {
            concept: conceptName,
            total: 0,
            count: 0,
          };
        }

        conceptMap[conceptName].total += mastery;
        conceptMap[conceptName].count += 1;
      });
    });

    return Object.values(conceptMap)
      .map((item) => ({
        concept: item.concept,
        mastery: Math.round(item.total / item.count),
      }))
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 4);
  }, [approvedSubmissions]);

  /*
   * Latest assessments first.
   */
  const recentAssessments = useMemo(() => {
    return [...assessments]
      .sort((a, b) => {
        const dateA = new Date(
          a.createdAt || a.createdDate || a.date || 0
        ).getTime();

        const dateB = new Date(
          b.createdAt || b.createdDate || b.date || 0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 3)
      .map((assessment) => {
        const assessmentSubmissions = submissions.filter(
          (submission) =>
            String(getAssessmentId(submission)) === String(assessment.id)
        );

        const reviewed = assessmentSubmissions.filter(
          (submission) =>
            submission?.status === "approved" &&
            submission?.evaluation
        );

        let average = null;

        if (reviewed.length > 0) {
          const total = reviewed.reduce(
            (sum, submission) =>
              sum + getSubmissionPercentage(submission),
            0
          );

          average = Math.round(total / reviewed.length);
        }

        return {
          ...assessment,
          submittedCount: assessmentSubmissions.length,
          average,
        };
      });
  }, [assessments, submissions]);

  const getGapStatus = (mastery) => {
    if (mastery < 65) {
      return {
        label: "Needs Attention",
        className: "danger",
      };
    }

    if (mastery < 75) {
      return {
        label: "Practice",
        className: "warning",
      };
    }

    return {
      label: "Strong",
      className: "success",
    };
  };

  const formatConfidence = (submission) => {
    const confidence =
      submission?.evaluation?.confidence ??
      submission?.evaluation?.overallConfidence;

    if (confidence === undefined || confidence === null) {
      return "Pending";
    }

    const numericConfidence = Number(confidence);

    if (numericConfidence <= 1) {
      return `${Math.round(numericConfidence * 100)}% confidence`;
    }

    return `${Math.round(numericConfidence)}% confidence`;
  };

  const formatDate = (assessment) => {
    const dateValue =
      assessment?.createdAt ||
      assessment?.createdDate ||
      assessment?.date;

    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="dashboard-layout">

      {/* Sidebar */}

      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <CheckCircle2 size={22} />
          </div>

          <span>LearnTrace</span>
        </div>

        <nav className="sidebar-nav">

          <button className="nav-item active">
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={onAssessments}
          >
            <ClipboardList size={19} />
            Assessments
          </button>

          <button
            className="nav-item"
            onClick={onCreateAssessment}
          >
            <PlusCircle size={19} />
            Create Assessment
          </button>

          <button
            className="nav-item"
            onClick={onReviewAnswers}
          >
            <FileCheck2 size={19} />
            Review Answers
          </button>

          <button
  className="nav-item"
  onClick={onClassAnalytics}
>
  <BarChart3 size={19} />
  Class Analytics
</button>

          <button
  className="nav-item"
  onClick={onStudents}
>
  <Users size={19} />
  Students
</button>

        </nav>

        <button
          className="logout-button"
          onClick={onLogout}
        >
          <LogOut size={18} />
          Logout
        </button>

      </aside>


      {/* Main Content */}

      <main className="dashboard-main">

        {/* Topbar */}

        <header className="dashboard-header">

          <div>
            <h1>Teacher Dashboard</h1>

            <p>
              Monitor assessments and track student learning.
            </p>
          </div>

          <div className="teacher-profile">
            <div className="profile-avatar">
              DP
            </div>

            <div>
              <strong>Dr. Priya</strong>
              <span>Data Structures</span>
            </div>
          </div>

        </header>


        {/* Statistics */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon blue">
              <ClipboardList size={22} />
            </div>

            <div>
              <span>Active Assessments</span>
              <strong>{assessments.length}</strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon purple">
              <Users size={22} />
            </div>

            <div>
              <span>Students</span>
              <strong>{studentCount}</strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon orange">
              <Clock size={22} />
            </div>

            <div>
              <span>Pending Reviews</span>
              <strong>{pendingSubmissions.length}</strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon green">
              <BarChart3 size={22} />
            </div>

            <div>
              <span>Class Average</span>
              <strong>
                {classAverage !== null
                  ? `${classAverage}%`
                  : "—"}
              </strong>
            </div>

          </div>

        </section>


        {/* Learning Gaps */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>
              <h2>Class Learning Gaps</h2>

              <p>
                Concepts where students need more practice.
              </p>
            </div>

            <button className="view-button">
              View Analytics
            </button>

          </div>


          <div className="gap-list">

            {learningGaps.length > 0 ? (
              learningGaps.map((gap) => {
                const status = getGapStatus(gap.mastery);

                return (
                  <div
                    className="gap-item"
                    key={gap.concept}
                  >

                    <div className="gap-info">
                      <strong>{gap.concept}</strong>

                      <span>
                        {gap.mastery}% mastery
                      </span>
                    </div>

                    <div className="progress-track">
                      <div
                        className={`progress-fill ${status.className}`}
                        style={{
                          width: `${Math.min(
                            Math.max(gap.mastery, 0),
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <span
                      className={`gap-status ${
                        status.className === "success"
                          ? "good"
                          : ""
                      }`}
                    >
                      {status.label}
                    </span>

                  </div>
                );
              })
            ) : (
              <div className="dashboard-empty-state">
                No class learning data available yet.
              </div>
            )}

          </div>

        </section>


        {/* Bottom Grid */}

        <div className="dashboard-two-column">


          {/* Pending Reviews */}

          <section className="dashboard-section">

            <div className="section-header">

              <div>
                <h2>Pending Reviews</h2>

                <p>
                  Evaluations waiting for teacher verification.
                </p>
              </div>

              <AlertCircle size={20} />

            </div>


            <div className="review-list">

              {pendingSubmissions.length > 0 ? (
                pendingSubmissions
                  .slice(0, 3)
                  .map((submission, index) => (
                    <div
                      className="review-item"
                      key={
                        submission.id ||
                        `${getStudentKey(submission)}-${index}`
                      }
                    >

                      <div className="student-avatar">
                        {getStudentName(submission)
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="review-details">
                        <strong>
                          {getStudentName(submission)}
                        </strong>

                        <span>
                          {getAssessmentTitle(submission)}
                        </span>
                      </div>

                      <span className="review-confidence">
                        {formatConfidence(submission)}
                      </span>

                    </div>
                  ))
              ) : (
                <div className="dashboard-empty-state">
                  No pending reviews.
                </div>
              )}

            </div>

          </section>


          {/* Recent Assessments */}

          <section className="dashboard-section">

            <div className="section-header">

              <div>
                <h2>Recent Assessments</h2>

                <p>
                  Latest assessments created.
                </p>
              </div>

            </div>


            <div className="assessment-list">

              {recentAssessments.length > 0 ? (
                recentAssessments.map((assessment) => (
                  <div
                    className="assessment-item"
                    key={assessment.id}
                  >

                    <div>
                      <strong>
                        {assessment.name ||
                          "Untitled Assessment"}
                      </strong>

                      <span>
                        {assessment.submittedCount}{" "}
                        {assessment.submittedCount === 1
                          ? "student"
                          : "students"}{" "}
                        submitted
                        {formatDate(assessment)
                          ? ` · ${formatDate(assessment)}`
                          : ""}
                      </span>
                    </div>

                    <strong>
                      {assessment.average !== null
                        ? `${assessment.average}%`
                        : "—"}
                    </strong>

                  </div>
                ))
              ) : (
                <div className="dashboard-empty-state">
                  No assessments created yet.
                </div>
              )}

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default TeacherDashboard;
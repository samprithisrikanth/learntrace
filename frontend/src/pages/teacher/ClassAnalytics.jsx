import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Target,
  Users,
} from "lucide-react";

function ClassAnalytics({ onBack }) {
  const getStoredData = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  };

  const assessments = getStoredData("learntrace_assessments");
  const submissions = getStoredData("learntrace_submissions");

  const approvedSubmissions = submissions.filter(
    (submission) =>
      submission?.status === "approved" &&
      submission?.evaluation
  );

  const percentages = approvedSubmissions
    .map((submission) =>
      Number(
        submission?.evaluation?.percentage ??
          submission?.evaluation?.scorePercentage ??
          0
      )
    )
    .filter((value) => !Number.isNaN(value));

  const classAverage =
    percentages.length > 0
      ? Math.round(
          percentages.reduce((sum, value) => sum + value, 0) /
            percentages.length
        )
      : 0;

  const studentKeys = new Set(
    submissions.map(
      (submission) =>
        submission?.studentEmail ||
        submission?.email ||
        submission?.student?.email ||
        submission?.studentName ||
        submission?.name ||
        "Student"
    )
  );

  const conceptMap = {};

  approvedSubmissions.forEach((submission) => {
    const concepts = submission?.evaluation?.concepts || [];

    concepts.forEach((item) => {
      const concept =
        item?.concept ||
        item?.name ||
        "General";

      const mastery = Number(
        item?.mastery ??
          item?.percentage ??
          item?.score ??
          0
      );

      if (!conceptMap[concept]) {
        conceptMap[concept] = {
          total: 0,
          count: 0,
        };
      }

      conceptMap[concept].total += mastery;
      conceptMap[concept].count += 1;
    });
  });

  const concepts = Object.entries(conceptMap)
    .map(([concept, data]) => ({
      concept,
      mastery: Math.round(data.total / data.count),
    }))
    .sort((a, b) => a.mastery - b.mastery);

  return (
    <div className="dashboard-layout">

      {/* Sidebar */}

      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <BarChart3 size={22} />
          </div>

          <span>LearnTrace</span>
        </div>

        <nav className="sidebar-nav">

          <button
            className="nav-item"
            onClick={onBack}
          >
            <ArrowLeft size={19} />
            Dashboard
          </button>

          <button className="nav-item active">
            <BarChart3 size={19} />
            Class Analytics
          </button>

        </nav>

      </aside>


      {/* Main */}

      <main className="dashboard-main">

        <header className="dashboard-header">

          <div>
            <h1>Class Analytics</h1>

            <p>
              Understand class performance and learning progress.
            </p>
          </div>

        </header>


        {/* Summary */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon blue">
              <BarChart3 size={22} />
            </div>

            <div>
              <span>Assessments</span>
              <strong>{assessments.length}</strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon purple">
              <Users size={22} />
            </div>

            <div>
              <span>Students</span>
              <strong>{studentKeys.size}</strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon green">
              <TrendingUp size={22} />
            </div>

            <div>
              <span>Class Average</span>
              <strong>
                {approvedSubmissions.length > 0
                  ? `${classAverage}%`
                  : "—"}
              </strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon orange">
              <Target size={22} />
            </div>

            <div>
              <span>Reviewed</span>
              <strong>
                {approvedSubmissions.length}
              </strong>
            </div>

          </div>

        </section>


        {/* Concept Performance */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>
              <h2>Concept Performance</h2>

              <p>
                Average mastery across reviewed assessments.
              </p>
            </div>

          </div>


          <div className="gap-list">

            {concepts.length > 0 ? (
              concepts.map((item) => {

                const status =
                  item.mastery < 65
                    ? "Needs Attention"
                    : item.mastery < 75
                    ? "Practice"
                    : "Strong";

                const fillClass =
                  item.mastery < 65
                    ? "danger"
                    : item.mastery < 75
                    ? "warning"
                    : "success";

                return (
                  <div
                    className="gap-item"
                    key={item.concept}
                  >

                    <div className="gap-info">
                      <strong>{item.concept}</strong>

                      <span>
                        {item.mastery}% mastery
                      </span>
                    </div>

                    <div className="progress-track">

                      <div
                        className={`progress-fill ${fillClass}`}
                        style={{
                          width: `${Math.min(
                            Math.max(item.mastery, 0),
                            100
                          )}%`,
                        }}
                      />

                    </div>

                    <span
                      className={`gap-status ${
                        fillClass === "success"
                          ? "good"
                          : ""
                      }`}
                    >
                      {status}
                    </span>

                  </div>
                );
              })
            ) : (
              <div className="dashboard-empty-state">
                No reviewed assessment data available yet.
              </div>
            )}

          </div>

        </section>


        {/* Assessment Performance */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>
              <h2>Assessment Performance</h2>

              <p>
                Performance across reviewed submissions.
              </p>
            </div>

          </div>


          <div className="assessment-list">

            {assessments.length > 0 ? (
              assessments.map((assessment) => {

                const related = approvedSubmissions.filter(
                  (submission) =>
                    String(
                      submission?.assessmentId
                    ) === String(assessment.id)
                );

                const scores = related.map((submission) =>
                  Number(
                    submission?.evaluation?.percentage ??
                      submission?.evaluation
                        ?.scorePercentage ??
                      0
                  )
                );

                const average =
                  scores.length > 0
                    ? Math.round(
                        scores.reduce(
                          (sum, score) => sum + score,
                          0
                        ) / scores.length
                      )
                    : null;

                return (
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
                        {related.length} reviewed
                      </span>
                    </div>

                    <strong>
                      {average !== null
                        ? `${average}%`
                        : "—"}
                    </strong>

                  </div>
                );
              })
            ) : (
              <div className="dashboard-empty-state">
                No assessments available yet.
              </div>
            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default ClassAnalytics;
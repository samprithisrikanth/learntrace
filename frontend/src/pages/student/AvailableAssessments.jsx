import {
  BookOpen,
  ClipboardList,
  Target,
  ArrowLeft,
  FileQuestion,
  Award,
  Clock3,
  Play,
} from "lucide-react";

function AvailableAssessments({
  onBack,
  onStartAssessment,
  onAssessmentResults,
}) {
  const assessments =
    JSON.parse(
      localStorage.getItem("learntrace_assessments")
    ) || [];

  return (
    <div className="student-layout">
      {/* ================= SIDEBAR ================= */}
      <aside className="student-sidebar">
        <div className="student-brand">
          <div className="student-logo">
            <BookOpen size={21} />
          </div>

          <span>LearnTrace</span>
        </div>

        <nav className="student-nav">

          {/* Dashboard */}
          <button
            type="button"
            className="student-nav-item"
            onClick={onBack}
          >
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </button>

          {/* Available Assessments */}
          <button
            type="button"
            className="student-nav-item active"
          >
            <ClipboardList size={18} />
            <span>Available Assessments</span>
          </button>

          {/* Results */}
          <button
            type="button"
            className="student-nav-item"
            onClick={onAssessmentResults}
          >
            <Target size={18} />
            <span>Assessment Results</span>
          </button>
        </nav>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="student-main assessment-page">

        {/* Header */}
        <header className="student-header">
          <div>
            <div className="page-title-row">
              <div className="page-title-icon">
                <ClipboardList size={20} />
              </div>

              <div>
                <h1>Available Assessments</h1>

                <p>
                  Choose an assessment to test your
                  understanding and track your progress.
                </p>
              </div>
            </div>
          </div>

          <div className="student-profile">
            A
          </div>
        </header>

        {/* ================= CONTENT ================= */}
        <section className="assessment-content">

          <div className="assessment-section-heading">
            <div>
              <h2>Assessments</h2>

              <p>
                Complete the assessments assigned by your teacher.
              </p>
            </div>

            <span className="assessment-count">
              {assessments.length} available
            </span>
          </div>

          {/* Empty State */}
          {assessments.length === 0 ? (
            <div className="assessment-empty">

              <div className="assessment-empty-icon">
                <ClipboardList size={25} />
              </div>

              <h3>No assessments available</h3>

              <p>
                Your teacher hasn't assigned any assessments yet.
                Check back later.
              </p>

              <button
                type="button"
                className="assessment-secondary-btn"
                onClick={onBack}
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <div className="assessment-grid">

              {assessments.map((assessment) => {

                const questionCount =
                  assessment.questions?.length || 0;

                const totalMarks =
                  assessment.questions?.reduce(
                    (total, question) =>
                      total + Number(question.marks || 0),
                    0
                  ) || 0;

                const duration =
                  assessment.duration ||
                  assessment.timeLimit ||
                  "30 min";

                return (
                  <article
                    className="assessment-card"
                    key={assessment.id}
                  >

                    {/* Card Header */}
                    <div className="assessment-card-header">

                      <div className="assessment-card-icon">
                        <BookOpen size={20} />
                      </div>

                    </div>

                    {/* Card Content */}
                    <div className="assessment-card-body">

                      <h3>
                        {assessment.name ||
                          assessment.title ||
                          "Untitled Assessment"}
                      </h3>

                      <p className="assessment-description">
                        {assessment.description ||
                          "Test your understanding of the concepts covered in this assessment."}
                      </p>

                      {/* Stats */}
                      <div className="assessment-stats">

                        <div className="assessment-stat">
                          <FileQuestion size={16} />

                          <div>
                            <span>Questions</span>
                            <strong>
                              {questionCount}
                            </strong>
                          </div>
                        </div>

                        <div className="assessment-stat">
                          <Award size={16} />

                          <div>
                            <span>Total Marks</span>
                            <strong>
                              {totalMarks}
                            </strong>
                          </div>
                        </div>

                        <div className="assessment-stat">
                          <Clock3 size={16} />

                          <div>
                            <span>Duration</span>
                            <strong>
                              {duration}
                            </strong>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Footer */}
                    <div className="assessment-card-footer">

                      <span>
                        Ready to attempt
                      </span>

                      <button
                        type="button"
                        className="assessment-start-btn"
                        onClick={() =>
                          onStartAssessment(assessment)
                        }
                      >
                        <Play size={14} />
                        Start Assessment
                      </button>

                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AvailableAssessments;
import {
  ArrowLeft,
  ClipboardList,
  Eye,
  Plus,
} from "lucide-react";

function Assessments({ onBack, onCreateAssessment, onViewAssessment }) {
  const assessments =
    JSON.parse(
      localStorage.getItem("learntrace_assessments")
    ) || [];

  return (
    <div className="dashboard-layout">

      {/* Sidebar */}

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="sidebar-logo">
            <ClipboardList size={22} />
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
            <ClipboardList size={19} />
            Assessments
          </button>


          <button
            className="nav-item"
            onClick={onCreateAssessment}
          >
            <Plus size={19} />
            Create Assessment
          </button>

        </nav>

      </aside>


      {/* Main Content */}

      <main className="dashboard-main">

        <header className="dashboard-header">

          <div>

            <h1>Assessments</h1>

            <p>
              Manage assessments and review their questions.
            </p>

          </div>


          <button
            className="primary-button"
            onClick={onCreateAssessment}
          >
            <Plus size={18} />
            Create Assessment
          </button>

        </header>


        {/* Assessment List */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>

              <h2>
                All Assessments
              </h2>

              <p>
                {assessments.length} assessment
                {assessments.length !== 1 ? "s" : ""} created
              </p>

            </div>

          </div>


          {assessments.length === 0 ? (

            <div className="empty-state">

              <ClipboardList size={42} />

              <h3>No assessments yet</h3>

              <p>
                Create your first assessment to get started.
              </p>

              <button
                className="primary-button"
                onClick={onCreateAssessment}
              >
                <Plus size={18} />
                Create Assessment
              </button>

            </div>

          ) : (

            <div className="assessment-page-list">

              {assessments.map((assessment) => (

                <div
                  className="assessment-card"
                  key={assessment.id}
                >

                  <div className="assessment-card-icon">

                    <ClipboardList size={22} />

                  </div>


                  <div className="assessment-card-content">

                    <h3>
                      {assessment.name}
                    </h3>

                    <p>
                      {assessment.subject}
                    </p>

                    <div className="assessment-meta">

                      <span>
                        {assessment.className}
                      </span>

                      <span>
                        {assessment.questions.length} question
                        {assessment.questions.length !== 1
                          ? "s"
                          : ""}
                      </span>

                      {assessment.date && (
                        <span>
                          {assessment.date}
                        </span>
                      )}

                    </div>

                  </div>


                  <button
                    className="view-assessment-button"
                    onClick={() => onViewAssessment(assessment)}
                  >

                    <Eye size={17} />

                    View

                  </button>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default Assessments;
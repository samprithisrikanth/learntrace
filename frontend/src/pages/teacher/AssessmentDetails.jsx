import {
  ArrowLeft,
  ClipboardList,
} from "lucide-react";

function AssessmentDetails({ assessment, onBack }) {
  if (!assessment) {
    return (
      <div className="dashboard-layout">
        <main className="dashboard-main">
          <h1>Assessment not found</h1>

          <button
            className="secondary-button"
            onClick={onBack}
          >
            <ArrowLeft size={18} />
            Back to Assessments
          </button>
        </main>
      </div>
    );
  }

  const totalMarks = assessment.questions.reduce(
    (total, question) =>
      total + Number(question.marks || 0),
    0
  );

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
            Assessments
          </button>

        </nav>

      </aside>


      {/* Main Content */}

      <main className="dashboard-main">

        {/* Header */}

        <header className="dashboard-header">

          <div>

            <button
              className="back-button"
              onClick={onBack}
            >
              <ArrowLeft size={17} />
              Back to Assessments
            </button>

            <h1>{assessment.name}</h1>

            <p>
              {assessment.subject}
              {assessment.className &&
                ` • ${assessment.className}`}
            </p>

          </div>

        </header>


        {/* Assessment Summary */}

        <section className="assessment-summary">

          <div className="summary-item">

            <span>Questions</span>

            <strong>
              {assessment.questions.length}
            </strong>

          </div>


          <div className="summary-item">

            <span>Total Marks</span>

            <strong>
              {totalMarks}
            </strong>

          </div>


          <div className="summary-item">

            <span>Date</span>

            <strong>
              {assessment.date || "Not specified"}
            </strong>

          </div>

        </section>


        {/* Questions */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>

              <h2>Assessment Questions</h2>

              <p>
                Questions, expected answers, and evaluation criteria for this assessment.
              </p>

            </div>

          </div>


          <div className="detail-questions">

            {assessment.questions.map(
              (question, index) => (

                <div
                  className="detail-question-card"
                  key={question.id}
                >

                  {/* Question Header */}

                  <div className="detail-question-header">

                    <div>

                      <span className="question-number">
                        Question {index + 1}
                      </span>

                      <h3>
                        {question.question ||
                          "Question not provided"}
                      </h3>

                    </div>


                    <div className="marks-badge">

                      {question.marks} Marks

                    </div>

                  </div>


                  {/* Expected Answer */}

                  <div className="detail-block">

                    <span className="detail-label">
                      Expected Answer
                    </span>

                    <p>
                      {question.expectedAnswer ||
                        "No expected answer provided."}
                    </p>

                  </div>


                  {/* Concept */}

                  <div className="detail-grid">

                    <div className="detail-block">

                      <span className="detail-label">
                        Learning Concept
                      </span>

                      <p>
                        {question.concept ||
                          "Not specified"}
                      </p>

                    </div>


                    <div className="detail-block">

                      <span className="detail-label">
                        Maximum Marks
                      </span>

                      <p>
                        {question.marks}
                      </p>

                    </div>

                  </div>


                  {/* Rubric */}

                  <div className="detail-block">

                    <span className="detail-label">
                      Rubric Criteria
                    </span>

                    <p>
                      {question.rubric ||
                        "No rubric criteria provided."}
                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default AssessmentDetails;
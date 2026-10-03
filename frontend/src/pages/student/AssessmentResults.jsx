import { useState } from "react";

import {
  BookOpen,
  ClipboardList,
  Target,
  ArrowLeft,
  CheckCircle2,
  MessageSquareText,
  ChevronDown,
  ChevronUp,
  Award,
  FileQuestion,
} from "lucide-react";

function AssessmentResults({
  onBack,
  onAvailableAssessments,
}) {
  const [expandedResults, setExpandedResults] =
    useState({});

  const assessments =
    JSON.parse(
      localStorage.getItem("learntrace_assessments")
    ) || [];

  const submissions =
    JSON.parse(
      localStorage.getItem("learntrace_submissions")
    ) || [];

  const approvedSubmissions = submissions
    .filter(
      (submission) =>
        submission.status === "approved" &&
        submission.evaluation
    )
    .reverse();

  const toggleResult = (submissionId) => {
    setExpandedResults((previous) => ({
      ...previous,
      [submissionId]: !previous[submissionId],
    }));
  };

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

          {/* Available */}
          <button
            type="button"
            className="student-nav-item"
            onClick={onAvailableAssessments}
          >
            <ClipboardList size={18} />
            <span>Available Assessments</span>
          </button>

          {/* Results */}
          <button
            type="button"
            className="student-nav-item active"
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

          <div className="page-title-row">

            <div className="page-title-icon">
              <Target size={20} />
            </div>

            <div>
              <h1>Assessment Results</h1>

              <p>
                Review your approved scores, feedback,
                and areas for improvement.
              </p>
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
              <h2>Your Results</h2>

              <p>
                Results appear here after your teacher
                approves your submission.
              </p>
            </div>

            <span className="assessment-count">
              {approvedSubmissions.length} results
            </span>

          </div>

          {/* Empty State */}
          {approvedSubmissions.length === 0 ? (
            <div className="assessment-empty">

              <div className="assessment-empty-icon">
                <Target size={25} />
              </div>

              <h3>No results available yet</h3>

              <p>
                Complete an assessment and wait for your
                teacher to approve your submission.
              </p>

              <button
                type="button"
                className="assessment-secondary-btn"
                onClick={onAvailableAssessments}
              >
                View Available Assessments
              </button>

            </div>
          ) : (
            <div className="results-list">

              {approvedSubmissions.map(
                (submission, index) => {

                  const assessment =
                    assessments.find(
                      (item) =>
                        item.id ===
                        submission.assessmentId
                    );

                  const result =
                    submission.evaluation;

                  const questionResults =
                    submission.aiEvaluations || [];

                  const resultId =
                    submission.id ??
                    `${submission.assessmentId}-${index}`;

                  const isExpanded =
                    Boolean(
                      expandedResults[resultId]
                    );

                  const totalScore =
                    result.totalScore ?? 0;

                  const totalMarks =
                    result.totalMarks ?? 0;

                  const percentage =
                    result.percentage ??
                    (totalMarks
                      ? Math.round(
                          (totalScore / totalMarks) *
                            100
                        )
                      : 0);

                  return (
                    <article
                      className="result-card"
                      key={resultId}
                    >

                      {/* Result Header */}
                      <div className="result-card-header">

                        <div className="result-title-area">

                          <div className="result-icon">
                            <CheckCircle2 size={20} />
                          </div>

                          <div>
                            <h3>
                              {submission.assessmentName ||
                                assessment?.name ||
                                assessment?.title ||
                                "Assessment"}
                            </h3>

                            <p>
                              Reviewed and approved by your teacher
                            </p>
                          </div>

                        </div>

                        <div className="result-score">

                          <strong>
                            {totalScore}
                            <span>
                              /{totalMarks}
                            </span>
                          </strong>

                          <small>
                            {percentage}%
                          </small>

                        </div>

                      </div>

                      {/* Summary */}
                      <div className="result-summary">

                        <div>
                          <FileQuestion size={15} />

                          <div>
                            <span>Questions</span>
                            <strong>
                              {questionResults.length ||
                                assessment?.questions?.length ||
                                0}
                            </strong>
                          </div>
                        </div>

                        <div>
                          <Award size={15} />

                          <div>
                            <span>Marks</span>
                            <strong>
                              {totalScore}/{totalMarks}
                            </strong>
                          </div>
                        </div>

                        <div>
                          <Target size={15} />

                          <div>
                            <span>Percentage</span>
                            <strong>
                              {percentage}%
                            </strong>
                          </div>
                        </div>

                        <div>
                          <CheckCircle2 size={15} />

                          <div>
                            <span>Status</span>
                            <strong>
                              Approved
                            </strong>
                          </div>
                        </div>

                      </div>

                      {/* Expand Button */}
                      <button
                        type="button"
                        className="result-details-btn"
                        onClick={() =>
                          toggleResult(resultId)
                        }
                      >
                        <MessageSquareText size={15} />

                        {isExpanded
                          ? "Hide Question-wise Feedback"
                          : "View Question-wise Feedback"}

                        {isExpanded ? (
                          <ChevronUp size={15} />
                        ) : (
                          <ChevronDown size={15} />
                        )}
                      </button>

                      {/* Details */}
                      {isExpanded && (
                        <div className="result-question-list">

                          {questionResults.length === 0 ? (
                            <div className="no-question-feedback">
                              Question-wise feedback is not
                              available for this submission.
                            </div>
                          ) : (
                            questionResults.map(
                              (
                                evaluation,
                                questionIndex
                              ) => {

                                const question =
                                  assessment?.questions?.[
                                    questionIndex
                                  ];

                                const maxScore =
                                  evaluation.maxScore ??
                                  question?.marks ??
                                  0;

                                return (
                                  <div
                                    className="result-question-card"
                                    key={
                                      question?.id ??
                                      questionIndex
                                    }
                                  >

                                    <div className="question-top">

                                      <span className="question-number">
                                        Q
                                        {questionIndex + 1}
                                      </span>

                                      <div className="question-content">

                                        <h4>
                                          {question?.question ||
                                            "Question"}
                                        </h4>

                                        <div className="question-score">
                                          {evaluation.score ??
                                            0}
                                          /
                                          {maxScore}
                                        </div>

                                      </div>

                                    </div>

                                    {evaluation.feedback && (
                                      <div className="feedback-box">

                                        <div className="feedback-title">
                                          <MessageSquareText
                                            size={14}
                                          />

                                          Feedback
                                        </div>

                                        <p>
                                          {
                                            evaluation.feedback
                                          }
                                        </p>

                                      </div>
                                    )}

                                    {evaluation.correction && (
                                      <div className="correction-box">

                                        <div className="correction-title">
                                          Suggested
                                          Correction
                                        </div>

                                        <p>
                                          {
                                            evaluation.correction
                                          }
                                        </p>

                                      </div>
                                    )}

                                  </div>
                                );
                              }
                            )
                          )}

                        </div>
                      )}

                    </article>
                  );
                }
              )}

            </div>
          )}

        </section>
      </main>
    </div>
  );
}

export default AssessmentResults;
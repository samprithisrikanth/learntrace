import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  AlertCircle,
} from "lucide-react";

import { evaluateAnswer } from "../../utils/evaluation";
import { evaluateAnswerWithAI } from "../../utils/aiEvaluation";

function ReviewAnswers({ onBack }) {
  const [submissions, setSubmissions] = useState(() =>
    JSON.parse(
      localStorage.getItem("learntrace_submissions")
    ) || []
  );

  const [selectedSubmission, setSelectedSubmission] =
    useState(null);

  const [aiEvaluations, setAiEvaluations] =
    useState([]);

  const [teacherEdits, setTeacherEdits] =
  useState([]);

  const [aiLoading, setAiLoading] =
    useState(false);

  const [aiError, setAiError] =
    useState("");

  /* =========================
     AI OVERALL SCORE
  ========================= */

  const calculateAIOverallScore = (
    evaluations,
    assessment
  ) => {
    if (
      !evaluations ||
      evaluations.length === 0 ||
      !assessment
    ) {
      return null;
    }

    let totalScore = 0;
    let totalMarks = 0;

    const conceptScores = {};

    evaluations.forEach((evaluation, index) => {
      const question =
        assessment.questions[index];

      if (!question || !evaluation) {
        return;
      }

      totalScore += Number(evaluation.score) || 0;
      totalMarks += Number(question.marks) || 0;

      const concept =
        evaluation.concept ||
        question.concept ||
        "General";

      if (!conceptScores[concept]) {
        conceptScores[concept] = {
          score: 0,
          marks: 0,
        };
      }

      conceptScores[concept].score +=
        Number(evaluation.score) || 0;

      conceptScores[concept].marks +=
        Number(question.marks) || 0;
    });

    const percentage =
      totalMarks > 0
        ? Math.round(
            (totalScore / totalMarks) * 100
          )
        : 0;

    const concepts = Object.entries(
      conceptScores
    ).map(([concept, data]) => {
      const mastery =
        data.marks > 0
          ? Math.round(
              (data.score / data.marks) * 100
            )
          : 0;

      let status;

      if (mastery >= 80) {
        status = "Strong";
      } else if (mastery >= 65) {
        status = "Good";
      } else if (mastery >= 45) {
        status = "Practice";
      } else {
        status = "Needs Attention";
      }

      return {
        concept,
        score: data.score,
        marks: data.marks,
        mastery,
        status,
      };
    });

    const weakConcepts = concepts.filter(
      (concept) => concept.mastery < 65
    );

    const strongConcepts = concepts.filter(
      (concept) => concept.mastery >= 80
    );

    return {
      totalScore,
      totalMarks,
      percentage,
      concepts,
      weakConcepts,
      strongConcepts,
    };
  };

  /* =========================
     RUN AI EVALUATION
  ========================= */

  const runAIEvaluation = async (
    submission
  ) => {
    const assessments =
      JSON.parse(
        localStorage.getItem(
          "learntrace_assessments"
        )
      ) || [];

    const assessment = assessments.find(
      (item) =>
        item.id === submission.assessmentId
    );

    if (!assessment) {
      setAiError(
        "Assessment could not be found."
      );
      return;
    }

    try {
      setAiLoading(true);
      setAiError("");
      setAiEvaluations([]);

      const results = [];

      for (
        let index = 0;
        index < assessment.questions.length;
        index++
      ) {
        const question =
          assessment.questions[index];

        const studentAnswer =
          submission.answers[index] || "";

        const evaluation =
          await evaluateAnswerWithAI({
            question: question.question,
            expectedAnswer:
              question.expectedAnswer,
            studentAnswer,
            rubric: question.rubric,
            concept: question.concept,
            maxMarks: question.marks,
          });

        results.push(evaluation);
      }

      setAiEvaluations(results);

setTeacherEdits(
  results.map((evaluation) => ({
    score: evaluation.score,
    feedback: evaluation.feedback || "",
    practiceRecommended: false,
  }))
);
    } catch (error) {
      console.error(
        "AI evaluation error:",
        error
      );

      setAiError(
        "Evaluation failed. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  };

  /* =========================
     APPROVE REVIEW
  ========================= */

  const handleApprove = () => {
    if (
      !selectedSubmission ||
      aiEvaluations.length === 0
    ) {
      setAiError(
        "Please wait for the evaluation to complete."
      );
      return;
    }

    const assessments =
      JSON.parse(
        localStorage.getItem(
          "learntrace_assessments"
        )
      ) || [];

    const assessment = assessments.find(
  (item) =>
    item.id === selectedSubmission.assessmentId
);

// Validate teacher-edited marks
const invalidScore = teacherEdits.some(
  (edit, index) => {
    const maxMarks = Number(
      assessment?.questions[index]?.marks
    );

    const score = Number(edit?.score);

    return (
      !Number.isFinite(score) ||
      score < 0 ||
      score > maxMarks
    );
  }
);

if (invalidScore) {
  setAiError(
    "Please enter valid marks within each question's maximum score."
  );
  return;
}

// Calculate the final overall score
const finalEvaluations =
  aiEvaluations.map(
    (evaluation, index) => ({
      ...evaluation,

      score: Number(
        teacherEdits[index]?.score ??
        evaluation.score
      ),

      feedback:
        teacherEdits[index]?.feedback ??
        evaluation.feedback ??
        "",

      practiceRecommended:
        teacherEdits[index]?.practiceRecommended ??
        false,
    })
  );

const overallResult = assessment
  ? calculateAIOverallScore(
      finalEvaluations,
      assessment
    )
  : null;

    const updatedSubmissions =
      submissions.map(
        (submission) =>
          submission.id ===
          selectedSubmission.id
            ? {
                ...submission,

                // Teacher approval
                status: "approved",

                // Save AI-based overall evaluation
                evaluation: overallResult,

                // Save individual AI evaluations
                aiEvaluations:
                  finalEvaluations,

                // Save approval time
                approvedAt:
                  new Date().toISOString(),
              }
            : submission
      );

    setSubmissions(updatedSubmissions);

    localStorage.setItem(
      "learntrace_submissions",
      JSON.stringify(
        updatedSubmissions
      )
    );

    alert(
      "Review approved successfully!"
    );

    setSelectedSubmission(null);
    setAiEvaluations([]);
    setTeacherEdits([]);
  };

  /* =========================
     SUBMISSION DETAILS
  ========================= */

  if (selectedSubmission) {
    const assessments =
      JSON.parse(
        localStorage.getItem(
          "learntrace_assessments"
        )
      ) || [];

    const assessment = assessments.find(
      (item) =>
        item.id ===
        selectedSubmission.assessmentId
    );

    const reviewedEvaluations =
  aiEvaluations.map(
    (evaluation, index) => {
      const edit = teacherEdits[index];

      return {
        ...evaluation,
        score: Number(
          edit?.score ?? evaluation.score
        ),
        feedback:
          edit?.feedback ??
          evaluation.feedback ??
          "",
      };
    }
  );

  const finalEvaluations =
  aiEvaluations.map(
    (evaluation, index) => ({
      ...evaluation,
      score: Number(
        teacherEdits[index]?.score ??
        evaluation.score
      ),
      feedback:
        teacherEdits[index]?.feedback ??
        evaluation.feedback ??
        "",
    })
  );

const overallResult = assessment
  ? calculateAIOverallScore(
      finalEvaluations,
      assessment
    )
  : null;

    return (
      <div className="review-page">

        {/* Header */}

        <header className="review-header">

          <button
            className="back-button"
            onClick={() => {
              setSelectedSubmission(null);
              setAiEvaluations([]);
              setTeacherEdits([]);
              setAiError("");
            }}
          >
            <ArrowLeft size={18} />
            Back to Submissions
          </button>

          <div>
            <h1>
              Review Student Answer
            </h1>

            <p>
              {selectedSubmission.studentName} •{" "}
              {selectedSubmission.assessmentName}
            </p>
          </div>

        </header>

        {/* Review Content */}

        <main className="review-content">

          {/* AI LOADING */}

          {aiLoading && (
            <div className="ai-loading-box">
              <strong>
                Evaluating the submission...
              </strong>

              <p>
               The student's answers are being
               reviewed against the expected answers,
               concepts, and rubric.
              </p>
            </div>
          )}

          {/* AI ERROR */}

          {aiError && (
            <div className="ai-error-box">
              <strong>
                Evaluation Error
              </strong>

              <p>
                {aiError}
              </p>
            </div>
          )}

          {/* =========================
              OVERALL SCORE
          ========================= */}

          {overallResult && (
            <div className="overall-result-card">

              <div className="overall-score-section">

                <span className="overall-label">
                  Overall Score
                </span>

                <div className="overall-score">
                  {overallResult.percentage}%
                </div>

                <span className="overall-marks">
                  {overallResult.totalScore} /{" "}
                  {overallResult.totalMarks} marks
                </span>

              </div>

              <div className="overall-summary">

                <div>
                  <span>
                    Strong Concepts
                  </span>

                  <strong>
                    {
                      overallResult
                        .strongConcepts
                        .length
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Concepts to Improve
                  </span>

                  <strong>
                    {
                      overallResult
                        .weakConcepts
                        .length
                    }
                  </strong>
                </div>

              </div>

            </div>
          )}

          {/* =========================
              CONCEPT MASTERY
          ========================= */}

          {overallResult &&
            overallResult.concepts.length > 0 && (
              <div className="concept-mastery-card">

                <div className="concept-mastery-header">

                  <div>
                    <h2>
                      Concept Mastery
                    </h2>

                    <p>
                      Performance across
                      assessed concepts
                    </p>
                  </div>

                </div>

                <div className="concept-mastery-list">

                  {overallResult.concepts.map(
                    (concept) => (
                      <div
                        className="concept-mastery-item"
                        key={concept.concept}
                      >

                        <div className="concept-mastery-info">

                          <div>
                            <strong>
                              {concept.concept}
                            </strong>

                            <span>
                              {concept.status}
                            </span>
                          </div>

                          <strong>
                            {concept.mastery}%
                          </strong>

                        </div>

                        <div className="concept-progress-track">

                          <div
                            className="concept-progress-fill"
                            style={{
                              width: `${concept.mastery}%`,
                            }}
                          />

                        </div>

                      </div>
                    )
                  )}

                </div>

              </div>
            )}

          {/* =========================
              QUESTION REVIEWS
          ========================= */}

          {assessment?.questions.map(
            (question, index) => {

              const studentAnswer =
                selectedSubmission
                  .answers[index] || "";

              const aiEvaluation =
                aiEvaluations[index];

              const evaluation =
                aiEvaluation ||
                evaluateAnswer(
                  studentAnswer,
                  question
                );

              return (
                <div
                  className="review-question-card"
                  key={question.id}
                >

                  {/* Question Header */}

                  <div className="review-question-top">

                    <div>

                      <span className="review-question-number">
                        Question {index + 1}
                      </span>

                      <h2>
                        {question.question}
                      </h2>

                    </div>

                    <span className="review-marks">
                      {question.marks} Marks
                    </span>

                  </div>

                  {/* Student Answer */}

                  <div className="review-section">

                    <h3>
                      Student Answer
                    </h3>

                    <div className="student-answer-display">
                      {studentAnswer ||
                        "No answer provided."}
                    </div>

                  </div>

                  {/* Expected Answer */}

                  <div className="review-section">

                    <h3>
                      Expected Answer
                    </h3>

                    <div className="expected-answer-display">
                      {question.expectedAnswer}
                    </div>

                  </div>

                  {/* Evaluation */}

                  <div className="review-evaluation">

                    <div className="teacher-score-editor">
  <label>
    Teacher-Reviewed Score
  </label>

  <div className="teacher-score-input-row">
    <input
      type="number"
      min="0"
      max={question.marks}
      step="0.5"
      value={
        teacherEdits[index]?.score ??
        evaluation.score
      }
      disabled={aiLoading || !aiEvaluations[index]}
      onChange={(event) => {
        const value = event.target.value;

        setTeacherEdits((previous) =>
          previous.map((edit, editIndex) =>
            editIndex === index
              ? {
                  ...edit,
                  score: value,
                }
              : edit
          )
        );
      }}
    />

    <span>
      / {question.marks} marks
    </span>
  </div>

  <small>
    Suggested score: {aiEvaluations[index]?.score ?? "—"} / {question.marks}
  </small>
</div>

                    <div>
                      <span>
                        Concept
                      </span>

                      <strong>
                        {evaluation.concept ||
                          question.concept}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Evaluation Confidence
                      </span>

                      <strong>
                        {evaluation.confidence}%
                      </strong>
                    </div>

                    <div>
                      <span>
                        Concept Status
                      </span>

                      <strong>
                        {evaluation.status}
                      </strong>
                    </div>

                    <div className="teacher-practice-decision">
  <span>
    Practice Recommendation
  </span>

  <div className="practice-recommendation-options">

    <label>
      <input
        type="radio"
        name={`practice-${selectedSubmission.id}-${index}`}
        checked={
          !teacherEdits[index]?.practiceRecommended
        }
        disabled={
          aiLoading ||
          !aiEvaluations[index]
        }
        onChange={() => {
          setTeacherEdits((previous) =>
            previous.map(
              (edit, editIndex) =>
                editIndex === index
                  ? {
                      ...edit,
                      practiceRecommended: false,
                    }
                  : edit
            )
          );
        }}
      />

      <span>No practice needed</span>
    </label>

    <label>
      <input
        type="radio"
        name={`practice-${selectedSubmission.id}-${index}`}
        checked={
          teacherEdits[index]?.practiceRecommended ===
          true
        }
        disabled={
          aiLoading ||
          !aiEvaluations[index]
        }
        onChange={() => {
          setTeacherEdits((previous) =>
            previous.map(
              (edit, editIndex) =>
                editIndex === index
                  ? {
                      ...edit,
                      practiceRecommended: true,
                    }
                  : edit
            )
          );
        }}
      />

      <span>Recommend practice</span>
    </label>

  </div>
</div>

                  </div>

                  {/* AI Feedback */}

                  <div className="ai-feedback-box">

                    <div className="ai-feedback-title">

                      <AlertCircle size={17} />

                      Assessment Feedback

                    </div>

                    <textarea
  className="teacher-feedback-input"
  value={
    teacherEdits[index]?.feedback ??
    evaluation.feedback ??
    ""
  }
  disabled={aiLoading || !aiEvaluations[index]}
  onChange={(event) => {
    const value = event.target.value;

    setTeacherEdits((previous) =>
      previous.map((edit, editIndex) =>
        editIndex === index
          ? {
              ...edit,
              feedback: value,
            }
          : edit
      )
    );
  }}
/>

                    {/* Understood */}

                    {evaluation.understood &&
                      evaluation.understood
                        .length > 0 && (

                        <div className="evaluation-mistakes">

                          <strong>
                            What the student understood
                          </strong>

                          <ul>
                            {evaluation.understood.map(
                              (
                                item,
                                itemIndex
                              ) => (
                                <li
                                  key={
                                    itemIndex
                                  }
                                >
                                  {item}
                                </li>
                              )
                            )}
                          </ul>

                        </div>
                      )}

                    {/* Missing */}

                    {evaluation.missing &&
                      evaluation.missing
                        .length > 0 && (

                        <div className="evaluation-mistakes">

                          <strong>
                            Missing Concepts
                          </strong>

                          <ul>
                            {evaluation.missing.map(
                              (
                                item,
                                itemIndex
                              ) => (
                                <li
                                  key={
                                    itemIndex
                                  }
                                >
                                  {item}
                                </li>
                              )
                            )}
                          </ul>

                        </div>
                      )}

                    {/* Mistakes */}

                    {evaluation.mistakes &&
                      evaluation.mistakes
                        .length > 0 && (

                        <div className="evaluation-mistakes">

                          <strong>
                            Areas to Improve
                          </strong>

                          <ul>
                            {evaluation.mistakes.map(
                              (
                                mistake,
                                mistakeIndex
                              ) => (
                                <li
                                  key={
                                    mistakeIndex
                                  }
                                >
                                  {mistake}
                                </li>
                              )
                            )}
                          </ul>

                        </div>
                      )}

                  </div>

                  {/* Suggested Correction */}

                  {evaluation.correction && (
                    <div className="correction-box">

                      <h3>
                        Suggested Correction
                      </h3>

                      <p>
                        {evaluation.correction}
                      </p>

                    </div>
                  )}

                </div>
              );
            }
          )}

          {/* =========================
              TEACHER ACTION
          ========================= */}

          <div className="teacher-review-actions">

            <button
              className="approve-review-button"
              onClick={handleApprove}
              disabled={
                aiLoading ||
                aiEvaluations.length === 0
              }
            >
              <CheckCircle2 size={18} />

              {aiLoading
                ? "Evaluating..."
                : "Approve Review"}
            </button>

          </div>

        </main>

      </div>
    );
  }

  /* =========================
     SUBMISSION LIST
  ========================= */

  return (
    <div className="review-page">

      {/* Header */}

      <header className="review-header">

        <button
          className="back-button"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div>

          <h1>
            Review Answers
          </h1>

          <p>
            Review and approve student
            submissions
          </p>

        </div>

      </header>

      {/* Content */}

      <main className="review-content">

        {/* Statistics */}

        <div className="review-stats">

          <div className="review-stat-card">

            <Clock3 size={20} />

            <div>

              <span>
                Pending Reviews
              </span>

              <strong>
                {
                  submissions.filter(
                    (item) =>
                      item.status !==
                      "approved"
                  ).length
                }
              </strong>

            </div>

          </div>

          <div className="review-stat-card">

            <CheckCircle2 size={20} />

            <div>

              <span>
                Reviewed
              </span>

              <strong>
                {
                  submissions.filter(
                    (item) =>
                      item.status ===
                      "approved"
                  ).length
                }
              </strong>

            </div>

          </div>

        </div>

        {/* No Submissions */}

        {submissions.length === 0 ? (

          <div className="empty-review-state">

            <h2>
              No submissions yet
            </h2>

            <p>
              Student submissions will appear
              here after they complete an
              assessment.
            </p>

          </div>

        ) : (

          <div className="submission-list">

            {submissions.map(
              (submission) => (

                <div
                  className="submission-card"
                  key={submission.id}
                >

                  <div>

                    <h2>
                      {submission.studentName}
                    </h2>

                    <p>
                      {submission.assessmentName}
                    </p>

                    <span>
                      Submitted{" "}
                      {new Date(
                        submission.submittedAt
                      ).toLocaleString()}
                    </span>

                  </div>

                  <div className="submission-card-right">

                    {submission.status ===
                    "approved" ? (

                      <span className="approved-status">

                        <CheckCircle2
                          size={15}
                        />

                        Approved

                      </span>

                    ) : (

                      <span className="pending-status">

                        <Clock3
                          size={15}
                        />

                        Pending Review

                      </span>

                    )}

                    <button
                      className="review-answer-button"
                      onClick={() => {
                        setSelectedSubmission(
                          submission
                        );

                        setAiEvaluations([]);

                        setAiError("");

                        runAIEvaluation(
                          submission
                        );
                      }}
                    >
                      Review
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </main>

    </div>
  );
}

export default ReviewAnswers;
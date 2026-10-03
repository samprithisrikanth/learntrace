import { useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react";

function StudentAssessment({
  assessment,
  onBack,
  onSubmit,
}) {
  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answers, setAnswers] = useState(
    assessment.questions.map(() => "")
  );

  const questions = assessment.questions || [];

  const question =
    questions[currentQuestion];

  const totalQuestions = questions.length;

  const isLastQuestion =
    currentQuestion === totalQuestions - 1;

  const answeredCount = answers.filter(
    (answer) => answer.trim().length > 0
  ).length;

  const progress =
    totalQuestions > 0
      ? Math.round(
          (answeredCount / totalQuestions) * 100
        )
      : 0;

  const handleAnswerChange = (value) => {
    const updatedAnswers = [...answers];

    updatedAnswers[currentQuestion] = value;

    setAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestion(
        currentQuestion + 1
      );
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(
        currentQuestion - 1
      );
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  const handleSubmit = () => {
    const unansweredQuestions =
      answers.filter(
        (answer) => answer.trim().length === 0
      ).length;

    if (unansweredQuestions > 0) {
      const shouldSubmit = window.confirm(
        `You have ${unansweredQuestions} unanswered question${
          unansweredQuestions > 1 ? "s" : ""
        }. Are you sure you want to submit?`
      );

      if (!shouldSubmit) {
        return;
      }
    } else {
      const shouldSubmit = window.confirm(
        "Are you sure you want to submit this assessment?"
      );

      if (!shouldSubmit) {
        return;
      }
    }

    const submission = {
      id: Date.now(),
      assessmentId: assessment.id,
      assessmentName: assessment.name,
      studentName: "Samprithi",
      answers: answers,
      submittedAt: new Date().toISOString(),
    };

    const existingSubmissions =
      JSON.parse(
        localStorage.getItem(
          "learntrace_submissions"
        )
      ) || [];

    localStorage.setItem(
      "learntrace_submissions",
      JSON.stringify([
        ...existingSubmissions,
        submission,
      ])
    );

    onSubmit();
  };

  if (!assessment || questions.length === 0) {
    return (
      <div className="student-assessment-page">
        <div className="student-question-container">
          <div className="student-question-card">
            <AlertCircle size={32} />

            <h2>
              Assessment unavailable
            </h2>

            <p>
              This assessment does not contain
              any questions.
            </p>

            <button
              className="back-button"
              onClick={onBack}
            >
              <ArrowLeft size={18} />
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-assessment-page">

      {/* Header */}
      <header className="student-assessment-header">

        <button
          className="back-button"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div>
          <h1>{assessment.name}</h1>

          <p>
            {assessment.subject || "Subject"}{" "}
            •{" "}
            {assessment.className || "Class"}
          </p>
        </div>

      </header>


      {/* Assessment Overview */}
      <div className="assessment-overview">

        <div>
          <span>Progress</span>

          <strong>
            {answeredCount} / {totalQuestions} answered
          </strong>
        </div>

        <div>
          <span>Current Question</span>

          <strong>
            {currentQuestion + 1} /{" "}
            {totalQuestions}
          </strong>
        </div>

        <div>
          <span>Marks</span>

          <strong>
            {question.marks}
          </strong>
        </div>

      </div>


      {/* Progress Bar */}
      <div className="assessment-progress-bar-container">
        <div
          className="assessment-progress-bar"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>


      {/* Question Navigation */}
      <div className="assessment-question-navigation">

        <div className="question-navigation-header">
          <span>Questions</span>

          <span>
            {answeredCount} answered
          </span>
        </div>

        <div className="question-navigation-list">

          {questions.map(
            (item, index) => {

              const isAnswered =
                answers[index].trim().length > 0;

              const isCurrent =
                currentQuestion === index;

              return (
                <button
                  key={item.id || index}
                  type="button"
                  className={`question-navigation-item ${
                    isCurrent
                      ? "active"
                      : ""
                  } ${
                    isAnswered
                      ? "answered"
                      : ""
                  }`}
                  onClick={() =>
                    goToQuestion(index)
                  }
                >
                  <span>
                    {isAnswered ? (
                      <CheckCircle2
                        size={16}
                      />
                    ) : (
                      <Circle size={16} />
                    )}
                  </span>

                  <span>
                    Q{index + 1}
                  </span>
                </button>
              );
            }
          )}

        </div>
      </div>


      {/* Question */}
      <main className="student-question-container">

        <div className="student-question-card">

          <div className="question-number">
            Question{" "}
            {currentQuestion + 1}
          </div>

          <h2>
            {question.question}
          </h2>

          {question.concept && (
            <div className="student-concept">
              Concept: {question.concept}
            </div>
          )}


          {/* Answer */}
          <label className="answer-label">
            Your Answer
          </label>

          <textarea
            className="student-answer-box"
            value={
              answers[currentQuestion]
            }
            onChange={(e) =>
              handleAnswerChange(
                e.target.value
              )
            }
            placeholder="Type your answer here..."
          />


          {/* Actions */}
          <div className="student-assessment-actions">

            <span>
              {answers[currentQuestion].length}{" "}
              characters
            </span>

            <div className="assessment-navigation-actions">

              <button
                type="button"
                className="student-previous-button"
                onClick={handlePrevious}
                disabled={
                  currentQuestion === 0
                }
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              {!isLastQuestion ? (

                <button
                  type="button"
                  className="student-next-button"
                  onClick={handleNext}
                >
                  Save & Next
                  <ChevronRight
                    size={18}
                  />
                </button>

              ) : (

                <button
                  type="button"
                  className="student-submit-button"
                  onClick={handleSubmit}
                >
                  <CheckCircle2
                    size={18}
                  />
                  Submit Assessment
                </button>

              )}

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default StudentAssessment;
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronRight,
} from "lucide-react";

const practiceQuestions = {
  Arrays: [
    {
      question: "Which operation provides constant-time access in an array?",
      options: [
        "Searching",
        "Indexing",
        "Sorting",
        "Traversal",
      ],
      correctAnswer: "Indexing",
      explanation:
        "Array elements can be accessed directly using their index, so indexing takes constant time.",
    },
    {
      question:
        "Which property is true about a traditional fixed-size array?",
      options: [
        "It stores values of different data types only",
        "Its size can never be determined",
        "Its size is fixed after creation",
        "It always stores objects",
      ],
      correctAnswer: "Its size is fixed after creation",
      explanation:
        "A traditional array has a fixed size that is determined when the array is created.",
    },
  ],

  "Linked Lists": [
    {
      question:
        "Which part of a linked-list node stores the reference to the next node?",
      options: [
        "Data field",
        "Index",
        "Pointer/reference field",
        "Length field",
      ],
      correctAnswer: "Pointer/reference field",
      explanation:
        "Each linked-list node contains a reference that points to the next node.",
    },
    {
      question:
        "What is a major advantage of inserting a node at the beginning of a linked list?",
      options: [
        "It always requires sorting",
        "It can be done in constant time",
        "It requires accessing every node",
        "It removes the first node",
      ],
      correctAnswer: "It can be done in constant time",
      explanation:
        "When the head reference is available, inserting a node at the beginning requires only a few reference updates.",
    },
  ],

  Stacks: [
    {
      question: "Which principle does a stack follow?",
      options: [
        "FIFO",
        "LIFO",
        "Random access",
        "Priority based access",
      ],
      correctAnswer: "LIFO",
      explanation:
        "A stack follows Last In, First Out, meaning the most recently added element is removed first.",
    },
    {
      question:
        "Which operation removes the top element from a stack?",
      options: [
        "Push",
        "Peek",
        "Pop",
        "Insert",
      ],
      correctAnswer: "Pop",
      explanation:
        "The pop operation removes the element currently at the top of the stack.",
    },
  ],

  Queues: [
    {
      question: "Which principle does a queue follow?",
      options: [
        "LIFO",
        "FIFO",
        "Random access",
        "Reverse order",
      ],
      correctAnswer: "FIFO",
      explanation:
        "A queue follows First In, First Out, so the earliest inserted element is removed first.",
    },
    {
      question: "Which operation adds an element to a queue?",
      options: [
        "Pop",
        "Dequeue",
        "Push",
        "Enqueue",
      ],
      correctAnswer: "Enqueue",
      explanation:
        "Enqueue adds a new element to the rear of a queue.",
    },
  ],

  Recursion: [
    {
      question: "What is essential for a recursive function to stop?",
      options: [
        "A loop",
        "A base case",
        "A global variable",
        "An array",
      ],
      correctAnswer: "A base case",
      explanation:
        "A base case provides the stopping condition that prevents recursive calls from continuing indefinitely.",
    },
    {
      question:
        "What happens when a recursive function calls itself?",
      options: [
        "A new recursive call is created",
        "The program always stops",
        "The function is deleted",
        "The loop is skipped",
      ],
      correctAnswer: "A new recursive call is created",
      explanation:
        "A recursive function invokes itself with a smaller or changed input until it reaches its base case.",
    },
  ],

  "Time Complexity": [
    {
      question:
        "What is the time complexity of accessing an element by index in an array?",
      options: [
        "O(n)",
        "O(log n)",
        "O(1)",
        "O(n²)",
      ],
      correctAnswer: "O(1)",
      explanation:
        "An array provides direct access to an element using its index, so the access takes constant time.",
    },
    {
      question:
        "What is the time complexity of traversing all elements in an array of n elements?",
      options: [
        "O(1)",
        "O(log n)",
        "O(n)",
        "O(n²)",
      ],
      correctAnswer: "O(n)",
      explanation:
        "Every element must be visited once, so the number of operations grows linearly with n.",
    },
  ],
};

function Practice({ concept, onBack }) {
  const questions = useMemo(() => {
    return practiceQuestions[concept] || practiceQuestions.Arrays;
  }, [concept]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  const question = questions[currentQuestion];

  const progress = Math.round(
    ((currentQuestion + (isChecked ? 1 : 0)) / questions.length) * 100
  );

  const isCorrect = selectedAnswer === question?.correctAnswer;

  useEffect(() => {
    if (!completed || !finalResult) {
      return;
    }

    const existingResults =
      JSON.parse(
        localStorage.getItem("learntrace_practice_results")
      ) || [];

    const newResult = {
      id: Date.now(),
      studentName: "Samprithi",
      concept,
      score: finalResult.score,
      totalQuestions: questions.length,
      percentage: finalResult.percentage,
      completedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "learntrace_practice_results",
      JSON.stringify([
        ...existingResults,
        newResult,
      ])
    );
  }, [
    completed,
    finalResult,
    concept,
    questions.length,
  ]);

  const handleCheckAnswer = () => {
    if (!selectedAnswer || isChecked) {
      return;
    }

    setIsChecked(true);
  };

  const handleNext = () => {
    if (!isChecked) {
      return;
    }

    const updatedScore =
      score + (isCorrect ? 1 : 0);

    if (currentQuestion === questions.length - 1) {
      const percentage = Math.round(
        (updatedScore / questions.length) * 100
      );

      setScore(updatedScore);
      setFinalResult({
        score: updatedScore,
        percentage,
      });
      setCompleted(true);
      return;
    }

    setScore(updatedScore);
    setCurrentQuestion(
      (previous) => previous + 1
    );
    setSelectedAnswer("");
    setIsChecked(false);
  };

  const restartPractice = () => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setIsChecked(false);
    setScore(0);
    setCompleted(false);
    setFinalResult(null);
  };

  if (completed && finalResult) {
    return (
      <div className="practice-page">
        <header className="practice-header">
          <button
            type="button"
            className="practice-back-button"
            onClick={onBack}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="practice-header-content">
            <span className="practice-eyebrow">
              PRACTICE
            </span>

            <h1>Practice Complete</h1>

            <p>
              Review your performance and continue
              strengthening this concept.
            </p>
          </div>
        </header>

        <main className="practice-content">
          <section className="practice-result-card">
            <div className="practice-result-icon">
              <CheckCircle2 size={28} />
            </div>

            <span className="practice-result-label">
              {concept}
            </span>

            <h2>Practice completed</h2>

            <p>
              You answered {finalResult.score} of{" "}
              {questions.length} questions correctly.
            </p>

            <div className="practice-result-score">
              <strong>
                {finalResult.percentage}%
              </strong>

              <span>
                {finalResult.score} /{" "}
                {questions.length} correct
              </span>
            </div>

            <div className="practice-result-actions">
              <button
                type="button"
                className="practice-secondary-button"
                onClick={restartPractice}
              >
                <RotateCcw size={15} />
                Try Again
              </button>

              <button
                type="button"
                className="practice-primary-button"
                onClick={onBack}
              >
                Done
                <ChevronRight size={15} />
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="practice-page">
      <header className="practice-header">
        <button
          type="button"
          className="practice-back-button"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="practice-header-content">
          <span className="practice-eyebrow">
            PRACTICE
          </span>

          <h1>Practice {concept}</h1>

          <p>
            Strengthen your understanding through
            focused questions.
          </p>
        </div>
      </header>

      <main className="practice-content">

        {/* Topic / progress */}

        <section className="practice-topic-card">
          <div className="practice-topic-icon">
            <Brain size={19} />
          </div>

          <div className="practice-topic-info">
            <span>Current topic</span>
            <strong>{concept}</strong>
          </div>

          <div className="practice-question-count">
            <strong>
              {currentQuestion + 1}
            </strong>

            <span>
              / {questions.length}
            </span>
          </div>
        </section>

        <div className="practice-progress">
          <div className="practice-progress-header">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>

          <div className="practice-progress-track">
            <div
              className="practice-progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        {/* Question */}

        <section className="practice-question-card">

          <div className="practice-question-label">
            Question {currentQuestion + 1}
          </div>

          <h2>
            {question.question}
          </h2>

          <div className="practice-options">
            {question.options.map((option) => {
              const selected =
                selectedAnswer === option;

              const correct =
                isChecked &&
                option === question.correctAnswer;

              const incorrect =
                isChecked &&
                selected &&
                option !== question.correctAnswer;

              return (
                <button
                  type="button"
                  key={option}
                  disabled={isChecked}
                  onClick={() =>
                    setSelectedAnswer(option)
                  }
                  className={[
                    "practice-option",
                    selected
                      ? "selected"
                      : "",
                    correct
                      ? "correct"
                      : "",
                    incorrect
                      ? "incorrect"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="practice-option-radio">
                    {correct && (
                      <CheckCircle2 size={15} />
                    )}

                    {incorrect && (
                      <XCircle size={15} />
                    )}

                    {!correct &&
                      !incorrect &&
                      selected && (
                        <span />
                      )}
                  </span>

                  <span className="practice-option-text">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {isChecked && (
            <div
              className={[
                "practice-feedback",
                isCorrect
                  ? "correct"
                  : "incorrect",
              ].join(" ")}
            >
              <div className="practice-feedback-title">
                {isCorrect ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <XCircle size={17} />
                )}

                <span>
                  {isCorrect
                    ? "Correct!"
                    : "Not quite"}
                </span>
              </div>

              {!isCorrect && (
                <div className="practice-correct-answer">
                  <span>Correct answer</span>

                  <strong>
                    {question.correctAnswer}
                  </strong>
                </div>
              )}

              <div className="practice-explanation">
                <span>Why?</span>

                <p>
                  {question.explanation}
                </p>
              </div>
            </div>
          )}

          <div className="practice-action">
            {!isChecked ? (
              <button
                type="button"
                className="practice-primary-button practice-full-button"
                disabled={!selectedAnswer}
                onClick={handleCheckAnswer}
              >
                Check Answer
              </button>
            ) : (
              <button
                type="button"
                className="practice-primary-button practice-full-button"
                onClick={handleNext}
              >
                {currentQuestion ===
                questions.length - 1
                  ? "Finish Practice"
                  : "Next Question"}

                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Practice;
import {
  ArrowLeft,
  Brain,
  CalendarDays,
  CheckCircle2,
  Target,
  PlayCircle,
} from "lucide-react";

function WeeklyRevision({ onBack, onPractice }) {
  /* =========================
     CURRENT WEEK
  ========================= */

  const today = new Date();
  const dayOfWeek = today.getDay();

  const daysSinceMonday =
    dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const weekStart = new Date(today);

  weekStart.setDate(
    today.getDate() - daysSinceMonday
  );

  weekStart.setHours(0, 0, 0, 0);

  const year = weekStart.getFullYear();

  const month = String(
    weekStart.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    weekStart.getDate()
  ).padStart(2, "0");

  const weekKey = `${year}-${month}-${day}`;

  /* =========================
     LOAD SAVED DATA
  ========================= */

  const practiceResults =
    JSON.parse(
      localStorage.getItem(
        "learntrace_practice_results"
      ) || "[]"
    );

  const submissions =
    JSON.parse(
      localStorage.getItem(
        "learntrace_submissions"
      ) || "[]"
    );

  const approvedSubmissions =
    submissions.filter(
      (submission) =>
        submission.status === "approved" &&
        submission.evaluation
    );

  const latestSubmission =
    approvedSubmissions.length > 0
      ? approvedSubmissions[
          approvedSubmissions.length - 1
        ]
      : null;

  const latestEvaluation =
    latestSubmission?.evaluation || null;

  /* =========================
     CONCEPT MASTERY
  ========================= */

  const mockConcepts = [
    { name: "Arrays", score: 92 },
    { name: "Linked Lists", score: 68 },
    { name: "Stacks", score: 81 },
    { name: "Queues", score: 76 },
    { name: "Recursion", score: 61 },
    { name: "Time Complexity", score: 54 },
  ];

  const baseConcepts =
    latestEvaluation?.concepts?.length > 0
      ? latestEvaluation.concepts.map(
          (concept) => ({
            name: concept.concept,
            score: concept.mastery,
          })
        )
      : mockConcepts;

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

      if (latestPractice) {
        updatedScore = Math.round(
          concept.score * 0.7 +
            latestPractice.percentage * 0.3
        );
      }

      return {
        ...concept,
        score: updatedScore,
        latestPractice,
      };
    }
  );

  /* =========================
     QUESTION-LEVEL INSIGHTS
  ========================= */

  const questionEvaluations =
    latestSubmission?.aiEvaluations || [];

  const assessments =
    JSON.parse(
      localStorage.getItem(
        "learntrace_assessments"
      ) || "[]"
    );

  const latestAssessment =
    assessments.find(
      (assessment) =>
        assessment.id ===
        latestSubmission?.assessmentId
    );

  const questionInsights =
    questionEvaluations.map(
      (evaluation, index) => {
        const question =
          latestAssessment?.questions?.[index];

        const maxMarks =
          Number(question?.marks) || 0;

        const score =
          Number(evaluation?.score) || 0;

        const percentage =
          maxMarks > 0
            ? Math.round(
                (score / maxMarks) * 100
              )
            : null;

        const concept =
          evaluation?.concept ||
          question?.concept ||
          "General";

        const mistakes =
          Array.isArray(evaluation?.mistakes)
            ? evaluation.mistakes
            : [];

        const missing =
          Array.isArray(evaluation?.missing)
            ? evaluation.missing
            : [];

        /*
         * Teacher explicitly selected
         * this question for practice.
         */
        const teacherRecommended =
          evaluation?.practiceRecommended === true;

        return {
          concept,
          question:
            question?.question ||
            `Question ${index + 1}`,
          score,
          maxMarks,
          percentage,
          mistakes,
          missing,
          feedback:
            evaluation?.feedback || "",
          correction:
            evaluation?.correction || "",
          teacherRecommended,
        };
      }
    );

  /* =========================
     TEACHER RECOMMENDED TOPICS
  ========================= */

  const teacherRecommendedQuestions =
    questionInsights.filter(
      (item) =>
        item.teacherRecommended
    );

  /* =========================
     PRIORITIZE REVISION TOPICS
  ========================= */

  const revisionTopics = [...concepts]
    .map((concept) => {
      const relatedQuestions =
        questionInsights.filter(
          (item) =>
            item.concept === concept.name &&
            item.percentage !== null
        );

      const lowScoringQuestions =
        relatedQuestions.filter(
          (item) => item.percentage < 65
        );

      const teacherRecommendedQuestionsForTopic =
        relatedQuestions.filter(
          (item) =>
            item.teacherRecommended
        );

      const mistakeCount =
        relatedQuestions.reduce(
          (total, item) =>
            total + item.mistakes.length,
          0
        );

      const missingCount =
        relatedQuestions.reduce(
          (total, item) =>
            total + item.missing.length,
          0
        );

      let priority =
        100 - concept.score;

      /*
       * Teacher recommendation gets
       * the strongest additional priority.
       */
      if (
        teacherRecommendedQuestionsForTopic.length >
        0
      ) {
        priority += 40;
      }

      // Weak assessment answers
      if (lowScoringQuestions.length > 0) {
        priority +=
          lowScoringQuestions.length * 10;
      }

      // Evaluation evidence
      priority += Math.min(
        mistakeCount * 3,
        15
      );

      priority += Math.min(
        missingCount * 3,
        15
      );

      // Recent practice performance
      if (
        concept.latestPractice &&
        concept.latestPractice.percentage < 70
      ) {
        priority += 15;
      }

      let level = "Review";

      if (priority >= 60) {
        level = "High Priority";
      } else if (priority >= 35) {
        level = "Recommended";
      }

      return {
        ...concept,
        priority,
        level,
        relatedQuestions,
        lowScoringQuestions,
        mistakeCount,
        missingCount,
        teacherRecommended:
          teacherRecommendedQuestionsForTopic.length >
          0,
        teacherRecommendedQuestions:
          teacherRecommendedQuestionsForTopic,
      };
    })
    .sort(
      (a, b) => b.priority - a.priority
    )
    .slice(0, 4);

  /* =========================
     7-DAY PERSONALIZED PLAN
  ========================= */

  const dailyTasks = [
    {
      title: "Understand the concept",
      description:
        "Review the core ideas behind this topic.",
      activity: "Review notes",
    },
    {
      title: "Revisit a difficult question",
      description:
        "Read the feedback and suggested correction for a question you struggled with.",
      activity: "Review mistakes",
    },
    {
      title: "Learn with an example",
      description:
        "Work through an example related to your learning gap.",
      activity: "Study an example",
    },
    {
      title: "Practice questions",
      description:
        "Attempt questions on this topic without looking at the answers.",
      activity: "Practice",
    },
    {
      title: "Fix missing concepts",
      description:
        "Focus on the points you missed in your assessment.",
      activity: "Strengthen weak areas",
    },
    {
      title: "Self-assessment",
      description:
        "Test your understanding without referring to your notes.",
      activity: "Take a self-test",
    },
    {
      title: "Review your progress",
      description:
        "Revisit mistakes and summarize what you have learned.",
      activity: "Weekly recap",
    },
  ];

  const weeklyPlan = dailyTasks.map(
    (task, index) => {
      const topic =
        revisionTopics.length > 0
          ? revisionTopics[
              index % revisionTopics.length
            ]
          : null;

      const relatedQuestions =
        topic?.relatedQuestions || [];

      /*
       * Teacher-selected question gets
       * preference in the weekly plan.
       */
      const teacherQuestion =
        topic?.teacherRecommendedQuestions?.[0];

      const focusQuestion =
        teacherQuestion ||
        relatedQuestions.find(
          (item) =>
            item.percentage !== null &&
            item.percentage < 65
        ) ||
        relatedQuestions[0];

      let personalizedDescription =
        task.description;

      /* Teacher recommendation */
      if (
        topic?.teacherRecommended &&
        focusQuestion
      ) {
        personalizedDescription =
          `Your teacher recommended practicing this area. Focus on: "${focusQuestion.question}".`;
      }

      /* Difficult question */
      else if (
        topic &&
        focusQuestion &&
        index === 1
      ) {
        personalizedDescription =
          `Revisit this question: "${focusQuestion.question}". Review the feedback and suggested correction.`;
      }

      /* Missing concepts */
      if (
        !topic?.teacherRecommended &&
        topic &&
        topic.missingCount > 0 &&
        index === 4
      ) {
        personalizedDescription =
          `Focus on the missing points identified in your ${topic.name} assessment.`;
      }

      /* Mistakes */
      if (
        !topic?.teacherRecommended &&
        topic &&
        topic.mistakeCount > 0 &&
        index === 6
      ) {
        personalizedDescription =
          `Review the ${topic.mistakeCount} recorded mistake(s) in ${topic.name} and check whether you can correct them independently.`;
      }

      return {
        day: index + 1,
        ...task,
        description: personalizedDescription,
        concept:
          topic?.name || "General Revision",
        mastery: topic?.score ?? null,
        focusQuestion:
          focusQuestion?.question || null,
        teacherRecommended:
          topic?.teacherRecommended || false,
      };
    }
  );

  /* =========================
     DAILY COMPLETION TRACKING
  ========================= */

  const dailyCompletionKey =
    `learntrace_daily_revision_completed_${weekKey}`;

  const completedDays =
    JSON.parse(
      localStorage.getItem(
        dailyCompletionKey
      ) || "[]"
    );

  const isDayCompleted = (dayNumber) =>
    completedDays.includes(dayNumber);

  const markDayCompleted = (dayNumber) => {
    if (isDayCompleted(dayNumber)) {
      return;
    }

    const updated = [
      ...completedDays,
      dayNumber,
    ];

    localStorage.setItem(
      dailyCompletionKey,
      JSON.stringify(updated)
    );

    window.location.reload();
  };

  const completedDayCount =
    weeklyPlan.filter((task) =>
      isDayCompleted(task.day)
    ).length;

  /* =========================
     TOPIC COMPLETION TRACKING
  ========================= */

  const revisionStorageKey =
    `learntrace_revision_completed_${weekKey}`;

  const revisionCompleted =
    JSON.parse(
      localStorage.getItem(
        revisionStorageKey
      ) || "[]"
    );

  const isCompleted = (conceptName) =>
    revisionCompleted.some(
      (item) => item.concept === conceptName
    );

  const markCompleted = (conceptName) => {
    if (isCompleted(conceptName)) {
      return;
    }

    const updated = [
      ...revisionCompleted,
      {
        concept: conceptName,
        completedAt: new Date().toISOString(),
      },
    ];

    localStorage.setItem(
      revisionStorageKey,
      JSON.stringify(updated)
    );

    window.location.reload();
  };

  /* =========================
     PRACTICE NAVIGATION
  ========================= */

  const handlePractice = (conceptName) => {
    if (!onPractice) {
      return;
    }

    onPractice(conceptName);
  };

  /* =========================
     PAGE UI
  ========================= */

  return (
    <div className="revision-page">

      {/* Header */}

      <header className="revision-header">

        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div>
          <h1>Weekly Revision</h1>

          <p>
            Your personalized revision plan
          </p>
        </div>

      </header>

      <main className="revision-content">

        {/* Introduction */}

        <section className="revision-intro">

          <div className="revision-intro-icon">
            <Brain size={26} />
          </div>

          <div>

            <span>
              PERSONALIZED LEARNING PLAN
            </span>

            <h2>
              Focus on what needs your attention
              most.
            </h2>

            <p>
               Your revision plan is organized around
               your learning progress, assessment
               feedback, and teacher recommendations.
            </p>

          </div>

        </section>

        {/* Teacher Recommendation Banner */}

        {teacherRecommendedQuestions.length >
          0 && (
          <section className="teacher-revision-banner">

            <div className="teacher-revision-banner-icon">
              <Target size={20} />
            </div>

            <div>
              <strong>
                Teacher-recommended practice
              </strong>

              <p>
                Your teacher has selected{" "}
                {teacherRecommendedQuestions.length}{" "}
                question
                {teacherRecommendedQuestions.length !==
                1
                  ? "s"
                  : ""}{" "}
                for additional practice. These
                areas are prioritized in your
                revision plan.
              </p>
            </div>

          </section>
        )}

        {/* Stats */}

        <section className="revision-stats">

          <div className="revision-stat-card">

            <Target size={20} />

            <div>
              <span>Topics to Revise</span>

              <strong>
                {revisionTopics.length}
              </strong>
            </div>

          </div>

          <div className="revision-stat-card">

            <CalendarDays size={20} />

            <div>
              <span>Revision Cycle</span>

              <strong>This Week</strong>
            </div>

          </div>

          <div className="revision-stat-card">

            <CheckCircle2 size={20} />

            <div>
              <span>Completed</span>

              <strong>
                {
                  revisionTopics.filter(
                    (topic) =>
                      isCompleted(topic.name)
                  ).length
                }{" "}
                / {revisionTopics.length}
              </strong>
            </div>

          </div>

        </section>

        {/* 7-Day Personalized Plan */}

        <section className="revision-section">

          <div className="revision-section-heading">

            <div>

              <h2>Your 7-Day Schedule</h2>

              <p>
                Small daily steps to strengthen
                your learning.
              </p>

            </div>

          </div>

          {/* Weekly Progress */}

          <div className="weekly-plan-progress">

            <div className="weekly-plan-progress-heading">

              <span>
                Weekly progress
              </span>

              <strong>
                {completedDayCount} / 7 days
                completed
              </strong>

            </div>

            <div className="revision-topic-progress">

              <div
                style={{
                  width: `${
                    (completedDayCount / 7) * 100
                  }%`,
                }}
              />

            </div>

          </div>

          {/* Daily Tasks */}

          <div className="daily-plan-list">

            {weeklyPlan.map((task) => {

              const completed =
                isDayCompleted(task.day);

              return (
                <article
                  className={`daily-plan-card ${
                    completed
                      ? "completed"
                      : ""
                  }`}
                  key={task.day}
                >

                  <div className="daily-plan-day">

                    <span>DAY</span>

                    <strong>
                      {String(task.day).padStart(
                        2,
                        "0"
                      )}
                    </strong>

                  </div>

                  <div className="daily-plan-details">

                    <div className="daily-plan-title">

                      <h3>
                        {task.title}
                      </h3>

                      {completed && (
                        <span className="daily-plan-done">

                          <CheckCircle2
                            size={14}
                          />

                          Completed

                        </span>
                      )}

                    </div>

                    <p className="daily-plan-concept">

                      Focus:{" "}

                      <strong>
                        {task.concept}
                      </strong>

                      {task.mastery !== null &&
                        ` · ${task.mastery}% mastery`}

                    </p>

                    {task.teacherRecommended && (
                      <span className="teacher-recommended-tag">
                        Teacher Recommended
                      </span>
                    )}

                    <p>
                      {task.description}
                    </p>

                    <span className="daily-plan-activity">
                      {task.activity}
                    </span>

                  </div>

                  <div className="daily-plan-actions">

                    <button
                      type="button"
                      className="revision-practice-button"
                      onClick={() =>
                        handlePractice(
                          task.concept
                        )
                      }
                    >
                      <PlayCircle size={16} />
                      Start Revision
                    </button>

                    <button
                      type="button"
                      className={`revision-complete-button ${
                        completed
                          ? "completed"
                          : ""
                      }`}
                      disabled={completed}
                      onClick={() =>
                        markDayCompleted(
                          task.day
                        )
                      }
                    >
                      {completed ? (
                        <>
                          <CheckCircle2
                            size={16}
                          />
                          Completed
                        </>
                      ) : (
                        "Mark Day Done"
                      )}
                    </button>

                  </div>

                </article>
              );
            })}

          </div>

        </section>

        {/* Revision Topics */}

        <section className="revision-section">

          <div className="revision-section-heading">

            <div>

              <h2>Your Revision Plan</h2>

              <p>
                Prioritized based on your learning
                progress and teacher recommendations.
              </p>

            </div>

          </div>

          <div className="revision-topic-list">

            {revisionTopics.map(
              (topic, index) => {

                const completed =
                  isCompleted(topic.name);

                return (
                  <div
                    className={`revision-topic-card ${
                      completed
                        ? "completed"
                        : ""
                    }`}
                    key={topic.name}
                  >

                    {/* Number */}

                    <div className="revision-topic-number">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    {/* Topic Information */}

                    <div className="revision-topic-main">

                      <div className="revision-topic-title">

                        <h3>
                          {topic.name}
                        </h3>

                        <div className="revision-topic-badges">

                          <span
                            className={`revision-priority ${topic.level
                              .toLowerCase()
                              .replaceAll(
                                " ",
                                "-"
                              )}`}
                          >
                            {topic.level}
                          </span>

                          {topic.teacherRecommended && (
                            <span className="teacher-recommended-tag">
                              Teacher Recommended
                            </span>
                          )}

                        </div>

                      </div>

                      <p>
                        Current mastery:{" "}
                        <strong>
                          {topic.score}%
                        </strong>
                      </p>

                      <div className="revision-topic-progress">

                        <div
                          style={{
                            width: `${topic.score}%`,
                          }}
                        />

                      </div>

                      {topic.teacherRecommendedQuestions
                        ?.length > 0 && (
                        <div className="teacher-focus-question">

                          <span>
                            Teacher focus
                          </span>

                          <p>
                            "
                            {
                              topic
                                .teacherRecommendedQuestions[0]
                                .question
                            }
                            "
                          </p>

                        </div>
                      )}

                    </div>

                    {/* Actions */}

                    <div className="revision-topic-actions">

                      <button
                        type="button"
                        className="revision-practice-button"
                        onClick={() =>
                          handlePractice(
                            topic.name
                          )
                        }
                      >
                        <PlayCircle size={16} />
                        Revise Topic
                      </button>

                      <button
                        type="button"
                        className={`revision-complete-button ${
                          completed
                            ? "completed"
                            : ""
                        }`}
                        onClick={() =>
                          markCompleted(
                            topic.name
                          )
                        }
                        disabled={completed}
                      >
                        {completed ? (
                          <>
                            <CheckCircle2
                              size={16}
                            />
                            Completed
                          </>
                        ) : (
                          "Mark Revised"
                        )}
                      </button>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default WeeklyRevision;
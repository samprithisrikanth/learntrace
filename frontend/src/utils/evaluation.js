export function evaluateAnswer(
  studentAnswer,
  question
) {
  if (!studentAnswer || !studentAnswer.trim()) {
    return {
      score: 0,
      confidence: 95,
      status: "Needs Improvement",
      feedback: "No answer was provided.",
      mistakes: ["Question was not attempted."],
      correction: question.expectedAnswer,
    };
  }

  const studentText =
    studentAnswer.toLowerCase();

  const expectedText =
    question.expectedAnswer.toLowerCase();

  const words = expectedText
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(
      (word) => word.length > 3
    );

  const uniqueWords = [
    ...new Set(words),
  ];

  const matchedWords =
    uniqueWords.filter((word) =>
      studentText.includes(word)
    );

  const matchPercentage =
    uniqueWords.length > 0
      ? matchedWords.length /
        uniqueWords.length
      : 0;

  let score;

  if (matchPercentage >= 0.75) {
    score = question.marks;
  } else if (matchPercentage >= 0.5) {
    score = Math.max(
      1,
      Math.round(question.marks * 0.7)
    );
  } else if (matchPercentage >= 0.25) {
    score = Math.max(
      1,
      Math.round(question.marks * 0.4)
    );
  } else {
    score = 0;
  }

  let status;
  let feedback;

  if (matchPercentage >= 0.75) {
    status = "Strong";
    feedback =
      "The answer covers most of the key concepts expected for this question.";
  } else if (matchPercentage >= 0.5) {
    status = "Good";
    feedback =
      "The answer demonstrates partial understanding, but some important concepts are missing.";
  } else if (matchPercentage >= 0.25) {
    status = "Needs Practice";
    feedback =
      "The answer contains a few relevant points but requires further practice.";
  } else {
    status = "Needs Improvement";
    feedback =
      "The answer does not sufficiently cover the expected concepts.";
  }

  const missingWords =
    uniqueWords
      .filter(
        (word) =>
          !studentText.includes(word)
      )
      .slice(0, 5);

  return {
    score,
    confidence: Math.round(
      60 + matchPercentage * 35
    ),
    status,
    feedback,
    mistakes:
      missingWords.length > 0
        ? missingWords.map(
            (word) =>
              `Important concept related to "${word}" may be missing.`
          )
        : [],
    correction:
      matchPercentage < 0.75
        ? question.expectedAnswer
        : "Your answer covers the important points.",
  };
}


/* =========================
   OVERALL ASSESSMENT SCORE
========================= */

export function calculateOverallScore(
  assessment,
  answers
) {
  let totalScore = 0;
  let totalMarks = 0;

  const conceptScores = {};

  assessment.questions.forEach(
    (question, index) => {

      const evaluation =
        evaluateAnswer(
          answers[index],
          question
        );

      totalScore += evaluation.score;
      totalMarks += question.marks;

      const concept =
        question.concept || "General";

      if (!conceptScores[concept]) {
        conceptScores[concept] = {
          score: 0,
          marks: 0,
        };
      }

      conceptScores[concept].score +=
        evaluation.score;

      conceptScores[concept].marks +=
        question.marks;
    }
  );

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

  const weakConcepts =
    concepts.filter(
      (concept) =>
        concept.mastery < 65
    );

  const strongConcepts =
    concepts.filter(
      (concept) =>
        concept.mastery >= 80
    );

  return {
    totalScore,
    totalMarks,
    percentage,
    concepts,
    weakConcepts,
    strongConcepts,
  };
}
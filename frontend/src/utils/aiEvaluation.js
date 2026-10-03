export async function evaluateAnswerWithAI({
  question,
  expectedAnswer,
  studentAnswer,
  rubric,
  concept,
  maxMarks,
}) {
  const response = await fetch(
    "http://127.0.0.1:8000/api/evaluate",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        question,
        expected_answer: expectedAnswer,
        student_answer: studentAnswer,
        rubric: rubric || "",
        concept: concept || "",
        max_marks: maxMarks,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "AI evaluation request failed."
    );
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(
      "AI evaluation was unsuccessful."
    );
  }

  return data.evaluation;
}
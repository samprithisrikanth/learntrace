import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  ClipboardList,
  Upload,
  FileText,
  X,
  BookOpen,
  CheckCircle,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const createQuestion = (id) => ({
  id,
  type: "objective",
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  expectedAnswer: "",
  marks: 1,
  concept: "",
  rubric: "",
  answerKeyFile: null,
});

function CreateAssessment({ onBack }) {
  const [assessment, setAssessment] = useState({
    name: "",
    subject: "",
    className: "",
    date: "",
  });

  const [questions, setQuestions] = useState([
    createQuestion(1),
  ]);

  const [uploadingKeys, setUploadingKeys] = useState({});
  const [extractingQuestions, setExtractingQuestions] =
    useState(false);
  const [questionPaperName, setQuestionPaperName] =
    useState("");

  // Update assessment details
  const updateAssessment = (field, value) => {
    setAssessment((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // Update a question field
  const updateQuestion = (id, field, value) => {
    setQuestions((previous) =>
      previous.map((question) =>
        question.id === id
          ? { ...question, [field]: value }
          : question
      )
    );
  };

  // Update an MCQ option
  const updateOption = (id, optionIndex, value) => {
    setQuestions((previous) =>
      previous.map((question) => {
        if (question.id !== id) return question;

        const updatedOptions = [...question.options];
        updatedOptions[optionIndex] = value;

        return {
          ...question,
          options: updatedOptions,
        };
      })
    );
  };

  // Change question type
  const changeQuestionType = (id, type) => {
    setQuestions((previous) =>
      previous.map((question) => {
        if (question.id !== id) return question;

        return {
          ...question,
          type,
          marks: type === "objective" ? 1 : 5,
          options:
            question.options?.length
              ? question.options
              : ["", "", "", ""],
        };
      })
    );
  };

  // Add question
  const addQuestion = (type = "objective") => {
    setQuestions((previous) => [
      ...previous,
      {
        ...createQuestion(Date.now() + Math.random()),
        type,
        marks: type === "objective" ? 1 : 5,
      },
    ]);
  };

  // Remove question
  const removeQuestion = (id) => {
    if (questions.length === 1) {
      alert("An assessment must have at least one question.");
      return;
    }

    setQuestions((previous) =>
      previous.filter((question) => question.id !== id)
    );
  };

  // Upload answer key
  const handleAnswerKeyUpload = async (id, file) => {
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Upload a JPG, PNG, WEBP, or PDF file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("The file must be 10 MB or less.");
      return;
    }

    setUploadingKeys((previous) => ({
      ...previous,
      [id]: true,
    }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/api/upload-answer-key`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      console.log("AI extracted questions:", data.questions);

      if (!response.ok) {
        throw new Error(
          data.detail || "Answer key upload failed."
        );
      }

      updateQuestion(id, "answerKeyFile", {
        uploadId: data.upload_id,
        name: data.filename,
        type: data.content_type,
        size: data.size,
      });

      alert("Answer key uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert(error.message || "Could not upload answer key.");
    } finally {
      setUploadingKeys((previous) => ({
        ...previous,
        [id]: false,
      }));
    }
  };

  // Upload question paper and extract questions
  const handleQuestionPaperUpload = async (file) => {
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Upload a JPG, PNG, or WEBP question paper image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("Question paper must be 10 MB or less.");
      return;
    }

    setExtractingQuestions(true);
    setQuestionPaperName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/api/extract-questions`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      console.log("API response:", data);
      console.log("Extracted questions:", data.questions);

      if (!response.ok) {
        throw new Error(
          data.detail || "Question extraction failed."
        );
      }

      if (
        !Array.isArray(data.questions) ||
        data.questions.length === 0
      ) {
        throw new Error("No questions were detected.");
      }

      const extractedQuestions = data.questions.map(
        (item, index) => {
          // Identify the question type returned by the AI
          const itemType = String(item.type || "")
            .trim()
            .toLowerCase();

          const type =
            itemType === "objective" ||
            itemType === "mcq"
              ? "objective"
              : "subjective";

          // Create the question using the existing structure
          const question = {
            ...createQuestion(
              Date.now() + index + Math.random()
            ),
            type,
            question: item.question || "",
            marks:
              Number(item.marks) > 0
                ? Number(item.marks)
                : type === "objective"
                  ? 1
                  : 5,
          };

          if (type === "objective") {
            // Extract MCQ options separately
            const extractedOptions =
              Array.isArray(item.options)
                ? item.options
                    .map((option) =>
                      typeof option === "string"
                        ? option
                        : option?.text || ""
                    )
                    .filter(
                      (option) =>
                        typeof option === "string" &&
                        option.trim()
                    )
                : [];

            question.options =
              extractedOptions.length >= 2
                ? extractedOptions
                : ["", "", "", ""];

            // Convert the AI answer into the option index
            // expected by the existing dropdown.
            const answer = item.correctAnswer;

            let correctIndex = -1;

            if (
              answer !== null &&
              answer !== undefined &&
              String(answer).trim() !== ""
            ) {
              const answerText = String(answer).trim();

              // Case 1: AI returns an index such as 0, 1, 2, 3
              if (
                /^\d+$/.test(answerText) &&
                Number(answerText) < question.options.length
              ) {
                correctIndex = Number(answerText);
              } else {
                // Case 2: AI returns A, B, C, or D
                const letterMatch =
                  answerText.match(/^([A-Z])$/i);

                if (letterMatch) {
                  const letterIndex =
                    letterMatch[1].toUpperCase().charCodeAt(0) -
                    65;

                  if (
                    letterIndex >= 0 &&
                    letterIndex < question.options.length
                  ) {
                    correctIndex = letterIndex;
                  }
                }

                // Case 3: AI returns the actual option text
                if (correctIndex === -1) {
                  correctIndex = question.options.findIndex(
                    (option) =>
                      option.trim().toLowerCase() ===
                      answerText.toLowerCase()
                  );
                }
              }
            }

            // Keep a placeholder selection if the answer is unknown.
            // The teacher must verify the correct answer before saving.
            question.correctAnswer =
              correctIndex >= 0
                ? String(correctIndex)
                : "";
          }

          return question;
        }
      );

      setQuestions(extractedQuestions);

      alert(
        `${extractedQuestions.length} questions extracted. ` +
          "Please review the question types, options, and correct answers."
      );
    } catch (error) {
      console.error("Question extraction error:", error);
      setQuestionPaperName("");

      alert(
        error.message || "Could not extract questions."
      );
    } finally {
      setExtractingQuestions(false);
    }
  };

  // Prepare and save assessment
  const handleCreateAssessment = () => {
    if (extractingQuestions) {
      alert("Please wait for question extraction to finish.");
      return;
    }

    if (Object.values(uploadingKeys).some(Boolean)) {
      alert("Please wait for answer-key uploads to finish.");
      return;
    }

    if (!assessment.name.trim() || !assessment.subject.trim()) {
      alert("Please enter the assessment name and subject.");
      return;
    }

    for (let index = 0; index < questions.length; index++) {
      const question = questions[index];
      const number = index + 1;

      if (!question.question.trim()) {
        alert(`Please enter Question ${number}.`);
        return;
      }

      if (!question.concept.trim()) {
        alert(`Please enter the concept for Question ${number}.`);
        return;
      }

      if (!Number(question.marks) || Number(question.marks) <= 0) {
        alert(`Please enter valid marks for Question ${number}.`);
        return;
      }

      if (question.type === "objective") {
        const filledOptions = question.options.filter(
          (option) => option.trim()
        );

        if (filledOptions.length < 2) {
          alert(
            `Please enter at least two options for Question ${number}.`
          );
          return;
        }

        if (
  question.correctAnswer === "" ||
  !Number.isInteger(Number(question.correctAnswer)) ||
  Number(question.correctAnswer) < 0 ||
  Number(question.correctAnswer) >= question.options.length ||
  !question.options[Number(question.correctAnswer)]?.trim()
) {
  alert(
    `Please select a valid correct answer for Question ${number}.`
  );
  return;
}
      } else if (!question.expectedAnswer.trim()) {
        alert(
          `Please enter the expected answer for Question ${number}.`
        );
        return;
      }
    }

    const preparedQuestions = questions.map((question) => {
      if (question.type === "objective") {
        const correctOption =
          question.options[Number(question.correctAnswer)];

        return {
          ...question,
          marks: Number(question.marks),
          options: question.options.filter(
            (option) => option.trim()
          ),
          expectedAnswer: correctOption,
          correctAnswer: correctOption,
        };
      }

      return {
        ...question,
        marks: Number(question.marks),
      };
    });

    const newAssessment = {
      id: Date.now(),
      ...assessment,
      questions: preparedQuestions,
      questionPaperName,
      createdAt: new Date().toISOString(),
    };

    try {
      const existingAssessments = JSON.parse(
        localStorage.getItem("learntrace_assessments") || "[]"
      );

      localStorage.setItem(
        "learntrace_assessments",
        JSON.stringify([
          ...existingAssessments,
          newAssessment,
        ])
      );

      alert("Assessment created successfully!");
      onBack();
    } catch (error) {
      console.error(error);
      alert("Could not save the assessment.");
    }
  };

  const objectiveQuestions = questions.filter(
    (question) => question.type === "objective"
  );

  const subjectiveQuestions = questions.filter(
    (question) => question.type === "subjective"
  );

  const totalMarks = questions.reduce(
    (total, question) =>
      total + (Number(question.marks) || 0),
    0
  );

  const isUploadingAnswerKey =
    Object.values(uploadingKeys).some(Boolean);

  // Render a question card
  const renderQuestion = (question, index, type) => (
    <div className="question-card" key={question.id}>
      <div className="question-header">
        <div>
          <h3>
            {type === "objective" ? "Objective" : "Subjective"}{" "}
            Question {index + 1}
          </h3>

          <span className="input-hint">
            {type === "objective"
              ? "MCQ · Select one correct answer"
              : "Written answer · Teacher-reviewed"}
          </span>
        </div>

        <button
          type="button"
          className="delete-question"
          onClick={() => removeQuestion(question.id)}
          title="Remove question"
        >
          <Trash2 size={17} />
        </button>
      </div>

      {/* Question type */}
      <div className="form-group">
        <label>Question Type</label>

        <select
          value={question.type}
          onChange={(e) =>
            changeQuestionType(question.id, e.target.value)
          }
        >
          <option value="objective">Objective — MCQ</option>
          <option value="subjective">
            Subjective — Written Answer
          </option>
        </select>
      </div>

      {/* Question text */}
      <div className="form-group">
        <label>Question</label>

        <textarea
          rows={3}
          placeholder="Enter the question..."
          value={question.question}
          onChange={(e) =>
            updateQuestion(
              question.id,
              "question",
              e.target.value
            )
          }
        />
      </div>

      {/* Objective fields */}
      {question.type === "objective" && (
        <div className="objective-fields">
          <div className="form-section-header">
            <div>
              <h3>Answer Options</h3>
              <p>
                Enter the options and select the correct answer.
              </p>
            </div>
          </div>

          {question.options.map((option, optionIndex) => (
            <div className="form-group" key={optionIndex}>
              <label>
                Option {String.fromCharCode(65 + optionIndex)}
              </label>

              <div className="option-input-row">
                <input
                  type="text"
                  placeholder={`Enter option ${String.fromCharCode(
                    65 + optionIndex
                  )}`}
                  value={option}
                  onChange={(e) =>
                    updateOption(
                      question.id,
                      optionIndex,
                      e.target.value
                    )
                  }
                />

                {question.options.length > 2 && (
                  <button
                    type="button"
                    className="delete-question"
                    title="Remove option"
                    onClick={() => {
                      const updatedOptions =
                        question.options.filter(
                          (_, i) => i !== optionIndex
                        );

                      let correctIndex = Number(
                        question.correctAnswer
                      );

                      if (correctIndex === optionIndex) {
                        correctIndex = 0;
                      } else if (correctIndex > optionIndex) {
                        correctIndex -= 1;
                      }

                      setQuestions((previous) =>
                        previous.map((item) =>
                          item.id === question.id
                            ? {
                                ...item,
                                options: updatedOptions,
                                correctAnswer: String(correctIndex),
                              }
                            : item
                        )
                      );
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            className="add-question-button"
            onClick={() =>
              updateQuestion(question.id, "options", [
                ...question.options,
                "",
              ])
            }
          >
            <Plus size={17} />
            Add Option
          </button>

          <div className="form-group">
            <label>Correct Answer</label>

            <select
              value={question.correctAnswer}
              onChange={(e) =>
                updateQuestion(
                  question.id,
                  "correctAnswer",
                  e.target.value
                )
              }
            >
              <option value="">-- Select correct answer --</option>
              {question.options.map((option, optionIndex) => (
                <option
                  key={optionIndex}
                  value={String(optionIndex)}
                  disabled={!option.trim()}
                >
                  Option {String.fromCharCode(65 + optionIndex)}
                  {option.trim() ? ` — ${option}` : " — Empty"}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Subjective fields */}
      {question.type === "subjective" && (
        <>
          <div className="form-group">
            <label>Expected Answer / Answer Key</label>

            <textarea
              rows={4}
              placeholder="Enter the model answer or key points..."
              value={question.expectedAnswer}
              onChange={(e) =>
                updateQuestion(
                  question.id,
                  "expectedAnswer",
                  e.target.value
                )
              }
            />
          </div>

          <div className="form-group">
            <label>Marking Rubric (Optional)</label>

            <textarea
              rows={3}
              placeholder="Example: Definition — 1 mark; explanation — 2 marks"
              value={question.rubric}
              onChange={(e) =>
                updateQuestion(
                  question.id,
                  "rubric",
                  e.target.value
                )
              }
            />
          </div>
        </>
      )}

      {/* Answer key upload */}
      <div className="form-group">
        <label>Upload Answer Key (Optional)</label>

        <input
          id={`answer-key-${question.id}`}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          hidden
          disabled={uploadingKeys[question.id]}
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              handleAnswerKeyUpload(question.id, file);
            }

            e.target.value = "";
          }}
        />

        <label
          htmlFor={`answer-key-${question.id}`}
          className="answer-key-upload-button"
        >
          <Upload size={18} />

          {uploadingKeys[question.id]
            ? "Uploading..."
            : question.answerKeyFile
              ? "Replace Answer Key"
              : "Choose Image or PDF"}
        </label>

        {question.answerKeyFile && (
          <div className="answer-key-file">
            <FileText size={18} />

            <div className="answer-key-file-info">
              <strong>{question.answerKeyFile.name}</strong>
              <span>Uploaded</span>
            </div>

            <button
              type="button"
              className="delete-question"
              onClick={() =>
                updateQuestion(
                  question.id,
                  "answerKeyFile",
                  null
                )
              }
              title="Remove answer key"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Marks and concept */}
      <div className="form-grid question-fields">
        <div className="form-group">
          <label>Marks</label>

          <input
            type="number"
            min="1"
            value={question.marks}
            onChange={(e) =>
              updateQuestion(
                question.id,
                "marks",
                e.target.value
              )
            }
          />
        </div>

        <div className="form-group">
          <label>Concept</label>

          <input
            type="text"
            placeholder="Example: Arrays"
            value={question.concept}
            onChange={(e) =>
              updateQuestion(
                question.id,
                "concept",
                e.target.value
              )
            }
          />
        </div>
      </div>
    </div>
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
            type="button"
            className="nav-item"
            onClick={onBack}
          >
            <ArrowLeft size={19} />
            Dashboard
          </button>

          <button type="button" className="nav-item">
            <ClipboardList size={19} />
            Assessments
          </button>

          <button
            type="button"
            className="nav-item active"
          >
            <Plus size={19} />
            Create Assessment
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Create Assessment</h1>
            <p>
              Create objective and subjective questions for
              your students.
            </p>
          </div>
        </header>

        {/* Assessment details */}
        <section className="form-section">
          <div className="form-section-header">
            <div>
              <h2>Assessment Details</h2>
              <p>Enter the basic assessment information.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Assessment Name *</label>

              <input
                value={assessment.name}
                onChange={(e) =>
                  updateAssessment("name", e.target.value)
                }
                placeholder="Example: Science Sample Paper"
              />
            </div>

            <div className="form-group">
              <label>Subject *</label>

              <input
                value={assessment.subject}
                onChange={(e) =>
                  updateAssessment("subject", e.target.value)
                }
                placeholder="Example: Science"
              />
            </div>

            <div className="form-group">
              <label>Class</label>

              <input
                value={assessment.className}
                onChange={(e) =>
                  updateAssessment("className", e.target.value)
                }
                placeholder="Example: Grade X"
              />
            </div>

            <div className="form-group">
              <label>Date</label>

              <input
                type="date"
                value={assessment.date}
                onChange={(e) =>
                  updateAssessment("date", e.target.value)
                }
              />
            </div>
          </div>
        </section>

        {/* Question paper upload */}
        <section className="form-section question-paper-upload">
          <div className="upload-heading">
            <h3>Import Question Paper</h3>
            <p>
              Upload an image to extract questions automatically.
            </p>
          </div>

          <input
            id="question-paper-upload"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            hidden
            disabled={extractingQuestions}
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (file) {
                handleQuestionPaperUpload(file);
              }

              e.target.value = "";
            }}
          />

          <label
            htmlFor="question-paper-upload"
            className="upload-button"
          >
            <Upload size={18} />

            {extractingQuestions
              ? "Extracting Questions..."
              : "Upload Question Paper Image"}
          </label>

          <span className="upload-hint">
            JPG, PNG, or WEBP · Maximum 10 MB
          </span>

          {questionPaperName && (
            <div className="answer-key-file">
              <FileText size={18} />

              <div className="answer-key-file-info">
                <strong>{questionPaperName}</strong>

                <span>
                  {extractingQuestions
                    ? "Processing..."
                    : "Imported — review the questions below"}
                </span>
              </div>

              {!extractingQuestions && (
                <button
                  type="button"
                  className="delete-question"
                  onClick={() => setQuestionPaperName("")}
                  title="Clear file name"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </section>

         {/* Objective + Subjective split layout */}
  <div className="question-type-grid">

  {/* Objective questions */}
  <section className="form-section objective-section">
          <div className="form-section-header">
            <div>
              <h2>
                <CheckCircle
                  size={20}
                  style={{
                    display: "inline",
                    verticalAlign: "middle",
                    marginRight: 8,
                  }}
                />
                Objective Questions
              </h2>

              <p>
                Multiple-choice questions with one correct answer.
              </p>
            </div>

            <span className="question-count">
              {objectiveQuestions.length} question(s)
            </span>
          </div>

          <div className="questions-container">
            {objectiveQuestions.map((question, index) =>
              renderQuestion(question, index, "objective")
            )}
          </div>

          <button
            type="button"
            className="add-question-button"
            onClick={() => addQuestion("objective")}
            disabled={extractingQuestions}
          >
            <Plus size={18} />
            Add Objective Question
          </button>
         </section>

  {/* Subjective questions */}
  <section className="form-section subjective-section">
          <div className="form-section-header">
            <div>
              <h2>
                <BookOpen
                  size={20}
                  style={{
                    display: "inline",
                    verticalAlign: "middle",
                    marginRight: 8,
                  }}
                />
                Subjective Questions
              </h2>

              <p>
                Written answers with model answers and marking
                rubrics.
              </p>
            </div>

            <span className="question-count">
              {subjectiveQuestions.length} question(s)
            </span>
          </div>

          <div className="questions-container">
            {subjectiveQuestions.map((question, index) =>
              renderQuestion(question, index, "subjective")
            )}
          </div>

          <button
            type="button"
            className="add-question-button"
            onClick={() => addQuestion("subjective")}
            disabled={extractingQuestions}
          >
            <Plus size={18} />
            Add Subjective Question
          </button>
        </section>

        </div>

                {/* Assessment summary */}
        <section className="form-section assessment-summary-section">
          <div className="form-section-header">
            <div>
              <h2>Assessment Summary</h2>
              <p>Review your assessment before saving.</p>
            </div>
          </div>

          <div className="assessment-stats-grid">
            <div className="assessment-stat-card stat-total">
              <span className="stat-label">Total Questions</span>
              <strong className="stat-value">
                {questions.length}
              </strong>
              <span className="stat-description">
                Questions added
              </span>
            </div>

            <div className="assessment-stat-card stat-objective">
              <span className="stat-label">Objective</span>
              <strong className="stat-value">
                {objectiveQuestions.length}
              </strong>
              <span className="stat-description">
                Multiple-choice questions
              </span>
            </div>

            <div className="assessment-stat-card stat-subjective">
              <span className="stat-label">Subjective</span>
              <strong className="stat-value">
                {subjectiveQuestions.length}
              </strong>
              <span className="stat-description">
                Written-answer questions
              </span>
            </div>

            <div className="assessment-stat-card stat-marks">
              <span className="stat-label">Total Marks</span>
              <strong className="stat-value">
                {totalMarks}
              </strong>
              <span className="stat-description">
                Maximum score
              </span>
            </div>
          </div>
        </section>

                {/* Bottom actions */}
        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onBack}
          >
            Cancel
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={handleCreateAssessment}
            disabled={
              extractingQuestions || isUploadingAnswerKey
            }
          >
            <Save size={18} />

            {extractingQuestions
              ? "Extracting..."
              : isUploadingAnswerKey
                ? "Uploading..."
                : "Create Assessment"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default CreateAssessment;

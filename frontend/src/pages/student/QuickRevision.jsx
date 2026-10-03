import {
  ArrowLeft,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  PlayCircle,
} from "lucide-react";

const revisionContent = {
  Arrays: {
    summary:
      "An array stores elements in contiguous memory locations and allows fast access using an index.",

    keyPoints: [
      "Elements are accessed using an index.",
      "Array indexing usually starts from 0.",
      "Accessing an element by index takes O(1) time.",
      "Insertion and deletion in the middle can require shifting elements.",
    ],

    commonMistake:
      "Confusing an array's index with its value. Remember that the index represents the position of an element.",

    example:
      "For [10, 20, 30], the element 20 is at index 1.",
  },

  "Linked Lists": {
    summary:
      "A linked list stores data in nodes where each node contains data and a reference to another node.",

    keyPoints: [
      "Each node contains data and a link to the next node.",
      "Nodes do not need to be stored next to each other in memory.",
      "Insertion and deletion can be efficient when the position is known.",
      "Traversing a linked list takes O(n) time.",
    ],

    commonMistake:
      "Forgetting to move the current pointer while traversing the list.",

    example:
      "10 → 20 → 30 → null",
  },

  Stacks: {
    summary:
      "A stack follows the LIFO principle: Last In, First Out.",

    keyPoints: [
      "The last inserted element is removed first.",
      "Push adds an element.",
      "Pop removes the top element.",
      "Peek or top checks the top element without removing it.",
    ],

    commonMistake:
      "Trying to remove an element from the middle of a stack instead of using the top.",

    example:
      "Push 10 → Push 20 → Push 30 → Pop removes 30.",
  },

  Queues: {
    summary:
      "A queue follows the FIFO principle: First In, First Out.",

    keyPoints: [
      "The first inserted element is removed first.",
      "Enqueue adds an element to the rear.",
      "Dequeue removes an element from the front.",
      "Queues are commonly used for scheduling and buffering.",
    ],

    commonMistake:
      "Mixing up FIFO with LIFO. Queues remove the oldest element first.",

    example:
      "10 → 20 → 30. Dequeue removes 10 first.",
  },

  Recursion: {
    summary:
      "Recursion is a technique where a function calls itself to solve smaller versions of the same problem.",

    keyPoints: [
      "Every recursive solution needs a base case.",
      "The recursive case reduces the problem.",
      "The base case prevents infinite recursion.",
      "Recursive calls use the call stack.",
    ],

    commonMistake:
      "Forgetting the base case or failing to move toward the base case.",

    example:
      "factorial(3) → 3 × factorial(2) → 3 × 2 × 1.",
  },

  "Time Complexity": {
    summary:
      "Time complexity describes how the running time of an algorithm grows as the input size increases.",

    keyPoints: [
      "O(1) means constant time.",
      "O(n) grows linearly with input size.",
      "O(log n) grows logarithmically.",
      "Nested loops often result in higher complexity.",
    ],

    commonMistake:
      "Counting every individual operation instead of focusing on how the algorithm grows with input size.",

    example:
      "Scanning an array once is generally O(n).",
  },
};

function QuickRevision({
  concept,
  onBack,
  onStartPractice,
}) {
  const content =
    revisionContent[concept] ||
    revisionContent.Arrays;

  return (
    <div className="quick-revision-page">

      {/* Header */}
      <header className="quick-revision-header">

        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          Weekly Revision
        </button>

        <div>
          <h1>Quick Revision</h1>
          <p>
            Refresh the concept before you practice
          </p>
        </div>

      </header>

      <main className="quick-revision-content">

        {/* Topic Header */}
        <section className="quick-topic-card">

          <div className="quick-topic-icon">
            <BookOpen size={26} />
          </div>

          <div>
            <span>REVISION TOPIC</span>

            <h2>{concept}</h2>

            <p>
              Review the key ideas before moving on to practice.
            </p>
          </div>

        </section>

        {/* Summary */}
        <section className="quick-revision-section">

          <div className="quick-section-heading">
            <BookOpen size={19} />

            <h2>Concept Summary</h2>
          </div>

          <div className="quick-summary-card">
            <p>{content.summary}</p>
          </div>

        </section>

        {/* Key Points */}
        <section className="quick-revision-section">

          <div className="quick-section-heading">
            <Lightbulb size={19} />

            <h2>Key Points</h2>
          </div>

          <div className="quick-points-card">

            {content.keyPoints.map(
              (point, index) => (
                <div
                  className="quick-point"
                  key={index}
                >
                  <span>
                    {index + 1}
                  </span>

                  <p>{point}</p>
                </div>
              )
            )}

          </div>

        </section>

        {/* Common Mistake */}
        <section className="quick-revision-section">

          <div className="quick-section-heading">
            <AlertTriangle size={19} />

            <h2>Common Mistake</h2>
          </div>

          <div className="quick-mistake-card">
            <p>
              {content.commonMistake}
            </p>
          </div>

        </section>

        {/* Example */}
        <section className="quick-revision-section">

          <div className="quick-section-heading">
            <BookOpen size={19} />

            <h2>Example</h2>
          </div>

          <div className="quick-example-card">
            <code>
              {content.example}
            </code>
          </div>

        </section>

        {/* Start Practice */}
        <section className="quick-practice-card">

          <div>
            <h2>
              Ready to test yourself?
            </h2>

            <p>
              Apply what you just revised with focused practice questions.
            </p>
          </div>

          <button
            type="button"
            className="quick-start-button"
            onClick={() =>
              onStartPractice(concept)
            }
          >
            <PlayCircle size={18} />
            Start Practice
          </button>

        </section>

      </main>
    </div>
  );
}

export default QuickRevision;
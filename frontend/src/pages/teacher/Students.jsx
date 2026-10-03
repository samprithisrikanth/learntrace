import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  BarChart3,
} from "lucide-react";

function Students({ onBack }) {
  const getStoredData = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  };

  const submissions = getStoredData("learntrace_submissions");

  const getStudentKey = (submission) =>
    submission?.studentEmail ||
    submission?.email ||
    submission?.student?.email ||
    submission?.studentName ||
    submission?.name ||
    "Student";

  const getStudentName = (submission) =>
    submission?.studentName ||
    submission?.student?.name ||
    submission?.name ||
    "Student";

  const studentMap = {};

  submissions.forEach((submission) => {
    const key = getStudentKey(submission);

    if (!studentMap[key]) {
      studentMap[key] = {
        name: getStudentName(submission),
        total: 0,
        reviewed: 0,
        scores: [],
      };
    }

    studentMap[key].total += 1;

    if (
      submission?.status === "approved" &&
      submission?.evaluation
    ) {
      studentMap[key].reviewed += 1;

      const percentage = Number(
        submission?.evaluation?.percentage ??
          submission?.evaluation?.scorePercentage ??
          0
      );

      if (!Number.isNaN(percentage)) {
        studentMap[key].scores.push(percentage);
      }
    }
  });

  const students = Object.values(studentMap).map((student) => {

    const average =
      student.scores.length > 0
        ? Math.round(
            student.scores.reduce(
              (sum, score) => sum + score,
              0
            ) / student.scores.length
          )
        : null;

    return {
      ...student,
      average,
    };
  });

  return (
    <div className="dashboard-layout">

      {/* Sidebar */}

      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Users size={22} />
          </div>

          <span>LearnTrace</span>
        </div>

        <nav className="sidebar-nav">

          <button
            className="nav-item"
            onClick={onBack}
          >
            <ArrowLeft size={19} />
            Dashboard
          </button>

          <button className="nav-item active">
            <Users size={19} />
            Students
          </button>

        </nav>

      </aside>


      {/* Main */}

      <main className="dashboard-main">

        <header className="dashboard-header">

          <div>
            <h1>Students</h1>

            <p>
              Track student assessment activity and progress.
            </p>
          </div>

        </header>


        {/* Summary */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon purple">
              <Users size={22} />
            </div>

            <div>
              <span>Total Students</span>
              <strong>{students.length}</strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon blue">
              <BarChart3 size={22} />
            </div>

            <div>
              <span>Submissions</span>
              <strong>{submissions.length}</strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon green">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <span>Reviewed</span>

              <strong>
                {
                  submissions.filter(
                    (submission) =>
                      submission?.status === "approved"
                  ).length
                }
              </strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon orange">
              <Clock size={22} />
            </div>

            <div>
              <span>Pending</span>

              <strong>
                {
                  submissions.filter(
                    (submission) =>
                      submission?.status !== "approved"
                  ).length
                }
              </strong>
            </div>

          </div>

        </section>


        {/* Student List */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>
              <h2>Student Progress</h2>

              <p>
                Individual assessment activity and performance.
              </p>
            </div>

          </div>


          <div className="student-table">

            {students.length > 0 ? (
              students.map((student, index) => {

                const initial =
                  student.name
                    .charAt(0)
                    .toUpperCase();

                return (
                  <div
                    className="student-row"
                    key={`${student.name}-${index}`}
                  >

                    <div className="student-profile-cell">

                      <div className="student-avatar">
                        {initial}
                      </div>

                      <div>
                        <strong>
                          {student.name}
                        </strong>

                        <span>
                          {student.total}{" "}
                          {student.total === 1
                            ? "submission"
                            : "submissions"}
                        </span>
                      </div>

                    </div>


                    <div className="student-stat">
                      <span>Reviewed</span>

                      <strong>
                        {student.reviewed}
                      </strong>
                    </div>


                    <div className="student-stat">
                      <span>Average</span>

                      <strong>
                        {student.average !== null
                          ? `${student.average}%`
                          : "—"}
                      </strong>
                    </div>


                    <div className="student-status">

                      {student.average !== null ? (
                        <span
                          className={
                            student.average >= 75
                              ? "student-status-good"
                              : student.average >= 65
                              ? "student-status-practice"
                              : "student-status-attention"
                          }
                        >
                          {student.average >= 75
                            ? "Strong"
                            : student.average >= 65
                            ? "Practice"
                            : "Needs Attention"}
                        </span>
                      ) : (
                        <span className="student-status-pending">
                          Awaiting review
                        </span>
                      )}

                    </div>

                  </div>
                );
              })
            ) : (
              <div className="dashboard-empty-state">
                No students have submitted an assessment yet.
              </div>
            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default Students;
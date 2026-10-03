import { useState } from "react";
import {
  GraduationCap,
  Mail,
  ArrowRight,
  ClipboardCheck,
  BarChart3,
  Target,
  TrendingUp,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  Leaf,
} from "lucide-react";

function Login({ onSelectRole }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    // Demo accounts
    // Teacher: teacher@learntrace.edu
    // Student: student@learntrace.edu

    if (normalizedEmail === "teacher@learntrace.edu") {
      localStorage.setItem("learntrace_user_email", normalizedEmail);
      localStorage.setItem("learntrace_user_role", "teacher");

      onSelectRole("teacher");
      return;
    }

    if (normalizedEmail === "student@learntrace.edu") {
      localStorage.setItem("learntrace_user_email", normalizedEmail);
      localStorage.setItem("learntrace_user_role", "student");

      onSelectRole("student");
      return;
    }

    setError("This email is not registered with LearnTrace.");
  };

  return (
    <div className="login-page">

      {/* Background shapes */}
      <div className="login-bg-shape login-bg-top"></div>
      <div className="login-bg-shape login-bg-bottom"></div>

      <main className="login-main">

        {/* =====================================================
            LEFT SIDE
        ===================================================== */}
        <section className="login-intro">

          {/* Brand */}
          <div className="login-brand">

            <div className="login-brand-icon">
              <GraduationCap
                size={30}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h1>LearnTrace</h1>
              <p>Learning &amp; Assessment Platform</p>
            </div>

          </div>


          {/* Main heading */}
          <div className="login-intro-content">

            <h2>
              Better Assessments.
              <br />
              Stronger <span>Learning.</span>
            </h2>

            <p className="login-intro-description">
              Track progress, identify gaps,
              <br />
              and build a stronger tomorrow.
            </p>

          </div>


          {/* Features */}
          <div className="login-features">

            <div className="login-feature">

              <div className="login-feature-icon purple">
                <ClipboardCheck
                  size={19}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <h3>Assess</h3>
                <p>Create and manage assessments</p>
              </div>

            </div>


            <div className="login-feature">

              <div className="login-feature-icon blue">
                <BarChart3
                  size={19}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <h3>Trace</h3>
                <p>Understand learning gaps</p>
              </div>

            </div>


            <div className="login-feature">

              <div className="login-feature-icon green">
                <Target
                  size={19}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <h3>Practise</h3>
                <p>Focus on what matters</p>
              </div>

            </div>


            <div className="login-feature">

              <div className="login-feature-icon violet">
                <TrendingUp
                  size={19}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <h3>Improve</h3>
                <p>See real progress</p>
              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            RIGHT SIDE — LOGIN PANEL
        ===================================================== */}
        <section className="login-panel">

          <div className="login-card">

            {/* Card icon */}
            <div className="login-card-icon">

              <GraduationCap
                size={30}
                strokeWidth={1.8}
              />

            </div>


            {/* Header */}
            <div className="login-card-header">

              <h2>Welcome back</h2>

              <p>
                Sign in to continue to your LearnTrace account.
              </p>

            </div>


            {/* Login form */}
            <form
              className="login-form"
              onSubmit={handleSubmit}
            >

              <div className="login-field">

                <label htmlFor="login-email">
                  Email address
                </label>

                <div className="login-input-wrapper">

                  <Mail
                    size={19}
                    strokeWidth={1.7}
                  />

                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />

                </div>

              </div>


              {/* Error */}
              {error && (
                <div className="login-error">

                  <UserRound
                    size={15}
                    strokeWidth={1.8}
                  />

                  <span>{error}</span>

                </div>
              )}


              {/* Continue button */}
              <button
                type="submit"
                className="login-submit-button"
              >

                <span>Continue</span>

                <ArrowRight
                  size={18}
                  strokeWidth={1.8}
                />

              </button>

            </form>


            {/* Secure login */}
            <div className="login-secure">

              <div className="login-secure-line"></div>

              <div className="login-secure-label">

                <LockKeyhole
                  size={12}
                  strokeWidth={1.8}
                />

                <span>Secure login</span>

              </div>

              <div className="login-secure-line"></div>

            </div>


            {/* Trust footer */}
            <div className="login-trust">

              <div className="login-trust-item">

                <ShieldCheck
                  size={20}
                  strokeWidth={1.6}
                  className="login-trust-icon"
                />

                <div>
                  <strong>Safe &amp; Secure</strong>
                  <span>Protected access</span>
                </div>

              </div>


              <div className="login-trust-divider"></div>


              <div className="login-trust-item">

                <UserRound
                  size={20}
                  strokeWidth={1.6}
                  className="login-trust-icon"
                />

                <div>
                  <strong>Your Data</strong>
                  <span>Stays Private</span>
                </div>

              </div>


              <div className="login-trust-divider"></div>


              <div className="login-trust-item">

                <Leaf
                  size={20}
                  strokeWidth={1.6}
                  className="login-trust-icon"
                />

                <div>
                  <strong>Built for</strong>
                  <span>Better Learning</span>
                </div>

              </div>

            </div>

          </div>

        </section>

      </main>


      {/* Bottom footer */}
      <div className="login-bottom-footer">

        <span>LearnTrace</span>
        <span>·</span>
        <span>Assess</span>
        <span>·</span>
        <span>Trace</span>
        <span>·</span>
        <span>Practise</span>
        <span>·</span>
        <span>Improve</span>

      </div>

    </div>
  );
}

export default Login;
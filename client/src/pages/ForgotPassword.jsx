import { useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/Alert";
import { forgotPassword } from "../services/authService";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      setAlert({ type: "error", message: "Email is required." });
      return;
    }

    setLoading(true);
    setAlert({ type: "", message: "" });
    setResetToken("");

    try {
      const response = await forgotPassword(email.trim());
      setAlert({
        type: "success",
        message: response.message || "Check your email for reset instructions.",
      });
      setResetToken(response.data?.resetToken || "");
    } catch (error) {
      setAlert({ type: "error", message: error.message || "Unable to process request." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="w-full max-w-md rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-strong)] p-8 shadow-[var(--shadow-panel)]">
        <p className="text-sm uppercase tracking-[0.32em] text-brand-700">GMP_LIVE</p>
        <h1 className="mt-2 text-3xl font-semibold text-brand-900">Forgot Password</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Enter your email to receive a password reset link.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>

          <Alert
            type={alert.type || "info"}
            message={alert.message}
            onClose={() => setAlert({ type: "", message: "" })}
          />

          {resetToken ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
              Development token: {resetToken}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-700 px-4 py-3 font-semibold text-white hover:bg-brand-900 disabled:opacity-70"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-4 text-sm">
          <Link to="/login" className="text-brand-700 hover:text-brand-900">
            Back to Login
          </Link>
        </div>
      </section>
    </main>
  );
}

export default ForgotPassword;

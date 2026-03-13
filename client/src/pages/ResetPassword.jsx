import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import Alert from "../components/Alert";
import { resetPassword } from "../services/authService";

function getStrength(password) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
  ].filter(Boolean).length;
  return ["Weak", "Fair", "Good", "Strong"][Math.max(score - 1, 0)];
}

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const strength = useMemo(() => getStrength(form.newPassword), [form.newPassword]);

  if (!token) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.newPassword || !form.confirmPassword) {
      setAlert({ type: "error", message: "Both password fields are required." });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setAlert({ type: "error", message: "Passwords do not match." });
      return;
    }

    setLoading(true);
    setAlert({ type: "", message: "" });
    try {
      const response = await resetPassword(token, form.newPassword);
      setAlert({ type: "success", message: response.message || "Password reset successful." });
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (error) {
      setAlert({
        type: "error",
        message: error.message || "Unable to reset password. Token may be invalid.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="w-full max-w-md rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-strong)] p-8 shadow-[var(--shadow-panel)]">
        <p className="text-sm uppercase tracking-[0.32em] text-brand-700">GMP_LIVE</p>
        <h1 className="mt-2 text-3xl font-semibold text-brand-900">Reset Password</h1>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">New Password</span>
            <input
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Confirm Password</span>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>

          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
            Password strength: <strong>{strength}</strong>
          </div>

          <Alert
            type={alert.type || "info"}
            message={alert.message}
            onClose={() => setAlert({ type: "", message: "" })}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-700 px-4 py-3 font-semibold text-white hover:bg-brand-900 disabled:opacity-70"
          >
            {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import Header from "../components/Header";
import useAuth from "../hooks/useAuth";
import { changePassword, logout } from "../services/authService";

function passwordChecks(password) {
  return {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
  };
}

function ChangePassword() {
  const navigate = useNavigate();
  const { userName, role, clearAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const checks = useMemo(() => passwordChecks(form.newPassword), [form.newPassword]);
  const strengthCount = Object.values(checks).filter(Boolean).length;
  const strengthText = ["Weak", "Fair", "Good", "Strong"][Math.max(strengthCount - 1, 0)];

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      return "All password fields are required.";
    }
    if (form.newPassword !== form.confirmPassword) {
      return "Confirm password must match new password.";
    }
    if (form.oldPassword === form.newPassword) {
      return "New password must differ from current password.";
    }
    if (strengthCount < 4) {
      return "New password does not meet complexity rules.";
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const error = validate();
    if (error) {
      setAlert({ type: "error", message: error });
      return;
    }

    setLoading(true);
    setAlert({ type: "", message: "" });
    try {
      const response = await changePassword(form.oldPassword, form.newPassword);
      setAlert({ type: "success", message: response.message || "Password changed successfully." });
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (requestError) {
      setAlert({ type: "error", message: requestError.message || "Password update failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <Header userName={userName} role={role} onLogout={handleLogout} />

        <section className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[var(--shadow-panel)]">
          <h1 className="text-2xl font-semibold text-brand-900">Change Password</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Use a strong password with uppercase, lowercase, and numbers.
          </p>

          <div className="mt-4">
            <Alert
              type={alert.type || "info"}
              message={alert.message}
              onClose={() => setAlert({ type: "", message: "" })}
            />
          </div>

          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            {["oldPassword", "newPassword", "confirmPassword"].map((field) => (
              <label key={field} className="block">
                <span className="mb-1 block text-sm font-medium">
                  {field === "oldPassword"
                    ? "Current Password"
                    : field === "newPassword"
                      ? "New Password"
                      : "Confirm New Password"}
                </span>
                <input
                  name={field}
                  type={showPassword ? "text" : "password"}
                  value={form[field]}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </label>
            ))}

            <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(event) => setShowPassword(event.target.checked)}
              />
              Show passwords
            </label>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
              Password strength: <strong>{strengthText}</strong>
              <ul className="mt-2 space-y-1 text-[var(--text-muted)]">
                <li>8+ chars: {checks.minLength ? "OK" : "Missing"}</li>
                <li>Uppercase: {checks.uppercase ? "OK" : "Missing"}</li>
                <li>Lowercase: {checks.lowercase ? "OK" : "Missing"}</li>
                <li>Number: {checks.number ? "OK" : "Missing"}</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-brand-700 px-5 py-2 font-medium text-white hover:bg-brand-900 disabled:opacity-70"
              >
                {loading ? "Updating..." : "Change Password"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="rounded-xl border border-slate-300 px-5 py-2 font-medium text-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default ChangePassword;

import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";
import useAuth from "../hooks/useAuth";
import { checkHealth, login as loginRequest } from "../services/authService";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, setAuthData, loading, setLoading, error, setError } =
    useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: true,
  });
  const [statusMessage, setStatusMessage] = useState("");

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    const rememberedUsername = localStorage.getItem("remembered_username");
    if (rememberedUsername) {
      setFormData((prev) => ({ ...prev, username: rememberedUsername }));
    }

    checkHealth()
      .then(() => setStatusMessage("Backend health check successful."))
      .catch(() => setStatusMessage("Backend health check unavailable."));
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    if (!formData.username.trim()) {
      return "Username is required.";
    }
    if (!formData.password.trim()) {
      return "Password is required.";
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await loginRequest(
        formData.username.trim(),
        formData.password,
      );
      setAuthData(response.data);
      if (formData.rememberMe) {
        localStorage.setItem("remembered_username", formData.username.trim());
      } else {
        localStorage.removeItem("remembered_username");
      }
      navigate(from, { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="w-full max-w-md rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-strong)] p-8 shadow-[var(--shadow-panel)]">
        <p className="text-sm uppercase tracking-[0.32em] text-brand-700">GMP_LIVE</p>
        <h1 className="mt-2 text-3xl font-semibold text-brand-900">Login</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{statusMessage}</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-900">Username</label>
            <input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-900">Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              autoComplete="current-password"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <input
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            Remember username
          </label>

          <Alert type="error" message={error} onClose={() => setError(null)} />

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-brand-700 px-4 py-3 font-semibold text-white hover:bg-brand-900 disabled:opacity-70"
          >
            {loading ? <LoadingSpinner label="Signing in..." /> : "Login"}
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm">
          <Link className="text-brand-700 hover:text-brand-900" to="/forgot-password">
            Forgot password?
          </Link>
          <span className="text-[var(--text-muted)]">Phase 1 Auth</span>
        </div>
      </section>
    </main>
  );
}

export default Login;

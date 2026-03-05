import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";
import useAuth from "../hooks/useAuth";
import { fetchHealth, login as loginRequest } from "../services/authService";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  const { setAuthData, loading, setLoading, error, setError, clearAuth } =
    useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [healthStatus, setHealthStatus] = useState("Checking backend...");

  useEffect(() => {
    clearAuth();

    fetchHealth()
      .then((response) => {
        setHealthStatus(
          `Backend ${response.data.status} and database ${response.data.db}.`,
        );
      })
      .catch(() => {
        setHealthStatus("Backend health check is unavailable.");
      });
  }, [clearAuth]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const authData = await loginRequest(formData);
      setAuthData(authData);
      navigate(from, { replace: true });
    } catch (submitError) {
      setError(submitError.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="grid w-full max-w-5xl gap-8 md:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[32px] border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[var(--shadow-panel)]">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-700">
            Phase 0 Infrastructure
          </p>
          <h1 className="mt-4 max-w-md text-4xl font-semibold leading-tight text-brand-900">
            GMP_LIVE React and Node foundation is ready for authentication work.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--text-muted)]">
            This screen validates the client shell, route protection, Zustand
            persistence, and API connectivity before Phase 1 replaces the mock
            login with the real authentication flow.
          </p>
          <div className="mt-8 rounded-3xl bg-brand-900 p-6 text-brand-50">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-100">
              Integration Status
            </p>
            <p className="mt-3 text-lg font-medium">{healthStatus}</p>
          </div>
        </section>

        <section className="rounded-[32px] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-8 shadow-[var(--shadow-panel)]">
          <h2 className="text-2xl font-semibold text-brand-900">Sign in</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Use any username and password for the Phase 0 placeholder flow.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-brand-900">
                Username
              </span>
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-brand-900">
                Password
              </span>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
              />
            </label>

            <label className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
              <input
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
              />
              Remember me
            </label>

            <Alert type="error" message={error} />

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl bg-brand-700 px-4 py-3 font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <LoadingSpinner label="Signing in..." /> : "Login"}
            </button>

            <button
              type="button"
              className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
            >
              Forgot password?
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default Login;

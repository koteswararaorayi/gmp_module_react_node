import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import useAuth from "../hooks/useAuth";
import { logout } from "../services/authService";

function Dashboard() {
  const navigate = useNavigate();
  const { userName, role, clearAuth } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Ignore logout API errors and clear local auth.
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  };

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Header userName={userName} role={role} onLogout={handleLogout} />

        <section className="grid gap-4 md:grid-cols-3">
          <Link
            to="/profile"
            className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-[var(--shadow-panel)]"
          >
            <p className="text-sm uppercase tracking-[0.24em] text-brand-700">Profile</p>
            <h2 className="mt-2 text-lg font-semibold text-brand-900">Manage account details</h2>
          </Link>
          <Link
            to="/change-password"
            className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-[var(--shadow-panel)]"
          >
            <p className="text-sm uppercase tracking-[0.24em] text-brand-700">Security</p>
            <h2 className="mt-2 text-lg font-semibold text-brand-900">Change password</h2>
          </Link>
          <div className="rounded-2xl border border-[var(--border-soft)] bg-brand-900 p-5 text-brand-50 shadow-[var(--shadow-panel)]">
            <p className="text-sm uppercase tracking-[0.24em] text-brand-100">Status</p>
            <h2 className="mt-2 text-lg font-semibold">Authenticated as {role || "user"}</h2>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;

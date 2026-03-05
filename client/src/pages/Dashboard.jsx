import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import useAuth from "../hooks/useAuth";

const placeholderLinks = [
  { to: "#", label: "Authentication", phase: "Phase 1" },
  { to: "#", label: "Master Items", phase: "Phase 2" },
  { to: "#", label: "Warehouses", phase: "Phase 3" },
];

function Dashboard() {
  const navigate = useNavigate();
  const { userName, role, clearAuth } = useAuth();

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <Header userName={userName} role={role} onLogout={handleLogout} />

        <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[32px] border border-[var(--border-soft)] bg-[var(--surface)] p-8 shadow-[var(--shadow-panel)]">
            <p className="text-sm uppercase tracking-[0.35em] text-brand-700">
              Welcome
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-brand-900">
              Hello, {userName || "User"}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-muted)]">
              You are signed in with the <strong>{role || "viewer"}</strong>{" "}
              role. This dashboard is the Phase 0 placeholder shell for the
              GMP_LIVE migration and confirms protected navigation is wired.
            </p>
          </article>

          <article className="rounded-[32px] border border-[var(--border-soft)] bg-brand-900 p-8 text-brand-50 shadow-[var(--shadow-panel)]">
            <p className="text-sm uppercase tracking-[0.35em] text-brand-100">
              Next Sections
            </p>
            <div className="mt-6 space-y-4">
              {placeholderLinks.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-brand-700/70 bg-brand-700/30 px-4 py-4"
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-brand-100">
                    {item.phase}
                  </p>
                  <Link to={item.to} className="mt-1 block text-lg font-medium">
                    {item.label}
                  </Link>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;

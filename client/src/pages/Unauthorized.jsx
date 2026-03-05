import { Link } from "react-router-dom";

function Unauthorized() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md rounded-[32px] border border-[var(--border-soft)] bg-[var(--surface)] p-8 text-center shadow-[var(--shadow-panel)]">
        <p className="text-sm uppercase tracking-[0.35em] text-brand-700">
          Access Denied
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-brand-900">
          You are not authorized to view this page.
        </h1>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-full bg-brand-700 px-5 py-3 font-semibold text-white"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}

export default Unauthorized;

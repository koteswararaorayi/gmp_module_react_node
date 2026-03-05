function Header({ userName, role, onLogout }) {
  return (
    <header className="flex flex-col gap-4 rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[var(--shadow-panel)] md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-muted)]">
          GMP_LIVE
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-brand-900">
          Inventory Control Workspace
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Signed in as {userName || "Guest"} ({role || "viewer"})
        </p>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
      >
        Logout
      </button>
    </header>
  );
}

export default Header;

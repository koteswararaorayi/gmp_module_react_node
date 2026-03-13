import { Link, NavLink } from "react-router-dom";

const navLinkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-brand-700 text-white"
      : "text-brand-900 hover:bg-brand-100 hover:text-brand-900"
  }`;

function Header({ userName, role, onLogout }) {
  return (
    <header className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-[var(--shadow-panel)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link to="/dashboard" className="text-sm uppercase tracking-[0.32em] text-brand-700">
            GMP_LIVE
          </Link>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {userName || "User"} | {role || "viewer"}
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          <NavLink to="/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/profile" className={navLinkClass}>
            Profile
          </NavLink>
          <NavLink to="/change-password" className={navLinkClass}>
            Change Password
          </NavLink>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;

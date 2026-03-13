import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import Header from "../components/Header";
import LoadingSpinner from "../components/LoadingSpinner";
import useAuth from "../hooks/useAuth";
import {
  getLoginHistory,
  getProfile,
  logout,
  updateProfile,
} from "../services/authService";

function Profile() {
  const navigate = useNavigate();
  const { userName, role, clearAuth, setAuthData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({
    user_name: "",
    email: "",
    user_image: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [profileResponse, historyResponse] = await Promise.all([
          getProfile(),
          getLoginHistory(5, 0),
        ]);
        setProfile(profileResponse.data);
        setHistory(historyResponse.data || []);
        setForm({
          user_name: profileResponse.data.user_name || "",
          email: profileResponse.data.email || "",
          user_image: profileResponse.data.user_image || "",
        });
      } catch (error) {
        setAlert({ type: "error", message: error.message || "Failed to load profile." });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setAlert({ type: "", message: "" });
    try {
      const response = await updateProfile(form);
      setAuthData({
        user_name: form.user_name,
        email: form.email,
      });
      setAlert({ type: "success", message: response.message || "Profile updated." });
    } catch (error) {
      setAlert({ type: "error", message: error.message || "Update failed." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner variant="page" label="Loading profile..." />;
  }

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Header userName={userName} role={role} onLogout={handleLogout} />

        <section className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[var(--shadow-panel)]">
          <h1 className="text-2xl font-semibold text-brand-900">Profile</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">View and update your account details.</p>
          <div className="mt-4">
            <Alert
              type={alert.type || "info"}
              message={alert.message}
              onClose={() => setAlert({ type: "", message: "" })}
            />
          </div>

          <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSave}>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Username</span>
              <input
                name="user_name"
                value={form.user_name}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium">User Image URL / Base64</span>
              <textarea
                name="user_image"
                value={form.user_image}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
              />
            </label>
            <div className="md:col-span-2 flex items-center justify-between">
              <div className="text-sm text-[var(--text-muted)]">
                Company ID: {profile?.company_id} | Status:{" "}
                {Number(profile?.is_active) === 0 ? "active" : "inactive"}
              </div>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand-700 px-5 py-2 font-medium text-white hover:bg-brand-900 disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[var(--shadow-panel)]">
          <h2 className="text-xl font-semibold text-brand-900">Recent Login History</h2>
          <div className="mt-4 space-y-2">
            {history.length ? (
              history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                  {item.login_date} | IP: {item.ip_address} | Duration: {item.duration_minutes}m
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No login history available.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Profile;

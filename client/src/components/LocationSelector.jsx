export default function LocationSelector({ locations, value, onChange, disabled = false }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-[var(--text-secondary)]">Location</label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:bg-slate-100"
      >
        <option value="">Select location…</option>
        {locations.map((l) => (
          <option key={l.id} value={l.id}>{l.location_code} - {l.location_name}</option>
        ))}
      </select>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";

function SearchFilter({ filters, onApply, onReset, dropdowns = {} }) {
  const [local, setLocal] = useState(filters);
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocal(filters);
  }, [filters]);

  const handleSearch = (value) => {
    setLocal((prev) => ({ ...prev, search: value }));
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onApply({ ...local, search: value });
    }, 500);
  };

  const handleFilter = (key, value) => {
    const updated = { ...local, [key]: value };
    setLocal(updated);
    onApply(updated);
  };

  const handleReset = () => {
    setLocal({});
    onReset();
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex min-w-[220px] flex-1 flex-col gap-1">
        <label className="text-xs font-medium text-[var(--text-muted)]">Search</label>
        <input
          type="text"
          placeholder="Search by code or name…"
          value={local.search || ""}
          onChange={(e) => handleSearch(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      {Object.entries(dropdowns).map(([key, { label, options }]) => (
        <div key={key} className="flex min-w-[160px] flex-col gap-1">
          <label className="text-xs font-medium text-[var(--text-muted)]">{label}</label>
          <select
            value={local[key] || ""}
            onChange={(e) => handleFilter(key, e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            <option value="">All</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      <button
        type="button"
        onClick={handleReset}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
      >
        Reset
      </button>
    </div>
  );
}

export default SearchFilter;

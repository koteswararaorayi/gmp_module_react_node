export default function WarehouseSelector({ warehouses, value, onChange, required = false, disabled = false }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-[var(--text-secondary)]">
        Warehouse {required && <span className="text-rose-500">*</span>}
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:bg-slate-100"
      >
        <option value="">Select warehouse…</option>
        {warehouses.map((w) => (
          <option key={w.id} value={w.id}>{w.warehouse_name}</option>
        ))}
      </select>
    </div>
  );
}

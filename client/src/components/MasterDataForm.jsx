function MasterDataForm({ fields, values, onChange, errors }) {
  return (
    <div className="flex flex-col gap-4">
      {fields.map(({ name, label, required, type = "text", rows }) => (
        <div key={name} className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[var(--text-secondary)]">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {type === "textarea" ? (
            <textarea
              rows={rows || 3}
              value={values[name] || ""}
              onChange={(e) => onChange(name, e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          ) : (
            <input
              type={type}
              value={values[name] || ""}
              onChange={(e) => onChange(name, e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          )}
          {errors?.[name] && (
            <p className="text-xs text-rose-500">{errors[name]}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default MasterDataForm;

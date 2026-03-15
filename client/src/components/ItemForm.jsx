function ItemForm({ values, onChange, errors, categories, itemTypes, uoms, suppliers, manufacturers }) {
  const field = (label, name, required = false, children) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-[var(--text-secondary)]">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {errors?.[name] && (
        <p className="text-xs text-rose-500">{errors[name]}</p>
      )}
    </div>
  );

  const input = (name, placeholder = "", disabled = false) => (
    <input
      type="text"
      value={values[name] || ""}
      onChange={(e) => onChange(name, e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:bg-slate-100 disabled:text-slate-500"
    />
  );

  const select = (name, options, placeholder = "Select…") => (
    <select
      value={values[name] || ""}
      onChange={(e) => onChange(name, e.target.value)}
      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {field("Item Code", "item_code", true, input("item_code", "e.g. ITEM001", !!values.id))}
      {field("Item Name", "item_name", true, input("item_name", "Full item name"))}
      {field(
        "Item Type",
        "item_type_id",
        true,
        select("item_type_id", itemTypes.map((t) => ({ id: t.id, label: t.item_type_name })), "Select type…"),
      )}
      {field(
        "Category",
        "category_id",
        true,
        select("category_id", categories.map((c) => ({ id: c.id, label: c.category_name })), "Select category…"),
      )}
      {field(
        "Unit of Measurement",
        "uom_id",
        true,
        select("uom_id", uoms.map((u) => ({ id: u.id, label: `${u.uom_name} (${u.uom_code})` })), "Select UOM…"),
      )}
      {field(
        "Supplier",
        "supplier_id",
        false,
        select("supplier_id", suppliers.map((s) => ({ id: s.id, label: s.supplier_name })), "None"),
      )}
      {field(
        "Manufacturer",
        "manufacturer_id",
        false,
        select("manufacturer_id", manufacturers.map((m) => ({ id: m.id, label: m.manufacturer_name })), "None"),
      )}
      <div className="col-span-full flex flex-col gap-1">
        <label className="text-sm font-medium text-[var(--text-secondary)]">Description</label>
        <textarea
          rows={3}
          value={values.description || ""}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Optional description…"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>
    </div>
  );
}

export default ItemForm;

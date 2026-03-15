import { useState } from "react";
import Alert from "../../components/Alert";
import LoadingSpinner from "../../components/LoadingSpinner";
import MasterDataForm from "../../components/MasterDataForm";
import uomService from "../../services/uomService";
import useMasterData from "../../hooks/useMasterData";

const FIELDS = [
  { name: "uom_code", label: "UOM Code", required: true, placeholder: "e.g. KG, LTR, PCS" },
  { name: "uom_name", label: "UOM Name", required: true },
];

function UOMModal({ initial = {}, onSave, onClose, loading }) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!values.uom_code?.trim()) e.uom_code = "UOM code is required";
    if (!values.uom_name?.trim()) e.uom_name = "UOM name is required";
    return e;
  };

  const handleChange = (k, v) => {
    setValues((p) => ({ ...p, [k]: k === "uom_code" ? v.toUpperCase() : v }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(values);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-base font-semibold">{initial.id ? "Edit UOM" : "New UOM"}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <MasterDataForm fields={FIELDS} values={values} onChange={handleChange} errors={errors} />
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
              {loading ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-5 py-2 text-sm hover:bg-slate-100">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UOMList() {
  const { data: uoms, loading, error, create, update, remove } = useMasterData(
    {
      create: (d) => uomService.createUOM(d),
      update: (id, d) => uomService.updateUOM(id, d),
      remove: (id) => uomService.deleteUOM(id),
    },
    () => uomService.getUOMs(),
  );

  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleSave = async (values) => {
    setSaving(true);
    const res = values.id ? await update(values.id, values) : await create(values);
    setSaving(false);
    if (res.success) {
      setModal(null);
      setAlert({ type: "success", msg: values.id ? "UOM updated." : "UOM created." });
    } else {
      setAlert({ type: "error", msg: res.message || "Failed to save." });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this UOM?")) return;
    const res = await remove(id);
    setAlert(res.success
      ? { type: "success", msg: "UOM deleted." }
      : { type: "error", msg: res.message || "Failed to delete." });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Units of Measurement</h1>
          <p className="text-sm text-[var(--text-muted)]">UOM codes used across items</p>
        </div>
        <button onClick={() => setModal({})} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          + New UOM
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.msg} autoClose onClose={() => setAlert(null)} />}
      {error && <Alert type="error" message={error} />}

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border-soft)]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {uoms.length === 0 ? (
                <tr><td colSpan={4} className="py-10 text-center text-[var(--text-muted)]">No UOMs found.</td></tr>
              ) : uoms.map((u, i) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-[var(--text-muted)]">{i + 1}</td>
                  <td className="px-4 py-3 font-mono font-medium uppercase">{u.uom_code}</td>
                  <td className="px-4 py-3">{u.uom_name}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => setModal(u)} className="rounded px-2 py-1 text-xs text-brand-600 hover:bg-brand-50">Edit</button>
                      <button onClick={() => handleDelete(u.id)} className="rounded px-2 py-1 text-xs text-rose-600 hover:bg-rose-50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <UOMModal initial={modal} onSave={handleSave} onClose={() => setModal(null)} loading={saving} />
      )}
    </div>
  );
}

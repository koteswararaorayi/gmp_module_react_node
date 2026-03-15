import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../../components/Alert";
import LoadingSpinner from "../../components/LoadingSpinner";
import Pagination from "../../components/Pagination";
import warehouseService from "../../services/warehouseService";
import userService from "../../services/userService";

const defaultForm = {
  warehouse_name: "",
  warehouse_type: "",
  address: "",
  manager_id: "",
  capacity: "",
};

function WarehouseModal({ initial, managers, loading, onSave, onClose }) {
  const [values, setValues] = useState(initial || defaultForm);
  const [errors, setErrors] = useState({});

  const setField = (key, val) => setValues((p) => ({ ...p, [key]: val }));

  const validate = () => {
    const e = {};
    if (!values.warehouse_name?.trim()) e.warehouse_name = "Warehouse name is required";
    if (values.capacity !== "" && Number(values.capacity) < 0) e.capacity = "Capacity must be positive";
    return e;
  };

  const submit = (evt) => {
    evt.preventDefault();
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSave(values);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-base font-semibold">{values.id ? "Edit Warehouse" : "New Warehouse"}</h2>
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={submit}>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Warehouse Name *</label>
            <input value={values.warehouse_name || ""} onChange={(e) => setField("warehouse_name", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            {errors.warehouse_name && <p className="text-xs text-rose-500">{errors.warehouse_name}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Warehouse Type</label>
            <input value={values.warehouse_type || ""} onChange={(e) => setField("warehouse_type", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2 flex flex-col gap-1">
            <label className="text-sm font-medium">Address</label>
            <textarea rows={2} value={values.address || ""} onChange={(e) => setField("address", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Manager</label>
            <select value={values.manager_id || ""} onChange={(e) => setField("manager_id", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white">
              <option value="">Select manager…</option>
              {managers.map((m) => <option key={m.id} value={m.id}>{m.username}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Capacity</label>
            <input type="number" min="0" step="0.001" value={values.capacity ?? ""} onChange={(e) => setField("capacity", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            {errors.capacity && <p className="text-xs text-rose-500">{errors.capacity}</p>}
          </div>
          <div className="sm:col-span-2 mt-2 flex gap-3">
            <button type="submit" disabled={loading} className="rounded-lg bg-brand-600 px-5 py-2 text-sm text-white hover:bg-brand-700 disabled:opacity-60">{loading ? "Saving…" : "Save"}</button>
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-5 py-2 text-sm hover:bg-slate-100">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WarehousesList() {
  const [rows, setRows] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [alert, setAlert] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  const params = useMemo(() => ({ page: pagination.page, limit: pagination.limit, search: search || undefined }), [pagination.page, pagination.limit, search]);

  const load = async () => {
    setLoading(true);
    try {
      const [whRes, mgrRes] = await Promise.all([
        warehouseService.getWarehouses(params),
        userService.getManagers(),
      ]);
      setRows(whRes.data || []);
      setPagination(whRes.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
      setManagers(mgrRes.data || []);
    } catch (e) {
      setAlert({ type: "error", msg: e.message || "Failed to load warehouses" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [params.page, params.limit, params.search]);

  const save = async (values) => {
    setSaving(true);
    try {
      const payload = {
        warehouse_name: values.warehouse_name,
        warehouse_type: values.warehouse_type || null,
        address: values.address || null,
        manager_id: values.manager_id ? Number(values.manager_id) : null,
        capacity: values.capacity === "" ? 0 : Number(values.capacity || 0),
      };

      if (values.id) {
        await warehouseService.updateWarehouse(values.id, payload);
        setAlert({ type: "success", msg: "Warehouse updated." });
      } else {
        await warehouseService.createWarehouse(payload);
        setAlert({ type: "success", msg: "Warehouse created." });
      }
      setModal(null);
      await load();
    } catch (e) {
      setAlert({ type: "error", msg: e.message || "Failed to save warehouse" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this warehouse?")) return;
    try {
      await warehouseService.deleteWarehouse(id);
      setAlert({ type: "success", msg: "Warehouse deleted." });
      await load();
    } catch (e) {
      setAlert({ type: "error", msg: e.message || "Failed to delete warehouse" });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Warehouses</h1>
          <p className="text-sm text-[var(--text-muted)]">Master management for storage facilities</p>
        </div>
        <button onClick={() => setModal({ ...defaultForm })} className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">+ New Warehouse</button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          placeholder="Search warehouses..."
          className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {alert && <Alert type={alert.type} message={alert.msg} autoClose onClose={() => setAlert(null)} />}

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border-soft)]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 text-left">Warehouse</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Address</th>
                <th className="px-4 py-3 text-left">Manager</th>
                <th className="px-4 py-3 text-right">Capacity</th>
                <th className="px-4 py-3 text-right">Locations</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr><td colSpan={7} className="py-10 text-center text-[var(--text-muted)]">No warehouses found.</td></tr>
              ) : rows.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{w.warehouse_name}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{w.warehouse_type || "—"}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{w.address || "—"}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{w.manager_name || "—"}</td>
                  <td className="px-4 py-3 text-right">{Number(w.capacity || 0).toFixed(3)}</td>
                  <td className="px-4 py-3 text-right">{w.location_count || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <Link to={`/warehouses/${w.id}`} className="rounded px-2 py-1 text-xs text-slate-700 hover:bg-slate-100">View</Link>
                      <button onClick={() => setModal({
                        id: w.id,
                        warehouse_name: w.warehouse_name || "",
                        warehouse_type: w.warehouse_type || "",
                        address: w.address || "",
                        manager_id: w.manager_id ? String(w.manager_id) : "",
                        capacity: w.capacity ?? "",
                      })} className="rounded px-2 py-1 text-xs text-brand-600 hover:bg-brand-50">Edit</button>
                      <button onClick={() => remove(w.id)} className="rounded px-2 py-1 text-xs text-rose-600 hover:bg-rose-50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        pagination={pagination}
        onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
        onLimitChange={(limit) => setPagination((p) => ({ ...p, limit, page: 1 }))}
      />

      {modal !== null && (
        <WarehouseModal
          initial={modal}
          managers={managers}
          loading={saving}
          onSave={save}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

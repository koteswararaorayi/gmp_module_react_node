import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Alert from "../../components/Alert";
import LoadingSpinner from "../../components/LoadingSpinner";
import Pagination from "../../components/Pagination";
import WarehouseSelector from "../../components/WarehouseSelector";
import locationService from "../../services/locationService";
import warehouseService from "../../services/warehouseService";

const defaultForm = {
  warehouse_id: "",
  location_code: "",
  location_name: "",
  row: "",
  column: "",
  shelf: "",
  zone: "",
  capacity: "",
};

function LocationModal({ initial, warehouses, saving, onSave, onClose }) {
  const [values, setValues] = useState(initial || defaultForm);
  const [errors, setErrors] = useState({});

  const setField = (k, v) => setValues((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!values.warehouse_id) e.warehouse_id = "Warehouse is required";
    if (!values.location_code?.trim()) e.location_code = "Location code is required";
    if (!values.location_name?.trim()) e.location_name = "Location name is required";
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
        <h2 className="mb-4 text-base font-semibold">{values.id ? "Edit Location" : "New Location"}</h2>
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={submit}>
          <div className="sm:col-span-2">
            <WarehouseSelector warehouses={warehouses} value={values.warehouse_id} onChange={(v) => setField("warehouse_id", v)} required />
            {errors.warehouse_id && <p className="mt-1 text-xs text-rose-500">{errors.warehouse_id}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Location Code *</label>
            <input value={values.location_code || ""} onChange={(e) => setField("location_code", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            {errors.location_code && <p className="text-xs text-rose-500">{errors.location_code}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Location Name *</label>
            <input value={values.location_name || ""} onChange={(e) => setField("location_name", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            {errors.location_name && <p className="text-xs text-rose-500">{errors.location_name}</p>}
          </div>

          <div className="flex flex-col gap-1"><label className="text-sm font-medium">Row</label><input value={values.row || ""} onChange={(e) => setField("row", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
          <div className="flex flex-col gap-1"><label className="text-sm font-medium">Column</label><input value={values.column || ""} onChange={(e) => setField("column", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
          <div className="flex flex-col gap-1"><label className="text-sm font-medium">Shelf</label><input value={values.shelf || ""} onChange={(e) => setField("shelf", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
          <div className="flex flex-col gap-1"><label className="text-sm font-medium">Zone</label><input value={values.zone || ""} onChange={(e) => setField("zone", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-sm font-medium">Capacity</label>
            <input type="number" min="0" step="0.001" value={values.capacity ?? ""} onChange={(e) => setField("capacity", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            {errors.capacity && <p className="text-xs text-rose-500">{errors.capacity}</p>}
          </div>

          <div className="sm:col-span-2 mt-2 flex gap-3">
            <button type="submit" disabled={saving} className="rounded-lg bg-brand-600 px-5 py-2 text-sm text-white hover:bg-brand-700 disabled:opacity-60">{saving ? "Saving…" : "Save"}</button>
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-5 py-2 text-sm hover:bg-slate-100">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LocationsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState(searchParams.get("warehouse_id") || "");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [alert, setAlert] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  const params = useMemo(() => ({
    warehouse_id: warehouseId || undefined,
    page: pagination.page,
    limit: pagination.limit,
    search: search || undefined,
  }), [warehouseId, pagination.page, pagination.limit, search]);

  const loadWarehouses = async () => {
    try {
      const res = await warehouseService.getWarehouses({ limit: 200, page: 1 });
      setWarehouses(res.data || []);
    } catch (e) {
      setAlert({ type: "error", msg: e.message || "Failed to load warehouses" });
    }
  };

  const loadLocations = async () => {
    if (!warehouseId) {
      setRows([]);
      setPagination((p) => ({ ...p, total: 0, pages: 0 }));
      return;
    }

    setLoading(true);
    try {
      const res = await locationService.getLocations(params);
      setRows(res.data || []);
      setPagination(res.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
    } catch (e) {
      setAlert({ type: "error", msg: e.message || "Failed to load locations" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    loadLocations();
    if (warehouseId) setSearchParams({ warehouse_id: warehouseId });
  }, [params.warehouse_id, params.page, params.limit, params.search]);

  const save = async (values) => {
    setSaving(true);
    try {
      const payload = {
        warehouse_id: Number(values.warehouse_id),
        location_code: values.location_code,
        location_name: values.location_name,
        row: values.row || null,
        column: values.column || null,
        shelf: values.shelf || null,
        zone: values.zone || null,
        capacity: values.capacity === "" ? 0 : Number(values.capacity || 0),
      };

      if (values.id) {
        await locationService.updateLocation(values.id, payload);
        setAlert({ type: "success", msg: "Location updated." });
      } else {
        await locationService.createLocation(payload);
        setAlert({ type: "success", msg: "Location created." });
      }
      setModal(null);
      await loadLocations();
    } catch (e) {
      setAlert({ type: "error", msg: e.message || "Failed to save location" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this location?")) return;
    try {
      await locationService.deleteLocation(id);
      setAlert({ type: "success", msg: "Location deleted." });
      await loadLocations();
    } catch (e) {
      setAlert({ type: "error", msg: e.message || "Failed to delete location" });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Locations</h1>
          <p className="text-sm text-[var(--text-muted)]">Warehouse specific storage locations</p>
        </div>
        <button onClick={() => setModal({ ...defaultForm, warehouse_id: warehouseId || "" })} className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">+ New Location</button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[260px]">
          <WarehouseSelector warehouses={warehouses} value={warehouseId} onChange={(v) => { setWarehouseId(v); setPagination((p) => ({ ...p, page: 1 })); }} required />
        </div>
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
          placeholder="Search locations..."
          className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {alert && <Alert type={alert.type} message={alert.msg} autoClose onClose={() => setAlert(null)} />}

      {!warehouseId ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-sm text-[var(--text-muted)]">Select a warehouse to manage its locations.</div>
      ) : loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border-soft)]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Row</th>
                <th className="px-4 py-3 text-left">Column</th>
                <th className="px-4 py-3 text-left">Shelf</th>
                <th className="px-4 py-3 text-left">Zone</th>
                <th className="px-4 py-3 text-right">Capacity</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr><td colSpan={8} className="py-10 text-center text-[var(--text-muted)]">No locations found.</td></tr>
              ) : rows.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{l.location_code}</td>
                  <td className="px-4 py-3">{l.location_name}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{l.row || "—"}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{l.column || "—"}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{l.shelf || "—"}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{l.zone || "—"}</td>
                  <td className="px-4 py-3 text-right">{Number(l.capacity || 0).toFixed(3)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => setModal({
                        id: l.id,
                        warehouse_id: String(l.warehouse_id || ""),
                        location_code: l.location_code || "",
                        location_name: l.location_name || "",
                        row: l.row || "",
                        column: l.column || "",
                        shelf: l.shelf || "",
                        zone: l.zone || "",
                        capacity: l.capacity ?? "",
                      })} className="rounded px-2 py-1 text-xs text-brand-600 hover:bg-brand-50">Edit</button>
                      <button onClick={() => remove(l.id)} className="rounded px-2 py-1 text-xs text-rose-600 hover:bg-rose-50">Delete</button>
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
        <LocationModal
          initial={modal}
          warehouses={warehouses}
          saving={saving}
          onSave={save}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

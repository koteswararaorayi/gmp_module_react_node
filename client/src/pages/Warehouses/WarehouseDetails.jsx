import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Alert from "../../components/Alert";
import CapacityBar from "../../components/CapacityBar";
import LoadingSpinner from "../../components/LoadingSpinner";
import warehouseService from "../../services/warehouseService";

export default function WarehouseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState(null);
  const [locations, setLocations] = useState([]);
  const [capacity, setCapacity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [whRes, locRes, capRes] = await Promise.all([
        warehouseService.getWarehouse(id),
        warehouseService.getWarehouseLocations(id),
        warehouseService.getCapacityStatus(id),
      ]);

      setWarehouse(whRes.data || null);
      setLocations(locRes.data || []);
      setCapacity(capRes.data || null);
    } catch (e) {
      setAlert({ type: "error", msg: e.message || "Failed to load warehouse details" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center py-16"><LoadingSpinner /></div>;
  }

  if (!warehouse) {
    return <Alert type="error" message="Warehouse not found." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{warehouse.warehouse_name}</h1>
          <p className="text-sm text-[var(--text-muted)]">Warehouse details and locations</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/locations?warehouse_id=${warehouse.id}`} className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">Manage Locations</Link>
          <button onClick={() => navigate("/warehouses")} className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100">Back</button>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.msg} autoClose onClose={() => setAlert(null)} />}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase text-[var(--text-muted)]">Overview</h2>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <p><span className="text-[var(--text-muted)]">Type:</span> {warehouse.warehouse_type || "—"}</p>
            <p><span className="text-[var(--text-muted)]">Address:</span> {warehouse.address || "—"}</p>
            <p><span className="text-[var(--text-muted)]">Manager:</span> {warehouse.manager_name || "—"}</p>
            <p><span className="text-[var(--text-muted)]">Capacity:</span> {Number(warehouse.capacity || 0).toFixed(3)}</p>
            <p><span className="text-[var(--text-muted)]">Location Count:</span> {warehouse.location_count || 0}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5">
          <CapacityBar total={capacity?.total_capacity || 0} allocated={capacity?.allocated_capacity || 0} />
          <div className="mt-3 text-xs text-[var(--text-muted)]">
            Available: {Number(capacity?.available_capacity || 0).toFixed(3)}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase text-[var(--text-muted)]">Locations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-[var(--text-muted)]">
              <tr>
                <th className="px-3 py-2 text-left">Code</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Row</th>
                <th className="px-3 py-2 text-left">Column</th>
                <th className="px-3 py-2 text-left">Shelf</th>
                <th className="px-3 py-2 text-left">Zone</th>
                <th className="px-3 py-2 text-right">Capacity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {locations.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-[var(--text-muted)]">No locations found.</td></tr>
              ) : locations.map((l) => (
                <tr key={l.id}>
                  <td className="px-3 py-2">{l.location_code}</td>
                  <td className="px-3 py-2">{l.location_name}</td>
                  <td className="px-3 py-2">{l.row || "—"}</td>
                  <td className="px-3 py-2">{l.column || "—"}</td>
                  <td className="px-3 py-2">{l.shelf || "—"}</td>
                  <td className="px-3 py-2">{l.zone || "—"}</td>
                  <td className="px-3 py-2 text-right">{Number(l.capacity || 0).toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

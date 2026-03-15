import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import useItemsStore from "../../stores/itemsStore";

function Row({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  );
}

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentItem, loading, error, fetchItemById, deleteItem } = useItemsStore();

  useEffect(() => {
    fetchItemById(id);
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this item?")) return;
    const result = await deleteItem(Number(id));
    if (result.success) navigate("/items");
  };

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner /></div>;

  if (error || !currentItem) {
    return (
      <div className="py-16 text-center text-sm text-rose-500">
        {error || "Item not found."}{" "}
        <button onClick={() => navigate("/items")} className="underline">Back to list</button>
      </div>
    );
  }

  const item = currentItem;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{item.item_name}</h1>
          <p className="font-mono text-sm text-brand-600">{item.item_code}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/items/${id}/edit`)}
            className="rounded-lg border border-brand-600 px-4 py-2 text-sm text-brand-700 hover:bg-brand-50"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="rounded-lg border border-rose-500 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
          >
            Delete
          </button>
          <button
            onClick={() => navigate("/items")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
          >
            Back
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[var(--shadow-panel)]">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          <Row label="Item Code" value={item.item_code} />
          <Row label="Item Name" value={item.item_name} />
          <Row label="SKU" value={item.sku} />
          <Row label="Item Type" value={item.item_type_name} />
          <Row label="Category" value={item.category_name} />
          <Row label="UOM" value={item.uom_name ? `${item.uom_name} (${item.uom_code})` : "—"} />
          <Row label="Supplier" value={item.supplier_name} />
          <Row label="Manufacturer" value={item.manufacturer_name} />
          <Row label="Status" value={item.is_active === 0 ? "Active" : "Inactive"} />
        </div>
        {item.description && (
          <div className="mt-6 flex flex-col gap-1">
            <span className="text-xs text-[var(--text-muted)]">Description</span>
            <p className="text-sm">{item.description}</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-[var(--shadow-panel)]">
        <p className="text-xs text-[var(--text-muted)]">Audit Trail</p>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <Row label="Created" value={item.created_date ? new Date(item.created_date).toLocaleString() : "—"} />
          <Row label="Created By" value={item.created_by} />
          <Row label="Updated" value={item.updated_date ? new Date(item.updated_date).toLocaleString() : "—"} />
          <Row label="Updated By" value={item.updated_by} />
        </div>
      </div>
    </div>
  );
}

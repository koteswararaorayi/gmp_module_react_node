import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

function ItemsTable({ items, loading, onDelete, basePath = "/items" }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-sm text-[var(--text-muted)]">
        No items found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--border-soft)]">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-[var(--text-muted)]">
          <tr>
            <th className="px-4 py-3 text-left">Code</th>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Category</th>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-left">UOM</th>
            <th className="px-4 py-3 text-left">Supplier</th>
            <th className="px-4 py-3 text-left">Manufacturer</th>
            <th className="px-4 py-3 text-left">Created</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr
              key={item.id}
              className="cursor-pointer hover:bg-slate-50"
              onClick={() => navigate(`${basePath}/${item.id}`)}
            >
              <td className="px-4 py-3 font-mono font-medium text-brand-700">{item.item_code}</td>
              <td className="px-4 py-3 font-medium">{item.item_name}</td>
              <td className="px-4 py-3 text-[var(--text-muted)]">{item.category_name || "—"}</td>
              <td className="px-4 py-3 text-[var(--text-muted)]">{item.item_type_name || "—"}</td>
              <td className="px-4 py-3 text-[var(--text-muted)]">{item.uom_name || "—"}</td>
              <td className="px-4 py-3 text-[var(--text-muted)]">{item.supplier_name || "—"}</td>
              <td className="px-4 py-3 text-[var(--text-muted)]">{item.manufacturer_name || "—"}</td>
              <td className="px-4 py-3 text-[var(--text-muted)]">
                {item.created_date ? new Date(item.created_date).toLocaleDateString() : "—"}
              </td>
              <td
                className="px-4 py-3 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => navigate(`${basePath}/${item.id}`)}
                    className="rounded-lg px-2 py-1 text-xs text-sky-600 hover:bg-sky-50"
                  >
                    View
                  </button>
                  <button
                    onClick={() => navigate(`${basePath}/${item.id}/edit`)}
                    className="rounded-lg px-2 py-1 text-xs text-brand-600 hover:bg-brand-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="rounded-lg px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ItemsTable;

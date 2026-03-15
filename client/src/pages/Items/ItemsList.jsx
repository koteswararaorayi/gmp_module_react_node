import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../../components/Alert";
import ExportButton from "../../components/ExportButton";
import ItemsTable from "../../components/ItemsTable";
import Pagination from "../../components/Pagination";
import SearchFilter from "../../components/SearchFilter";
import useItems from "../../hooks/useItems";
import useItemsStore from "../../stores/itemsStore";
import { useEffect } from "react";

export default function ItemsList() {
  const navigate = useNavigate();
  const {
    items, loading, error, pagination,
    filters, setFilters, setCurrentPage, setPageLimit,
    deleteItem, clearError,
  } = useItems();

  const { categories, itemTypes, suppliers, manufacturers, fetchMasterData } = useItemsStore();

  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("success");

  useEffect(() => {
    fetchMasterData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    const result = await deleteItem(id);
    if (result.success) {
      setAlertType("success");
      setAlertMsg("Item deleted successfully.");
    } else {
      setAlertType("error");
      setAlertMsg(result.message || "Failed to delete item.");
    }
  };

  const dropdowns = {
    category_id: {
      label: "Category",
      options: categories.map((c) => ({ value: c.id, label: c.category_name })),
    },
    item_type_id: {
      label: "Type",
      options: itemTypes.map((t) => ({ value: t.id, label: t.item_type_name })),
    },
    supplier_id: {
      label: "Supplier",
      options: suppliers.map((s) => ({ value: s.id, label: s.supplier_name })),
    },
    manufacturer_id: {
      label: "Manufacturer",
      options: manufacturers.map((m) => ({ value: m.id, label: m.manufacturer_name })),
    },
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Items</h1>
          <p className="text-sm text-[var(--text-muted)]">Manage inventory item master data</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton filters={filters} />
          <Link
            to="/items/new"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            + New Item
          </Link>
        </div>
      </div>

      {alertMsg && (
        <Alert type={alertType} message={alertMsg} autoClose onClose={() => setAlertMsg("")} />
      )}
      {error && (
        <Alert type="error" message={error} onClose={clearError} />
      )}

      <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-[var(--shadow-panel)]">
        <SearchFilter
          filters={filters}
          onApply={setFilters}
          onReset={() => setFilters({ search: "", category_id: "", item_type_id: "", supplier_id: "", manufacturer_id: "" })}
          dropdowns={dropdowns}
        />
      </div>

      <ItemsTable
        items={items}
        loading={loading}
        onDelete={handleDelete}
        basePath="/items"
      />

      <Pagination
        pagination={pagination}
        onPageChange={setCurrentPage}
        onLimitChange={setPageLimit}
      />
    </div>
  );
}

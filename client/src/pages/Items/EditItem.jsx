import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "../../components/Alert";
import ItemForm from "../../components/ItemForm";
import LoadingSpinner from "../../components/LoadingSpinner";
import useItemsStore from "../../stores/itemsStore";

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentItem, categories, itemTypes, uoms, suppliers, manufacturers,
    fetchMasterData, fetchItemById, updateItem, loading,
  } = useItemsStore();

  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("error");

  useEffect(() => {
    fetchMasterData();
    fetchItemById(id);
  }, [id]);

  useEffect(() => {
    if (!currentItem) return;

    const findIdByName = (arr, key, value) => {
      if (!value) return "";
      const match = arr.find((x) => String(x[key] || "").toLowerCase() === String(value).toLowerCase());
      return match ? String(match.id) : "";
    };

    setValues({
      id: currentItem.id,
      item_code: currentItem.item_code,
      item_name: currentItem.item_name,
      item_type_id: String(currentItem.item_type_id || currentItem.item_type || ""),
      category_id: String(currentItem.category_id || currentItem.item_category || ""),
      uom_id: String(currentItem.uom_id || currentItem.uom || ""),
      supplier_id: String(currentItem.supplier_id || findIdByName(suppliers, "supplier_name", currentItem.supplier_name) || ""),
      manufacturer_id: String(currentItem.manufacturer_id || findIdByName(manufacturers, "manufacturer_name", currentItem.manufacturer_name) || ""),
      description: currentItem.description || "",
    });
  }, [currentItem, suppliers, manufacturers]);

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!values.item_name?.trim()) e.item_name = "Item name is required";
    if (!values.item_type_id) e.item_type_id = "Item type is required";
    if (!values.category_id) e.category_id = "Category is required";
    if (!values.uom_id) e.uom_id = "UOM is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const result = await updateItem(id, values);
    if (result.success) {
      setAlertType("success");
      setAlertMsg("Item updated successfully.");
    } else {
      setAlertType("error");
      setAlertMsg(result.message || "Failed to update item.");
    }
  };

  if (loading && !currentItem) {
    return <div className="flex justify-center py-16"><LoadingSpinner /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Edit Item</h1>
        <p className="text-sm text-[var(--text-muted)]">{currentItem?.item_code}</p>
      </div>

      {alertMsg && (
        <Alert type={alertType} message={alertMsg} autoClose onClose={() => setAlertMsg("")} />
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[var(--shadow-panel)]"
      >
        <ItemForm
          values={values}
          onChange={handleChange}
          errors={errors}
          categories={categories}
          itemTypes={itemTypes}
          uoms={uoms}
          suppliers={suppliers}
          manufacturers={manufacturers}
        />

        {currentItem && (
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-[var(--text-muted)]">
            Created: {currentItem.created_date ? new Date(currentItem.created_date).toLocaleDateString() : "—"} &nbsp;|&nbsp;
            Updated: {currentItem.updated_date ? new Date(currentItem.updated_date).toLocaleDateString() : "—"}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Saving…" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/items/${id}`)}
            className="rounded-lg border border-slate-300 px-6 py-2 text-sm hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

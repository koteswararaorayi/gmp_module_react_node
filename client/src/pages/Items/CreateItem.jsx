import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../../components/Alert";
import ItemForm from "../../components/ItemForm";
import useItemsStore from "../../stores/itemsStore";

export default function CreateItem() {
  const navigate = useNavigate();
  const { categories, itemTypes, uoms, suppliers, manufacturers, fetchMasterData, createItem, loading } =
    useItemsStore();

  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [alertMsg, setAlertMsg] = useState("");

  useEffect(() => {
    fetchMasterData();
  }, []);

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!values.item_code?.trim()) e.item_code = "Item code is required";
    else if (!/^[a-zA-Z0-9_-]{1,50}$/.test(values.item_code.trim()))
      e.item_code = "Alphanumeric, hyphens, underscores only (max 50)";
    if (!values.item_name?.trim()) e.item_name = "Item name is required";
    if (!values.item_type_id) e.item_type_id = "Item type is required";
    if (!values.category_id) e.category_id = "Category is required";
    if (!values.uom_id) e.uom_id = "UOM is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const result = await createItem(values);
    if (result.success) {
      navigate("/items");
    } else {
      setAlertMsg(result.message || "Failed to create item.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Create Item</h1>
        <p className="text-sm text-[var(--text-muted)]">Add a new item to the master list</p>
      </div>

      {alertMsg && (
        <Alert type="error" message={alertMsg} onClose={() => setAlertMsg("")} />
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

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Saving…" : "Create Item"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/items")}
            className="rounded-lg border border-slate-300 px-6 py-2 text-sm hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

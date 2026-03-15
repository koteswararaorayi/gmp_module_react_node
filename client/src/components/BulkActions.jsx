function BulkActions({ selectedIds, onDelete, onClear }) {
  if (!selectedIds.length) return null;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
      <span className="text-sm font-medium text-amber-800">
        {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} selected
      </span>
      <button
        type="button"
        onClick={() => onDelete(selectedIds)}
        className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-medium text-white hover:bg-rose-700"
      >
        Delete Selected
      </button>
      <button
        type="button"
        onClick={onClear}
        className="rounded-lg border border-slate-300 px-3 py-1 text-xs hover:bg-white"
      >
        Clear
      </button>
    </div>
  );
}

export default BulkActions;

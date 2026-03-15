function Pagination({ pagination, onPageChange, onLimitChange }) {
  const { page, pages, total, limit } = pagination;

  if (total === 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const getPages = () => {
    const arr = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
      arr.push(i);
    }
    return arr;
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-[var(--text-muted)]">
        Showing {start}–{end} of {total} records
      </p>

      <div className="flex items-center gap-2">
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          {[20, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>

        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-40 hover:bg-slate-100"
        >
          Prev
        </button>

        {getPages().map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`rounded-lg border px-3 py-1 text-sm ${
              p === page
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-slate-300 hover:bg-slate-100"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-40 hover:bg-slate-100"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;

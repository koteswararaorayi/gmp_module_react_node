import { useEffect } from "react";

function Alert({ type = "info", message, onClose, autoClose = false }) {
  if (!message) {
    return null;
  }

  useEffect(() => {
    if (!autoClose || !onClose) {
      return undefined;
    }

    const timeout = setTimeout(onClose, 5000);
    return () => clearTimeout(timeout);
  }, [autoClose, onClose]);

  const classes = {
    info: "border-sky-200 bg-sky-50 text-sky-700",
    error: "border-rose-200 bg-rose-50 text-rose-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
  };

  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm">
      <div className={`${classes[type] || classes.info} -m-4 flex-1 rounded-2xl px-4 py-3`}>
        {message}
      </div>
      {onClose ? (
        <button
          type="button"
          className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700"
          onClick={onClose}
        >
          Close
        </button>
      ) : null}
    </div>
  );
}

export default Alert;

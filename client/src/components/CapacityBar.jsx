export default function CapacityBar({ total = 0, allocated = 0 }) {
  const safeTotal = Number(total || 0);
  const safeAllocated = Number(allocated || 0);
  const percent = safeTotal > 0 ? Math.min((safeAllocated / safeTotal) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--text-secondary)]">Capacity Utilization</span>
        <span className="font-medium">{percent.toFixed(2)}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-brand-600 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-[var(--text-muted)]">
        Allocated {safeAllocated} of {safeTotal}
      </p>
    </div>
  );
}

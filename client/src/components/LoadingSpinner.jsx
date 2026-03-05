function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
      <span>{label}</span>
    </div>
  );
}

export default LoadingSpinner;

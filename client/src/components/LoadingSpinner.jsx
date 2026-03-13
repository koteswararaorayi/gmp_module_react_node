function LoadingSpinner({ label = "Loading...", variant = "inline" }) {
  if (variant === "page") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
          <span>{label}</span>
        </div>
      </div>
    );
  }

  if (variant === "overlay") {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-white/70 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
          <span>{label}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
      <span>{label}</span>
    </div>
  );
}

export default LoadingSpinner;

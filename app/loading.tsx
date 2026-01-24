export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3 text-slate-600">
        <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-emerald-500 animate-spin" aria-label="Loading" />
        <p className="text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}

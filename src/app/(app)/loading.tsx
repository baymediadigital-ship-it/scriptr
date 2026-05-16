export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2 animate-pulse">
      <div className="h-8 w-48 rounded-xl shimmer rounded-xl" />
      <div className="h-4 w-64 rounded-lg shimmer rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl shimmer rounded-2xl" />
        ))}
      </div>
      <div className="h-40 rounded-2xl shimmer rounded-2xl" />
    </div>
  );
}

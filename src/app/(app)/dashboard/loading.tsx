export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-2">
      <div>
        <div className="h-8 w-64 rounded-xl shimmer" />
        <div className="h-4 w-48 rounded-lg shimmer mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl shimmer" />
        ))}
      </div>
      <div className="h-40 rounded-2xl shimmer" />
    </div>
  );
}

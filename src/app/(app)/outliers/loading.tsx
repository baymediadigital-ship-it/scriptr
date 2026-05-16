export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      <div>
        <div className="h-7 w-52 rounded-xl shimmer" />
        <div className="h-4 w-72 rounded-lg shimmer mt-2" />
      </div>
      <div className="flex gap-3">
        <div className="h-10 flex-1 rounded-xl shimmer" />
        <div className="h-10 w-32 rounded-xl shimmer" />
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 rounded-2xl shimmer" />
        ))}
      </div>
    </div>
  );
}

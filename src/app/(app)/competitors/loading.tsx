export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      <div>
        <div className="h-7 w-40 rounded-xl shimmer" />
        <div className="h-4 w-80 rounded-lg shimmer mt-2" />
      </div>
      <div className="h-16 rounded-2xl shimmer" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl shimmer" />
        ))}
      </div>
    </div>
  );
}

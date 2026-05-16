export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-2">
      <div>
        <div className="h-7 w-32 rounded-xl shimmer" />
        <div className="h-4 w-56 rounded-lg shimmer mt-2" />
      </div>
      <div className="h-40 rounded-2xl shimmer" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-64 rounded-2xl shimmer" />
        <div className="h-64 rounded-2xl shimmer" />
      </div>
    </div>
  );
}

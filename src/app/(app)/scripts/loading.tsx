export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      <div>
        <div className="h-7 w-44 rounded-xl shimmer" />
        <div className="h-4 w-80 rounded-lg shimmer mt-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="h-40 rounded-2xl shimmer" />
          <div className="h-24 rounded-2xl shimmer" />
          <div className="h-10 rounded-xl shimmer" />
        </div>
        <div className="h-96 rounded-2xl shimmer" />
      </div>
    </div>
  );
}

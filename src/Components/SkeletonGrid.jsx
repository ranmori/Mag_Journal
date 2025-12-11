// SkeletonGrid.jsx
export default function SkeletonGrid({ rows = 2, cardsPerRow = 3 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 p-6 animate-pulse">
      {Array.from({ length: rows * cardsPerRow }).map((_, i) => (
        <div key={i} className="space-y-3">
          {/* cover */}
          <div className="bg-gray-300 dark:bg-white h-60 rounded-md" />
          {/* title */}
          <div className="h-4 bg-gray-300 dark:bg-white rounded w-3/4" />
          {/* issue line */}
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
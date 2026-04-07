export default function AdminItensLoading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2" />
          <div className="h-4 w-36 bg-gray-100 rounded" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-gray-200 rounded-xl" />
          <div className="h-10 w-36 bg-gray-300 rounded-xl" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="h-10 w-64 bg-gray-200 rounded-xl" />
        <div className="h-10 w-48 bg-gray-200 rounded-xl" />
      </div>

      <div className="bg-white rounded-2xl" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="flex gap-4 px-5 py-3 border-b border-gray-100">
          {[60, 80, 140, 80, 80, 60, 60, 80, 40].map((w, i) => (
            <div key={i} className="h-3 bg-gray-100 rounded" style={{ width: w }} />
          ))}
        </div>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex gap-4 items-center px-5 py-4 border-b border-gray-50">
            <div className="h-4 w-14 bg-gray-200 rounded" />
            <div className="h-4 w-28 bg-gray-100 rounded" />
            <div className="h-4 flex-1 bg-gray-100 rounded" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
            <div className="h-4 w-12 bg-gray-100 rounded" />
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
            <div className="h-4 w-8 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

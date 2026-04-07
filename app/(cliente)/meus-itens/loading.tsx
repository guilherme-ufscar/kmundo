export default function MeusItensLoading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="mb-8">
        <div className="h-8 w-40 bg-gray-200 rounded-lg mb-2" />
        <div className="h-4 w-28 bg-gray-100 rounded" />
      </div>

      <div className="bg-white rounded-2xl" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        {/* Table header */}
        <div className="grid grid-cols-5 gap-4 px-6 py-3 border-b border-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-3 bg-gray-100 rounded" />
          ))}
        </div>
        {/* Rows */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-50">
            <div>
              <div className="h-4 w-full bg-gray-200 rounded mb-1" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
            <div className="h-4 w-20 bg-gray-100 rounded" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

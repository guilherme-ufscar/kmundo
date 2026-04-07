export default function PerfilLoading() {
  return (
    <div className="p-8 max-w-xl animate-pulse">
      <div className="mb-8">
        <div className="h-8 w-32 bg-gray-200 rounded-lg mb-2" />
        <div className="h-4 w-48 bg-gray-100 rounded" />
      </div>

      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="space-y-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-4 w-32 bg-gray-100 rounded mb-1.5" />
              <div className="h-11 w-full bg-gray-200 rounded-lg" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i}>
                <div className="h-4 w-20 bg-gray-100 rounded mb-1.5" />
                <div className="h-11 w-full bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
          <div className="h-11 w-40 bg-gray-300 rounded-lg mt-2" />
        </div>
      </div>
    </div>
  )
}

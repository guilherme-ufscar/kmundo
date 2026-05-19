export default function MeusPedidosLoading() {
  return (
    <div className="p-4 sm:p-8 animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-7 w-40 bg-gray-200 rounded-lg mb-2" />
          <div className="h-4 w-56 bg-gray-100 rounded" />
        </div>
        <div className="h-11 w-36 bg-gray-200 rounded-xl" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 flex items-center gap-4"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <div className="w-10 h-10 rounded-xl bg-gray-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-48 bg-gray-100 rounded" />
            </div>
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

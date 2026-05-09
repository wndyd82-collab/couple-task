export default function SkeletonTodo() {
  return (
    <div
      className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse"
      aria-hidden="true"
    >
      <div className="flex items-start gap-3 p-4">
        <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0 mt-0.5" />
        <div className="flex-1 flex flex-col gap-2 py-0.5">
          <div className="h-3.5 bg-gray-200 rounded-full w-3/4" />
          <div className="h-3 bg-gray-200 rounded-full w-1/5" />
        </div>
      </div>
      <div className="border-t border-gray-100 px-4 py-2.5 flex items-center gap-2">
        <div className="h-3 bg-gray-100 rounded-full w-20" />
      </div>
    </div>
  )
}

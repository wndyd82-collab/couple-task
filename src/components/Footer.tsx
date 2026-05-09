export default function Footer() {
  return (
    <footer className="bg-white border-t border-orange-100 mt-auto">
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-lg" aria-hidden="true">❤️</span>
          <span className="font-bold text-gray-700">CoupleTask</span>
        </div>
        <p className="text-xs text-gray-400">함께하는 할 일 관리 서비스</p>
        <p className="text-xs text-gray-300">© 2026 CoupleTask. All rights reserved.</p>
      </div>
    </footer>
  )
}

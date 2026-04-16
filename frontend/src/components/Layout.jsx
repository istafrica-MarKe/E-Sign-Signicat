export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 4h10M3 8h10M3 12h6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-semibold text-slate-800 text-lg tracking-tight">DocSign</span>
          </div>
          {/* BankID SE badge */}
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-medium text-blue-700">BankID SE</span>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-auto py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-xs text-slate-400">
          <span>© 2026 DocSign</span>
          <span>Powered by <span className="font-medium text-slate-500">Signicat</span></span>
        </div>
      </footer>
    </div>
  )
}

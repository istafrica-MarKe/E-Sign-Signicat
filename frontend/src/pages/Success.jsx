import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

export default function Success() {
  const navigate = useNavigate()
  const [sessionId] = useState(() => localStorage.getItem('sessionId'))
  const [documentTitle] = useState(() => localStorage.getItem('documentTitle') || 'Document')
  const [state, setState] = useState('checking') // checking | signed | pending | error
  const [resultDocumentId, setResultDocumentId] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [pollCount, setPollCount] = useState(0)

  useEffect(() => {
    if (!sessionId) { navigate('/'); return }
    pollSession()
  }, [sessionId])

  async function pollSession() {
    try {
      const res = await fetch(`/api/signing/sessions/${sessionId}`)
      const data = await res.json()

      if (!res.ok) {
        console.error('[DocSign] Session check failed:', data)
        setState('error')
        return
      }

      console.log('[DocSign] Session state:', data.lifecycle?.state, data)

      const lifecycle = data.lifecycle?.state
      const padesId = data.output?.packages?.[0]?.resultDocumentId

      if (padesId) {
        // Signed + packaged — ready to download
        setResultDocumentId(padesId)
        setState('signed')
      } else if (lifecycle === 'SIGNED') {
        // Signed but packaging still in progress
        setState('pending')
        if (pollCount < 15) {
          setTimeout(() => {
            setPollCount(c => c + 1)
            pollSession()
          }, 2000)
        }
      } else {
        setState('pending')
      }
    } catch (err) {
      console.error('[DocSign] Failed to fetch session:', err)
      setState('error')
    }
  }

  async function downloadSigned() {
    if (!resultDocumentId) return
    setDownloading(true)
    try {
      const res = await fetch(`/api/signing/documents/${resultDocumentId}/download`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `signed-${documentTitle.replace(/\.pdf$/i, '')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('[DocSign] Download failed:', err)
      alert('Download failed: ' + err.message)
    } finally {
      setDownloading(false)
    }
  }

  function startOver() {
    localStorage.removeItem('sessionId')
    localStorage.removeItem('documentTitle')
    navigate('/')
  }

  return (
    <Layout>
      <div className="max-w-lg mx-auto text-center">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M10 21l7 7 13-14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Document Signed!</h1>
        <p className="text-slate-500 mb-8">
          <span className="font-medium text-slate-700">"{documentTitle}"</span> has been successfully signed with BankID SE.
        </p>

        {/* Info card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-6">

          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <span className="text-sm text-slate-500">Status</span>
            {state === 'checking' || state === 'pending' ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                <svg className="animate-spin" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="4" stroke="#D97706" strokeOpacity="0.3" strokeWidth="2"/>
                  <path d="M6 2a4 4 0 014 4" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {state === 'checking' ? 'Checking…' : 'Packaging PDF…'}
              </span>
            ) : state === 'signed' ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Signed & Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-700 bg-red-50 px-3 py-1 rounded-full">
                Error
              </span>
            )}
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <span className="text-sm text-slate-500">Signing method</span>
            <span className="text-sm font-medium text-slate-800">BankID SE</span>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-slate-500">Session ID</span>
            <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded-lg truncate max-w-[160px]">
              {sessionId}
            </span>
          </div>
        </div>

        {/* Pending packaging note */}
        {state === 'pending' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 text-sm text-amber-800">
            The signed PDF is being packaged. This usually takes a few seconds. The download button will appear when ready.
          </div>
        )}

        {/* Download */}
        {state === 'signed' && resultDocumentId && (
          <button
            onClick={downloadSigned}
            disabled={downloading}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md mb-3"
          >
            {downloading ? (
              <>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="white" strokeOpacity="0.3" strokeWidth="2"/>
                  <path d="M9 2a7 7 0 017 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Preparing download…
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2v10M9 12l-3.5-3.5M9 12l3.5-3.5M3 15h12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Download Signed PDF (PAdES)
              </>
            )}
          </button>
        )}

        <button
          onClick={startOver}
          className="w-full border border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300 font-medium py-3 rounded-xl transition-all text-sm"
        >
          Sign another document
        </button>
      </div>
    </Layout>
  )
}

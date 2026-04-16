import { useState } from 'react'
import Layout from '../components/Layout'
import UploadZone from '../components/UploadZone'

export default function Home() {
  const [file, setFile] = useState(null)
  const [form, setForm] = useState({ title: '', signerName: '', signerEmail: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) return setError('Please select a PDF document to sign.')
    if (!form.signerName.trim()) return setError('Signer name is required.')
    if (!form.signerEmail.trim()) return setError('Signer email is required.')

    setLoading(true)
    setError('')

    try {
      const body = new FormData()
      body.append('document', file)
      body.append('title', form.title || file.name.replace(/\.pdf$/i, ''))
      body.append('signerName', form.signerName)
      body.append('signerEmail', form.signerEmail)

      const res = await fetch('/api/signing/create', { method: 'POST', body })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to create signing order')

      // Persist for success page
      localStorage.setItem('sessionId', data.sessionId)
      localStorage.setItem('documentTitle', form.title || file.name)

      // Hand off to BankID signing
      window.location.href = data.signatureUrl

    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <Layout>
      {/* Hero */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 0a6 6 0 100 12A6 6 0 006 0zm-.5 8.5V5.5h1v3h-1zm0-4V3h1v1.5h-1z"/>
          </svg>
          Sandbox · BankID SE
        </span>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">
          Sign documents securely
        </h1>
        <p className="text-slate-500 text-lg max-w-md mx-auto">
          Upload your document and sign it digitally with Swedish BankID — fast, legal, and secure.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

        {/* Form card */}
        <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">New signing request</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Upload zone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Document <span className="text-red-500">*</span>
              </label>
              <UploadZone file={file} onFile={setFile} />
            </div>

            {/* Document title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="title">
                Document title
                <span className="text-slate-400 font-normal ml-1">(optional)</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder={file ? file.name.replace(/\.pdf$/i, '') : 'e.g. Employment Contract 2026'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400 font-medium">Signer details</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Signer name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="signerName">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                id="signerName"
                name="signerName"
                type="text"
                value={form.signerName}
                onChange={handleChange}
                placeholder="Anna Svensson"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Signer email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="signerEmail">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                id="signerEmail"
                name="signerEmail"
                type="email"
                value={form.signerEmail}
                onChange={handleChange}
                placeholder="anna@example.com"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.5"/>
                  <path d="M8 5v3.5M8 10.5v.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="7" stroke="white" strokeOpacity="0.3" strokeWidth="2"/>
                    <path d="M9 2a7 7 0 017 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Redirecting to BankID…
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M15 9A6 6 0 113 9a6 6 0 0112 0z" stroke="white" strokeWidth="1.8"/>
                    <path d="M6.5 9l2 2 3-3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Send for Signing with BankID SE
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info sidebar */}
        <div className="lg:col-span-2 space-y-4">

          {/* How it works */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">How it works</h3>
            <ol className="space-y-4">
              {[
                { n: '1', title: 'Upload your PDF', desc: 'Select the document you need signed.' },
                { n: '2', title: 'Enter signer details', desc: 'Provide the signer\'s name and email.' },
                { n: '3', title: 'Sign with BankID SE', desc: 'Securely authenticate and sign using Swedish BankID.' },
                { n: '4', title: 'Download signed copy', desc: 'Get the legally binding signed PDF instantly.' },
              ].map(step => (
                <li key={step.n} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {step.n}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{step.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Security badge */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L3 5v6c0 3.55 3.06 6.54 7 7 3.94-.46 7-3.45 7-7V5l-7-3z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M7 10l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-semibold text-sm">Bank-level security</span>
            </div>
            <p className="text-blue-100 text-xs leading-relaxed">
              All documents are encrypted end-to-end. Signatures are legally binding under EU eIDAS regulation and Swedish law.
            </p>
            <div className="mt-4 pt-4 border-t border-blue-500/50">
              <p className="text-xs text-blue-200">Powered by</p>
              <p className="font-bold text-sm mt-0.5">Signicat · BankID SE</p>
            </div>
          </div>

          {/* Sandbox note */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-amber-800 mb-1">Sandbox mode</p>
            <p className="text-xs text-amber-700">
              Use Signicat's test BankID SE credentials to sign. No real identity required in sandbox.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

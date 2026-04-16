import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

export default function Cancel() {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="max-w-lg mx-auto text-center">

        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 12v10M20 27v2" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
              <path d="M20 4L36 33H4L20 4z" stroke="#F59E0B" strokeWidth="2.5" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Signing Cancelled</h1>
        <p className="text-slate-500 mb-8">
          You cancelled the BankID signing process. No document has been signed.
        </p>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-6 text-left">
          <p className="text-sm font-medium text-slate-700 mb-1">What happened?</p>
          <p className="text-sm text-slate-500">
            The signing session was cancelled before completion. Your document remains unsigned.
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-sm"
        >
          Try Again
        </button>
      </div>
    </Layout>
  )
}

import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

export default function ErrorPage() {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="max-w-lg mx-auto text-center">

        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="16" stroke="#EF4444" strokeWidth="2.5"/>
              <path d="M14 14l12 12M26 14L14 26" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Something Went Wrong</h1>
        <p className="text-slate-500 mb-8">
          An error occurred during the signing process. Please try again.
        </p>

        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 mb-6 text-left">
          <p className="text-sm font-medium text-red-800 mb-1">Possible causes</p>
          <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
            <li>BankID SE session timed out</li>
            <li>Authentication failed</li>
            <li>Network issue during signing</li>
          </ul>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-sm"
        >
          Back to Home
        </button>
      </div>
    </Layout>
  )
}

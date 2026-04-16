import { useRef, useState } from 'react'

export default function UploadZone({ file, onFile }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.type === 'application/pdf') onFile(dropped)
  }

  function handleChange(e) {
    const selected = e.target.files[0]
    if (selected) onFile(selected)
  }

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`
        relative cursor-pointer rounded-2xl border-2 border-dashed p-8
        flex flex-col items-center justify-center gap-3 transition-all duration-200
        ${file
          ? 'border-blue-400 bg-blue-50'
          : dragging
            ? 'border-blue-500 bg-blue-50 scale-[1.01]'
            : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
      />

      {file ? (
        <>
          {/* File selected state */}
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2v6h6M9 13h6M9 17h4" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-800 text-sm">{file.name}</p>
            <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB • PDF</p>
          </div>
          <span className="text-xs text-blue-600 font-medium">Click to change file</span>
        </>
      ) : (
        <>
          {/* Empty state */}
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="font-medium text-slate-700 text-sm">Drop your PDF here</p>
            <p className="text-xs text-slate-400 mt-1">or <span className="text-blue-600 font-medium">browse files</span></p>
          </div>
          <span className="text-xs text-slate-400">PDF files only • Max 10 MB</span>
        </>
      )}
    </div>
  )
}

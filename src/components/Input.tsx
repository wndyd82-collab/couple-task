import { type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export default function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all
          ${error
            ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
            : 'border-orange-200 bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
          } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

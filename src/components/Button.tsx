import { type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  isLoading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-orange-500 hover:bg-orange-600 text-white disabled:bg-orange-300',
  secondary:
    'bg-white hover:bg-orange-50 text-orange-600 border border-orange-300 disabled:opacity-50',
  danger:
    'bg-red-500 hover:bg-red-600 text-white disabled:bg-red-300',
}

export default function Button({
  variant = 'primary',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all
        flex items-center justify-center gap-2
        ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}

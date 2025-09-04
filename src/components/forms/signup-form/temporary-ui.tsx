/**
 * Composants UI temporaires pour SignupForm
 * À remplacer par shadcn/ui composants
 */

export function Button({ 
  children, 
  variant = 'default', 
  disabled = false, 
  type = 'button', 
  className = '', 
  ...props 
}: any) {
  const baseClasses = 'px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  const variantClasses: Record<string, string> = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
  }
  
  return (
    <button 
      type={type}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Input({ error, ...props }: any) {
  const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
  const errorClasses = error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
  
  return (
    <input 
      className={`${baseClasses} ${errorClasses}`}
      {...props} 
    />
  )
}

export function Label({ children, htmlFor, required = false }: any) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}

export function Alert({ 
  children, 
  variant = 'info' 
}: { 
  children: React.ReactNode, 
  variant?: 'info' | 'error' | 'success' | 'warning' 
}) {
  const variantClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800'
  }
  
  return (
    <div className={`border rounded-lg p-3 ${variantClasses[variant]}`}>
      {children}
    </div>
  )
}
import type { ButtonHTMLAttributes, ReactNode } from 'react'

const solid =
  'inline-flex min-h-11 items-center justify-center rounded-full bg-lagoon-800 px-5 text-sm font-medium text-sand-50'
const ghost =
  'inline-flex min-h-11 items-center justify-center rounded-full border border-sand-200 bg-white px-5 text-sm font-medium text-ink'

export function Button({
  variant = 'solid',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'ghost'
  children: ReactNode
}) {
  return (
    <button className={`${variant === 'solid' ? solid : ghost} ${className}`} {...props}>
      {children}
    </button>
  )
}

import { CSSProperties } from 'react'
import { Colors } from '../lib/colors'

type ButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit'
  style?: CSSProperties
  icon?: string
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  type = 'button',
  style,
  icon,
}: ButtonProps) {
  const baseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    width: fullWidth ? '100%' : 'auto',
    fontFamily: 'Inter, system-ui, sans-serif',
    letterSpacing: '0.3px',
  }

  const sizeStyles: Record<string, CSSProperties> = {
    small: { padding: '10px 20px', fontSize: '14px' },
    medium: { padding: '14px 28px', fontSize: '15px' },
    large: { padding: '16px 32px', fontSize: '16px' },
  }

  const variantStyles: Record<string, CSSProperties> = {
    primary: {
      backgroundColor: Colors.primary,
      color: Colors.onPrimary,
      boxShadow: `0 2px 8px ${Colors.primary}40`,
    },
    secondary: {
      backgroundColor: Colors.secondary,
      color: Colors.onSecondary,
      boxShadow: `0 2px 8px ${Colors.secondary}40`,
    },
    outline: {
      backgroundColor: 'transparent',
      color: Colors.primary,
      border: `2px solid ${Colors.primary}`,
    },
    danger: {
      backgroundColor: Colors.error,
      color: '#fff',
      boxShadow: `0 2px 8px ${Colors.error}40`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: Colors.onSurface,
    },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{ ...baseStyle, ...sizeStyles[size], ...variantStyles[variant], ...style }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(-1px)'
          if (variant !== 'ghost' && variant !== 'outline') {
            e.currentTarget.style.boxShadow = `0 4px 16px ${variantStyles[variant].backgroundColor}60`
          }
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow || 'none'
      }}
    >
      {loading ? (
        <span className="material-icons" style={{ animation: 'spin 1s linear infinite', fontSize: '20px' }}>
          sync
        </span>
      ) : icon ? (
        <span className="material-icons" style={{ fontSize: '20px' }}>
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  )
}

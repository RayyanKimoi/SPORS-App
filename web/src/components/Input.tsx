import { CSSProperties, InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  fullWidth?: boolean
  icon?: string
  helperText?: string
}

export function Input({
  label,
  error,
  fullWidth = true,
  icon,
  helperText,
  style,
  className,
  ...props
}: InputProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: fullWidth ? '100%' : 'auto',
  }

  const labelStyle: CSSProperties = {
    fontSize: '11px',
    fontWeight: 500,
    color: '#737373',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    fontFamily: "'JetBrains Mono', monospace",
  }

  const inputWrapperStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#fff',
    borderRadius: '0px',
    border: error ? '1.5px solid #FF4E4E' : '1px solid #E5E5E5',
    padding: '12px 16px',
    transition: 'border-color 0.3s ease',
  }

  const inputStyle: CSSProperties = {
    flex: 1,
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: '#000',
    WebkitTextFillColor: '#000',
    fontFamily: "'Inter', system-ui, sans-serif",
    fontWeight: 400,
    ...style,
  }

  const errorStyle: CSSProperties = {
    fontSize: '12px',
    color: '#FF4E4E',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: "'JetBrains Mono', monospace",
  }

  const helperTextStyle: CSSProperties = {
    fontSize: '12px',
    color: '#A3A3A3',
  }

  return (
    <div style={containerStyle}>
      {label && <label style={labelStyle}>{label}</label>}
      <div style={inputWrapperStyle} className="input-wrapper">
        {icon && (
          <span className="material-icons" style={{ color: '#A3A3A3', fontSize: '20px' }}>
            {icon}
          </span>
        )}
        <input style={inputStyle} className="custom-input" {...props} />
      </div>
      {error && (
        <span style={errorStyle}>
          <span className="material-icons" style={{ fontSize: '14px' }}>error</span>
          {error}
        </span>
      )}
      {helperText && !error && <span style={helperTextStyle}>{helperText}</span>}
    </div>
  )
}

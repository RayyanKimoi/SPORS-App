import { CSSProperties, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Colors } from '../lib/colors'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Button } from '../components/Button'
import { Input } from '../components/Input'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [isPoliceLogin, setIsPoliceLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName)
        if (error) throw error
        setError('Account created! Please check your email to verify.')
        setIsSignUp(false)
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
        
        // If police login, verify role
        if (isPoliceLogin) {
          // Check user role from profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .single()
          
          if (profile?.role !== 'police' && profile?.role !== 'admin') {
            await supabase.auth.signOut()
            throw new Error('Access denied. Police credentials required.')
          }
          navigate('/police')
        } else {
          // Regular civilian login
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .single()
          
          if (profile?.role === 'police' || profile?.role === 'admin') {
            setError('Please use the Police login option.')
            await supabase.auth.signOut()
            return
          }
          navigate('/')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const containerStyle: CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: `linear-gradient(135deg, ${Colors.surfaceContainerLowest} 0%, ${Colors.background} 50%, ${Colors.surfaceContainerLow} 100%)`,
    position: 'relative',
    overflow: 'hidden',
  }

  const backgroundAccentStyle: CSSProperties = {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: `radial-gradient(circle, ${Colors.primary}15 0%, transparent 70%)`,
    top: '-200px',
    right: '-200px',
    pointerEvents: 'none',
  }

  const backgroundAccent2Style: CSSProperties = {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: `radial-gradient(circle, ${Colors.secondary}10 0%, transparent 70%)`,
    bottom: '-150px',
    left: '-150px',
    pointerEvents: 'none',
  }

  const cardStyle: CSSProperties = {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    position: 'relative',
    zIndex: 1,
  }

  const logoStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '32px',
  }

  const titleStyle: CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    color: Colors.primary,
  }

  const subtitleStyle: CSSProperties = {
    textAlign: 'center',
    color: Colors.onSurfaceVariant,
    marginBottom: '32px',
    fontSize: '15px',
  }

  const formStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  }

  const errorStyle: CSSProperties = {
    backgroundColor: Colors.errorContainer,
    color: Colors.error,
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    textAlign: 'center',
  }

  const toggleStyle: CSSProperties = {
    textAlign: 'center',
    marginTop: '24px',
    color: Colors.onSurfaceVariant,
    fontSize: '14px',
  }

  const switchContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '24px',
    padding: '12px',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: '12px',
  }

  const switchLabelStyle: CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    color: Colors.onSurfaceVariant,
    transition: 'color 0.3s ease',
  }

  const switchLabelActiveStyle: CSSProperties = {
    ...switchLabelStyle,
    color: Colors.primary,
    fontWeight: 600,
  }

  const switchTrackStyle: CSSProperties = {
    width: '52px',
    height: '28px',
    backgroundColor: isPoliceLogin ? Colors.primary : Colors.outline,
    borderRadius: '14px',
    position: 'relative',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  }

  const switchThumbStyle: CSSProperties = {
    width: '22px',
    height: '22px',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: '50%',
    position: 'absolute',
    top: '3px',
    left: isPoliceLogin ? '27px' : '3px',
    transition: 'left 0.3s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  }

  return (
    <div style={containerStyle}>
      <div style={backgroundAccentStyle} />
      <div style={backgroundAccent2Style} />
      <div style={cardStyle}>
        <div style={logoStyle}>
          <span className="material-icons" style={{ fontSize: '36px', color: Colors.primary }}>
            security
          </span>
          <span style={titleStyle}>SPORS</span>
        </div>

        <p style={subtitleStyle}>
          {isSignUp
            ? 'Create your account to protect your devices'
            : isPoliceLogin
            ? 'Law Enforcement Portal'
            : 'Secure Phone Ownership & Recovery System'}
        </p>

        {!isSignUp && (
          <div style={switchContainerStyle}>
            <span style={!isPoliceLogin ? switchLabelActiveStyle : switchLabelStyle}>
              <span className="material-icons" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>
                person
              </span>
              Civilian
            </span>
            <div 
              style={switchTrackStyle}
              onClick={() => setIsPoliceLogin(!isPoliceLogin)}
            >
              <div style={switchThumbStyle} />
            </div>
            <span style={isPoliceLogin ? switchLabelActiveStyle : switchLabelStyle}>
              <span className="material-icons" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>
                local_police
              </span>
              Police
            </span>
          </div>
        )}

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit} style={formStyle}>
          {isSignUp && (
            <Input
              label="Full Name"
              icon="person"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
            />
          )}

          <Input
            label="Email"
            icon="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            icon="lock"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
          />

          <Button type="submit" fullWidth loading={loading} size="large">
            {isSignUp ? 'Create Account' : isPoliceLogin ? 'Police Sign In' : 'Sign In'}
          </Button>
        </form>

        <p style={toggleStyle}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setIsSignUp(!isSignUp)
              setError('')
            }}
            style={{ color: Colors.primary, fontWeight: 500, textDecoration: 'none' }}
            onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </a>
        </p>
      </div>
    </div>
  )
}

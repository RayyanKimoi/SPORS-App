import { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { Colors } from '../lib/colors'
import { useAuth } from '../hooks/useAuth'
import { useDevices } from '../hooks/useDevices'
import { Card } from '../components/Card'
import { Button } from '../components/Button'

export function HomePage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { devices, loading } = useDevices()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const totalDevices = devices.length
  const lostDevices = devices.filter((d) => d.status === 'lost' || d.status === 'stolen').length
  const safeDevices = devices.filter((d) => d.status === 'registered').length
  const recoveredDevices = devices.filter((d) => d.status === 'recovered' || d.status === 'found').length

  const containerStyle: CSSProperties = {
    padding: '40px',
    maxWidth: '1400px',
    margin: '0 auto',
  }

  const headerStyle: CSSProperties = {
    marginBottom: '48px',
    background: `linear-gradient(135deg, ${Colors.primary}15 0%, transparent 100%)`,
    padding: '32px',
    borderRadius: '20px',
    border: `1px solid ${Colors.primary}20`,
  }

  const greetingStyle: CSSProperties = {
    fontSize: '36px',
    fontWeight: 700,
    color: Colors.onSurface,
    marginBottom: '12px',
    letterSpacing: '-0.5px',
  }

  const subGreetingStyle: CSSProperties = {
    fontSize: '18px',
    color: Colors.onSurfaceVariant,
    fontWeight: 500,
  }

  const statsGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
    marginBottom: '48px',
  }

  const statCardInnerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  }

  const statIconContainerStyle = (bgColor: string): CSSProperties => ({
    width: '72px',
    height: '72px',
    borderRadius: '18px',
    background: `linear-gradient(135deg, ${bgColor}30 0%, ${bgColor}10 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: `2px solid ${bgColor}40`,
  })

  const statValueStyle: CSSProperties = {
    fontSize: '40px',
    fontWeight: 800,
    color: Colors.onSurface,
    marginBottom: '6px',
    letterSpacing: '-1px',
  }

  const statLabelStyle: CSSProperties = {
    fontSize: '14px',
    color: Colors.onSurfaceVariant,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  }

  const sectionTitleStyle: CSSProperties = {
    fontSize: '26px',
    fontWeight: 700,
    color: Colors.onSurface,
    marginBottom: '24px',
    letterSpacing: '-0.3px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  }

  const quickActionsGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '48px',
  }

  const actionCardStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '28px',
  }

  const actionIconStyle = (color: string): CSSProperties => ({
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: `linear-gradient(135deg, ${color}40 0%, ${color}20 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: `2px solid ${color}50`,
  })

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={greetingStyle}>
          {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
        </h1>
        <p style={subGreetingStyle}>
          Welcome back to your device security dashboard
        </p>
      </header>

      <div style={statsGridStyle}>
        <Card variant="elevated" hoverable={false}>
          <div style={statCardInnerStyle}>
            <div style={statIconContainerStyle(Colors.primary)}>
              <span className="material-icons" style={{ fontSize: '36px', color: Colors.primary }}>
                devices
              </span>
            </div>
            <div>
              <div style={statValueStyle}>{loading ? '...' : totalDevices}</div>
              <div style={statLabelStyle}>Total Devices</div>
            </div>
          </div>
        </Card>

        <Card variant="elevated" hoverable={false}>
          <div style={statCardInnerStyle}>
            <div style={statIconContainerStyle(Colors.secondary)}>
              <span className="material-icons" style={{ fontSize: '36px', color: Colors.secondary }}>
                verified
              </span>
            </div>
            <div>
              <div style={statValueStyle}>{loading ? '...' : safeDevices}</div>
              <div style={statLabelStyle}>Protected</div>
            </div>
          </div>
        </Card>

        {lostDevices > 0 && (
          <Card variant="elevated" hoverable={false} style={{ borderLeft: `4px solid ${Colors.error}` }}>
            <div style={statCardInnerStyle}>
              <div style={statIconContainerStyle(Colors.error)}>
                <span className="material-icons" style={{ fontSize: '36px', color: Colors.error }}>
                  error
                </span>
              </div>
              <div>
                <div style={statValueStyle}>{loading ? '...' : lostDevices}</div>
                <div style={statLabelStyle}>At Risk</div>
              </div>
            </div>
          </Card>
        )}

        {recoveredDevices > 0 && (
          <Card variant="elevated" hoverable={false}>
            <div style={statCardInnerStyle}>
              <div style={statIconContainerStyle(Colors.tertiary)}>
                <span className="material-icons" style={{ fontSize: '36px', color: Colors.tertiary }}>
                  check_circle
                </span>
              </div>
              <div>
                <div style={statValueStyle}>{loading ? '...' : recoveredDevices}</div>
                <div style={statLabelStyle}>Recovered</div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <h2 style={sectionTitleStyle}>
        <span className="material-icons" style={{ fontSize: '32px', color: Colors.primary }}>
          bolt
        </span>
        Quick Actions
      </h2>
      <div style={quickActionsGridStyle}>
        <Card onClick={() => navigate('/add-device')} style={actionCardStyle} variant="outlined">
          <div style={actionIconStyle(Colors.primary)}>
            <span className="material-icons" style={{ fontSize: '32px', color: Colors.primary }}>
              add_circle
            </span>
          </div>
          <div>
            <h3 style={{ color: Colors.onSurface, marginBottom: '6px', fontSize: '18px', fontWeight: 700 }}>
              Register Device
            </h3>
            <p style={{ color: Colors.onSurfaceVariant, fontSize: '14px', lineHeight: '1.5' }}>
              Add a new device to protect it
            </p>
          </div>
        </Card>

        <Card onClick={() => navigate('/devices')} style={actionCardStyle} variant="outlined">
          <div style={actionIconStyle(Colors.secondary)}>
            <span className="material-icons" style={{ fontSize: '32px', color: Colors.secondary }}>
              smartphone
            </span>
          </div>
          <div>
            <h3 style={{ color: Colors.onSurface, marginBottom: '6px', fontSize: '18px', fontWeight: 700 }}>
              My Devices
            </h3>
            <p style={{ color: Colors.onSurfaceVariant, fontSize: '14px', lineHeight: '1.5' }}>
              View and manage all devices
            </p>
          </div>
        </Card>

        <Card onClick={() => navigate('/chat')} style={actionCardStyle} variant="outlined">
          <div style={actionIconStyle(Colors.tertiary)}>
            <span className="material-icons" style={{ fontSize: '32px', color: Colors.tertiary }}>
              chat
            </span>
          </div>
          <div>
            <h3 style={{ color: Colors.onSurface, marginBottom: '6px', fontSize: '18px', fontWeight: 700 }}>
              Messages
            </h3>
            <p style={{ color: Colors.onSurfaceVariant, fontSize: '14px', lineHeight: '1.5' }}>
              Chat with device finders
            </p>
          </div>
        </Card>
      </div>

      {lostDevices > 0 && (
        <Card 
          variant="elevated"
          style={{
            background: `linear-gradient(135deg, ${Colors.error}15 0%, transparent 100%)`,
            borderLeft: `4px solid ${Colors.error}`,
            padding: '32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'start', gap: '20px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: `${Colors.error}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span className="material-icons" style={{ fontSize: '32px', color: Colors.error }}>
                warning
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: Colors.onSurface, marginBottom: '12px' }}>
                ⚠️ Devices Requiring Attention
              </h3>
              <p style={{ color: Colors.onSurfaceVariant, marginBottom: '20px', fontSize: '15px', lineHeight: '1.6' }}>
                You have {lostDevices} device{lostDevices > 1 ? 's' : ''} marked as lost or stolen. 
                Our network is actively scanning for {lostDevices > 1 ? 'them' : 'it'} and you'll be notified immediately when detected.
              </p>
              <Button variant="danger" onClick={() => navigate('/devices')} icon="arrow_forward">
                View Lost Devices
              </Button>
            </div>
          </div>
        </Card>
      )}

      {totalDevices === 0 && !loading && (
        <Card 
          variant="elevated"
          style={{
            padding: '48px',
            textAlign: 'center',
            background: `linear-gradient(135deg, ${Colors.primary}10 0%, transparent 100%)`,
          }}
        >
          <span className="material-icons" style={{ fontSize: '80px', color: Colors.primary, marginBottom: '24px', display: 'block' }}>
            security
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: Colors.onSurface, marginBottom: '16px' }}>
            Get Started with SPORS
          </h2>
          <p style={{ fontSize: '16px', color: Colors.onSurfaceVariant, marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
            Protect your valuable devices with our advanced security system. Register your first device to begin tracking and securing your electronics.
          </p>
          <Button size="large" onClick={() => navigate('/add-device')} icon="add_circle">
            Register Your First Device
          </Button>
        </Card>
      )}
    </div>
  )
}

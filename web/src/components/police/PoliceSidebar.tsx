import { CSSProperties, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Colors } from '../../lib/colors'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

const policeNavItems = [
  { path: '/police', icon: 'dashboard', label: 'Dashboard', exact: true },
  { path: '/police/chats', icon: 'forum', label: 'All Chats' },
  { path: '/police/devices', icon: 'devices', label: 'Lost Devices' },
  { path: '/police/reports', icon: 'description', label: 'Reports' },
  { path: '/police/search', icon: 'search', label: 'Search' },
  { path: '/police/analytics', icon: 'analytics', label: 'Analytics' },
]

export function PoliceSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, signOut } = useAuth()
  const [activeChatsCount, setActiveChatsCount] = useState(0)

  useEffect(() => {
    const fetchActiveChats = async () => {
      const { count } = await supabase
        .from('chat_rooms')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
      
      setActiveChatsCount(count || 0)
    }

    fetchActiveChats()
    const interval = setInterval(fetchActiveChats, 30000) // Update every 30s
    return () => clearInterval(interval)
  }, [])

  const sidebarStyle: CSSProperties = {
    width: '280px',
    minHeight: '100vh',
    backgroundColor: Colors.surfaceContainerLow,
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    borderRight: `1px solid ${Colors.outlineVariant}`,
  }

  const logoStyle: CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    color: Colors.primary,
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 8px',
  }

  const dividerStyle: CSSProperties = {
    height: '1px',
    backgroundColor: Colors.outlineVariant,
    margin: '20px 0',
  }

  const navStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  }

  const navItemStyle = (isActive: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 16px',
    borderRadius: '12px',
    backgroundColor: isActive ? Colors.primaryContainer : 'transparent',
    color: isActive ? Colors.onPrimary : Colors.onSurfaceVariant,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '15px',
    fontWeight: isActive ? 600 : 500,
    border: isActive ? `1px solid ${Colors.primary}40` : '1px solid transparent',
  })

  const profileSectionStyle: CSSProperties = {
    borderTop: `1px solid ${Colors.outlineVariant}`,
    paddingTop: '16px',
    marginTop: '16px',
  }

  const profileCardStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px',
    borderRadius: '12px',
    backgroundColor: Colors.surfaceContainer,
    marginBottom: '12px',
    border: `1px solid ${Colors.primary}30`,
  }

  const avatarStyle: CSSProperties = {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: Colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: Colors.onPrimary,
    fontWeight: 700,
    fontSize: '16px',
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'PO'

  return (
    <aside style={sidebarStyle}>
      <div style={logoStyle}>
        <span className="material-icons" style={{ fontSize: '32px' }}>
          local_police
        </span>
        <div>
          <div>SPORS</div>
          <div style={{ fontSize: '12px', fontWeight: 500, color: Colors.onSurfaceVariant }}>
            Police Portal
          </div>
        </div>
      </div>

      <div style={dividerStyle} />

      <nav style={navStyle}>
        {policeNavItems.map((item) => {
          const isActive = item.exact 
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path)

          return (
            <div
              key={item.path}
              style={navItemStyle(isActive)}
              onClick={() => navigate(item.path)}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = Colors.surfaceContainerHigh
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              <span className="material-icons" style={{ fontSize: '24px' }}>
                {item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.path === '/police/chats' && activeChatsCount > 0 && (
                <span
                  style={{
                    backgroundColor: Colors.secondary,
                    color: Colors.onPrimary,
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '10px',
                    minWidth: '22px',
                    textAlign: 'center',
                  }}
                >
                  {activeChatsCount}
                </span>
              )}
            </div>
          )
        })}
      </nav>

      <div style={profileSectionStyle}>
        <div style={profileCardStyle}>
          <div style={avatarStyle}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: Colors.onSurface, fontSize: '14px', marginBottom: '2px' }}>
              {profile?.full_name || 'Officer'}
            </div>
            <div style={{ fontSize: '12px', color: Colors.primary, fontWeight: 500 }}>
              Police Officer
            </div>
          </div>
        </div>
        <div
          style={{
            ...navItemStyle(false),
            color: Colors.error,
            justifyContent: 'center',
          }}
          onClick={signOut}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${Colors.error}20`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <span className="material-icons" style={{ fontSize: '22px' }}>
            logout
          </span>
          Sign Out
        </div>
      </div>
    </aside>
  )
}

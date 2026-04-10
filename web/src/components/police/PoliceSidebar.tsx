import { CSSProperties, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { Shield } from 'lucide-react'

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
    const interval = setInterval(fetchActiveChats, 30000)
    return () => clearInterval(interval)
  }, [])

  const sidebarStyle: CSSProperties = {
    width: '240px',
    minHeight: '100vh',
    backgroundColor: '#fff',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #E5E5E5',
  }

  const navItemStyle = (isActive: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '0px',
    backgroundColor: isActive ? '#000' : 'transparent',
    color: isActive ? '#fff' : '#737373',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.33, 1, 0.68, 1)',
    fontSize: '13px',
    fontWeight: isActive ? 500 : 400,
    fontFamily: "'Inter', system-ui, sans-serif",
  })

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'PO'

  return (
    <aside style={sidebarStyle}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 12px', marginBottom: '8px' }}>
        <Shield size={20} strokeWidth={1.5} color="#000" />
        <span style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 600, fontSize: '16px', letterSpacing: '0.15em', color: '#000' }}>
          SPORS
        </span>
      </div>
      <span style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.15em', color: '#A3A3A3', textTransform: 'uppercase', padding: '0 12px', marginBottom: '32px' }}>
        Police Portal
      </span>

      {/* Section label */}
      <span style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.2em', color: '#A3A3A3', textTransform: 'uppercase', padding: '0 12px', marginBottom: '12px' }}>
        Navigation
      </span>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
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
                  e.currentTarget.style.backgroundColor = '#F5F5F5'
                  e.currentTarget.style.color = '#000'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#737373'
                }
              }}
            >
              <span className="material-icons" style={{ fontSize: '20px' }}>
                {item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.path === '/police/chats' && activeChatsCount > 0 && (
                <span style={{
                  backgroundColor: '#000',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 6px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {activeChatsCount}
                </span>
              )}
            </div>
          )
        })}
      </nav>

      {/* Profile */}
      <div style={{ borderTop: '1px solid #E5E5E5', paddingTop: '16px', marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', marginBottom: '8px' }}>
          <div style={{
            width: '36px', height: '36px', backgroundColor: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 600, fontSize: '13px',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 500, color: '#000', fontSize: '13px' }}>
              {profile?.full_name || 'Officer'}
            </div>
            <div style={{ fontSize: '11px', color: '#A3A3A3', fontFamily: "'JetBrains Mono', monospace" }}>
              Police Officer
            </div>
          </div>
        </div>
        <div
          style={{ ...navItemStyle(false), color: '#FF4E4E' }}
          onClick={signOut}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFF0F0' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <span className="material-icons" style={{ fontSize: '20px' }}>logout</span>
          Sign Out
        </div>
      </div>
    </aside>
  )
}

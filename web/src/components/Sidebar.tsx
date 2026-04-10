import { CSSProperties, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Shield } from 'lucide-react'

const navItems = [
  { path: '/dashboard', icon: 'home', label: 'Home' },
  { path: '/devices', icon: 'devices', label: 'Devices' },
  { path: '/add-device', icon: 'add_circle', label: 'Add Device' },
  { path: '/chat', icon: 'chat', label: 'Chat', showBadge: true },
  { path: '/alerts', icon: 'notifications', label: 'Alerts' },
  { path: '/profile', icon: 'person', label: 'Profile' },
]

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, signOut } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  const sidebarStyle: CSSProperties = {
    width: '240px',
    minHeight: '100vh',
    backgroundColor: '#fff',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #E5E5E5',
  }

  const logoStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '48px',
    padding: '0 12px',
  }

  const navStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
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
    letterSpacing: '0.01em',
    position: 'relative',
  })

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'SP'

  useEffect(() => {
    if (!user?.id) return

    const fetchUnreadCount = async () => {
      try {
        const { data: rooms } = await supabase
          .from('chat_rooms')
          .select('id')
          .eq('owner_id', user.id)
          .eq('is_active', true)

        if (!rooms || rooms.length === 0) {
          setUnreadCount(0)
          return
        }

        const roomIds = rooms.map(r => r.id)
        
        const { count } = await supabase
          .from('chat_messages')
          .select('id', { count: 'exact', head: true })
          .in('room_id', roomIds)
          .eq('is_read', false)
          .neq('sender_role', 'owner')

        setUnreadCount(count || 0)
      } catch (error) {
        console.error('Error fetching unread count:', error)
      }
    }

    fetchUnreadCount()

    const channel = supabase
      .channel('unread_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
        },
        () => {
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  return (
    <aside style={sidebarStyle}>
      {/* Logo */}
      <div style={logoStyle}>
        <Shield size={20} strokeWidth={1.5} color="#000" />
        <span
          style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontWeight: 600,
            fontSize: '16px',
            letterSpacing: '0.15em',
            color: '#000',
          }}
        >
          SPORS
        </span>
      </div>

      {/* Section label */}
      <span
        style={{
          display: 'block',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px',
          letterSpacing: '0.2em',
          color: '#A3A3A3',
          textTransform: 'uppercase',
          padding: '0 12px',
          marginBottom: '12px',
        }}
      >
        Navigation
      </span>

      <nav style={navStyle}>
        {navItems.map((item) => (
          <div
            key={item.path}
            style={navItemStyle(location.pathname === item.path || location.pathname.startsWith(item.path + '/'))}
            onClick={() => navigate(item.path)}
            onMouseEnter={(e) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
              if (!isActive) {
                e.currentTarget.style.backgroundColor = '#F5F5F5'
                e.currentTarget.style.color = '#000'
              }
            }}
            onMouseLeave={(e) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#737373'
              }
            }}
          >
            <span className="material-icons" style={{ fontSize: '20px' }}>
              {item.icon}
            </span>
            {item.label}
            {item.showBadge && unreadCount > 0 && (
              <span
                style={{
                  marginLeft: 'auto',
                  backgroundColor: '#000',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '0px',
                  minWidth: '18px',
                  textAlign: 'center',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom profile section */}
      <div style={{ borderTop: '1px solid #E5E5E5', paddingTop: '16px', marginTop: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '0px',
              backgroundColor: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 600,
              fontSize: '13px',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 500, color: '#000', fontSize: '13px' }}>
              {profile?.full_name || 'SPORS User'}
            </div>
            <div style={{ fontSize: '11px', color: '#A3A3A3', fontFamily: "'JetBrains Mono', monospace" }}>
              {profile?.role === 'police' ? 'Officer' : 'User'}
            </div>
          </div>
        </div>
        <div
          style={{
            ...navItemStyle(false),
            color: '#FF4E4E',
          }}
          onClick={signOut}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#FFF0F0'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <span className="material-icons" style={{ fontSize: '20px' }}>
            logout
          </span>
          Sign Out
        </div>
      </div>
    </aside>
  )
}

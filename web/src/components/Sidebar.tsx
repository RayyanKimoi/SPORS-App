import { CSSProperties, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Colors } from '../lib/colors'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

const navItems = [
  { path: '/', icon: 'home', label: 'Home' },
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
    width: '260px',
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
    marginBottom: '40px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 8px',
  }

  const navStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  }

  const navItemStyle = (isActive: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '12px',
    backgroundColor: isActive ? Colors.surfaceContainerHighest : 'transparent',
    color: isActive ? Colors.primary : Colors.onSurfaceVariant,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '15px',
    fontWeight: isActive ? 600 : 400,
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
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: Colors.surfaceContainer,
    marginBottom: '12px',
  }

  const avatarStyle: CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: Colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: Colors.onPrimary,
    fontWeight: 600,
    fontSize: '16px',
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'SP'

  // Fetch unread message count
  useEffect(() => {
    if (!user?.id) return

    const fetchUnreadCount = async () => {
      try {
        // Get rooms where user is owner
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
        
        // Count unread messages in those rooms
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

    // Subscribe to real-time updates
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
      <div style={logoStyle}>
        <span className="material-icons" style={{ fontSize: '28px' }}>
          security
        </span>
        SPORS
      </div>

      <nav style={navStyle}>
        {navItems.map((item) => (
          <div
            key={item.path}
            style={{
              ...navItemStyle(location.pathname === item.path || location.pathname.startsWith(item.path + '/')),
              position: 'relative',
            }}
            onClick={() => navigate(item.path)}
            onMouseEnter={(e) => {
              if (location.pathname !== item.path) {
                e.currentTarget.style.backgroundColor = Colors.surfaceContainerHigh
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== item.path) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <span className="material-icons" style={{ fontSize: '22px' }}>
              {item.icon}
            </span>
            {item.label}
            {item.showBadge && unreadCount > 0 && (
              <span
                style={{
                  marginLeft: 'auto',
                  backgroundColor: Colors.error,
                  color: Colors.onPrimary,
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  minWidth: '20px',
                  textAlign: 'center',
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        ))}
      </nav>

      <div style={profileSectionStyle}>
        <div style={profileCardStyle}>
          <div style={avatarStyle}>{initials}</div>
          <div>
            <div style={{ fontWeight: 500, color: Colors.onSurface, fontSize: '14px' }}>
              {profile?.full_name || 'SPORS User'}
            </div>
            <div style={{ fontSize: '12px', color: Colors.onSurfaceVariant }}>
              {profile?.role === 'police' ? 'Police Officer' : 'User'}
            </div>
          </div>
        </div>
        <div
          style={{
            ...navItemStyle(false),
            color: Colors.error,
          }}
          onClick={signOut}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = Colors.errorContainer
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

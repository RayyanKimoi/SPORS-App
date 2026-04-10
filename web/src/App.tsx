import { CSSProperties } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { globalStyles } from './styles/global'
import { Sidebar } from './components/Sidebar'
import { PoliceSidebar } from './components/police/PoliceSidebar'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { DevicesPage } from './pages/DevicesPage'
import { AddDevicePage } from './pages/AddDevicePage'
import { AlertsPage } from './pages/AlertsPage'
import { ProfilePage } from './pages/ProfilePage'
import { ChatListPage } from './pages/ChatListPage'
import { ChatRoomPage } from './pages/ChatRoomPage'
import { AboutPage } from './pages/AboutPage'
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage'
import { ReportBugPage } from './pages/ReportBugPage'
import { PoliceDashboardPage } from './pages/police/PoliceDashboardPage'
import { PoliceChatsPage } from './pages/police/PoliceChatsPage'
import { PoliceDevicesPage } from './pages/police/PoliceDevicesPage'
import { PoliceReportsPage } from './pages/police/PoliceReportsPage'
import { PoliceSearchPage } from './pages/police/PoliceSearchPage'
import { PoliceAnalyticsPage } from './pages/police/PoliceAnalyticsPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAFAFA',
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '2px solid #E5E5E5',
            borderTopColor: '#000',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto',
          }} />
          <p style={{
            marginTop: '16px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.2em',
            color: '#A3A3A3',
            textTransform: 'uppercase',
          }}>
            Loading...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppLayout({ children, isPolice }: { children: React.ReactNode; isPolice?: boolean }) {
  const layoutStyle: CSSProperties = {
    display: 'flex',
    minHeight: '100vh',
  }

  const mainStyle: CSSProperties = {
    flex: 1,
    overflow: 'auto',
    backgroundColor: '#FAFAFA',
  }

  return (
    <div className="app-layout" style={layoutStyle}>
      {isPolice ? <PoliceSidebar /> : <Sidebar />}
      <main style={mainStyle}>{children}</main>
    </div>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAFAFA',
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '2px solid #E5E5E5',
            borderTopColor: '#000',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto',
          }} />
          <p style={{
            marginTop: '16px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            letterSpacing: '0.2em',
            color: '#A3A3A3',
            textTransform: 'uppercase',
          }}>
            Initializing...
          </p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route path="/dashboard" element={<PrivateRoute><AppLayout><HomePage /></AppLayout></PrivateRoute>} />
      <Route path="/devices" element={<PrivateRoute><AppLayout><DevicesPage /></AppLayout></PrivateRoute>} />
      <Route path="/add-device" element={<PrivateRoute><AppLayout><AddDevicePage /></AppLayout></PrivateRoute>} />
      <Route path="/alerts" element={<PrivateRoute><AppLayout><AlertsPage /></AppLayout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><AppLayout><ProfilePage /></AppLayout></PrivateRoute>} />
      <Route path="/chat" element={<PrivateRoute><AppLayout><ChatListPage /></AppLayout></PrivateRoute>} />
      <Route path="/chat/:roomId" element={<PrivateRoute><AppLayout><ChatRoomPage /></AppLayout></PrivateRoute>} />
      <Route path="/about" element={<PrivateRoute><AppLayout><AboutPage /></AppLayout></PrivateRoute>} />
      <Route path="/privacy-policy" element={<PrivateRoute><AppLayout><PrivacyPolicyPage /></AppLayout></PrivateRoute>} />
      <Route path="/report-bug" element={<PrivateRoute><AppLayout><ReportBugPage /></AppLayout></PrivateRoute>} />
      
      {/* Police Routes */}
      <Route path="/police" element={<PrivateRoute><AppLayout isPolice><PoliceDashboardPage /></AppLayout></PrivateRoute>} />
      <Route path="/police/chats" element={<PrivateRoute><AppLayout isPolice><PoliceChatsPage /></AppLayout></PrivateRoute>} />
      <Route path="/police/devices" element={<PrivateRoute><AppLayout isPolice><PoliceDevicesPage /></AppLayout></PrivateRoute>} />
      <Route path="/police/reports" element={<PrivateRoute><AppLayout isPolice><PoliceReportsPage /></AppLayout></PrivateRoute>} />
      <Route path="/police/search" element={<PrivateRoute><AppLayout isPolice><PoliceSearchPage /></AppLayout></PrivateRoute>} />
      <Route path="/police/analytics" element={<PrivateRoute><AppLayout isPolice><PoliceAnalyticsPage /></AppLayout></PrivateRoute>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <>
      <style>{globalStyles}</style>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </>
  )
}

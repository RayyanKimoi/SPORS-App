import { CSSProperties, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Colors } from '../lib/colors'
import { useDevices, Device } from '../hooks/useDevices'
import { Card } from '../components/Card'
import { Button } from '../components/Button'

export function DevicesPage() {
  const navigate = useNavigate()
  const { devices, loading, markAsLost, markAsFound, deleteDevice } = useDevices()
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)

  const handleMarkLost = async (device: Device) => {
    setActionLoading(device.id)
    await markAsLost(device.id)
    setActionLoading(null)
  }

  const handleMarkFound = async (device: Device) => {
    setActionLoading(device.id)
    await markAsFound(device.id)
    setActionLoading(null)
  }

  const handleDelete = async (id: string) => {
    setActionLoading(id)
    await deleteDevice(id)
    setActionLoading(null)
    setConfirmDelete(null)
  }

  const containerStyle: CSSProperties = {
    padding: '40px',
    maxWidth: '1400px',
    margin: '0 auto',
  }

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    background: `linear-gradient(135deg, ${Colors.primary}10 0%, transparent 100%)`,
    padding: '28px 32px',
    borderRadius: '20px',
    border: `1px solid ${Colors.primary}20`,
  }

  const titleStyle: CSSProperties = {
    fontSize: '32px',
    fontWeight: 700,
    color: Colors.onSurface,
    letterSpacing: '-0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  }

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '24px',
  }

  const deviceCardStyle: CSSProperties = {
    position: 'relative',
  }

  const statusBadgeStyle = (status: string): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '24px',
    fontSize: '13px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    backgroundColor:
      status === 'lost' || status === 'stolen'
        ? `${Colors.error}20`
        : status === 'recovered' || status === 'found'
        ? `${Colors.tertiary}25`
        : `${Colors.secondary}25`,
    color:
      status === 'lost' || status === 'stolen' 
        ? Colors.error 
        : status === 'recovered' || status === 'found' 
        ? Colors.tertiary 
        : Colors.secondary,
    border: `2px solid ${
      status === 'lost' || status === 'stolen' 
        ? Colors.error 
        : status === 'recovered' || status === 'found' 
        ? Colors.tertiary 
        : Colors.secondary
    }40`,
  })

  const infoRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: `1px solid ${Colors.outlineVariant}`,
  }

  const labelStyle: CSSProperties = {
    color: Colors.onSurfaceVariant,
    fontSize: '14px',
  }

  const valueStyle: CSSProperties = {
    color: Colors.onSurface,
    fontSize: '14px',
    fontWeight: 500,
  }

  const actionsStyle: CSSProperties = {
    display: 'flex',
    gap: '10px',
    marginTop: '16px',
    flexWrap: 'wrap',
  }

  const emptyStyle: CSSProperties = {
    textAlign: 'center',
    padding: '80px 40px',
    color: Colors.onSurfaceVariant,
    background: `linear-gradient(135deg, ${Colors.primary}08 0%, transparent 100%)`,
  }

  const modalOverlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  }

  const modalStyle: CSSProperties = {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '100px', color: Colors.onSurfaceVariant }}>
          <span className="material-icons" style={{ fontSize: '48px', animation: 'spin 1s linear infinite', marginBottom: '16px', display: 'block' }}>
            sync
          </span>
          <div style={{ fontSize: '18px', fontWeight: 600 }}>Loading your devices...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>
          <span className="material-icons" style={{ fontSize: '36px', color: Colors.primary }}>
            devices
          </span>
          My Devices
        </h1>
        <Button onClick={() => navigate('/add-device')} icon="add_circle" size="medium">
          Register New Device
        </Button>
      </header>

      {devices.length === 0 ? (
        <Card variant="elevated" style={emptyStyle}>
          <span
            className="material-icons"
            style={{ fontSize: '96px', color: Colors.primary, marginBottom: '24px', display: 'block', opacity: 0.5 }}
          >
            devices
          </span>
          <h2 style={{ color: Colors.onSurface, marginBottom: '12px', fontSize: '28px', fontWeight: 700 }}>
            No devices yet
          </h2>
          <p style={{ marginBottom: '32px', fontSize: '16px', maxWidth: '500px', margin: '0 auto 32px' }}>
            Protect your valuable devices with SPORS. Register your first device to begin tracking and securing your electronics.
          </p>
          <Button onClick={() => navigate('/add-device')} icon="add_circle" size="large">
            Register Your First Device
          </Button>
        </Card>
      ) : (
        <div style={gridStyle}>
          {devices.map((device) => (
            <Card 
              key={device.id} 
              style={deviceCardStyle} 
              variant="elevated"
              hoverable={false}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '20px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: `linear-gradient(135deg, ${Colors.primary}30 0%, ${Colors.primary}10 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${Colors.primary}40`,
                    }}>
                      <span className="material-icons" style={{ fontSize: '28px', color: Colors.primary }}>
                        smartphone
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ color: Colors.onSurface, fontSize: '20px', fontWeight: 700, marginBottom: '4px', letterSpacing: '-0.2px' }}>
                        {device.make} {device.model}
                      </h3>
                      <div style={statusBadgeStyle(device.status)}>
                        <span className="material-icons" style={{ fontSize: '16px' }}>
                          {device.status === 'lost' || device.status === 'stolen'
                            ? 'warning'
                            : device.status === 'recovered' || device.status === 'found'
                            ? 'check_circle'
                            : 'verified'}
                        </span>
                        {device.status}
                      </div>
                    </div>
                  </div>
                </div>
                {device.color && (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: device.color,
                      border: `3px solid ${Colors.outline}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  />
                )}
              </div>

              <div style={infoRowStyle}>
                <span style={labelStyle}>SPORS Key</span>
                <span style={valueStyle}>{device.spors_key || '—'}</span>
              </div>
              <div style={infoRowStyle}>
                <span style={labelStyle}>Primary IMEI</span>
                <span style={valueStyle}>{device.imei_primary}</span>
              </div>
              {device.imei_secondary && (
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Secondary IMEI</span>
                  <span style={valueStyle}>{device.imei_secondary}</span>
                </div>
              )}
              <div style={infoRowStyle}>
                <span style={labelStyle}>Serial Number</span>
                <span style={valueStyle}>{device.serial_number}</span>
              </div>
              <div style={{ ...infoRowStyle, borderBottom: 'none' }}>
                <span style={labelStyle}>Registered</span>
                <span style={valueStyle}>
                  {new Date(device.created_at).toLocaleDateString()}
                </span>
              </div>

              <div style={actionsStyle}>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => setSelectedDevice(device)}
                  icon="info"
                  fullWidth
                  style={{ border: `2px solid ${Colors.outlineVariant}` }}
                >
                  View Details
                </Button>
                {device.status === 'lost' || device.status === 'stolen' ? (
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleMarkFound(device)}
                    loading={actionLoading === device.id}
                    icon="check_circle"
                    fullWidth
                  >
                    Mark Found
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => handleMarkLost(device)}
                    loading={actionLoading === device.id}
                    icon="warning"
                    fullWidth
                  >
                    Report Lost
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => setConfirmDelete(device.id)}
                  icon="delete"
                  style={{ color: Colors.error, border: `2px solid ${Colors.error}` }}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Device Details Modal */}
      {selectedDevice && (
        <div style={modalOverlayStyle} onClick={() => setSelectedDevice(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: Colors.onSurface, fontSize: '22px' }}>Device Details</h2>
              <button
                onClick={() => setSelectedDevice(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: Colors.onSurfaceVariant }}
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: Colors.surfaceContainerHigh,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                <span className="material-icons" style={{ fontSize: '40px', color: Colors.primary }}>
                  smartphone
                </span>
              </div>
              <h3 style={{ color: Colors.onSurface, marginBottom: '4px' }}>
                {selectedDevice.make} {selectedDevice.model}
              </h3>
              <span style={statusBadgeStyle(selectedDevice.status)}>
                {selectedDevice.status.charAt(0).toUpperCase() + selectedDevice.status.slice(1)}
              </span>
            </div>

            <div style={{ backgroundColor: Colors.surfaceContainerLow, borderRadius: '12px', padding: '16px' }}>
              <div style={infoRowStyle}>
                <span style={labelStyle}>State</span>
                <span style={valueStyle}>{selectedDevice.state || '—'}</span>
              </div>
              <div style={infoRowStyle}>
                <span style={labelStyle}>SPORS Key</span>
                <span style={valueStyle}>{selectedDevice.spors_key || '—'}</span>
              </div>
              <div style={infoRowStyle}>
                <span style={labelStyle}>Primary IMEI</span>
                <span style={valueStyle}>{selectedDevice.imei_primary}</span>
              </div>
              <div style={infoRowStyle}>
                <span style={labelStyle}>Secondary IMEI</span>
                <span style={valueStyle}>{selectedDevice.imei_secondary || '—'}</span>
              </div>
              <div style={infoRowStyle}>
                <span style={labelStyle}>Serial Number</span>
                <span style={valueStyle}>{selectedDevice.serial_number}</span>
              </div>
              <div style={infoRowStyle}>
                <span style={labelStyle}>Color</span>
                <span style={{ ...valueStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedDevice.color && (
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: selectedDevice.color }} />
                  )}
                  {selectedDevice.color || '—'}
                </span>
              </div>
              <div style={infoRowStyle}>
                <span style={labelStyle}>Purchase Date</span>
                <span style={valueStyle}>
                  {selectedDevice.purchase_date ? new Date(selectedDevice.purchase_date).toLocaleDateString() : '—'}
                </span>
              </div>
              <div style={infoRowStyle}>
                <span style={labelStyle}>BLE Active</span>
                <span style={valueStyle}>{selectedDevice.is_ble_active ? 'Yes' : 'No'}</span>
              </div>
              <div style={infoRowStyle}>
                <span style={labelStyle}>Last Seen</span>
                <span style={valueStyle}>
                  {selectedDevice.last_seen_at ? new Date(selectedDevice.last_seen_at).toLocaleString() : 'Never'}
                </span>
              </div>
              <div style={{ ...infoRowStyle, borderBottom: 'none' }}>
                <span style={labelStyle}>Registered</span>
                <span style={valueStyle}>{new Date(selectedDevice.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              {selectedDevice.status === 'lost' || selectedDevice.status === 'stolen' ? (
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    handleMarkFound(selectedDevice)
                    setSelectedDevice(null)
                  }}
                  loading={actionLoading === selectedDevice.id}
                >
                  Mark as Found
                </Button>
              ) : (
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => {
                    handleMarkLost(selectedDevice)
                    setSelectedDevice(null)
                  }}
                  loading={actionLoading === selectedDevice.id}
                >
                  Report Lost
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div style={modalOverlayStyle} onClick={() => setConfirmDelete(null)}>
          <div style={{ ...modalStyle, maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: Colors.onSurface, marginBottom: '12px' }}>Delete Device?</h3>
            <p style={{ color: Colors.onSurfaceVariant, marginBottom: '20px' }}>
              This action cannot be undone. The device will be removed from your account.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(confirmDelete)}
                loading={actionLoading === confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

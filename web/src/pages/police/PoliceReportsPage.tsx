import { CSSProperties, useEffect, useState } from 'react'
import { Colors } from '../../lib/colors'
import { supabase } from '../../lib/supabase'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'

type LostReport = {
  id: string
  device_id: string
  owner_id: string
  last_known_lat: number | null
  last_known_lng: number | null
  last_known_address: string | null
  incident_description: string | null
  police_complaint_number: string | null
  reward_amount: number | null
  is_active: boolean
  reported_at: string
  resolved_at: string | null
  devices: {
    make: string
    model: string
    imei_primary: string
    status: string
  } | null
  profiles: {
    full_name: string
    phone_number: string | null
  } | null
}

export function PoliceReportsPage() {
  const [reports, setReports] = useState<LostReport[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'active' | 'resolved' | 'all'>('active')
  const [selectedReport, setSelectedReport] = useState<LostReport | null>(null)

  useEffect(() => {
    loadReports()
  }, [filter])

  const loadReports = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('lost_reports')
        .select(`
          id,
          device_id,
          owner_id,
          last_known_lat,
          last_known_lng,
          last_known_address,
          incident_description,
          police_complaint_number,
          reward_amount,
          is_active,
          reported_at,
          resolved_at,
          devices(make, model, imei_primary, status),
          profiles(full_name, phone_number)
        `)
        .order('reported_at', { ascending: false })

      if (filter === 'active') {
        query = query.eq('is_active', true)
      } else if (filter === 'resolved') {
        query = query.eq('is_active', false)
      }

      const { data, error } = await query

      if (error) throw error
      setReports(data as LostReport[])
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsResolved = async (reportId: string) => {
    const confirmed = window.confirm('Mark this report as resolved?')
    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('lost_reports')
        .update({ 
          is_active: false,
          resolved_at: new Date().toISOString()
        })
        .eq('id', reportId)

      if (error) throw error
      
      await loadReports()
      setSelectedReport(null)
      alert('Report marked as resolved')
    } catch (error) {
      console.error('Error resolving report:', error)
      alert('Failed to resolve report')
    }
  }

  const containerStyle: CSSProperties = {
    padding: '32px',
    maxWidth: '1600px',
    margin: '0 auto',
  }

  const headerStyle: CSSProperties = {
    marginBottom: '32px',
  }

  const titleStyle: CSSProperties = {
    fontSize: '32px',
    fontWeight: 700,
    color: Colors.onSurface,
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  }

  const toolbarStyle: CSSProperties = {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
  }

  const filterButtonStyle = (isActive: boolean): CSSProperties => ({
    padding: '10px 20px',
    borderRadius: '10px',
    backgroundColor: isActive ? Colors.primary : Colors.surfaceContainerHigh,
    color: isActive ? Colors.onPrimary : Colors.onSurfaceVariant,
    border: `1px solid ${isActive ? Colors.primary : Colors.outlineVariant}`,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  })

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: selectedReport ? '1fr 450px' : '1fr',
    gap: '24px',
  }

  const reportsListStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  }

  const reportCardStyle = (isSelected: boolean): CSSProperties => ({
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: `2px solid ${isSelected ? Colors.primary : Colors.outlineVariant}`,
    backgroundColor: isSelected ? `${Colors.primary}08` : Colors.surfaceContainer,
  })

  const detailsPanelStyle: CSSProperties = {
    position: 'sticky',
    top: '32px',
    height: 'fit-content',
    maxHeight: 'calc(100vh - 96px)',
    overflow: 'auto',
  }

  if (loading) {
    return (
      <div style={{ ...containerStyle, textAlign: 'center', paddingTop: '120px' }}>
        <span className="material-icons" style={{ fontSize: '48px', color: Colors.primary, animation: 'spin 1s linear infinite' }}>
          sync
        </span>
        <p style={{ marginTop: '16px', color: Colors.onSurfaceVariant }}>Loading reports...</p>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          <span className="material-icons" style={{ fontSize: '40px', color: Colors.primary }}>
            description
          </span>
          Lost Device Reports
        </h1>
        <p style={{ fontSize: '15px', color: Colors.onSurfaceVariant }}>
          {reports.length} report{reports.length !== 1 ? 's' : ''} filed
        </p>
      </div>

      <div style={toolbarStyle}>
        <button
          style={filterButtonStyle(filter === 'active')}
          onClick={() => setFilter('active')}
        >
          Active ({reports.filter(r => r.is_active).length})
        </button>
        <button
          style={filterButtonStyle(filter === 'resolved')}
          onClick={() => setFilter('resolved')}
        >
          Resolved ({reports.filter(r => !r.is_active).length})
        </button>
        <button
          style={filterButtonStyle(filter === 'all')}
          onClick={() => setFilter('all')}
        >
          All ({reports.length})
        </button>
      </div>

      <div style={gridStyle}>
        <div style={reportsListStyle}>
          {reports.length === 0 ? (
            <Card style={{ padding: '60px', textAlign: 'center' }}>
              <span className="material-icons" style={{ fontSize: '64px', color: Colors.outline, marginBottom: '16px' }}>
                assignment
              </span>
              <h2 style={{ color: Colors.onSurface, marginBottom: '8px' }}>No reports found</h2>
              <p style={{ color: Colors.onSurfaceVariant }}>
                {filter === 'active' ? 'No active reports at this time' : filter === 'resolved' ? 'No resolved reports' : 'No reports filed'}
              </p>
            </Card>
          ) : (
            reports.map((report) => (
              <Card
                key={report.id}
                style={reportCardStyle(selectedReport?.id === report.id)}
                onClick={() => setSelectedReport(report)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 600, color: Colors.onSurface, marginBottom: '6px' }}>
                      {report.devices?.make} {report.devices?.model}
                    </h3>
                    <div style={{ fontSize: '14px', color: Colors.onSurfaceVariant, marginBottom: '4px' }}>
                      <span className="material-icons" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '6px' }}>
                        person
                      </span>
                      {report.profiles?.full_name || 'Unknown Owner'}
                    </div>
                    {report.profiles?.phone_number && (
                      <div style={{ fontSize: '14px', color: Colors.onSurfaceVariant }}>
                        <span className="material-icons" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '6px' }}>
                          phone
                        </span>
                        {report.profiles.phone_number}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      backgroundColor: report.is_active ? `${Colors.error}20` : `${Colors.secondary}20`,
                      color: report.is_active ? Colors.error : Colors.secondary,
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    {report.is_active ? 'Active' : 'Resolved'}
                  </span>
                </div>

                {report.police_complaint_number && (
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: Colors.surfaceContainerHigh,
                    borderRadius: '10px',
                    marginBottom: '12px',
                  }}>
                    <div style={{ fontSize: '11px', color: Colors.outline, marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase' }}>
                      Complaint Number
                    </div>
                    <div style={{ fontSize: '16px', color: Colors.primary, fontWeight: 700, fontFamily: 'monospace' }}>
                      {report.police_complaint_number}
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px' }}>
                    <div style={{ color: Colors.outline, marginBottom: '4px' }}>IMEI</div>
                    <div style={{ color: Colors.onSurface, fontWeight: 500, fontFamily: 'monospace' }}>
                      {report.devices?.imei_primary || 'N/A'}
                    </div>
                  </div>
                  {report.reward_amount && (
                    <div style={{ fontSize: '13px' }}>
                      <div style={{ color: Colors.outline, marginBottom: '4px' }}>Reward</div>
                      <div style={{ color: Colors.secondary, fontWeight: 600 }}>
                        ₹{report.reward_amount.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                {report.incident_description && (
                  <div style={{ 
                    fontSize: '14px', 
                    color: Colors.onSurfaceVariant, 
                    marginBottom: '12px',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {report.incident_description}
                  </div>
                )}

                <div style={{ fontSize: '12px', color: Colors.outline, paddingTop: '12px', borderTop: `1px solid ${Colors.outlineVariant}` }}>
                  Reported: {new Date(report.reported_at).toLocaleString()}
                  {report.resolved_at && (
                    <span> • Resolved: {new Date(report.resolved_at).toLocaleString()}</span>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {selectedReport && (
          <Card style={detailsPanelStyle}>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: Colors.onSurface }}>
                  Report Details
                </h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: Colors.onSurfaceVariant,
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  <span className="material-icons">close</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: Colors.outline, marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
                    Device Information
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: Colors.onSurface, marginBottom: '8px' }}>
                    {selectedReport.devices?.make} {selectedReport.devices?.model}
                  </div>
                  <div style={{ fontSize: '14px', color: Colors.onSurfaceVariant, marginBottom: '4px' }}>
                    IMEI: <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{selectedReport.devices?.imei_primary}</span>
                  </div>
                  <div style={{ fontSize: '14px', color: Colors.onSurfaceVariant }}>
                    Status: <span style={{ 
                      fontWeight: 600, 
                      color: selectedReport.devices?.status === 'stolen' ? Colors.error : Colors.tertiary 
                    }}>
                      {selectedReport.devices?.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div style={{ height: '1px', backgroundColor: Colors.outlineVariant }} />

                <div>
                  <div style={{ fontSize: '12px', color: Colors.outline, marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
                    Owner Information
                  </div>
                  <div style={{ fontSize: '15px', color: Colors.onSurface, marginBottom: '6px' }}>
                    <span className="material-icons" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '8px', color: Colors.primary }}>
                      person
                    </span>
                    {selectedReport.profiles?.full_name || 'Unknown'}
                  </div>
                  {selectedReport.profiles?.phone_number && (
                    <div style={{ fontSize: '15px', color: Colors.onSurface, marginBottom: '12px' }}>
                      <span className="material-icons" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '8px', color: Colors.primary }}>
                        phone
                      </span>
                      <a 
                        href={`tel:${selectedReport.profiles.phone_number}`}
                        style={{ color: Colors.primary, textDecoration: 'none', fontWeight: 500 }}
                      >
                        {selectedReport.profiles.phone_number}
                      </a>
                    </div>
                  )}
                </div>

                <div style={{ height: '1px', backgroundColor: Colors.outlineVariant }} />

                {selectedReport.police_complaint_number && (
                  <>
                    <div>
                      <div style={{ fontSize: '12px', color: Colors.outline, marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
                        Police Complaint
                      </div>
                      <div style={{ 
                        padding: '16px', 
                        backgroundColor: Colors.surfaceContainerHigh, 
                        borderRadius: '12px',
                        border: `2px solid ${Colors.primary}40`,
                      }}>
                        <div style={{ fontSize: '11px', color: Colors.outline, marginBottom: '4px', fontWeight: 600 }}>
                          COMPLAINT NUMBER
                        </div>
                        <div style={{ fontSize: '20px', color: Colors.primary, fontWeight: 700, fontFamily: 'monospace' }}>
                          {selectedReport.police_complaint_number}
                        </div>
                      </div>
                    </div>
                    <div style={{ height: '1px', backgroundColor: Colors.outlineVariant }} />
                  </>
                )}

                {selectedReport.incident_description && (
                  <>
                    <div>
                      <div style={{ fontSize: '12px', color: Colors.outline, marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
                        Incident Description
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: Colors.onSurface, 
                        lineHeight: '1.6',
                        padding: '14px',
                        backgroundColor: Colors.surfaceContainerHigh,
                        borderRadius: '10px',
                      }}>
                        {selectedReport.incident_description}
                      </div>
                    </div>
                    <div style={{ height: '1px', backgroundColor: Colors.outlineVariant }} />
                  </>
                )}

                {selectedReport.last_known_address && (
                  <>
                    <div>
                      <div style={{ fontSize: '12px', color: Colors.outline, marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
                        Last Known Location
                      </div>
                      <div style={{ fontSize: '14px', color: Colors.onSurface, lineHeight: '1.5' }}>
                        {selectedReport.last_known_address}
                      </div>
                      {(selectedReport.last_known_lat && selectedReport.last_known_lng) && (
                        <button
                          onClick={() => {
                            window.open(`https://www.google.com/maps?q=${selectedReport.last_known_lat},${selectedReport.last_known_lng}`, '_blank')
                          }}
                          style={{
                            width: '100%',
                            marginTop: '12px',
                            padding: '12px',
                            backgroundColor: Colors.secondary,
                            color: Colors.onPrimary,
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                          }}
                        >
                          <span className="material-icons" style={{ fontSize: '18px' }}>map</span>
                          View on Map
                        </button>
                      )}
                    </div>
                    <div style={{ height: '1px', backgroundColor: Colors.outlineVariant }} />
                  </>
                )}

                {selectedReport.reward_amount && (
                  <>
                    <div>
                      <div style={{ fontSize: '12px', color: Colors.outline, marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
                        Reward Offered
                      </div>
                      <div style={{ fontSize: '28px', color: Colors.secondary, fontWeight: 700 }}>
                        ₹{selectedReport.reward_amount.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ height: '1px', backgroundColor: Colors.outlineVariant }} />
                  </>
                )}

                <div>
                  <div style={{ fontSize: '12px', color: Colors.outline, marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
                    Timeline
                  </div>
                  <div style={{ fontSize: '14px', color: Colors.onSurface, marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600 }}>Reported:</span> {new Date(selectedReport.reported_at).toLocaleString()}
                  </div>
                  {selectedReport.resolved_at && (
                    <div style={{ fontSize: '14px', color: Colors.secondary, fontWeight: 500 }}>
                      <span style={{ fontWeight: 600 }}>Resolved:</span> {new Date(selectedReport.resolved_at).toLocaleString()}
                    </div>
                  )}
                </div>

                {selectedReport.is_active && (
                  <>
                    <div style={{ height: '1px', backgroundColor: Colors.outlineVariant }} />
                    <Button
                      fullWidth
                      onClick={() => markAsResolved(selectedReport.id)}
                      style={{ backgroundColor: Colors.secondary }}
                    >
                      <span className="material-icons" style={{ fontSize: '18px', marginRight: '8px' }}>
                        check_circle
                      </span>
                      Mark as Resolved
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

import { CSSProperties, useEffect, useState } from 'react'
import { Colors } from '../../lib/colors'
import { supabase } from '../../lib/supabase'
import { Card } from '../../components/Card'

type AnalyticsData = {
  devicesByStatus: { status: string; count: number }[]
  devicesByMake: { make: string; count: number }[]
  reportsOverTime: { month: string; count: number }[]
  topRewardAmounts: { amount: number; device: string }[]
  recoveryRate: number
  averageResolutionDays: number
}

export function PoliceAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    devicesByStatus: [],
    devicesByMake: [],
    reportsOverTime: [],
    topRewardAmounts: [],
    recoveryRate: 0,
    averageResolutionDays: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      // Devices by status
      const { data: devices } = await supabase
        .from('devices')
        .select('status')

      const statusCounts: { [key: string]: number } = {}
      devices?.forEach((d: any) => {
        statusCounts[d.status] = (statusCounts[d.status] || 0) + 1
      })
      const devicesByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }))

      // Devices by make
      const { data: allDevices } = await supabase
        .from('devices')
        .select('make')

      const makeCounts: { [key: string]: number } = {}
      allDevices?.forEach((d: any) => {
        makeCounts[d.make] = (makeCounts[d.make] || 0) + 1
      })
      const devicesByMake = Object.entries(makeCounts)
        .map(([make, count]) => ({ make, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Reports over time (last 6 months)
      const { data: reports } = await supabase
        .from('lost_reports')
        .select('reported_at')
        .gte('reported_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())

      const monthCounts: { [key: string]: number } = {}
      reports?.forEach((r: any) => {
        const month = new Date(r.reported_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        monthCounts[month] = (monthCounts[month] || 0) + 1
      })
      const reportsOverTime = Object.entries(monthCounts).map(([month, count]) => ({ month, count }))

      // Top reward amounts
      const { data: rewardsData } = await supabase
        .from('lost_reports')
        .select('reward_amount, devices(make, model)')
        .not('reward_amount', 'is', null)
        .order('reward_amount', { ascending: false })
        .limit(5)

      const topRewardAmounts = rewardsData?.map((r: any) => ({
        amount: r.reward_amount,
        device: `${r.devices?.make || ''} ${r.devices?.model || ''}`.trim() || 'Unknown',
      })) || []

      // Recovery rate
      const { count: totalLost } = await supabase
        .from('devices')
        .select('*', { count: 'exact', head: true })
        .in('status', ['lost', 'stolen', 'found', 'recovered'])

      const { count: recovered } = await supabase
        .from('devices')
        .select('*', { count: 'exact', head: true })
        .in('status', ['found', 'recovered'])

      const recoveryRate = totalLost ? Math.round((recovered! / totalLost!) * 100) : 0

      // Average resolution days
      const { data: resolvedReports } = await supabase
        .from('lost_reports')
        .select('reported_at, resolved_at')
        .not('resolved_at', 'is', null)

      let totalDays = 0
      resolvedReports?.forEach((r: any) => {
        const reported = new Date(r.reported_at).getTime()
        const resolved = new Date(r.resolved_at).getTime()
        totalDays += (resolved - reported) / (1000 * 60 * 60 * 24)
      })
      const averageResolutionDays = resolvedReports?.length 
        ? Math.round(totalDays / resolvedReports.length) 
        : 0

      setAnalytics({
        devicesByStatus,
        devicesByMake,
        reportsOverTime,
        topRewardAmounts,
        recoveryRate,
        averageResolutionDays,
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
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
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  }

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  }

  const chartCardStyle: CSSProperties = {
    padding: '24px',
  }

  const chartTitleStyle: CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: Colors.onSurface,
    marginBottom: '20px',
  }

  const barStyle = (value: number, maxValue: number, color: string): CSSProperties => ({
    height: '32px',
    backgroundColor: `${color}30`,
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
    overflow: 'hidden',
  })

  const barFillStyle = (percentage: number, color: string): CSSProperties => ({
    width: `${percentage}%`,
    height: '100%',
    backgroundColor: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '12px',
    color: Colors.onPrimary,
    fontSize: '13px',
    fontWeight: 600,
    transition: 'width 0.5s ease',
  })

  if (loading) {
    return (
      <div style={{ ...containerStyle, textAlign: 'center', paddingTop: '120px' }}>
        <span className="material-icons" style={{ fontSize: '48px', color: Colors.primary, animation: 'spin 1s linear infinite' }}>
          sync
        </span>
        <p style={{ marginTop: '16px', color: Colors.onSurfaceVariant }}>Loading analytics...</p>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          <span className="material-icons" style={{ fontSize: '40px', color: Colors.primary }}>
            analytics
          </span>
          Analytics & Insights
        </h1>
        <p style={{ fontSize: '15px', color: Colors.onSurfaceVariant }}>
          Statistical analysis and trends
        </p>
      </div>

      <div style={gridStyle}>
        <Card style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', fontWeight: 700, color: Colors.secondary, marginBottom: '8px' }}>
            {analytics.recoveryRate}%
          </div>
          <div style={{ fontSize: '16px', color: Colors.onSurfaceVariant, fontWeight: 500 }}>
            Recovery Rate
          </div>
          <div style={{ fontSize: '13px', color: Colors.outline, marginTop: '8px' }}>
            Devices recovered vs reported
          </div>
        </Card>

        <Card style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', fontWeight: 700, color: Colors.primary, marginBottom: '8px' }}>
            {analytics.averageResolutionDays}
          </div>
          <div style={{ fontSize: '16px', color: Colors.onSurfaceVariant, fontWeight: 500 }}>
            Avg Days to Resolve
          </div>
          <div style={{ fontSize: '13px', color: Colors.outline, marginTop: '8px' }}>
            Average time to close reports
          </div>
        </Card>
      </div>

      <div style={gridStyle}>
        <Card style={chartCardStyle}>
          <h3 style={chartTitleStyle}>Devices by Status</h3>
          {analytics.devicesByStatus.length === 0 ? (
            <p style={{ color: Colors.onSurfaceVariant, textAlign: 'center', padding: '20px' }}>
              No data available
            </p>
          ) : (
            analytics.devicesByStatus.map((item) => {
              const maxCount = Math.max(...analytics.devicesByStatus.map(d => d.count))
              const percentage = (item.count / maxCount) * 100
              const statusColors: { [key: string]: string } = {
                'registered': Colors.primary,
                'lost': Colors.tertiary,
                'stolen': Colors.error,
                'found': Colors.secondary,
                'recovered': Colors.secondary,
              }
              const color = statusColors[item.status] || Colors.outline

              return (
                <div key={item.status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', color: Colors.onSurface, fontWeight: 500, textTransform: 'capitalize' }}>
                      {item.status}
                    </span>
                    <span style={{ fontSize: '13px', color: Colors.onSurfaceVariant }}>
                      {item.count} devices
                    </span>
                  </div>
                  <div style={barStyle(item.count, maxCount, color)}>
                    <div style={barFillStyle(percentage, color)}>
                      {percentage > 15 && item.count}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </Card>

        <Card style={chartCardStyle}>
          <h3 style={chartTitleStyle}>Top 10 Device Makes</h3>
          {analytics.devicesByMake.length === 0 ? (
            <p style={{ color: Colors.onSurfaceVariant, textAlign: 'center', padding: '20px' }}>
              No data available
            </p>
          ) : (
            analytics.devicesByMake.map((item) => {
              const maxCount = Math.max(...analytics.devicesByMake.map(d => d.count))
              const percentage = (item.count / maxCount) * 100

              return (
                <div key={item.make}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', color: Colors.onSurface, fontWeight: 500 }}>
                      {item.make}
                    </span>
                    <span style={{ fontSize: '13px', color: Colors.onSurfaceVariant }}>
                      {item.count} devices
                    </span>
                  </div>
                  <div style={barStyle(item.count, maxCount, Colors.primary)}>
                    <div style={barFillStyle(percentage, Colors.primary)}>
                      {percentage > 15 && item.count}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </Card>
      </div>

      <div style={gridStyle}>
        <Card style={chartCardStyle}>
          <h3 style={chartTitleStyle}>Reports Over Time</h3>
          {analytics.reportsOverTime.length === 0 ? (
            <p style={{ color: Colors.onSurfaceVariant, textAlign: 'center', padding: '20px' }}>
              No reports in the last 6 months
            </p>
          ) : (
            analytics.reportsOverTime.map((item) => {
              const maxCount = Math.max(...analytics.reportsOverTime.map(d => d.count))
              const percentage = (item.count / maxCount) * 100

              return (
                <div key={item.month}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', color: Colors.onSurface, fontWeight: 500 }}>
                      {item.month}
                    </span>
                    <span style={{ fontSize: '13px', color: Colors.onSurfaceVariant }}>
                      {item.count} reports
                    </span>
                  </div>
                  <div style={barStyle(item.count, maxCount, Colors.error)}>
                    <div style={barFillStyle(percentage, Colors.error)}>
                      {percentage > 15 && item.count}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </Card>

        <Card style={chartCardStyle}>
          <h3 style={chartTitleStyle}>Top Reward Amounts</h3>
          {analytics.topRewardAmounts.length === 0 ? (
            <p style={{ color: Colors.onSurfaceVariant, textAlign: 'center', padding: '20px' }}>
              No rewards offered
            </p>
          ) : (
            analytics.topRewardAmounts.map((item, index) => (
              <div 
                key={index}
                style={{
                  padding: '14px',
                  backgroundColor: Colors.surfaceContainerHigh,
                  borderRadius: '10px',
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', color: Colors.onSurface, fontWeight: 500, marginBottom: '4px' }}>
                    {item.device}
                  </div>
                  <div style={{ fontSize: '12px', color: Colors.outline }}>
                    Rank #{index + 1}
                  </div>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: Colors.secondary }}>
                  ₹{item.amount.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  )
}

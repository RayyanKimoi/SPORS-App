import { useState } from 'react'
import { motion } from 'framer-motion'
import { FeatureVector } from './FeatureVector'
import {
  Radio,
  Bell,
  ShieldCheck,
  Bluetooth,
  MessageSquareLock,
  Smartphone,
} from 'lucide-react'

const features = [
  {
    id: '01',
    label: 'Detection',
    icon: Radio,
    title: 'Crowdsourced Detection',
    description:
      'Every SPORS user becomes a node in a massive detection network. When your device goes missing, thousands of peers silently scan for it — creating an invisible mesh of protection across the city.',
  },
  {
    id: '02',
    label: 'Alerts',
    icon: Bell,
    title: 'Real-time Alerts',
    description:
      'Instant notifications the moment your device is detected anywhere in the network. Location data is triangulated through multiple nodes for pinpoint accuracy.',
  },
  {
    id: '03',
    label: 'Integration',
    icon: ShieldCheck,
    title: 'Police Integration',
    description:
      'A dedicated law enforcement portal enables verified officers to receive reports, coordinate recovery operations, and communicate directly with device owners through secure channels.',
  },
  {
    id: '04',
    label: 'Tracking',
    icon: Bluetooth,
    title: 'BLE Tracking',
    description:
      'Advanced Bluetooth Low Energy scanning detects registered devices within proximity, building a real-time location mesh that grows stronger with every new user in the network.',
  },
  {
    id: '05',
    label: 'Security',
    icon: MessageSquareLock,
    title: 'Encrypted Chat',
    description:
      'Secure, end-to-end encrypted communication between device owners and finders. No personal data is ever exposed — only verified, anonymized interactions.',
  },
  {
    id: '06',
    label: 'Registry',
    icon: Smartphone,
    title: 'Device Registry',
    description:
      'Register IMEI numbers, serial IDs, and unique hardware identifiers to create bulletproof ownership proof that stands up in any recovery scenario.',
  },
]

export function BentoGrid() {
  const [activeIndex, setActiveIndex] = useState<number>(0)

  return (
    <section
      id="features"
      style={{
        height: '100vh',
        backgroundColor: '#fff',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        borderTop: '1px solid #E5E5E5',
        borderBottom: '1px solid #E5E5E5',
      }}
    >
      {/* Section label */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        letterSpacing: '0.3em',
        color: '#A3A3A3',
        textTransform: 'uppercase',
        zIndex: 20,
      }}>
        [ FEATURES ]
      </div>

      {features.map((feature, i) => {
        const isActive = activeIndex === i
        const Icon = feature.icon

        return (
          <motion.div
            key={feature.id}
            onClick={() => setActiveIndex(i)}
            style={{
              position: 'relative',
              height: '100%',
              borderRight: '1px solid #E5E5E5',
              cursor: 'pointer',
              overflow: 'hidden',
              backgroundColor: '#fff',
            }}
            animate={{ flex: isActive ? 8 : 1 }}
            transition={{ duration: 0.7, ease: [0.77, 0, 0.175, 1] }}
          >
            {/* ─── COLLAPSED ─── */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px 0',
                opacity: isActive ? 0 : 1,
                transition: 'opacity 0.3s ease',
                pointerEvents: isActive ? 'none' : 'auto',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 500,
                color: '#000',
                letterSpacing: '0.1em',
                marginBottom: '24px',
              }}>
                {feature.id}
              </span>

              <div style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                fontWeight: 500,
                color: '#525252',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginTop: 'auto',
                marginBottom: 'auto',
              }}>
                {feature.label}
              </div>
            </div>

            {/* ─── EXPANDED (always mounted, visibility controlled by opacity) ─── */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: isActive ? 'grid' : 'none',
                gridTemplateColumns: '1fr 1fr',
                height: '100%',
              }}
            >
              {/* ── LEFT: WireframeMesh ── */}
              <div style={{
                position: 'relative',
                borderRight: '1px solid #E5E5E5',
                overflow: 'hidden',
                backgroundColor: '#fff',
              }}>
                {isActive && <FeatureVector id={feature.id} isActive={isActive} />}

                {/* Giant feature number (Now above the animation) */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  pointerEvents: 'none',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 'clamp(120px, 15vw, 200px)',
                    color: '#000',
                    opacity: 0.4,
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    userSelect: 'none',
                  }}>
                    {feature.id}
                  </span>
                </div>

                {/* Feature icon overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: '40px',
                  left: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  zIndex: 10,
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    border: '1px solid #E5E5E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fff',
                  }}>
                    <Icon size={20} strokeWidth={1.5} color="#000" />
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.2em',
                    color: '#737373',
                    textTransform: 'uppercase',
                  }}>
                    {feature.label}
                  </span>
                </div>

                {/* Number label — top left */}
                <span style={{
                  position: 'absolute',
                  top: '20px',
                  left: '24px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#000',
                  letterSpacing: '0.1em',
                  zIndex: 10,
                }}>
                  {feature.id}
                </span>
              </div>

              {/* ── RIGHT: Content ── */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{
                  padding: '48px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      letterSpacing: '0.3em',
                      color: '#A3A3A3',
                      textTransform: 'uppercase',
                      marginBottom: '32px',
                    }}>
                      [ {feature.id} — {feature.label} ]
                    </span>

                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 600,
                      fontSize: 'clamp(28px, 3vw, 40px)',
                      color: '#000',
                      lineHeight: 1.15,
                      letterSpacing: '-0.02em',
                      marginBottom: '28px',
                    }}>
                      {feature.title}
                    </h3>
                  </div>

                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '16px',
                    color: '#737373',
                    lineHeight: 1.8,
                    maxWidth: '460px',
                  }}>
                    {feature.description}
                  </p>

                  <div style={{
                    width: '48px',
                    height: '2px',
                    backgroundColor: '#000',
                    marginTop: '32px',
                  }} />
                </div>

                {/* Bottom bar */}
                <div style={{
                  borderTop: '1px solid #E5E5E5',
                  padding: '24px 48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    letterSpacing: '0.2em',
                    color: '#A3A3A3',
                    textTransform: 'uppercase',
                  }}>
                    SPORS / {feature.label}
                  </span>

                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: '#D4D4D4',
                    letterSpacing: '0.1em',
                  }}>
                    {feature.id} / 06
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </section>
  )
}

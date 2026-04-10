import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PixelBlock, BarcodeLines, Crosshair, CornerBrackets } from './Accents'
import {
  Radio,
  Bell,
  ShieldCheck,
  Bluetooth,
  MessageSquareLock,
  Smartphone,
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    icon: Radio,
    title: 'Crowdsourced Detection',
    description:
      'Every SPORS user becomes a node in a massive detection network. When your device goes missing, thousands of crowd-silently scan for it.',
    span: 2,
  },
  {
    icon: Bell,
    title: 'Real-time Alerts',
    description:
      'Instant notifications when your device is detected anywhere in the network.',
    span: 1,
  },
  {
    icon: ShieldCheck,
    title: 'Police Integration',
    description:
      'Dedicated law enforcement portal for verified, streamlined recovery operations.',
    span: 1,
  },
  {
    icon: Bluetooth,
    title: 'BLE Tracking',
    description:
      'Advanced Bluetooth Low Energy scanning detects registered devices in proximity, building a real-time location mesh.',
    span: 2,
  },
  {
    icon: MessageSquareLock,
    title: 'Encrypted Chat',
    description:
      'Secure communication between device owners and finders, end-to-end encrypted.',
    span: 1,
  },
  {
    icon: Smartphone,
    title: 'Device Registry',
    description:
      'Register IMEI, serial numbers, and unique identifiers for bulletproof ownership proof.',
    span: 1,
  },
]

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0]
  index: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(cardRef, { once: true, margin: '-80px' })
  const Icon = feature.icon

  return (
    <motion.div
      ref={cardRef}
      className="bento-card"
      style={{
        gridColumn: `span ${feature.span}`,
        padding: '40px',
        minHeight: feature.span === 2 ? '220px' : '220px',
      }}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.7,
        delay: index * 0.08,
        ease: [0.33, 1, 0.68, 1],
      }}
    >
      {/* Icon */}
      <div
        className="bento-icon-wrap"
        style={{
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #E0E0E0',
          borderRadius: '12px',
          marginBottom: '24px',
          backgroundColor: '#fff',
          transition: 'all 0.4s cubic-bezier(0.33, 1, 0.68, 1)',
        }}
      >
        <Icon
          size={22}
          strokeWidth={1.5}
          style={{ color: '#000', transition: 'all 0.4s cubic-bezier(0.33, 1, 0.68, 1)' }}
        />
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: '20px',
          color: '#000',
          marginBottom: '12px',
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
        }}
      >
        {feature.title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: '#737373',
          lineHeight: 1.7,
          maxWidth: '400px',
        }}
      >
        {feature.description}
      </p>

      {/* Card number */}
      <span
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: '#D4D4D4',
          letterSpacing: '0.1em',
          zIndex: 2,
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>
    </motion.div>
  )
}

export function BentoGrid() {
  const sectionRef = useRef<HTMLElement>(null)
  const bgTextRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Parallax drift on the background text
    if (bgTextRef.current) {
      gsap.to(bgTextRef.current, {
        y: -80,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      })
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="features"
      style={{
        padding: '128px 0',
        backgroundColor: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Large faint background text — parallax drift */}
      <div
        ref={bgTextRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(120px, 15vw, 280px)',
          color: 'rgba(0,0,0,0.02)',
          letterSpacing: '-0.04em',
          lineHeight: 0.9,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
        }}
      >
        FEATURES
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 48px', position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <div style={{ marginBottom: '80px', maxWidth: '640px' }}>
          {/* Label with typing cursor */}
          <motion.span
            className="typing-cursor"
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              letterSpacing: '0.3em',
              color: '#A3A3A3',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            [ 01 · FEATURES ]
          </motion.span>

          {/* Split-line reveal heading */}
          <div style={{ overflow: 'hidden', marginBottom: '8px' }}>
            <motion.div
              initial={{ y: '100%' }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
            >
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: 'clamp(36px, 5vw, 60px)',
                  color: '#000',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                Built for the
              </span>
            </motion.div>
          </div>
          <div style={{ overflow: 'hidden', marginBottom: '24px' }}>
            <motion.div
              initial={{ y: '100%' }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.77, 0, 0.175, 1] }}
            >
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: 'clamp(36px, 5vw, 60px)',
                  color: '#000',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                modern threat landscape
              </span>
            </motion.div>
          </div>

          {/* Animated underline */}
          <motion.div
            style={{
              width: '64px',
              height: '2px',
              backgroundColor: '#000',
              transformOrigin: 'left',
            }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.33, 1, 0.68, 1] }}
          />
        </div>

        {/* Bento Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
          }}
        >
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} />
          ))}
        </div>
      </div>

      {/* Decorative accents */}
      <PixelBlock
        size={5}
        cellSize={16}
        pattern={[1,0,1,1,0, 1,1,0,0,1, 0,1,1,1,0, 1,0,0,1,1, 0,1,1,0,1]}
        style={{ position: 'absolute', bottom: '48px', right: '48px', zIndex: 2 }}
        delay={0.5}
      />
      <BarcodeLines
        count={20}
        maxHeight={70}
        style={{ position: 'absolute', top: '80px', right: '48px', zIndex: 2 }}
        delay={0.6}
      />
      <Crosshair
        size={48}
        style={{ position: 'absolute', bottom: '80px', left: '48px', zIndex: 2 }}
        delay={0.7}
      />
      <CornerBrackets
        size={40}
        style={{ position: 'absolute', top: '48px', left: '48px', zIndex: 2 }}
        delay={0.4}
      />
    </section>
  )
}

import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'ScouttOpp — The Creative Talent Platform'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0A',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Purple glow orb */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 800,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.25) 0%, transparent 70%)',
          }}
        />

        {/* Bottom glow */}
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            right: 100,
            width: 400,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 999,
            padding: '8px 18px',
            marginBottom: 32,
          }}
        >
          <span style={{ fontSize: 13, color: '#A78BFA', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
            ✦ Invitation Only
          </span>
        </div>

        {/* Heading */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: '#FFFFFF',
            textAlign: 'center',
            lineHeight: 1.1,
            maxWidth: 900,
            letterSpacing: -2,
          }}
        >
          Talent this good doesn&apos;t{' '}
          <span style={{ color: '#A78BFA' }}>come from a job board.</span>
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: 22,
            color: 'rgba(255,255,255,0.55)',
            textAlign: 'center',
            marginTop: 28,
            maxWidth: 640,
            lineHeight: 1.5,
          }}
        >
          The creative talent platform. Get discovered through your work.
        </div>

        {/* Brand name */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: 1,
            }}
          >
            scouttopp.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}

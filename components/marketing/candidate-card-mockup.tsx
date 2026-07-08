'use client'

import { motion } from 'framer-motion'
import { MapPin, X, Heart } from 'lucide-react'

interface CandidateCardMockupProps {
  rotate?: number
  delay?: number
  opacity?: number
  scale?: number
}

export function CandidateCardMockup({
  rotate = -2,
  delay = 0,
  opacity = 1,
  scale = 1,
}: CandidateCardMockupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{
        opacity,
        y: [0, -10, 0],
        scale,
        rotate,
      }}
      transition={{
        opacity: { duration: 0.6, delay },
        y: {
          delay: delay + 0.6,
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        },
        scale: { duration: 0.6, delay },
        rotate: { duration: 0.6, delay },
      }}
      className="w-[280px] rounded-2xl overflow-hidden select-none"
      style={{
        background: 'rgba(24, 24, 24, 0.92)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
      }}
    >
      {/* Avatar + Identity */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)' }}
          >
            M
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Maya R.</p>
            <p className="text-xs text-muted">Art Director</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted mb-3">
          <MapPin size={12} />
          <span>London · Remote</span>
        </div>
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {['Brand', 'Motion', 'UI/UX'].map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                background: 'rgba(124, 58, 237, 0.12)',
                color: '#A78BFA',
                border: '1px solid rgba(124, 58, 237, 0.2)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Portfolio thumbnails */}
      <div
        className="mx-4 mb-4 rounded-xl overflow-hidden grid grid-cols-2 gap-0.5"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        {[
          { bg: 'rgba(124,58,237,0.25)' },
          { bg: 'rgba(167,139,250,0.2)' },
          { bg: 'rgba(107,95,174,0.2)' },
          { bg: 'rgba(155,141,196,0.15)' },
        ].map((item, i) => (
          <div
            key={i}
            className="h-16"
            style={{ background: item.bg }}
          />
        ))}
      </div>

      {/* Actions */}
      <div
        className="flex items-center px-4 pb-5 gap-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold mt-3"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#EF4444',
          }}
        >
          <X size={14} />
          Pass
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold mt-3"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
            color: 'white',
          }}
        >
          <Heart size={14} />
          Like
        </button>
      </div>
    </motion.div>
  )
}

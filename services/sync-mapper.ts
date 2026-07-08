import type { SheetRow } from './sheets.service'

export interface MappedCandidate {
  full_name:        string
  email:            string
  phone:            string | null
  location_city:    string | null
  location_country: string | null
  timezone:         string | null
  pronouns:         string | null
  bio:              string | null
  avatar_url:       string | null
  primary_role:     string | null
  years_experience: number | null
  portfolio_url:    string | null
  linkedin_url:     string | null
  instagram_url:    string | null
  website_url:      string | null
  resume_url:       string | null
}

// Flexible column matching: any header that contains one of these patterns (case-insensitive)
// maps to the given DB field.
const FIELD_PATTERNS: Array<{ key: keyof MappedCandidate; patterns: string[] }> = [
  { key: 'full_name',        patterns: ['full name', 'name'] },
  { key: 'email',            patterns: ['email'] },
  { key: 'phone',            patterns: ['phone', 'mobile', 'contact number'] },
  { key: 'location_city',    patterns: ['city', 'location city'] },
  { key: 'location_country', patterns: ['country', 'location country'] },
  { key: 'timezone',         patterns: ['timezone', 'time zone'] },
  { key: 'pronouns',         patterns: ['pronoun'] },
  { key: 'bio',              patterns: ['bio', 'about yourself', 'description'] },
  { key: 'avatar_url',       patterns: ['avatar', 'photo url', 'profile photo'] },
  { key: 'primary_role',     patterns: ['role', 'discipline', 'specialty', 'what do you do', 'your role'] },
  { key: 'years_experience', patterns: ['years of experience', 'years experience', 'experience'] },
  { key: 'portfolio_url',    patterns: ['portfolio'] },
  { key: 'linkedin_url',     patterns: ['linkedin'] },
  { key: 'instagram_url',    patterns: ['instagram'] },
  { key: 'website_url',      patterns: ['website', 'personal site'] },
  { key: 'resume_url',       patterns: ['resume', 'cv link', 'cv url'] },
]

const ROLE_MAP: Record<string, string> = {
  'motion designer':    'motion_designer',
  'motion design':      'motion_designer',
  'graphic designer':   'graphic_designer',
  'graphic design':     'graphic_designer',
  'ux designer':        'ux_designer',
  'ui/ux':              'ux_designer',
  'ux/ui':              'ux_designer',
  'brand designer':     'brand_designer',
  'brand design':       'brand_designer',
  'illustrator':        'illustrator',
  'illustration':       'illustrator',
  'photographer':       'photographer',
  'photography':        'photographer',
  'videographer':       'videographer',
  'video editor':       'videographer',
  'creative director':  'creative_director',
  'art director':       'art_director',
  'copywriter':         'copywriter',
  'copywriting':        'copywriter',
  'social media':       'social_media',
}

function findColumnValue(rawData: Record<string, string>, patterns: string[]): string | null {
  for (const [header, value] of Object.entries(rawData)) {
    const h = header.toLowerCase()
    for (const pattern of patterns) {
      if (h.includes(pattern.toLowerCase())) {
        return value.trim() || null
      }
    }
  }
  return null
}

function mapRole(raw: string | null): string | null {
  if (!raw) return null
  const normalized = raw.toLowerCase().trim()
  for (const [pattern, role] of Object.entries(ROLE_MAP)) {
    if (normalized.includes(pattern)) return role
  }
  return 'other'
}

export interface MapResult {
  mapped: MappedCandidate | null
  errors: string[]
}

export function mapSheetRow(row: SheetRow): MapResult {
  const result: Partial<MappedCandidate> = {}

  for (const { key, patterns } of FIELD_PATTERNS) {
    const raw = findColumnValue(row.rawData, patterns)

    if (key === 'primary_role') {
      result[key] = mapRole(raw)
    } else if (key === 'years_experience') {
      const n = raw ? parseInt(raw, 10) : NaN
      result[key] = isNaN(n) ? null : n
    } else {
      result[key] = raw ?? undefined
    }
  }

  const errors: string[] = []
  if (!result.full_name) errors.push('Missing full_name')
  if (!result.email)     errors.push('Missing email')

  if (errors.length > 0) return { mapped: null, errors }

  return {
    mapped: {
      full_name:        result.full_name!,
      email:            result.email!,
      phone:            result.phone            ?? null,
      location_city:    result.location_city    ?? null,
      location_country: result.location_country ?? null,
      timezone:         result.timezone         ?? null,
      pronouns:         result.pronouns         ?? null,
      bio:              result.bio               ?? null,
      avatar_url:       result.avatar_url        ?? null,
      primary_role:     result.primary_role      ?? null,
      years_experience: result.years_experience  ?? null,
      portfolio_url:    result.portfolio_url      ?? null,
      linkedin_url:     result.linkedin_url       ?? null,
      instagram_url:    result.instagram_url      ?? null,
      website_url:      result.website_url        ?? null,
      resume_url:       result.resume_url         ?? null,
    },
    errors: [],
  }
}

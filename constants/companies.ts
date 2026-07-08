export interface Company {
  id: string
  name: string
  industry: string
  size: string
  website: string
  useCase: string
  initials: string
  color: string
}

export const TRUSTED_COMPANIES: Company[] = [
  {
    id: '1',
    name: 'Ogilvy',
    industry: 'Advertising & PR',
    size: '10,000+ employees',
    website: 'https://ogilvy.com',
    useCase: 'Hiring motion designers, creative directors, and brand strategists.',
    initials: 'OG',
    color: '#E63946',
  },
  {
    id: '2',
    name: 'Droga5',
    industry: 'Creative Agency',
    size: '500–1,000 employees',
    website: 'https://droga5.com',
    useCase: 'Sourcing brand designers and copywriters for campaigns.',
    initials: 'D5',
    color: '#2B3875',
  },
  {
    id: '3',
    name: 'Wieden+Kennedy',
    industry: 'Creative Agency',
    size: '1,000–5,000 employees',
    website: 'https://wk.com',
    useCase: 'Building a vetted creative pipeline for global campaigns.',
    initials: 'WK',
    color: '#6B5FAE',
  },
  {
    id: '4',
    name: 'BBDO',
    industry: 'Advertising',
    size: '10,000+ employees',
    website: 'https://bbdo.com',
    useCase: 'Discovering UX designers and digital art directors.',
    initials: 'BB',
    color: '#E67E22',
  },
  {
    id: '5',
    name: 'R/GA',
    industry: 'Digital Agency',
    size: '1,000–5,000 employees',
    website: 'https://rga.com',
    useCase: 'Hiring UI/UX designers and interactive developers.',
    initials: 'RG',
    color: '#16A085',
  },
  {
    id: '6',
    name: 'Mother London',
    industry: 'Creative Agency',
    size: '200–500 employees',
    website: 'https://motherlondon.com',
    useCase: 'Finding illustrators and visual identity designers.',
    initials: 'ML',
    color: '#8E44AD',
  },
]

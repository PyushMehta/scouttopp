import { type MetadataRoute } from 'next'

const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://scouttopp.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/`,         changeFrequency: 'monthly', priority: 1,   lastModified: new Date('2026-07-31') },
    { url: `${base}/features`, changeFrequency: 'monthly', priority: 0.8, lastModified: new Date('2026-07-31') },
    { url: `${base}/about`,    changeFrequency: 'monthly', priority: 0.6, lastModified: new Date('2026-07-31') },
    { url: `${base}/faq`,      changeFrequency: 'monthly', priority: 0.6, lastModified: new Date('2026-07-31') },
    { url: `${base}/blog`,     changeFrequency: 'weekly',  priority: 0.7, lastModified: new Date('2026-07-20') },
    { url: `${base}/blog/why-creative-hiring-is-broken-2026`, changeFrequency: 'monthly', priority: 0.7, lastModified: new Date('2026-07-20') },
    { url: `${base}/contact`,  changeFrequency: 'yearly',  priority: 0.5, lastModified: new Date('2026-07-01') },
    { url: `${base}/privacy`,  changeFrequency: 'yearly',  priority: 0.3, lastModified: new Date('2026-07-01') },
    { url: `${base}/terms`,    changeFrequency: 'yearly',  priority: 0.3, lastModified: new Date('2026-07-01') },
  ]
}

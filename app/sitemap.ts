import { type MetadataRoute } from 'next'

const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://scouttopp.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/`,        changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/features`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/about`,   changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/faq`,     changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`, changeFrequency: 'yearly',  priority: 0.5 },
    { url: `${base}/privacy`, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/terms`,   changeFrequency: 'yearly',  priority: 0.3 },
  ]
}

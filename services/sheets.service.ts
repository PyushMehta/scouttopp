import { createSign } from 'crypto'

const OAUTH_URL = 'https://oauth2.googleapis.com/token'
const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly'
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets'

function b64url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function getAccessToken(): Promise<string> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? process.env.GOOGLE_PRIVATE_KEY

  if (!email || !rawKey) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY env vars')
  }

  // .env files escape newlines as \n — restore them for the PEM parser
  const privateKey = rawKey.replace(/\\n/g, '\n')

  const now = Math.floor(Date.now() / 1000)
  const header  = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = b64url(JSON.stringify({
    iss:   email,
    scope: SHEETS_SCOPE,
    aud:   OAUTH_URL,
    exp:   now + 3600,
    iat:   now,
  }))

  const unsigned = `${header}.${payload}`
  const signer   = createSign('RSA-SHA256')
  signer.update(unsigned)
  const sig = b64url(signer.sign(privateKey))
  const jwt = `${unsigned}.${sig}`

  const res = await fetch(OAUTH_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion:  jwt,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Google OAuth token error: ${text}`)
  }

  const json = await res.json() as { access_token: string }
  return json.access_token
}

export interface SheetRow {
  rowIndex: number
  rawData:  Record<string, string>
}

/**
 * Returns true if the given email appears in any row of the sheet.
 * Used by the pending page to detect whether a candidate has submitted
 * the Google Form before an admin has run the sync.
 * Silently returns false on any Sheets API error.
 */
export async function checkEmailInSheet(email: string): Promise<boolean> {
  try {
    const rows = await fetchSheetRows()
    const target = email.toLowerCase()
    for (const row of rows) {
      for (const [header, value] of Object.entries(row.rawData)) {
        if (header.toLowerCase().includes('email') && value.trim().toLowerCase() === target) {
          return true
        }
      }
    }
    return false
  } catch {
    return false
  }
}

export async function fetchSheetRows(): Promise<SheetRow[]> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  const range         = process.env.GOOGLE_SHEETS_RANGE ?? 'Sheet1'

  if (!spreadsheetId) {
    throw new Error('Missing GOOGLE_SHEETS_SPREADSHEET_ID env var')
  }

  const token = await getAccessToken()
  const url   = `${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(range)}`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Google Sheets API error ${res.status}: ${text}`)
  }

  const json = await res.json() as { values?: string[][] }
  const values = json.values ?? []

  if (values.length < 2) return []

  const headers = values[0].map(h => h.trim())

  return values.slice(1).map((row, i) => ({
    rowIndex: i + 2, // 1-indexed; row 1 is headers
    rawData:  Object.fromEntries(headers.map((h, j) => [h, (row[j] ?? '').trim()])),
  }))
}

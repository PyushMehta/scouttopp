/**
 * Magic-byte signatures for every MIME type accepted by upload routes.
 * Validates actual file content, not the client-supplied Content-Type header.
 *
 * MP4 and MOV share the ISO Base Media File Format (ftyp box at bytes 4–7);
 * both are accepted when either is declared.
 */

type MagicCheck = { mime: string; check: (b: Buffer) => boolean }

const MAGIC: MagicCheck[] = [
  { mime: 'image/jpeg',      check: b => b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF },
  { mime: 'image/png',       check: b => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47 },
  {
    mime: 'image/webp',
    check: b =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && // RIFF
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,  // WEBP
  },
  { mime: 'image/gif',       check: b => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38 },
  { mime: 'video/webm',      check: b => b[0] === 0x1A && b[1] === 0x45 && b[2] === 0xDF && b[3] === 0xA3 },
  { mime: 'application/pdf', check: b => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46 },
  // MP4 and MOV: ftyp box starts at byte offset 4
  { mime: 'video/mp4',       check: b => b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 },
  { mime: 'video/quicktime', check: b => b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 },
]

/** Returns the detected MIME type, or null if no signature matches or the buffer is too short. */
function sniffMime(buffer: Buffer): string | null {
  if (buffer.length < 12) return null
  for (const { mime, check } of MAGIC) {
    if (check(buffer)) return mime
  }
  return null
}

/**
 * Returns true if the buffer's magic bytes are consistent with the declared MIME type.
 * MP4 and MOV share a signature, so both are accepted when either is declared.
 */
export function mimeMatchesBuffer(declaredMime: string, buffer: Buffer): boolean {
  const actual = sniffMime(buffer)
  if (actual === null) return false
  if (declaredMime === 'video/mp4' || declaredMime === 'video/quicktime') {
    return actual === 'video/mp4' || actual === 'video/quicktime'
  }
  return actual === declaredMime
}

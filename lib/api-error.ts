import { NextResponse } from 'next/server'

export function serverError(context: string, error: unknown) {
  console.error(`[${context}]`, error)
  return NextResponse.json(
    { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
    { status: 500 },
  )
}

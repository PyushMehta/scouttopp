import type { Metadata } from 'next'
import { RoleSelectForm } from '@/components/auth/role-select-form'

export const metadata: Metadata = {
  title: 'Choose Your Role',
  description: 'Select your account type to get started with ScouttOpp.',
}

export default function RoleSelectPage() {
  return <RoleSelectForm />
}

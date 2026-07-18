import type { Metadata } from 'next'
import { LegalPageShell, Section } from '@/components/marketing/legal-prose'

export const metadata: Metadata = {
  title: 'Account Deletion Policy',
  description: 'How to delete your ScouttOpp account and what happens to your data.',
}

const DATE = 'July 18, 2026'

export default function AccountDeletionPage() {
  return (
    <LegalPageShell
      title="Account Deletion Policy"
      date={DATE}
      intro="You have the right to delete your ScouttOpp account at any time, for any reason, with no penalty. This policy explains what happens when you do."
    >

      <Section id="how-to-delete" title="1. How to Delete Your Account">
        <p><strong>From your dashboard:</strong></p>
        <ol className="pl-5 space-y-1 list-decimal">
          <li>Go to <strong>Dashboard → Settings → Account</strong></li>
          <li>Scroll to the <strong>Danger Zone</strong> section</li>
          <li>Click <strong>Delete Account</strong></li>
          <li>Confirm your decision when prompted</li>
        </ol>
        <p>
          <strong>By email:</strong> if you cannot access your account, email{' '}
          <a href="mailto:support@scouttopp.com">support@scouttopp.com</a> from your registered email address
          requesting deletion. We will process your request within 5 business days.
        </p>
      </Section>

      <Section id="what-happens" title="2. What Happens When You Delete Your Account">
        <p>
          Deletion is <strong>permanent and irreversible</strong>. Once initiated:
        </p>
        <table>
          <thead>
            <tr><th>What gets deleted</th><th>Timeline</th></tr>
          </thead>
          <tbody>
            <tr><td>Login credentials and authentication record</td><td>Immediately</td></tr>
            <tr><td>Your candidate or employer profile data</td><td>Within 30 days</td></tr>
            <tr><td>Uploaded files (avatar, portfolio images, videos, PDFs)</td><td>Within 30 days</td></tr>
            <tr><td>Work preferences and notification settings</td><td>Within 30 days</td></tr>
            <tr><td>Your profile from discovery results</td><td>Immediately</td></tr>
          </tbody>
        </table>

        <p><strong>What we retain (and why):</strong></p>
        <table>
          <thead>
            <tr><th>What we keep</th><th>Why</th><th>For how long</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Employer private notes mentioning your profile</td>
              <td>Tied to employer account records</td>
              <td>Deleted when employer deletes their account, or on request</td>
            </tr>
            <tr>
              <td>Server logs containing your IP</td>
              <td>Security and abuse prevention</td>
              <td>Up to 90 days</td>
            </tr>
            <tr>
              <td>Original Google Form application data</td>
              <td>Audit trail</td>
              <td>Up to 90 days after deletion</td>
            </tr>
            <tr>
              <td>Aggregated, anonymised analytics</td>
              <td>Platform improvement</td>
              <td>Indefinitely (no personal data)</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section id="alternatives" title="3. Before You Delete">
        <p>Consider these alternatives:</p>
        <ul>
          <li>
            <strong>Pause your discovery</strong>: if you just don&apos;t want to be visible to employers right
            now, pause discovery from Settings without deleting your account.
          </li>
          <li>
            <strong>Update your preferences</strong>: if you&apos;re unhappy with the types of roles or employers
            reaching you, update your work preferences.
          </li>
          <li>
            <strong>Take a break</strong>: your account will remain inactive safely if you simply stop using it.
          </li>
        </ul>
      </Section>

      <Section id="data-download" title="4. Data Download">
        <p>
          Before deleting, you may request a copy of your profile data by emailing{' '}
          <a href="mailto:privacy@scouttopp.com">privacy@scouttopp.com</a>. We will provide your data in a
          machine-readable format (JSON) within 14 days.
        </p>
      </Section>

      <Section id="re-joining" title="5. Re-Joining After Deletion">
        <p>Once your account is deleted:</p>
        <ul>
          <li>Your email is removed from the platform.</li>
          <li>You would need to re-apply via the candidate application form to re-join.</li>
          <li>Previous approval does not guarantee re-approval.</li>
          <li>You cannot recover your old profile, portfolio uploads, or data.</li>
        </ul>
      </Section>

      <Section id="employer-deletion" title="6. Employer Account Deletion">
        <p>Employer accounts follow the same process. On deletion:</p>
        <ul>
          <li>All employer profile data is removed within 30 days.</li>
          <li>All private notes about candidates are deleted.</li>
          <li>Candidate profiles you saved or passed on are no longer tracked.</li>
        </ul>
      </Section>

      <Section id="changes" title="7. Changes to This Policy">
        <p>
          We may update this policy as the platform evolves. Changes will be communicated via email or
          platform notice.
        </p>
        <p>
          Contact: <a href="mailto:support@scouttopp.com">support@scouttopp.com</a> |{' '}
          <a href="mailto:privacy@scouttopp.com">privacy@scouttopp.com</a>
        </p>
      </Section>

    </LegalPageShell>
  )
}

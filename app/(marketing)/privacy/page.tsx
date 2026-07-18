import type { Metadata } from 'next'
import { LegalPageShell, Section, Sub } from '@/components/marketing/legal-prose'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How ScouttOpp collects, uses, and protects your personal information.',
}

const DATE          = 'July 18, 2026'
const PRIVACY_EMAIL = 'privacy@scouttopp.com'
const SUPPORT_EMAIL = 'support@scouttopp.com'

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      date={DATE}
      intro='This policy explains how ScouttOpp ("we", "us", "our") collects, uses, and protects your personal information when you use our platform.'
    >

      <Section id="who-we-are" title="1. Who We Are">
        <p>
          ScouttOpp is a curated hiring platform for creative professionals based in India, serving users globally.
          For privacy questions or requests, contact us at{' '}
          <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>.
        </p>
      </Section>

      <Section id="information-we-collect" title="2. Information We Collect">
        <Sub title="Information you give us directly">
          <ul>
            <li><strong>Candidates:</strong> full name, email address, phone number, location (city and country),
              timezone, pronouns, professional bio, primary role, years of experience, portfolio media and links,
              LinkedIn, Instagram, website, resume URL, and profile avatar.</li>
            <li><strong>Employers:</strong> company name, website, LinkedIn URL, industry, company size,
              founding year, company bio, logo, and hiring preferences (roles, contract type, budget, urgency).</li>
            <li><strong>All users:</strong> email and password, or Google OAuth identity.</li>
          </ul>
        </Sub>
        <Sub title="Information collected automatically">
          <ul>
            <li>An HTTP-only session cookie to keep you logged in (strictly necessary — not used for tracking).</li>
            <li>Employer discovery activity: which profiles are viewed, saved, passed on, and private notes. Used to
              power the discovery engine and future AI-matching features.</li>
            <li>Page view and navigation events collected via PostHog analytics (anonymised; no advertising use).</li>
            <li>Standard server logs (IP address, browser type, referring URL) for security and abuse prevention.</li>
            <li>Profile completeness score (0–100) computed automatically to determine discovery eligibility.</li>
          </ul>
        </Sub>
        <Sub title="Information from third parties">
          <p>
            <strong>Google OAuth</strong>: if you sign in with Google, Google shares your name, email, and profile
            picture with us under Google's own terms. We use this only to create and manage your account.
          </p>
          <p>
            <strong>Google Forms</strong>: candidate applications are submitted via Google Form. When our admin
            approves an application, the submitted data is imported into our database once. We do not read from
            Google Forms on an ongoing basis.
          </p>
        </Sub>
      </Section>

      <Section id="how-we-use" title="3. How We Use Your Information">
        <p>We use the information we collect to:</p>
        <ul>
          <li>Create and maintain your account and profile.</li>
          <li>Operate the talent discovery platform — showing candidate profiles to approved employers whose
            needs match the candidate's preferences.</li>
          <li>Verify candidates and employers before granting platform access.</li>
          <li>Send transactional emails: invitations, verification results, and critical service notices.
            We do not send marketing emails without your consent.</li>
          <li>Calculate profile completeness to determine discovery eligibility.</li>
          <li>Enforce our Terms &amp; Conditions, detect fraud, and prevent abuse.</li>
          <li>Improve platform features using aggregated, non-identifying usage data.</li>
          <li>Comply with applicable Indian and international law.</li>
        </ul>
        <p>We do <strong>not</strong> sell your personal data or use it for advertising networks.</p>
      </Section>

      <Section id="how-we-share" title="4. How We Share Your Information">
        <Sub title="Within the platform">
          <p>
            Candidate profiles (name, role, location, bio, portfolio, preferences) are visible to approved
            employer accounts when the candidate has enabled discovery. Employers cannot see phone numbers,
            email addresses, or personal social links unless the candidate explicitly includes them.
            Employer private notes are never shared with candidates or other employers.
          </p>
        </Sub>
        <Sub title="Service providers">
          <table>
            <thead>
              <tr><th>Provider</th><th>Purpose</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Supabase</strong></td><td>Database, authentication, and file storage.</td></tr>
              <tr><td><strong>Vercel</strong></td><td>Hosting, serverless compute, and CDN.</td></tr>
              <tr><td><strong>Google</strong></td><td>OAuth sign-in and Google Forms for applications.</td></tr>
              <tr><td><strong>PostHog</strong></td><td>Product analytics and session replay (US region).</td></tr>
            </tbody>
          </table>
          <p>We do not permit service providers to use your data for their own purposes.</p>
        </Sub>
        <Sub title="Legal disclosures">
          <p>
            We may disclose your data if required by law, court order, or government authority, or to protect
            the rights, property, or safety of ScouttOpp, our users, or the public.
          </p>
        </Sub>
        <Sub title="Business transfers">
          <p>
            If ScouttOpp is involved in a merger or acquisition, your data may be transferred to the acquiring
            entity. We will notify you before your data becomes subject to a different privacy policy.
          </p>
        </Sub>
      </Section>

      <Section id="data-retention" title="5. Data Retention">
        <table>
          <thead>
            <tr><th>Data type</th><th>Retention period</th></tr>
          </thead>
          <tbody>
            <tr><td>Active accounts</td><td>Retained while account is active.</td></tr>
            <tr><td>Deleted accounts</td><td>Deleted or anonymised within 30 days.</td></tr>
            <tr><td>Portfolio files</td><td>Deleted when you remove them or delete your account.</td></tr>
            <tr><td>Candidate staging data</td><td>Up to 90 days after rejection, for audit purposes.</td></tr>
            <tr><td>Server logs</td><td>Up to 90 days.</td></tr>
            <tr><td>Employer notes</td><td>Deleted when employer deletes their account or on verified request.</td></tr>
          </tbody>
        </table>
      </Section>

      <Section id="your-rights" title="6. Your Rights">
        <p>Depending on your location, you may have the right to:</p>
        <ul>
          <li><strong>Access</strong> the personal data we hold about you.</li>
          <li><strong>Correct</strong> inaccurate data — most fields are editable directly in your dashboard.</li>
          <li><strong>Delete</strong> your account and data via Account Settings or by emailing us.</li>
          <li><strong>Restrict</strong> certain uses of your data.</li>
          <li><strong>Data portability</strong> — receive your data in a machine-readable format (JSON).</li>
          <li><strong>Object</strong> to processing where we rely on legitimate interests.</li>
        </ul>
        <p>
          <strong>India (DPDPA 2023)</strong>: you have the right to access, correct, and request erasure of your
          personal data. <strong>EU/UK (GDPR)</strong>: you may also lodge a complaint with your local
          supervisory authority.
        </p>
        <p>
          To exercise any right, email <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>. We will respond
          within 30 days.
        </p>
      </Section>

      <Section id="cookies" title="7. Cookies">
        <p>
          We use a single HTTP-only session cookie (set by Supabase) to keep you logged in. It is strictly
          necessary and not used for tracking or advertising. We do not use analytics cookies, advertising pixels,
          or fingerprinting scripts. See our full <a href="/cookies">Cookie Policy</a>.
        </p>
      </Section>

      <Section id="security" title="8. Security">
        <ul>
          <li>All data in transit is encrypted using TLS.</li>
          <li>Passwords are hashed using bcrypt and never stored in plaintext.</li>
          <li>Row-level security (RLS) policies ensure users can only access their own data.</li>
          <li>Portfolio files and avatars are stored in private buckets, served only via time-limited signed URLs.</li>
          <li>File uploads are validated for type, size, and content using magic-byte checks.</li>
          <li>Authentication endpoints are rate-limited to prevent brute-force attacks.</li>
        </ul>
        <p>
          No system is 100% secure. In the event of a breach affecting your rights, we will notify you as
          required by applicable law.
        </p>
      </Section>

      <Section id="children" title="9. Children's Privacy">
        <p>
          ScouttOpp is not intended for anyone under 18. We do not knowingly collect data from children.
          If you believe a child has created an account, contact <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a> and
          we will delete the account and its data promptly.
        </p>
      </Section>

      <Section id="international" title="10. International Transfers">
        <p>
          ScouttOpp is based in India. Your data may be processed in data centres outside your country (including
          where Supabase, Vercel, and PostHog host their infrastructure, primarily in the United States). By
          using the platform, you consent to these transfers. We take steps to ensure compliance with applicable
          data protection law.
        </p>
      </Section>

      <Section id="changes" title="11. Changes to This Policy">
        <p>
          We may update this Privacy Policy at any time. We will update the effective date at the top of this
          page and, for material changes, notify you by email or platform notice at least 14 days before they
          take effect. Continued use after the effective date constitutes acceptance of the revised policy.
        </p>
      </Section>

      <Section id="contact" title="12. Contact &amp; Grievance Officer">
        <p>
          For any privacy questions, requests, or complaints:
        </p>
        <p>
          <strong>ScouttOpp</strong><br />
          Privacy: <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a><br />
          Support: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a><br />
          Grievance Officer: <a href="mailto:grievance@scouttopp.com">grievance@scouttopp.com</a>
        </p>
        <p className="text-sm" style={{ color: 'var(--color-stone)' }}>
          In accordance with the IT Act 2000 and applicable Indian law, our Grievance Officer will acknowledge
          complaints within 24 hours and resolve them within 15 working days.
        </p>
      </Section>

    </LegalPageShell>
  )
}

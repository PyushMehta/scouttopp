import type { Metadata } from 'next'
import { LegalPageShell, Section } from '@/components/marketing/legal-prose'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How ScouttOpp uses cookies and similar technologies.',
}

const DATE = 'July 18, 2026'

export default function CookiesPage() {
  return (
    <LegalPageShell
      title="Cookie Policy"
      date={DATE}
      intro="This policy explains what cookies ScouttOpp uses, why we use them, and how you can control them."
    >

      <Section id="what-are-cookies" title="1. What Are Cookies">
        <p>
          Cookies are small text files stored on your device when you visit a website. They allow the site to
          remember information about your visit — such as whether you are logged in.
        </p>
      </Section>

      <Section id="what-we-use" title="2. What ScouttOpp Currently Uses">
        <p>ScouttOpp uses <strong>one cookie</strong>, and it is strictly necessary.</p>
        <table>
          <thead>
            <tr><th>Cookie</th><th>Type</th><th>Purpose</th><th>Duration</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Supabase session token</td>
              <td>First-party, HTTP-only</td>
              <td>Keeps you authenticated during your session</td>
              <td>Session / auto-refreshed up to 1 year</td>
            </tr>
          </tbody>
        </table>
        <p>We do <strong>not</strong> currently use:</p>
        <ul>
          <li>Google Analytics or any third-party analytics cookies</li>
          <li>Advertising or retargeting cookies</li>
          <li>Third-party tracking pixels</li>
          <li>Fingerprinting or behavioural tracking scripts</li>
        </ul>
      </Section>

      <Section id="why-no-banner" title="3. Why We Don't Show a Cookie Banner Right Now">
        <p>
          Because the only cookie ScouttOpp sets is strictly necessary for the platform to function, we are not
          legally required to obtain cookie consent for it under most applicable laws — including India&apos;s IT
          Act and the EU ePrivacy Directive&apos;s &ldquo;strictly necessary&rdquo; exemption.
        </p>
        <p>
          When we add any analytics or marketing cookies in the future, we will update this policy and display a
          consent banner <strong>before</strong> setting those cookies.
        </p>
      </Section>

      <Section id="third-party" title="4. Third-Party Cookies">
        <p>
          When you use Google OAuth (&ldquo;Continue with Google&rdquo;) to sign in, Google may set its own
          cookies as part of the authentication process. These are governed by Google&apos;s Privacy Policy.
          ScouttOpp does not control or access Google&apos;s cookies.
        </p>
      </Section>

      <Section id="manage" title="5. How to Manage Cookies">
        <p>You can control cookies through your browser settings:</p>
        <ul>
          <li><strong>Chrome</strong>: Settings → Privacy and Security → Cookies and other site data</li>
          <li><strong>Firefox</strong>: Settings → Privacy &amp; Security → Cookies and Site Data</li>
          <li><strong>Safari</strong>: Preferences → Privacy → Manage Website Data</li>
          <li><strong>Edge</strong>: Settings → Cookies and site permissions</li>
        </ul>
        <p>
          Note: disabling the ScouttOpp session cookie will prevent you from staying logged in and will break
          core platform functionality.
        </p>
      </Section>

      <Section id="future" title="6. Future Cookie Use">
        <p>When we introduce analytics or other non-essential features, we will:</p>
        <ul>
          <li>Update this Cookie Policy with a full list of cookies and their purposes.</li>
          <li>Display a consent banner that lets you accept or decline non-essential cookies.</li>
          <li>Honour your choice and never set non-essential cookies without consent.</li>
        </ul>
      </Section>

      <Section id="changes" title="7. Changes to This Policy">
        <p>
          We may update this Cookie Policy as the platform evolves. We will update the effective date and notify
          you of material changes via the platform or email.
        </p>
        <p>Contact: <a href="mailto:privacy@scouttopp.com">privacy@scouttopp.com</a></p>
      </Section>

    </LegalPageShell>
  )
}

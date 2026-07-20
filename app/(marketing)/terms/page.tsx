import type { Metadata } from 'next'
import { LegalPageShell, Section, Sub } from '@/components/marketing/legal-prose'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'The rules and guidelines for using the ScouttOpp platform.',
}

const DATE          = 'July 18, 2026'
const SUPPORT_EMAIL = 'support@scouttopp.com'
const LEGAL_EMAIL   = 'legal@scouttopp.com'

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms & Conditions"
      date={DATE}
      intro="These Terms & Conditions govern your access to and use of ScouttOpp. By creating an account or using the platform, you agree to be legally bound by these Terms."
    >

      <Section id="about" title="1. About ScouttOpp">
        <p>
          ScouttOpp is a curated hiring platform for creative professionals. We connect verified candidates
          with verified employers through portfolio-based discovery. ScouttOpp is a technology platform only —
          we are <strong>not</strong> a recruitment agency, staffing firm, or employment intermediary.
          We do not guarantee employment, job offers, interviews, or any specific outcome.
        </p>
      </Section>

      <Section id="eligibility" title="2. Eligibility">
        <ul>
          <li>You must be at least 18 years old.</li>
          <li>You must be a human individual (automated accounts are prohibited).</li>
          <li>You must not have been previously suspended or terminated from the Platform by us.</li>
          <li>
            <strong>Candidates</strong> may only access the platform after submitting an application and
            receiving an email invitation. Invitations are non-transferable and single-use.
          </li>
          <li>
            <strong>Employers</strong> may only access employer features after submitting a request and
            receiving approval from the ScouttOpp team.
          </li>
        </ul>
      </Section>

      <Section id="your-account" title="3. Your Account">
        <p>
          You are responsible for maintaining the confidentiality of your login credentials and for all
          activity that occurs under your account. Notify us immediately at{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> if you suspect unauthorised access.
        </p>
        <p>
          You agree to provide accurate, current, and complete information and to keep it updated.
          One person may hold one candidate account; one organisation may hold one employer account.
        </p>
      </Section>

      <Section id="candidate-terms" title="4. Candidate Terms">
        <Sub title="Invitation-only access">
          <p>
            Submitting an application does not guarantee an invitation. ScouttOpp has sole discretion to
            approve or reject applications without providing reasons.
          </p>
        </Sub>
        <Sub title="Your content">
          <p>
            You retain ownership of all content you upload — portfolio images, videos, PDFs, and profile text.
            By uploading content, you grant ScouttOpp a non-exclusive, worldwide, royalty-free licence to store,
            display, and transmit your content as necessary to operate the Platform. This licence ends when you
            delete the content or your account.
          </p>
        </Sub>
        <Sub title="Accuracy and ownership">
          <p>
            You warrant that all content in your profile is your own original work or work you have the legal
            right to share, that it does not infringe any third-party intellectual property rights, and that all
            information you provide is accurate and not misleading. Misrepresentation is grounds for immediate
            account termination.
          </p>
        </Sub>
        <Sub title="Discovery controls">
          <p>
            You may pause or resume your discovery visibility at any time from Account Settings. Changes
            typically take effect within a few minutes.
          </p>
        </Sub>
      </Section>

      <Section id="employer-terms" title="5. Employer Terms">
        <Sub title="Verified access only">
          <p>
            Employer access is granted only after the ScouttOpp team reviews and approves your request.
            Access may be revoked at any time if our Employer Verification Policy is breached.
          </p>
        </Sub>
        <Sub title="Permitted use of candidate data">
          <p>As an employer, you may use candidate profiles only to evaluate candidates for genuine, active
            roles at your organisation and to write internal notes. You may <strong>not</strong>:</p>
          <ul>
            <li>Share, export, or redistribute candidate data outside your internal hiring team.</li>
            <li>Contact candidates through channels outside of what ScouttOpp facilitates, unless the candidate
              has separately consented.</li>
            <li>Use candidate information for advertising, marketing, or non-hiring purposes.</li>
            <li>Screen candidates based on characteristics protected under applicable anti-discrimination law.</li>
          </ul>
        </Sub>
        <Sub title="Employer responsibility">
          <p>
            You are solely responsible for your hiring decisions, compliance with applicable employment and
            anti-discrimination laws, and any offers or contracts made with candidates. ScouttOpp is not a
            party to any employment or services agreement between you and a candidate.
          </p>
        </Sub>
      </Section>

      <Section id="prohibited-conduct" title="6. Prohibited Conduct">
        <p>You must not:</p>
        <ul>
          <li>Scrape, crawl, or systematically extract data from the Platform by automated means.</li>
          <li>Reverse-engineer, decompile, or tamper with the Platform or its security systems.</li>
          <li>Upload malware, viruses, or any malicious code.</li>
          <li>Impersonate another person, organisation, or ScouttOpp.</li>
          <li>Create multiple accounts or use accounts on behalf of others without their written consent.</li>
          <li>Harass, threaten, defame, or deceive other users.</li>
          <li>Use the Platform to send spam or unsolicited commercial messages.</li>
          <li>Post content that is illegal, discriminatory, or infringes third-party rights.</li>
          <li>Use the Platform for any purpose that violates applicable law.</li>
        </ul>
      </Section>

      <Section id="intellectual-property" title="7. Intellectual Property">
        <p>
          The ScouttOpp name, logo, platform design, UI, and codebase are owned by or licensed to ScouttOpp
          and protected by applicable intellectual property laws. You may not use our trademarks or branding
          without prior written consent.
        </p>
        <p>
          You own your content. We own ours. If you provide feedback or suggestions, you grant us a perpetual,
          royalty-free licence to use that feedback without any obligation to you.
        </p>
      </Section>

      <Section id="termination" title="8. Termination">
        <Sub title="By you">
          <p>
            You may delete your account at any time from Account Settings. Data deletion follows our{' '}
            <a href="/account-deletion">Account Deletion Policy</a>.
          </p>
        </Sub>
        <Sub title="By us">
          <p>
            We may suspend or terminate your account, with or without notice, if you violate these Terms,
            provide false information, your account is inactive for more than 24 months, or we are required to
            do so by law. Sections 6, 7, 9, 10, and 11 survive termination.
          </p>
        </Sub>
      </Section>

      <Section id="disclaimers" title="9. Disclaimers">
        <p>
          The Platform is provided <strong>&ldquo;as is&rdquo;</strong> and <strong>&ldquo;as available&rdquo;</strong> without
          warranties of any kind. We do not warrant that the Platform will be uninterrupted, error-free, or
          free of harmful components, or that candidates will receive job offers or employers will find hires.
        </p>
      </Section>

      <Section id="liability" title="10. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, ScouttOpp and its team will not be liable for any indirect,
          incidental, special, consequential, or punitive damages arising from your use of or inability to use
          the Platform.
        </p>
        <p>
          Our total aggregate liability for any claim is limited to the greater of: (a) amounts you have paid
          to ScouttOpp in the 12 months prior to the claim, or (b) ₹1,000 (Indian Rupees One Thousand).
        </p>
      </Section>

      <Section id="indemnification" title="11. Indemnification">
        <p>
          You agree to indemnify, defend, and hold harmless ScouttOpp and its team from and against any claims,
          damages, losses, and expenses (including reasonable legal fees) arising from your use of the Platform
          in violation of these Terms, your content, or your violation of any applicable law.
        </p>
      </Section>

      <Section id="governing-law" title="12. Governing Law &amp; Disputes">
        <p>
          These Terms are governed by the laws of India. Any dispute shall first be attempted through
          good-faith negotiation. If unresolved within 30 days, disputes shall be subject to the exclusive
          jurisdiction of the competent courts in{' '}
          <span className="rounded px-1.5 py-0.5 text-xs font-medium" style={{ background: 'rgba(196,124,26,0.12)', color: '#7a4e0a' }}>
            Mumbai, India
          </span>.
        </p>
      </Section>

      <Section id="changes" title="13. Changes to These Terms">
        <p>
          We may update these Terms at any time. We will notify you of material changes via email or platform
          notice at least 14 days before they take effect. Continued use after the effective date constitutes
          acceptance of the revised Terms.
        </p>
      </Section>

      <Section id="cookies" title="14. Cookie Policy">
        <p>
          ScouttOpp currently uses <strong>one cookie</strong>: a first-party, HTTP-only Supabase session
          token that keeps you authenticated. It is strictly necessary and cannot be disabled without breaking
          platform login. We do not use advertising, analytics, or third-party tracking cookies. When Google
          OAuth is used, Google may set its own cookies governed by Google&apos;s Privacy Policy.
        </p>
        <p>
          If we introduce non-essential cookies in future, we will update this section and display a consent
          banner before setting them. Cookie enquiries:{' '}
          <a href="mailto:privacy@scouttopp.com">privacy@scouttopp.com</a>
        </p>
      </Section>

      <Section id="copyright" title="15. Copyright & Intellectual Property">
        <Sub title="Ownership">
          <p>
            Candidates retain full ownership of uploaded portfolio content. By uploading, you grant ScouttOpp
            a limited licence to store and display it for platform purposes only (see §4). ScouttOpp owns all
            rights to its name, logo, brand, UI, and codebase.
          </p>
        </Sub>
        <Sub title="Takedown requests">
          <p>
            If you believe content on ScouttOpp infringes your copyright, email{' '}
            <a href="mailto:copyright@scouttopp.com">copyright@scouttopp.com</a> with: identification of
            the original work, the infringing URL, your contact information, a good-faith statement, and
            your signature. We will acknowledge within 5 business days and remove valid claims promptly.
            Multiple substantiated claims will result in permanent account termination.
          </p>
        </Sub>
        <Sub title="Counter-notices">
          <p>
            If your content was removed in error, email{' '}
            <a href="mailto:copyright@scouttopp.com">copyright@scouttopp.com</a> with identification of
            the removed content and a statement that removal was mistaken. We will review and may restore it.
          </p>
        </Sub>
      </Section>

      <Section id="disclaimer" title="16. Disclaimer">
        <p>ScouttOpp is a technology platform only — not a recruitment agency or employment intermediary.
          We do not guarantee job offers, interviews, or hires. While we manually verify candidates before
          granting access, we do not independently verify every claim in candidate or employer profiles.
          <strong> Employers must conduct their own due diligence before making hiring decisions.</strong>
          Nothing on ScouttOpp constitutes legal, financial, or HR advice. The Platform is provided on an
          &ldquo;as available&rdquo; basis — we are not liable for losses arising from downtime or errors.
        </p>
      </Section>

      <Section id="ai-policy" title="17. AI Usage Policy">
        <p>
          As of the date of these Terms, ScouttOpp does <strong>not</strong> use AI to score candidates,
          make hiring recommendations, or generate content on behalf of users. Our candidate review process
          is entirely manual. We use PostHog for standard product analytics only.
        </p>
        <p>
          We plan to introduce AI-powered matching and discovery ranking features in future. When introduced,
          we will: update this section and notify users in advance; not use AI to automatically accept or
          reject applications; conduct bias assessments before launch; and give users the right to request
          human review of any AI-influenced decision. We will not share personal data with AI providers for
          training without explicit consent. Enquiries: <a href="mailto:privacy@scouttopp.com">privacy@scouttopp.com</a>
        </p>
      </Section>

      <Section id="account-deletion" title="18. Account Deletion">
        <Sub title="How to delete">
          <p>
            Go to <strong>Dashboard → Settings → Account → Danger Zone → Delete Account</strong> and confirm.
            Alternatively, email <a href="mailto:support@scouttopp.com">support@scouttopp.com</a> from your
            registered address; we will process within 5 business days. Deletion is permanent and irreversible.
          </p>
        </Sub>
        <Sub title="What gets deleted">
          <p>
            Login credentials are removed immediately. Profile data, uploaded files, preferences, and settings
            are deleted within 30 days. Your profile is removed from discovery results immediately.
          </p>
        </Sub>
        <Sub title="What we retain">
          <p>
            Server logs (up to 90 days, security), original application data (up to 90 days, audit trail),
            and anonymised/aggregated analytics (no personal data, indefinitely). Employer notes referencing
            your profile are deleted when the employer deletes their account or on request.
          </p>
        </Sub>
        <Sub title="Data export">
          <p>
            Before deleting, you may request a JSON export of your profile data by emailing{' '}
            <a href="mailto:privacy@scouttopp.com">privacy@scouttopp.com</a>. We will provide it within 14 days.
          </p>
        </Sub>
        <Sub title="Re-joining">
          <p>
            After deletion your email is removed from the platform. To re-join you must re-apply via the
            candidate application form. Previous approval does not guarantee re-approval.
          </p>
        </Sub>
      </Section>

      <Section id="contact" title="19. Contact">
        <p>
          <strong>ScouttOpp</strong><br />
          Legal: <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a><br />
          Support: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
      </Section>

    </LegalPageShell>
  )
}

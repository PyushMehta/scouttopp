import type { Metadata } from 'next'
import { LegalPageShell, Section } from '@/components/marketing/legal-prose'

export const metadata: Metadata = {
  title: 'Employer Verification Policy',
  description: 'How ScouttOpp verifies employers before granting access to candidate profiles.',
}

const DATE = 'July 18, 2026'

export default function EmployerVerificationPage() {
  return (
    <LegalPageShell
      title="Employer Verification Policy"
      date={DATE}
      intro="ScouttOpp manually reviews every employer before granting access to candidate profiles. This policy explains our verification standards and what we expect from verified employers."
    >

      <Section id="why-we-verify" title="1. Why We Verify Employers">
        <p>
          Candidates trust us to only expose their profiles to legitimate, professional employers. Employer
          verification is how we uphold that trust. Access to our candidate community is a privilege, not a
          right — and we take that seriously.
        </p>
      </Section>

      <Section id="who-can-apply" title="2. Who Can Apply">
        <p>Employer access is available to:</p>
        <ul>
          <li>Registered companies and businesses of any size.</li>
          <li>Freelance studios and creative agencies.</li>
          <li>Startups seeking creative hires.</li>
        </ul>
        <p>We do <strong>not</strong> currently grant employer access to:</p>
        <ul>
          <li>Individuals hiring for personal (non-business) purposes.</li>
          <li>Staffing agencies or third-party recruiting firms acting on behalf of undisclosed clients.</li>
          <li>Entities in industries we determine to be incompatible with our candidate community&apos;s wellbeing.</li>
        </ul>
      </Section>

      <Section id="what-we-review" title="3. What We Review">
        <p>The ScouttOpp team manually reviews:</p>
        <ul>
          <li>Company name and website (must be publicly accessible and verifiable).</li>
          <li>Industry and the types of roles you hire for.</li>
          <li>LinkedIn company page or equivalent professional presence.</li>
          <li>The email domain used to register (generic domains like Gmail/Yahoo for business accounts may
            require additional verification).</li>
          <li>Any information you provide about your hiring needs.</li>
        </ul>
        <p>We may contact you for additional documentation if we cannot verify your identity from the above.</p>
      </Section>

      <Section id="rejection" title="4. Grounds for Rejection">
        <p>We reserve the right to reject employer applications where:</p>
        <ul>
          <li>The company cannot be independently verified as a legitimate business.</li>
          <li>The email domain or company details raise concerns.</li>
          <li>The roles described are inconsistent with the creative talent on our platform.</li>
          <li>A previous account from the same company was terminated for policy violations.</li>
        </ul>
        <p>
          Rejection decisions are at ScouttOpp&apos;s sole discretion. We do not provide detailed reasons
          for rejection.
        </p>
      </Section>

      <Section id="obligations" title="5. Employer Obligations After Verification">
        <p>Upon receiving employer access, you agree to:</p>
        <ul>
          <li>Use candidate data only for legitimate internal hiring purposes.</li>
          <li>Not share, export, or distribute candidate profiles outside your hiring team.</li>
          <li>Not contact candidates outside of ScouttOpp-facilitated channels without their separate consent.</li>
          <li>Comply with all applicable employment, labour, and anti-discrimination laws.</li>
          <li>Not use ScouttOpp to harvest candidate data for any non-hiring purpose.</li>
        </ul>
      </Section>

      <Section id="ongoing-compliance" title="6. Ongoing Compliance">
        <p>
          Employer accounts are subject to periodic review. We may re-verify your account or request updated
          information at any time. Your access may be suspended pending review if we receive credible reports
          of misuse.
        </p>
      </Section>

      <Section id="termination" title="7. Termination of Employer Access">
        <p>
          Employer access will be terminated immediately (and without refund if any fees have been paid) if:
        </p>
        <ul>
          <li>Candidate data is found to have been misused, exported, or shared in violation of this policy.</li>
          <li>The company misrepresented itself during the verification process.</li>
          <li>Our Community Guidelines or Terms &amp; Conditions are violated.</li>
          <li>The company is involved in conduct harmful to candidates on our platform.</li>
        </ul>
      </Section>

      <Section id="changes" title="8. Changes to This Policy">
        <p>
          We may update our verification standards as the platform grows. Updates will be communicated to
          existing employer account holders by email.
        </p>
        <p>Contact: <a href="mailto:employers@scouttopp.com">employers@scouttopp.com</a></p>
      </Section>

    </LegalPageShell>
  )
}

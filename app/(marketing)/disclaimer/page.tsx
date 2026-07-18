import type { Metadata } from 'next'
import { LegalPageShell, Section } from '@/components/marketing/legal-prose'

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Important disclaimers about the ScouttOpp platform and its limitations.',
}

const DATE = 'July 18, 2026'

export default function DisclaimerPage() {
  return (
    <LegalPageShell
      title="Disclaimer"
      date={DATE}
      intro="Please read these disclaimers carefully before using ScouttOpp. They describe important limitations on what ScouttOpp is and what we are responsible for."
    >

      <Section id="platform-purpose" title="1. Platform Purpose">
        <p>
          ScouttOpp is a technology platform that connects creative professionals with employers. We are not
          a recruitment agency, employment agency, staffing firm, or careers consultancy. We do not act as an
          agent, broker, or intermediary in any employment or services agreement between candidates and employers.
        </p>
      </Section>

      <Section id="no-guarantee" title="2. No Employment Guarantee">
        <p>ScouttOpp does not guarantee:</p>
        <ul>
          <li>That any candidate will receive a job offer, interview, or callback.</li>
          <li>That any employer will successfully hire through the platform.</li>
          <li>That connections made through the platform will result in any employment, freelance engagement,
            or business relationship.</li>
          <li>That the platform will be available at all times or free from errors.</li>
        </ul>
      </Section>

      <Section id="profile-accuracy" title="3. Profile Accuracy">
        <p>
          While we verify candidates before granting access, ScouttOpp does not independently verify every
          claim in candidate profiles — including specific job titles, employer names, project credits, or
          qualifications. <strong>Employers are responsible for conducting their own due diligence and background
          checks before making hiring decisions.</strong>
        </p>
        <p>
          Similarly, ScouttOpp does not independently verify all claims made in employer profiles. Candidates
          should research employers thoroughly before engaging with them.
        </p>
      </Section>

      <Section id="external-links" title="4. External Links">
        <p>
          Candidate and employer profiles may contain links to third-party websites (portfolios, LinkedIn,
          personal websites, etc.). ScouttOpp is not responsible for the content, accuracy, or privacy
          practices of any third-party websites. These links are provided for convenience only.
        </p>
      </Section>

      <Section id="no-advice" title="5. No Legal, Financial, or HR Advice">
        <p>
          Nothing on ScouttOpp constitutes legal advice, employment law advice, financial advice, or HR
          guidance. For decisions involving employment contracts, compensation structures, or labour law
          compliance, consult a qualified professional.
        </p>
      </Section>

      <Section id="availability" title="6. Platform Availability">
        <p>
          ScouttOpp is provided on an &ldquo;as available&rdquo; basis. We may carry out maintenance,
          experience downtime, or temporarily restrict access without notice. We are not liable for any losses
          arising from platform unavailability.
        </p>
      </Section>

      <Section id="limitation" title="7. Limitation">
        <p>
          All disclaimers in this document are subject to applicable law. Certain jurisdictions do not allow
          the exclusion of implied warranties or limitation of liability, and the above may not apply to you
          to the extent prohibited by law.
        </p>
      </Section>

      <Section id="changes" title="8. Changes">
        <p>
          We may update this Disclaimer at any time. Material changes will be communicated via the platform
          or email.
        </p>
        <p>Contact: <a href="mailto:legal@scouttopp.com">legal@scouttopp.com</a></p>
      </Section>

    </LegalPageShell>
  )
}

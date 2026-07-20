import type { Metadata } from 'next'
import { LegalPageShell, Section, Sub } from '@/components/marketing/legal-prose'

export const metadata: Metadata = {
  title: 'Trust & Safety',
  description: 'Community standards, and how ScouttOpp verifies candidates and employers.',
}

const DATE = 'July 18, 2026'

export default function TrustPage() {
  return (
    <LegalPageShell
      title="Trust & Safety"
      date={DATE}
      intro="ScouttOpp is an invitation-only platform. Every person here has been reviewed by a real human. These policies explain the standards we hold the community to and how we verify both candidates and employers."
    >

      {/* ── Community Guidelines ─────────────────────────────────── */}
      <Section id="community-guidelines" title="Community Guidelines">
        <p>
          Violation of these guidelines may result in a warning, temporary suspension, or permanent removal.
        </p>
      </Section>

      <Section id="for-candidates" title="For Candidates">
        <Sub title="Be honest about your work">
          <p>
            Everything in your portfolio must be work you created, co-created (with clear credit), or have
            legal permission to share. Do not upload work that belongs to others or misrepresent your role.
            Plagiarism or misattribution will result in immediate removal.
          </p>
        </Sub>
        <Sub title="Be accurate about your experience">
          <p>
            Do not misrepresent your job titles, years of experience, skills, qualifications, or client
            history. If an employer flags a significant discrepancy, your account may be reviewed and suspended.
          </p>
        </Sub>
        <Sub title="Keep your profile professional">
          <ul>
            <li>Use a clear, professional profile photo.</li>
            <li>Keep your bio relevant to your creative career.</li>
            <li>Do not include offensive, discriminatory, or inappropriate content anywhere on your profile.</li>
          </ul>
        </Sub>
        <Sub title="Respect employers">
          <ul>
            <li>Do not use ScouttOpp to send spam or unsolicited solicitations.</li>
            <li>Do not share or publish private employer communications without consent.</li>
          </ul>
        </Sub>
      </Section>

      <Section id="for-employers" title="For Employers">
        <Sub title="Hire with integrity">
          <ul>
            <li>Only use ScouttOpp to find candidates for genuine, active roles.</li>
            <li>Engage with candidates respectfully and professionally at all times.</li>
            <li>Do not discriminate in screening or hiring based on any characteristic protected under applicable law.</li>
          </ul>
          <p>
            <strong>Posting fake roles, harvesting contact details, or using candidate data for any purpose
            outside of legitimate hiring will result in immediate termination of your employer account.</strong>
          </p>
        </Sub>
        <Sub title="Keep candidate data private">
          <ul>
            <li>Do not share candidate profiles or contact details outside your internal hiring team.</li>
            <li>Do not store or export candidate data in external systems without the candidate&apos;s explicit consent.</li>
            <li>Do not use candidate information for research, advertising, sales, or any non-hiring purpose.</li>
          </ul>
        </Sub>
        <Sub title="Respect candidate availability">
          <p>
            If a candidate&apos;s profile is set to &ldquo;Not Discoverable&rdquo; or they decline an
            introduction, respect that decision. Do not attempt to contact them through other channels.
          </p>
        </Sub>
      </Section>

      <Section id="zero-tolerance" title="Zero-Tolerance Rules">
        <p>The following are grounds for <strong>immediate and permanent removal</strong>, with no appeal:</p>
        <ul>
          <li>Harassment, threats, or abuse of any user.</li>
          <li>Uploading illegal content of any kind.</li>
          <li>Impersonating another person, business, or ScouttOpp staff.</li>
          <li>Attempting to hack, scrape, or compromise the platform.</li>
          <li>Creating fake accounts or using accounts on behalf of others without consent.</li>
          <li>Discriminatory conduct based on gender, caste, religion, race, disability, sexual orientation,
            or any other protected characteristic.</li>
        </ul>
      </Section>

      <Section id="reporting" title="Reporting a Violation">
        <p>
          If you encounter conduct that violates these guidelines, email{' '}
          <a href="mailto:trust@scouttopp.com">trust@scouttopp.com</a> with: the user profile in question,
          a description of what happened, and any relevant screenshots. We review all reports seriously and
          typically respond within 2 business days. Reporter identity is kept confidential.
        </p>
        <p>ScouttOpp reserves the right to issue warnings, suspend accounts pending review,
          permanently remove accounts for serious or repeated violations, or take legal action where conduct
          violates applicable law. We may act without prior notice where the violation is serious or involves
          immediate risk to other users.</p>
      </Section>

      {/* ── Candidate Verification ───────────────────────────────── */}
      <Section id="candidate-verification" title="Candidate Verification">
        <p>
          ScouttOpp is not an open job board. Every candidate profile an employer sees has been reviewed
          by a real person on our team. This is what makes the platform valuable to employers — and keeps
          the community high-quality for candidates.
        </p>
      </Section>

      <Section id="how-to-apply" title="How Candidates Apply">
        <p>
          Candidates apply by submitting a Google Form. The form asks for your name, contact details,
          creative role, years of experience, portfolio link(s), and a short bio. Submitting does{' '}
          <strong>not</strong> guarantee access.
        </p>
        <p>Our team manually reviews each application based on:</p>
        <ul>
          <li>Completeness and clarity of the application.</li>
          <li>Portfolio quality and professional relevance.</li>
          <li>Alignment with the creative roles the platform supports.</li>
          <li>Whether the applicant appears to be a genuine creative professional.</li>
        </ul>
        <p>
          We do not discriminate on the basis of gender, race, religion, caste, nationality, disability,
          age (above 18), or sexual orientation.
        </p>
      </Section>

      <Section id="candidate-outcomes" title="Verification Outcomes">
        <ul>
          <li>
            <strong>Approved</strong>: you will receive an email invitation to create your account. The
            invitation is time-limited (7 days), single-use, and non-transferable. Contact{' '}
            <a href="mailto:support@scouttopp.com">support@scouttopp.com</a> if it expires.
          </li>
          <li>
            <strong>Rejected</strong>: you will receive a notification. We do not provide detailed
            feedback. You may re-apply after <strong>90 days</strong> — a previous rejection does not
            guarantee a future one.
          </li>
          <li>
            <strong>Deferred</strong>: your application may be held for re-review at a later stage.
          </li>
        </ul>
        <p>
          Once active, being a verified candidate does not automatically make your profile discoverable.
          Your profile must reach a minimum completeness threshold first — check your completeness score
          in your dashboard.
        </p>
      </Section>

      {/* ── Employer Verification ────────────────────────────────── */}
      <Section id="employer-verification" title="Employer Verification">
        <p>
          Candidates trust us to only expose their profiles to legitimate, professional employers.
          Access to our candidate community is a privilege, not a right — and we take that seriously.
        </p>
        <p>Employer access is available to registered companies, creative agencies, freelance studios,
          and startups seeking creative hires. We do <strong>not</strong> currently grant access to
          individuals hiring for personal purposes, or to staffing agencies acting on behalf of
          undisclosed clients.
        </p>
      </Section>

      <Section id="employer-review" title="What We Review for Employers">
        <ul>
          <li>Company name and website (must be publicly accessible and verifiable).</li>
          <li>Industry and types of roles you hire for.</li>
          <li>LinkedIn company page or equivalent professional presence.</li>
          <li>The email domain used to register (generic domains may require additional verification).</li>
        </ul>
        <p>We may contact you for additional documentation if needed. We reserve the right to reject
          applications where the company cannot be independently verified, or where a previous account
          from the same company was terminated for policy violations. Rejection decisions are at
          ScouttOpp&apos;s sole discretion.</p>
      </Section>

      <Section id="employer-obligations" title="Employer Obligations After Verification">
        <p>Upon receiving employer access, you agree to:</p>
        <ul>
          <li>Use candidate data only for legitimate internal hiring purposes.</li>
          <li>Not share, export, or distribute candidate profiles outside your hiring team.</li>
          <li>Not contact candidates outside of ScouttOpp-facilitated channels without their separate consent.</li>
          <li>Comply with all applicable employment, labour, and anti-discrimination laws.</li>
        </ul>
        <p>
          Employer accounts are subject to periodic review. Access will be terminated immediately if
          candidate data is misused, if the company misrepresented itself during verification, or if our
          Terms & Conditions are violated.
        </p>
      </Section>

      <Section id="trust-contact" title="Contact">
        <p>
          Community reports: <a href="mailto:trust@scouttopp.com">trust@scouttopp.com</a><br />
          Employer enquiries: <a href="mailto:employers@scouttopp.com">employers@scouttopp.com</a><br />
          Candidate support: <a href="mailto:support@scouttopp.com">support@scouttopp.com</a>
        </p>
      </Section>

    </LegalPageShell>
  )
}

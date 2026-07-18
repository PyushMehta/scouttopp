import type { Metadata } from 'next'
import { LegalPageShell, Section } from '@/components/marketing/legal-prose'

export const metadata: Metadata = {
  title: 'Candidate Verification Policy',
  description: 'How ScouttOpp reviews and verifies creative professionals before granting platform access.',
}

const DATE = 'July 18, 2026'

export default function CandidateVerificationPage() {
  return (
    <LegalPageShell
      title="Candidate Verification Policy"
      date={DATE}
      intro="Every candidate on ScouttOpp has been manually reviewed by our team. This policy explains how we evaluate applications and what being a verified candidate means."
    >

      <Section id="why-we-verify" title="1. Why We Verify Candidates">
        <p>
          ScouttOpp is not an open job board. Manual curation is what makes the platform valuable to employers
          — and what keeps the community high-quality for candidates. Every profile an employer sees has been
          reviewed by a real person.
        </p>
      </Section>

      <Section id="how-to-apply" title="2. How to Apply">
        <p>
          Candidates apply by submitting a Google Form application. The form asks for your name, contact
          details, creative role, years of experience, portfolio link(s), and a short bio.
        </p>
        <p>
          Submitting an application does <strong>not</strong> guarantee access to the platform.
        </p>
      </Section>

      <Section id="what-we-review" title="3. What We Review">
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

      <Section id="outcomes" title="4. Verification Outcomes">
        <p>After reviewing your application, we will:</p>
        <ul>
          <li>
            <strong>Approve</strong>: you will receive an email invitation to create your ScouttOpp account.
            The invitation is time-limited and sent to the email you provided.
          </li>
          <li>
            <strong>Reject</strong>: you will receive an email notifying you that your application was not
            approved at this time. We do not provide detailed feedback.
          </li>
          <li>
            <strong>Defer</strong>: we may hold your application for re-review at a later stage.
          </li>
        </ul>
      </Section>

      <Section id="invitation" title="5. Invitation Validity">
        <p>Invitation emails contain a one-time link to set up your account. This link:</p>
        <ul>
          <li>Is valid for <strong>7 days</strong> from the date of issue.</li>
          <li>Can only be used once.</li>
          <li>Cannot be forwarded or transferred to another person.</li>
        </ul>
        <p>
          If your invitation expires, contact{' '}
          <a href="mailto:support@scouttopp.com">support@scouttopp.com</a> to request a new one.
        </p>
      </Section>

      <Section id="profile-accuracy" title="6. Profile Accuracy">
        <p>
          Once your account is active, you are responsible for keeping your profile accurate and up to date.
          ScouttOpp does not independently verify every claim in your profile, but we rely on the community
          and employer reports to flag inaccuracies. If an employer reports a material discrepancy, we will
          investigate and may suspend or remove your account.
        </p>
      </Section>

      <Section id="re-application" title="7. Re-Application">
        <p>
          If your application is rejected, you may re-apply after <strong>90 days</strong>. We review all
          applications fresh — a previous rejection does not guarantee a future one.
        </p>
      </Section>

      <Section id="discovery-eligibility" title="8. Discovery Eligibility">
        <p>
          Being a verified candidate does not automatically mean your profile appears in employer searches.
          Your profile must reach a minimum completeness threshold before it becomes discoverable. You can
          check your profile completeness score in your dashboard.
        </p>
      </Section>

      <Section id="changes" title="9. Changes to This Policy">
        <p>
          Our verification standards may evolve as the platform grows. We will communicate significant
          changes to active candidates by email.
        </p>
        <p>Contact: <a href="mailto:support@scouttopp.com">support@scouttopp.com</a></p>
      </Section>

    </LegalPageShell>
  )
}

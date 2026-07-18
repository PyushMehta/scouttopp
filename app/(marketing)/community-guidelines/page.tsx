import type { Metadata } from 'next'
import { LegalPageShell, Section } from '@/components/marketing/legal-prose'

export const metadata: Metadata = {
  title: 'Community Guidelines',
  description: 'The standards of conduct expected from every ScouttOpp user.',
}

const DATE = 'July 18, 2026'

export default function CommunityGuidelinesPage() {
  return (
    <LegalPageShell
      title="Community Guidelines"
      date={DATE}
      intro="ScouttOpp is an invitation-only platform for creative professionals and the employers who want to hire them. These guidelines exist to keep the community high-quality and trustworthy for everyone."
    >

      <Section id="our-standard" title="1. Our Standard">
        <p>
          Every person on ScouttOpp has been reviewed and verified. We hold our community to a higher standard
          than general job boards. Violation of these guidelines may result in a warning, temporary suspension,
          or permanent removal from the platform.
        </p>
      </Section>

      <Section id="for-candidates" title="2. For Candidates">
        <p><strong>Be honest about your work</strong></p>
        <p>
          Everything in your portfolio must be work you created, co-created (with clear credit), or have legal
          permission to share. Do not upload work that belongs to others or misrepresent your role in a project.
          Plagiarism or misattribution will result in immediate removal.
        </p>

        <p><strong>Be accurate about your experience</strong></p>
        <p>Do not misrepresent your job titles, years of experience, skills, qualifications, or client history.
          If an employer flags a significant discrepancy, your account may be reviewed and suspended.</p>

        <p><strong>Keep your profile professional</strong></p>
        <ul>
          <li>Use a clear, professional profile photo.</li>
          <li>Keep your bio relevant to your creative career.</li>
          <li>Do not include offensive, discriminatory, or inappropriate content anywhere on your profile.</li>
        </ul>

        <p><strong>Respect employers</strong></p>
        <ul>
          <li>Do not use ScouttOpp to send spam or unsolicited solicitations.</li>
          <li>Do not share or publish private employer communications without consent.</li>
        </ul>
      </Section>

      <Section id="for-employers" title="3. For Employers">
        <p><strong>Hire with integrity</strong></p>
        <ul>
          <li>Only use ScouttOpp to find candidates for genuine, active roles.</li>
          <li>Engage with candidates respectfully and professionally at all times.</li>
          <li>Do not discriminate in screening or hiring based on any characteristic protected under applicable law.</li>
        </ul>

        <p><strong>Posting fake roles, harvesting contact details, or using candidate data for any purpose
          outside of legitimate hiring will result in immediate termination of your employer account.</strong></p>

        <p><strong>Keep candidate data private</strong></p>
        <ul>
          <li>Do not share candidate profiles or contact details outside your internal hiring team.</li>
          <li>Do not store or export candidate data in external systems without the candidate&apos;s explicit consent.</li>
          <li>Do not use candidate information for research, advertising, sales, or any non-hiring purpose.</li>
        </ul>

        <p><strong>Respect candidate availability</strong></p>
        <p>
          If a candidate&apos;s profile is set to &ldquo;Not Discoverable&rdquo; or they decline an introduction,
          respect that decision. Do not attempt to contact them through other channels.
        </p>
      </Section>

      <Section id="zero-tolerance" title="4. Zero-Tolerance Rules">
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

      <Section id="reporting" title="5. Reporting a Violation">
        <p>
          If you encounter conduct that violates these guidelines, email{' '}
          <a href="mailto:trust@scouttopp.com">trust@scouttopp.com</a> with:
        </p>
        <ul>
          <li>The user profile in question (name or profile URL).</li>
          <li>A description of what happened.</li>
          <li>Any relevant screenshots.</li>
        </ul>
        <p>
          We review all reports seriously and typically respond within 2 business days. Reporter identity is
          kept confidential.
        </p>
      </Section>

      <Section id="enforcement" title="6. Enforcement">
        <p>ScouttOpp reserves the right to:</p>
        <ul>
          <li>Issue a warning for first-time minor violations.</li>
          <li>Temporarily suspend an account pending review.</li>
          <li>Permanently remove an account for serious or repeated violations.</li>
          <li>Take legal action where conduct violates applicable law.</li>
        </ul>
        <p>
          We may take action without prior notice where the violation is serious or involves immediate risk
          to other users.
        </p>
      </Section>

      <Section id="changes" title="7. Changes to These Guidelines">
        <p>
          We may update these Community Guidelines as the platform grows. We will notify users of significant
          changes via email or platform notice.
        </p>
        <p>Contact: <a href="mailto:trust@scouttopp.com">trust@scouttopp.com</a></p>
      </Section>

    </LegalPageShell>
  )
}

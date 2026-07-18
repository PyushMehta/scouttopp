import type { Metadata } from 'next'
import { LegalPageShell, Section } from '@/components/marketing/legal-prose'

export const metadata: Metadata = {
  title: 'AI Usage Policy',
  description: "How ScouttOpp uses artificial intelligence — now and in the future.",
}

const DATE = 'July 18, 2026'

export default function AIPolicyPage() {
  return (
    <LegalPageShell
      title="AI Usage Policy"
      date={DATE}
      intro="This policy explains how ScouttOpp uses artificial intelligence today, what AI features we plan to introduce, and what rights you have in relation to AI-driven decisions."
    >

      <Section id="current-use" title="1. Current AI Use on ScouttOpp">
        <p>
          As of the effective date of this policy, ScouttOpp does <strong>not</strong> currently use
          artificial intelligence to:
        </p>
        <ul>
          <li>Score or rank candidates.</li>
          <li>Make hiring recommendations to employers.</li>
          <li>Make approval or rejection decisions on candidate applications.</li>
          <li>Generate content on behalf of users.</li>
        </ul>
        <p>
          Our candidate application review process is entirely <strong>manual</strong>, conducted by the
          ScouttOpp team.
        </p>
        <p>
          We do use PostHog analytics to collect aggregated usage data (pageviews, feature interactions).
          This is not AI — it is standard product analytics.
        </p>
      </Section>

      <Section id="planned-features" title="2. Planned AI Features">
        <p>ScouttOpp intends to introduce AI-powered features in the future, including:</p>
        <ul>
          <li><strong>AI-powered candidate matching</strong>: surfacing candidates to employers based on role
            fit, skills, preferences, and portfolio signals.</li>
          <li><strong>Completeness and quality suggestions</strong>: recommending improvements to candidate profiles.</li>
          <li><strong>Discovery ranking</strong>: ordering candidates in employer search results based on
            relevance signals.</li>
        </ul>
        <p>
          This policy will be updated when these features are introduced, and users will be notified in advance.
        </p>
      </Section>

      <Section id="data-used" title="3. What Data May Be Used for AI">
        <p>When AI features are introduced, the following types of data may be used as inputs:</p>
        <ul>
          <li>Candidate roles, skills, experience, and preferences.</li>
          <li>Employer roles sought, preferences, and past discovery activity (views, saves, passes).</li>
          <li>Profile completeness scores.</li>
          <li>Aggregated engagement signals (e.g. how often a profile is viewed).</li>
        </ul>
        <p><strong>What will not be used:</strong></p>
        <ul>
          <li>Portfolio images or files (we do not analyse portfolio content with AI).</li>
          <li>Private employer notes.</li>
          <li>Any data shared in ways not described in our Privacy Policy.</li>
        </ul>
      </Section>

      <Section id="no-automated-decisions" title="4. No Automated Employment Decisions">
        <p>
          ScouttOpp&apos;s AI features will be designed to <strong>assist</strong> — not replace — human
          decision-making. No AI system on ScouttOpp will:
        </p>
        <ul>
          <li>Automatically accept or reject candidate applications.</li>
          <li>Automatically approve or reject employer requests.</li>
          <li>Make final hiring recommendations without a human employer reviewing the candidate.</li>
        </ul>
        <p>Employers remain solely responsible for all hiring decisions.</p>
      </Section>

      <Section id="bias-fairness" title="5. Bias &amp; Fairness">
        <p>
          We are committed to building AI features that do not discriminate based on gender, caste, religion,
          race, nationality, disability, or any other protected characteristic. When AI features are introduced,
          we will:
        </p>
        <ul>
          <li>Conduct bias assessments before launch.</li>
          <li>Monitor for disparate impact on protected groups.</li>
          <li>Publish a summary of our fairness testing approach.</li>
        </ul>
      </Section>

      <Section id="your-rights" title="6. Your Rights Regarding AI">
        <p>When AI features are live, you will have the right to:</p>
        <ul>
          <li>Know when an AI system has influenced what you see on the platform.</li>
          <li>Request a human review of any AI-influenced decision that materially affects you.</li>
          <li>Opt out of AI-based ranking or matching — we will provide this option in Account Settings
            where technically feasible.</li>
        </ul>
      </Section>

      <Section id="third-party-ai" title="7. Third-Party AI Tools">
        <p>ScouttOpp may use third-party AI providers to power future features. Where we do, we will:</p>
        <ul>
          <li>Name those providers in our Privacy Policy.</li>
          <li>Ensure data shared with AI providers is governed by appropriate data processing agreements.</li>
          <li>Not share personal data with AI providers for training purposes without explicit consent.</li>
        </ul>
      </Section>

      <Section id="changes" title="8. Changes to This Policy">
        <p>
          This policy will be updated when AI features are introduced or when our AI practices change
          materially. We will notify users by email and platform notice before any material AI-related change
          takes effect.
        </p>
        <p>Contact: <a href="mailto:privacy@scouttopp.com">privacy@scouttopp.com</a></p>
      </Section>

    </LegalPageShell>
  )
}

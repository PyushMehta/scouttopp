import type { Metadata } from 'next'
import { LegalPageShell, Section } from '@/components/marketing/legal-prose'

export const metadata: Metadata = {
  title: 'Copyright & IP Policy',
  description: 'How ScouttOpp handles intellectual property rights and copyright takedown requests.',
}

const DATE = 'July 18, 2026'

export default function CopyrightPage() {
  return (
    <LegalPageShell
      title="Copyright & IP Policy"
      date={DATE}
      intro="ScouttOpp respects intellectual property rights and expects our users to do the same. This policy explains how we handle copyright and IP claims, and how to submit a takedown request."
    >

      <Section id="who-owns-what" title="1. Who Owns What">
        <p>
          <strong>Candidate content</strong>: candidates retain full ownership of all content they upload —
          portfolio images, videos, PDFs, project descriptions, and profile text. By uploading content,
          candidates grant ScouttOpp a limited licence to display and store it for platform purposes only
          (see Terms &amp; Conditions §4). This does not transfer ownership.
        </p>
        <p>
          <strong>ScouttOpp&apos;s IP</strong>: ScouttOpp owns all rights to the ScouttOpp name, logo, brand
          identity, platform design, user interface, and underlying code. You may not reproduce, modify, or
          distribute ScouttOpp&apos;s intellectual property without explicit written permission.
        </p>
        <p>
          <strong>Employer content</strong>: employer company profiles, logos, and descriptions remain the
          property of the respective employers. ScouttOpp&apos;s licence to display employer content is
          limited to operating the platform.
        </p>
      </Section>

      <Section id="candidate-responsibility" title="2. Candidate Responsibility for Uploaded Content">
        <p>When uploading portfolio content, you confirm that:</p>
        <ul>
          <li>You are the original creator, or you hold the legal right to display and share the work.</li>
          <li>The work does not infringe any copyright, trademark, or other IP rights of a third party.</li>
          <li>If the work was produced under a client contract, you have portfolio rights to share it.</li>
          <li>You are not falsely attributing work to yourself that was created by others.</li>
        </ul>
        <p>
          If you are unsure whether you have the right to share specific work, we recommend consulting a legal
          professional or omitting that work from your portfolio.
        </p>
      </Section>

      <Section id="takedown" title="3. Copyright Infringement (Takedown Process)">
        <p>
          If you believe content on ScouttOpp infringes your copyright, submit a takedown request to{' '}
          <a href="mailto:copyright@scouttopp.com">copyright@scouttopp.com</a> with the following:
        </p>
        <ul>
          <li><strong>Identification of the original work</strong>: describe or link to the work you claim has been infringed.</li>
          <li><strong>Identification of the infringing content</strong>: provide the URL or description of the
            infringing content on ScouttOpp.</li>
          <li><strong>Your contact information</strong>: full name, email address, and optional postal address.</li>
          <li><strong>Good faith statement</strong>: a declaration that you believe the use is not authorised by
            the copyright owner, its agent, or law.</li>
          <li><strong>Accuracy statement</strong>: a declaration that the information is accurate and that you
            are the rights holder or authorised to act on their behalf.</li>
          <li><strong>Signature</strong>: your physical or electronic signature.</li>
        </ul>
        <p>
          We will acknowledge receipt within <strong>5 business days</strong>, review the request, and if valid,
          remove or disable access to the content. The uploader will be notified that a takedown claim was made
          (without sharing your personal details).
        </p>
      </Section>

      <Section id="counter-notice" title="4. Counter-Notice">
        <p>
          If your content was removed and you believe it was in error, you may submit a counter-notice to{' '}
          <a href="mailto:copyright@scouttopp.com">copyright@scouttopp.com</a> including:
        </p>
        <ul>
          <li>Identification of the removed content and its former location.</li>
          <li>A statement under penalty of perjury that you believe the content was removed in error.</li>
          <li>Your name, address, and electronic signature.</li>
        </ul>
        <p>We will review counter-notices and may restore content if the original claim is determined to be invalid.</p>
      </Section>

      <Section id="repeat-infringers" title="5. Repeat Infringer Policy">
        <p>
          Users who receive multiple substantiated copyright infringement claims will have their accounts
          permanently terminated.
        </p>
      </Section>

      <Section id="false-claims" title="6. False Claims">
        <p>
          Submitting a false or fraudulent takedown request may expose you to legal liability. We take misuse
          of this process seriously and may take action against bad-faith claimants.
        </p>
      </Section>

      <Section id="other-ip" title="7. Trademark &amp; Other IP Claims">
        <p>
          For claims involving trademark infringement, impersonation, or other IP issues not covered by the
          copyright takedown process, contact{' '}
          <a href="mailto:legal@scouttopp.com">legal@scouttopp.com</a>.
        </p>
      </Section>

      <Section id="changes" title="8. Changes to This Policy">
        <p>
          We may update this policy from time to time. Material changes will be communicated via email or
          platform notice.
        </p>
        <p>
          Copyright enquiries: <a href="mailto:copyright@scouttopp.com">copyright@scouttopp.com</a>
        </p>
      </Section>

    </LegalPageShell>
  )
}

import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use — MenuSaaS",
  description: "Terms of Use for MenuSaaS, operated by MOSEGIC COMPANY LIMITED.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" effectiveDate="18 September 2026">
      <LegalSection heading="1. Agreement to these Terms">
        <p>
          These Terms of Use (&quot;Terms&quot;) govern your access to and use of MenuSaaS
          (the &quot;Service&quot;), a multi-tenant digital menu and QR ordering platform operated by
          MOSEGIC COMPANY LIMITED (&quot;MOSEGIC&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), a company
          registered in Kenya. By creating an account, registering a business, or otherwise
          using the Service, you agree to be bound by these Terms and our{" "}
          <Link href="/privacy">Privacy Policy</Link>. If you do not agree, do not use the
          Service.
        </p>
      </LegalSection>

      <LegalSection heading="2. Who Can Use the Service">
        <p>
          You must be at least 18 years old and able to form a binding contract to register
          for an account. If you register on behalf of a business or organization, you
          represent that you are authorized to bind that entity to these Terms.
        </p>
      </LegalSection>

      <LegalSection heading="3. Accounts and Restaurant Data">
        <p>
          You are responsible for maintaining the confidentiality of your account
          credentials and for all activity under your account. You are solely responsible
          for the accuracy of the menu content, prices, images, and other information
          (&quot;Restaurant Content&quot;) you upload, and for ensuring it complies with
          applicable law (e.g. accurate pricing, allergen disclosure where required).
        </p>
        <p>
          We reserve the right to suspend or terminate accounts that upload unlawful,
          fraudulent, or abusive content, or that otherwise violate these Terms.
        </p>
      </LegalSection>

      <LegalSection heading="4. Subscriptions, Trials, and Billing">
        <p>
          MenuSaaS offers a free trial period followed by paid subscription tiers
          (&quot;Business Standard&quot; and &quot;Business Elite&quot;), billed monthly or annually in Kenyan
          Shillings (KES). Payments are processed by our third-party payment processor,
          Paystack. By subscribing, you authorize recurring charges to your chosen payment
          method until you cancel.
        </p>
        <p>
          Fees are non-refundable except where required by law. You may cancel your
          subscription at any time from your dashboard; cancellation takes effect at the
          end of the current billing period. Failure to pay a renewal charge may result in
          your account being downgraded or suspended.
        </p>
        <p>
          We may change subscription pricing with reasonable prior notice. Continued use of
          the Service after a price change takes effect constitutes acceptance of the new
          pricing.
        </p>
      </LegalSection>

      <LegalSection heading="5. Acceptable Use">
        <p>You agree not to use the Service to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Upload content that is illegal, defamatory, or infringes third-party rights;</li>
          <li>Attempt to gain unauthorized access to other tenants&apos; data or our systems;</li>
          <li>Interfere with or disrupt the integrity or performance of the Service;</li>
          <li>Reverse-engineer, resell, or white-label the Service without our written consent.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="6. Intellectual Property">
        <p>
          MOSEGIC retains all rights, title, and interest in the Service, including its
          software, design, and branding. You retain ownership of your Restaurant Content,
          and grant us a limited license to host, display, and transmit it solely to
          operate and provide the Service to you and your customers.
        </p>
      </LegalSection>

      <LegalSection heading="7. Third-Party Services">
        <p>
          The Service integrates with third-party providers, including Paystack (payments)
          and exchange-rate data providers (currency conversion display). Your use of those
          services is also subject to their respective terms and privacy policies. We are
          not responsible for the acts or omissions of third-party providers.
        </p>
      </LegalSection>

      <LegalSection heading="8. Disclaimers">
        <p>
          The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
          whether express or implied, including implied warranties of merchantability,
          fitness for a particular purpose, and non-infringement. We do not guarantee
          uninterrupted or error-free operation of the Service.
        </p>
      </LegalSection>

      <LegalSection heading="9. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, MOSEGIC shall not be liable for any
          indirect, incidental, special, consequential, or punitive damages, or any loss of
          profits or revenues, arising from your use of the Service. Our total aggregate
          liability for any claim arising from these Terms shall not exceed the amount you
          paid us in the three (3) months preceding the claim.
        </p>
      </LegalSection>

      <LegalSection heading="10. Termination">
        <p>
          You may stop using the Service at any time. We may suspend or terminate your
          access if you breach these Terms, fail to pay applicable fees, or if required by
          law. Upon termination, your right to use the Service ceases immediately, though
          certain provisions of these Terms (e.g. intellectual property, limitation of
          liability) survive termination.
        </p>
      </LegalSection>

      <LegalSection heading="11. Governing Law">
        <p>
          These Terms are governed by the laws of the Republic of Kenya, without regard to
          conflict-of-law principles. Any dispute arising from these Terms shall be subject
          to the exclusive jurisdiction of the courts of Kenya.
        </p>
      </LegalSection>

      <LegalSection heading="12. Changes to these Terms">
        <p>
          We may update these Terms from time to time. Material changes will be
          communicated via the Service or by email. Continued use of the Service after
          changes take effect constitutes acceptance of the revised Terms.
        </p>
      </LegalSection>

      <LegalSection heading="13. Contact Us">
        <p>
          Questions about these Terms can be sent to{" "}
          <a href="mailto:mosegiccompany@gmail.com">mosegiccompany@gmail.com</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

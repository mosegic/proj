import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — MenuSaaS",
  description: "Privacy Policy for MenuSaaS, operated by MOSEGIC COMPANY LIMITED.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" effectiveDate="18 September 2026">
      <LegalSection heading="1. Introduction">
        <p>
          MOSEGIC COMPANY LIMITED (&quot;MOSEGIC&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), a company
          registered in Kenya, operates MenuSaaS (the &quot;Service&quot;). This Privacy Policy
          explains what personal data we collect, how we use it, and the choices you have,
          when you register a business, manage a digital menu, or otherwise use the
          Service.
        </p>
      </LegalSection>

      <LegalSection heading="2. Information We Collect">
        <p>We collect the following categories of information:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Account information:</strong> name, email address, and password (stored
            as a salted hash, never in plain text).
          </li>
          <li>
            <strong>Business/restaurant information:</strong> business name, menu slug,
            description, logo, theme colors, WhatsApp number, categories, menu items,
            prices, and images you upload.
          </li>
          <li>
            <strong>Billing information:</strong> subscription tier, billing interval, and
            transaction references. Card and payment details are collected and processed
            directly by Paystack; we do not store your full card number or CVV.
          </li>
          <li>
            <strong>Usage data:</strong> basic technical logs (e.g. IP address, browser
            type, pages visited) used for security, debugging, and abuse prevention.
          </li>
          <li>
            <strong>Customer-facing data:</strong> when your customers view your public
            menu, we may process their selected display currency and table number to
            render the page correctly; we do not require them to create an account.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="3. How We Use Your Information">
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Provide, operate, and maintain the Service, including hosting your digital menu and generating QR codes;</li>
          <li>Process subscription payments and renewals via Paystack, and manage your subscription tier and limits;</li>
          <li>Communicate with you about your account, billing, or changes to the Service;</li>
          <li>Detect, investigate, and prevent fraud, abuse, or security incidents;</li>
          <li>Improve and develop new features of the Service.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="4. How We Share Information">
        <p>We do not sell your personal data. We share information only with:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Paystack</strong> — to process subscription payments and verify
            transactions;
          </li>
          <li>
            <strong>Cloud infrastructure providers</strong> (e.g. our hosting provider and
            database provider) — to store and serve application data;
          </li>
          <li>
            <strong>Exchange-rate data providers</strong> — to display approximate menu
            prices in an alternate currency (e.g. USD) for your customers;
          </li>
          <li>Law enforcement or regulators, where required by applicable law.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="5. Data Retention">
        <p>
          We retain account and business data for as long as your account is active, and
          for a reasonable period afterward to comply with legal, accounting, or
          fraud-prevention obligations. You may request deletion of your account and
          associated data at any time by contacting us (see Section 9).
        </p>
      </LegalSection>

      <LegalSection heading="6. Data Security">
        <p>
          We use industry-standard measures to protect your data, including encrypted
          connections (TLS/SSL) between your browser, our servers, and our database
          provider, and salted password hashing. No method of transmission or storage is
          completely secure, and we cannot guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection heading="7. Your Rights">
        <p>
          Depending on your location, you may have rights to access, correct, export, or
          delete your personal data, and to object to or restrict certain processing. You
          can update most account and business information directly from your dashboard, or
          contact us to exercise these rights.
        </p>
      </LegalSection>

      <LegalSection heading="8. Cookies and Similar Technologies">
        <p>
          We use essential cookies/local storage to keep you signed in and to remember
          preferences such as your selected menu currency. We do not use third-party
          advertising cookies.
        </p>
      </LegalSection>

      <LegalSection heading="9. Contact Us">
        <p>
          For questions about this Privacy Policy, or to exercise your data rights, contact
          us at <a href="mailto:mosegiccompany@gmail.com">mosegiccompany@gmail.com</a>.
        </p>
      </LegalSection>

      <LegalSection heading="10. Changes to this Policy">
        <p>
          We may update this Privacy Policy from time to time. Material changes will be
          communicated via the Service or by email. The &quot;Effective date&quot; above indicates
          when this policy was last revised.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

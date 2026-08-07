import React from "react";
import style from "./style.module.css";

const PrivacyPolicyContent = () => {
  return (
    <main className={style.wrapper}>
      <div className={style.card}>
        <div className="min-h-screen bg-white">
          <div
            className="mx-auto bg-white"
            style={{
              maxWidth: "816px",
            }}
          >
            {/* Title */}
            <h1 className="mb-1 text-[16pt] leading-tight font-bold text-black">
              TERMS OF SERVICE – ALPHADRAFTS DOCAUDITOR
            </h1>

            {/* Meta */}
            <p className="mb-1 leading-normal text-black">
              Effective Date: February, 2026
            </p>
            <p className="mb-1 leading-normal text-black">
              Company: Visionary Insights LLC
            </p>
            <p className="mb-5 leading-normal text-black">
              Product: AlphaDrafts DocAuditor
            </p>

            {/* ── 1. Introduction ── */}
            <h2 className="mt-4 mb-0 leading-normal font-bold text-black">
              1. Introduction
            </h2>
            <p className="mb-4 leading-normal text-black">
              Welcome to{" "}
              <strong>AlphaDrafts DocAuditor (&quot;DocAuditor&quot;)</strong> ,
              a pre-submission document verification platform operated by{" "}
              <strong>Visionary Insights LLC</strong> under the{" "}
              <strong>AlphaDrafts </strong> brand.
            </p>
            <p className="mb-4 leading-normal text-black">
              These Terms of Service (&quot;Terms&quot;) govern your access to
              and use of the DocAuditor platform, website, and related services.
            </p>
            <p className="mb-3 leading-normal text-black">
              By accessing or using DocAuditor, you agree to these Terms. If you
              do not agree, you must not use the platform.
            </p>

            {/* ── 2. Description of the Service ── */}
            <h2 className="mt-4 mb-0 leading-normal font-bold text-black">
              2. Description of the Service
            </h2>
            <p className="mb-4 leading-normal text-black">
              DocAuditor is a <strong>document verification platform </strong>{" "}
              designed to help users review written work before submission.
            </p>
            <p className="mb-4 leading-normal text-black">
              The platform provides three verification checks:
            </p>
            <ol className="mb-0 list-decimal pl-9 leading-normal text-black">
              <li className="mb-3">
                <span className="font-bold">AI Originality Check</span> –
                identifies patterns consistent with AI-generated writing
              </li>
              <li className="mb-3">
                <span className="font-bold">Plagiarism Source Check</span> –
                identifies matches with published sources
              </li>
              <li className="mb-3">
                <span className="font-bold">Alignment Brief Check</span> –
                compares documents against assignment instructions or project
                briefs
              </li>
            </ol>
            <p className="mb-3 leading-normal text-black">
              DocAuditor provides{" "}
              <strong>analysis and flags potential issues</strong> , but does
              not <strong>rewrite, edit, or generate content</strong> .
            </p>

            {/* ── 3. Eligibility ── */}
            <h2 className="mt-4 mb-0 leading-normal font-bold text-black">
              3. Eligibility
            </h2>
            <p className="mb-4 leading-normal text-black">
              To use DocAuditor, you must:
            </p>
            <ul className="mb-0 list-disc pl-9 leading-normal text-black">
              <li>
                Be at least <strong>13 years old</strong>
              </li>
              <li>Have the legal capacity to enter into agreements</li>
              <li>Provide accurate account information</li>
            </ul>
            <p className="mb-3 leading-normal text-black">
              Organizations using the service represent that they are authorized
              to do so.
            </p>

            {/* ── 4. User Accounts ── */}
            <h2 className="mt-4 mb-0 leading-normal font-bold text-black">
              4. User Accounts
            </h2>
            <p className="mb-4 leading-normal text-black">
              To access certain features, you must create an account.
            </p>
            <p className="mb-4 leading-normal text-black">You agree to:</p>
            <ul className="mb-0 list-disc pl-9 leading-normal text-black">
              <li>Provide accurate and current information</li>
              <li>Maintain the confidentiality of your login credentials</li>
              <li>Be responsible for all activity under your account</li>
            </ul>
            <p className="mb-3 leading-normal text-black">
              AlphaDrafts reserves the right to suspend or terminate accounts
              suspected of misuse.
            </p>

            {/* ── 5. User Content and Ownership ── */}
            <h2 className="mt-4 mb-0 leading-normal font-bold text-black">
              5. User Content and Ownership
            </h2>
            <p className="mb-4 leading-normal text-black">
              Users may upload documents including essays, research papers,
              proposals, reports, and other written materials.
            </p>
            <p className="mt-1 mb-0 leading-normal font-bold text-black">
              Ownership
            </p>
            <p className="mb-4 leading-normal text-black">
              Users{" "}
              <strong>
                retain full ownership of their documents and content
              </strong>{" "}
              .
            </p>
            <p className="mb-4 leading-normal text-black">
              By uploading content, you grant AlphaDrafts a limited license to
              process the content solely to provide verification services.
            </p>
            <p className="mb-3 leading-normal text-black">
              AlphaDrafts does <strong>not claim ownership</strong> of user
              documents.
            </p>

            {/* ── 6. Acceptable Use ── */}
            <h2 className="mt-4 mb-0 leading-normal font-bold text-black">
              6. Acceptable Use
            </h2>
            <p className="mb-4 leading-normal text-black">
              You agree not to use DocAuditor to:
            </p>
            <ul className="mb-0 list-disc pl-9 leading-normal text-black">
              <li>Upload illegal or unlawful content</li>
              <li>
                Upload copyrighted material you do not have rights to process
              </li>
              <li>Interfere with platform security</li>
              <li>Reverse engineer or exploit the platform</li>
              <li>Use automated scraping or bots</li>
            </ul>
            <p className="mb-3 leading-normal text-black">
              Violation may result in suspension or termination.
            </p>

            {/* ── 7. AI and Verification Limitations ── */}
            <h2 className="mt-4 mb-0 leading-normal font-bold text-black">
              7. AI and Verification Limitations
            </h2>
            <p className="mb-4 leading-normal text-black">
              DocAuditor provides{" "}
              <strong>automated verification results</strong> that may include:
            </p>
            <ul className="mb-0 list-disc pl-9 leading-normal text-black">
              <li>AI pattern detection</li>
              <li>Source similarity detection</li>
              <li>Requirement alignment analysis</li>
            </ul>
            <p className="mt-1 mb-0 leading-normal font-bold text-black">
              Important limitations:
            </p>
            <ul className="mb-0 list-disc pl-9 leading-normal text-black">
              <li>
                Results are <strong>probabilistic </strong> and not definitive
              </li>
              <li>False positives or false negatives may occur</li>
              <li>Results may be incomplete</li>
            </ul>
            <p className="mt-1 mb-0 leading-normal font-bold text-black">
              DocAuditor <strong>does not guarantee</strong> :
            </p>
            <ul className="mb-0 list-disc pl-9 leading-normal text-black">
              <li>academic compliance</li>
              <li>plagiarism clearance</li>
              <li>AI-free certification</li>
              <li>acceptance by institutions or publishers</li>
            </ul>
            <p className="mb-3 leading-normal text-black">
              Users remain responsible for reviewing and interpreting results.
            </p>

            {/* ── 8. Credits and Pricing ── */}
            <h2 className="mt-4 mb-0 leading-normal font-bold text-black">
              8. Credits and Pricing
            </h2>
            <p className="mb-4 leading-normal text-black">
              DocAuditor uses a <strong>credit-based system</strong> for
              verification checks.
            </p>
            <p className="mt-1 mb-0 leading-normal font-bold text-black">
              Key rules include:
            </p>
            <ul className="mb-0 list-disc pl-9 leading-normal text-black">
              <li>Credits are deducted based on word count and check type</li>
              <li>Word counts are rounded up to the nearest 1,000 words</li>
              <li>
                Purchased credits <strong>do not expire</strong>{" "}
              </li>
              <li>Subscription credits refresh monthly and do not roll over</li>
            </ul>
            <p className="mb-3 leading-normal text-black">
              AlphaDrafts may modify pricing with reasonable notice.
            </p>

            {/* ── 9. Free Tier ── */}
            <h2 className="mt-4 mb-0 leading-normal font-bold text-black">
              9. Free Tier
            </h2>
            <p className="mb-4 leading-normal text-black">
              DocAuditor offers a limited free plan.
            </p>
            <p className="mb-4 leading-normal text-black">
              Free usage may include:
            </p>
            <ul className="mb-0 list-disc pl-9 leading-normal text-black">
              <li>limited number of checks</li>
              <li>word count restrictions</li>
              <li>limited feature access</li>
            </ul>
            <p className="mb-3 leading-normal text-black">
              AlphaDrafts may modify or discontinue the free tier at any time.
            </p>

            {/* ── 10. Platform Availability ── */}
            <h2 className="mt-4 mb-0 leading-normal font-bold text-black">
              10. Platform Availability
            </h2>
            <p className="mb-4 leading-normal text-black">
              We strive to maintain reliable service but do not guarantee
              uninterrupted availability.
            </p>
            <p className="mb-4 leading-normal text-black">
              DocAuditor may experience:
            </p>
            <ul className="mb-0 list-disc pl-9 leading-normal text-black">
              <li>maintenance periods</li>
              <li>technical outages</li>
              <li>third-party service interruptions</li>
            </ul>
            <p className="mb-3 leading-normal text-black">
              AlphaDrafts is not liable for temporary service disruptions.
            </p>

            {/* ── 11. Intellectual Property ── */}
            <h2 className="mt-4 mb-0 leading-normal font-bold text-black">
              11. Intellectual Property
            </h2>
            <p className="mb-4 leading-normal text-black">
              All platform components including:
            </p>
            <ul className="mb-0 list-disc pl-9 leading-normal text-black">
              <li>software</li>
              <li>design</li>
              <li>algorithms</li>
              <li>branding</li>
              <li>trademarks</li>
              <li>documentation</li>
            </ul>
            <p className="mb-4 leading-normal text-black">
              are owned by <strong>AlphaDrafts / Visionary Insights LLC</strong>{" "}
              .
            </p>
            <p className="mb-3 leading-normal text-black">
              Users may not reproduce, distribute, or reverse engineer the
              platform.
            </p>

            {/* ── 12. Privacy ── */}
            <h2 className="mt-4 mb-0 leading-normal font-bold text-black">
              12. Privacy
            </h2>
            <p className="mb-4 leading-normal text-black">
              Your use of DocAuditor is governed by the AlphaDrafts Privacy
              Policy.
            </p>
            <p className="mb-3 leading-normal text-black">
              Please review the Privacy Policy for details on data collection
              and processing.
            </p>

            {/* ── 13. Limitation of Liability ── */}
            <h2 className="mt-4 mb-0 leading-normal font-bold text-black">
              13. Limitation of Liability
            </h2>
            <p className="mb-4 leading-normal text-black">
              To the fullest extent permitted by law, AlphaDrafts shall not be
              liable for:
            </p>
            <ul className="mb-0 list-disc pl-9 leading-normal text-black">
              <li>academic penalties</li>
              <li>rejected submissions</li>
              <li>lost contracts or funding</li>
              <li>reliance on verification results</li>
              <li>indirect or consequential damages</li>
            </ul>
            <p className="mb-3 leading-normal text-black">
              DocAuditor is a <strong>verification aid</strong> , not a
              guarantee.
            </p>

            {/* ── 14. Indemnification ── */}
            <h2 className="mt-4 mb-0 leading-normal font-bold text-black">
              14. Indemnification
            </h2>
            <p className="mb-4 leading-normal text-black">
              Users agree to indemnify and hold AlphaDrafts harmless from claims
              arising from:
            </p>
            <ul className="mb-3 list-disc pl-9 leading-normal text-black">
              <li>misuse of the platform</li>
              <li>violation of these Terms</li>
              <li>infringement of third-party rights</li>
            </ul>

            {/* ── 15. Termination ── */}
            <h2 className="mt-4 mb-0 leading-normal font-bold text-black">
              15. Termination
            </h2>
            <p className="mb-4 leading-normal text-black">
              AlphaDrafts may suspend or terminate access if users:
            </p>
            <ul className="mb-0 list-disc pl-9 leading-normal text-black">
              <li>violate these Terms</li>
              <li>misuse the platform</li>
              <li>engage in fraudulent or abusive behavior</li>
            </ul>
            <p className="mb-3 leading-normal text-black">
              Users may terminate their accounts at any time.
            </p>

            {/* ── 16. Changes to Terms ── */}
            <h2 className="mt-4 mb-0 leading-normal font-bold text-black">
              16. Changes to Terms
            </h2>
            <p className="mb-4 leading-normal text-black">
              AlphaDrafts may update these Terms periodically.
            </p>
            <p className="mb-4 leading-normal text-black">
              Updates will be posted on the platform with a revised effective
              date.
            </p>
            <p className="mb-3 leading-normal text-black">
              Continued use constitutes acceptance of updated Terms.
            </p>

            {/* ── 17. Governing Law ── */}
            <h2 className="mt-4 mb-0 leading-normal font-bold text-black">
              17. Governing Law
            </h2>
            <p className="mb-4 leading-normal text-black">
              These Terms are governed by applicable international law and the
              laws applicable to Visionary Insights LLC, unless otherwise
              required by the user&apos;s jurisdiction.
            </p>
            <p className="mb-3 leading-normal text-black">
              Disputes should first be resolved through{" "}
              <strong>negotiation or mediation</strong>
              before litigation.
            </p>

            {/* ── 18. Contact Information ── */}
            <h2 className="mt-4 mb-0 leading-normal font-bold text-black">
              18. Contact Information
            </h2>
            <p className="mb-4 leading-normal text-black">
              Visionary Insights LLC
            </p>
            <p className="mb-4 leading-normal text-black">
              Email:{" "}
              <a
                href="mailto:principal@visionaryinsights.co"
                className="text-blue-700 underline"
              >
                principal@visionaryinsights.co
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicyContent;

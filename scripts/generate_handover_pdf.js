const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

async function generatePDF() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AlphaDraft - Management Handover Note</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 15mm 10mm 15mm;
    }
    
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      line-height: 1.35;
      font-size: 8.5pt;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2.5px solid #1A73E8;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .logo-box {
      width: 30px;
      height: 30px;
      background: linear-gradient(135deg, #1A73E8 0%, #0d47a1 100%);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 13pt;
    }

    .brand-title {
      font-size: 15pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin: 0;
      line-height: 1.1;
    }

    .brand-subtitle {
      font-size: 7.5pt;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin: 0;
      font-weight: 600;
    }

    .badge-doc {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .memo-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 12px;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
    }

    .meta-label {
      font-size: 6.8pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 1px;
    }

    .meta-value {
      font-size: 8.5pt;
      font-weight: 600;
      color: #0f172a;
    }

    h2 {
      color: #0f172a;
      font-size: 10pt;
      font-weight: 700;
      margin-top: 10px;
      margin-bottom: 5px;
      padding-bottom: 3px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    h2::before {
      content: "";
      display: inline-block;
      width: 3.5px;
      height: 12px;
      background: #1A73E8;
      border-radius: 2px;
    }

    p {
      margin: 0 0 6px 0;
      color: #334155;
    }

    .highlight-card {
      background: #f0fdf4;
      border-left: 3.5px solid #16a34a;
      border-radius: 0 6px 6px 0;
      padding: 7px 10px;
      margin: 6px 0 8px 0;
    }

    .highlight-title {
      font-weight: 700;
      color: #166534;
      font-size: 8pt;
      margin-bottom: 2px;
    }

    .status-table {
      width: 100%;
      border-collapse: collapse;
      margin: 6px 0 10px 0;
      font-size: 7.8pt;
    }

    .status-table th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 5px 8px;
      border: 1px solid #e2e8f0;
      font-size: 7.2pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-table td {
      padding: 5px 8px;
      border: 1px solid #e2e8f0;
      color: #334155;
      vertical-align: top;
    }

    .status-table tr:nth-child(even) td {
      background: #f8fafc;
    }

    .tag-passed {
      background: #dcfce7;
      color: #15803d;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 7.2pt;
      font-weight: 700;
      display: inline-block;
    }

    .tag-secured {
      background: #dbeafe;
      color: #1d4ed8;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 7.2pt;
      font-weight: 700;
      display: inline-block;
    }

    .feature-list {
      margin: 4px 0 6px 0;
      padding-left: 14px;
    }

    .feature-list li {
      margin-bottom: 3px;
      color: #334155;
    }

    .docs-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin: 6px 0 10px 0;
    }

    .doc-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      padding: 6px 8px;
    }

    .doc-name {
      font-weight: 700;
      font-size: 7.8pt;
      color: #1A73E8;
      margin-bottom: 2px;
      word-break: break-all;
    }

    .doc-desc {
      font-size: 6.8pt;
      color: #64748b;
      margin: 0;
      line-height: 1.3;
    }

    .recommendations-box {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-left: 3.5px solid #f59e0b;
      border-radius: 0 5px 5px 0;
      padding: 7px 10px;
      margin: 6px 0 8px 0;
    }

    .recommendations-box ol {
      margin: 4px 0 0 0;
      padding-left: 14px;
    }

    .recommendations-box li {
      margin-bottom: 3px;
      font-size: 7.8pt;
      color: #78350f;
    }

    .footer {
      margin-top: 10px;
      padding-top: 6px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      color: #94a3b8;
      font-size: 7pt;
    }
  </style>
</head>
<body>

  <div class="header-bar">
    <div class="logo-container">
      <div class="logo-box">A</div>
      <div>
        <h1 class="brand-title">AlphaDraft</h1>
        <p class="brand-subtitle">Architecture & Engineering Handover</p>
      </div>
    </div>
    <div class="badge-doc">Official Memo</div>
  </div>

  <div class="memo-meta">
    <div class="meta-item">
      <span class="meta-label">To</span>
      <span class="meta-value">Executive Leadership & Engineering Management</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">From</span>
      <span class="meta-value">AlphaDraft Core Engineering & Architecture Team</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Date</span>
      <span class="meta-value">October 10, 2026</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Subject</span>
      <span class="meta-value">Full Decoupling Migration, Security Hardening & Handover</span>
    </div>
  </div>

  <h2>1. Executive Summary</h2>
  <p>
    This handover note confirms the successful architectural audit, stabilization, security hardening, and documentation of the <strong>AlphaDraft</strong> web platform (<code>alphadrafts-new</code>). The application has fully decoupled from legacy Firebase SDKs and now operates on an independent, enterprise cloud-native infrastructure.
  </p>

  <div class="highlight-card">
    <div class="highlight-title">Production Stability Verification</div>
    <div style="font-size: 7.8pt; color: #14532d;">
      The codebase has achieved <strong>zero build and lint defects</strong>. Both <code>tsc --noEmit</code> and <code>next lint</code> execute with 0 errors and 0 warnings, verified on the latest production commit (<code>b3dcf52</code>) on branch <code>main</code>.
    </div>
  </div>

  <h2>2. Architectural Foundations</h2>
  <ul class="feature-list">
    <li><strong>Decoupled Cloud Engine:</strong> Cloud Run REST backend backed by PostgreSQL (Drizzle ORM) and Cloudflare R2 object storage.</li>
    <li><strong>Bank-Grade Cookie Authentication:</strong> httpOnly, SameSite, Secure JWT tokens with automated background rotation and double-submit CSRF headers.</li>
    <li><strong>Design System Tokens:</strong> Material 3 design system with dynamic light/dark theming, WCAG 2.1 motion preference support, and Tailwind CSS v4 tokens.</li>
    <li><strong>Advanced Document Editing:</strong> TipTap PM v3 rich text editor featuring debounced 1.5s background auto-saving, rollback snapshots, and inline AI highlights.</li>
  </ul>

  <h2>3. Quality & Security Hardening Scorecard</h2>
  <table class="status-table">
    <thead>
      <tr>
        <th style="width: 22%;">Area</th>
        <th style="width: 18%;">Status</th>
        <th>Result & Impact</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>TypeScript Safety</strong></td>
        <td><span class="tag-passed">0 ERRORS</span></td>
        <td>Full type coverage across React 19 contexts, API responses, and TipTap models.</td>
      </tr>
      <tr>
        <td><strong>ESLint Standards</strong></td>
        <td><span class="tag-passed">0 WARNINGS</span></td>
        <td>ESLint Flat config updated with build artifact exclusions and clean dependencies.</td>
      </tr>
      <tr>
        <td><strong>AI Proxy Security</strong></td>
        <td><span class="tag-secured">HARDENED</span></td>
        <td>Secured <code>/api/v1/sapling/*</code> behind cryptographic session gates to prevent quota leakage.</td>
      </tr>
      <tr>
        <td><strong>CSRF Defense</strong></td>
        <td><span class="tag-secured">ENFORCED</span></td>
        <td>Double-submit cookie validation active on all state-mutating requests (POST/PUT/DELETE).</td>
      </tr>
    </tbody>
  </table>

  <h2>4. Central Documentation Repository</h2>
  <div class="docs-grid">
    <div class="doc-card">
      <div class="doc-name">ARCHITECTURE.md</div>
      <p class="doc-desc">System diagrams, Cloud Run proxy flows, and storage mechanics.</p>
    </div>
    <div class="doc-card">
      <div class="doc-name">DATABASE_SCHEMA.md</div>
      <p class="doc-desc">PostgreSQL ERD, table dictionaries, relations, and index policies.</p>
    </div>
    <div class="doc-card">
      <div class="doc-name">APP_FLOW.md</div>
      <p class="doc-desc">Authentication lifecycles, project wizard stages, and auto-save state.</p>
    </div>
    <div class="doc-card">
      <div class="doc-name">TRD.md</div>
      <p class="doc-desc">Technical Requirements, NFRs, SLA targets, and API contracts.</p>
    </div>
  </div>

  <h2>5. High-Priority Engineering Recommendations for Next Sprint</h2>
  <div class="recommendations-box">
    <strong>Action Items for Next Release Cycle:</strong>
    <ol>
      <li><strong>Consolidate Date Formatting:</strong> Standardize on <code>date-fns</code> across <code>formatDates.ts</code> to retire legacy date helper functions.</li>
      <li><strong>Mailing List Hardening:</strong> Integrate rate limiting and Turnstile captcha on <code>/api/v1/mail-list</code> to safeguard against automated form submissions.</li>
      <li><strong>Dependency Optimization:</strong> Prune legacy packages (such as <code>jquery</code> and secondary docx converters) to further streamline client bundle sizes.</li>
    </ol>
  </div>

  <div class="footer">
    <span>AlphaDraft Technical Handover &bull; Confidential &bull; Internal Management Distribution</span>
    <span>Git Commit: b3dcf52 (main)</span>
  </div>

</body>
</html>
  `;

  await page.setContent(htmlContent, { waitUntil: 'networkidle' });

  const outputPath = path.resolve(__dirname, 'docs/MANAGEMENT_HANDOVER_NOTE.pdf');
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0mm',
      bottom: '0mm',
      left: '0mm',
      right: '0mm'
    }
  });

  console.log(`PDF successfully generated at: ${outputPath}`);
  await browser.close();
}

generatePDF().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});

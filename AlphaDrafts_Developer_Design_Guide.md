# AlphaDrafts DocAuditor — UI/UX Redesign & Design System Specification

> **Target Audience:** Frontend Engineering & UI Design Teams  
> **Document Purpose:** Technical Design System & UI/UX Revamp Guidelines for AlphaDrafts Web Application  
> **Design Philosophy:** Inspired by Google Material Design 3 (M3) — Clean, Functional, High-Contrast, Frictionless.

---

## 1. Audit & Core UX Friction Points

The previous AlphaDrafts interface exhibited several usability, consistency, and visual hierarchy issues. Below is the technical breakdown of the friction points and their systematic fixes:

| Feature / Element | Current UI Issue | Developer Fix & Specification |
| :--- | :--- | :--- |
| **Typography** | Mixed typography (Serif headings arbitrarily paired with Sans-serif body fonts) creates visual noise and reduces readability. | Standardize to **Google Sans / Inter** across all headings, body text, badges, and interface controls. Remove serif font imports. |
| **Color System & Surfaces** | Harsh jumps between light cream (`#FBFBF9`), pure black (`#0F0C20`), and white surfaces without semantic token structure. | Implement a unified **M3 Tonal Surface Hierarchy**. Use dark slate (`#0F172A`) for dark containers and slate gray (`#F8FAFC`) for light surfaces. |
| **Button & CTA Hierarchy** | Multiple primary CTAs ("Check My Work Free") appearing simultaneously on a single viewport without visual ordering. | Establish strict primary (`#1A73E8` / `#1E6091`), secondary (outlined), and tertiary (text) button guidelines. Limit 1 primary CTA per viewport. |
| **Card & Container Styling** | Inconsistent border radii ($8\text{px}$, $12\text{px}$, $20\text{px}$, $999\text{px}$ mixed haphazardly), mismatched drop shadows, and varied badge layouts. | Standardize to M3 container specs: Cards ($16\text{px}$ / $24\text{px}$ radius), Inputs ($10\text{px}$ radius), Pills ($999\text{px}$ radius). |
| **Alerts & Banners** | Unpadded yellow alert banners with hardcoded legacy colors and poor icon alignment. | Implement semantic inline dismissible alert banners with soft tonal fills (`#FEF3C7` container, `#D97706` text/border). |

---

## 2. Design System Foundation

### 2.1 Design Tokens & Color Palette (M3 Tonal Palette)

All colors must be referenced using CSS custom properties (variables) or Tailwind config tokens rather than raw hex codes.

#### CSS Variables (`/styles/tokens.css`)

```css
:root {
  /* Brand Primary Colors */
  --color-primary: #1A73E8;
  --color-primary-hover: #1557B0;
  --color-primary-active: #10438C;
  --color-on-primary: #FFFFFF;
  --color-primary-container: #E0F2FE;
  --color-on-primary-container: #0369A1;

  /* Neutral & Surface Colors */
  --color-surface-background: #F8FAFC;
  --color-surface-container: #FFFFFF;
  --color-surface-container-elevated: #FFFFFF;
  --color-surface-dark: #0F172A;
  --color-surface-dark-container: #1E293B;

  /* Typography Colors */
  --color-text-primary: #0F172A;
  --color-text-secondary: #475569;
  --color-text-tertiary: #94A3B8;
  --color-text-on-dark: #F8FAFC;
  --color-text-on-dark-muted: #CBD5E1;

  /* Borders & Dividers */
  --color-border-subtle: #E2E8F0;
  --color-border-medium: #CBD5E1;
  --color-border-focus: #1A73E8;

  /* Semantic Feedback Tokens */
  --color-success: #16A34A;
  --color-success-container: #DCFCE7;
  --color-on-success-container: #14532D;

  --color-warning: #D97706;
  --color-warning-container: #FEF3C7;
  --color-on-warning-container: #78350F;

  --color-error: #DC2626;
  --color-error-container: #FEE2E2;
  --color-on-error-container: #7F1D1D;
}
```

---

### 2.2 Typography Scale & Rules

* **Primary Font Stack**: `'Google Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
* **Monospace Font Stack** (for code/raw document view): `'JetBrains Mono', 'Fira Code', monospace`

| Type Level | Font Family | Size | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Large** | Google Sans / Inter | `44px` (2.75rem) | 700 (Bold) | `52px` | `-0.02em` |
| **Display Medium** | Google Sans / Inter | `36px` (2.25rem) | 700 (Bold) | `44px` | `-0.015em` |
| **Headline Large** | Google Sans / Inter | `28px` (1.75rem) | 600 (SemiBold) | `36px` | `-0.01em` |
| **Headline Medium** | Google Sans / Inter | `22px` (1.375rem) | 600 (SemiBold) | `28px` | `0` |
| **Title Medium** | Google Sans / Inter | `18px` (1.125rem) | 500 (Medium) | `24px` | `0` |
| **Body Large** | Inter | `16px` (1.0rem) | 400 (Regular) | `24px` | `0` |
| **Body Medium** | Inter | `14px` (0.875rem) | 400 (Regular) | `20px` | `0` |
| **Label / Badge** | Inter | `12px` (0.75rem) | 600 (SemiBold) | `16px` | `0.05em` (Uppercase) |

---

### 2.3 Grid, Layout & Spatial System

* **Base Spatial Grid**: Multiples of $8\text{px}$ ($8\text{px}, 16\text{px}, 24\text{px}, 32\text{px}, 48\text{px}, 64\text{px}, 96\text{px}$).
* **Container Max Widths**:
  * Desktop Main Content: `1280px` centered with `24px` horizontal padding.
  * Focused Form / Settings Width: `768px` centered.
  * Dashboard Layout: `280px` fixed sidebar (if applicable) + flexible main viewport area.

#### Radius Tokens
* **Pill / Badge**: `999px`
* **Buttons & Form Control Inputs**: `10px`
* **Standard Cards & Modules**: `16px`
* **Elevated Cards & Large Containers**: `24px`
* **Modals & Dialogs**: `28px`

#### Shadow & Elevation Tokens
* **Elevation 0 (Flat)**: `none`, Border: `1px solid var(--color-border-subtle)`
* **Elevation 1 (Card Hover / Dropdown)**: `0px 4px 12px rgba(15, 23, 42, 0.06)`
* **Elevation 2 (Floating Toolbar / Sticky Header)**: `0px 8px 24px rgba(15, 23, 42, 0.10)`
* **Elevation 3 (Modals / Overlays)**: `0px 16px 32px rgba(15, 23, 42, 0.16)`

---

## 3. UI Component Specifications

### 3.1 Buttons & Action Controls

1. **Primary Button**:
   * Background: `var(--color-primary)`
   * Text: `var(--color-on-primary)` (Pure White)
   * Height: `44px` (Medium) / `52px` (Large Hero)
   * Padding: `0 24px`
   * Radius: `10px`
   * Hover: `background-color: var(--color-primary-hover)`, `transform: translateY(-1px)`, Elevation 1.
   * Active: `background-color: var(--color-primary-active)`, `transform: translateY(0)`.

2. **Secondary Button**:
   * Background: `transparent`
   * Border: `1.5px solid var(--color-border-medium)`
   * Text: `var(--color-text-primary)`
   * Hover: `background-color: var(--color-primary-container)`, `border-color: var(--color-primary)`.

3. **Tertiary / Ghost Button**:
   * Background: `transparent`
   * Border: `none`
   * Text: `var(--color-primary)`
   * Hover: `background-color: rgba(26, 115, 232, 0.08)`.

---

### 3.2 Cards & Containers

* **Default Card Structure**:
  * Background: `var(--color-surface-container)`
  * Border: `1px solid var(--color-border-subtle)`
  * Border Radius: `16px`
  * Padding: `24px`
  * Transition: `all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`

---

### 3.3 Badges & Status Chips

* **Originality / Success**: Background `var(--color-success-container)`, Text `var(--color-on-success-container)`.
* **Missing Requirement / Warning**: Background `var(--color-warning-container)`, Text `var(--color-on-warning-container)`.
* **AI Flag / Danger**: Background `var(--color-error-container)`, Text `var(--color-on-error-container)`.
* **Neutral / Step Pill**: Background `var(--color-primary-container)`, Text `var(--color-on-primary-container)`.

---

## 4. Accessibility & Interactive Guidelines

1. **Contrast Compliance (WCAG 2.1 AA)**:
   * All text elements must maintain a contrast ratio of at least **4.5:1** against their background surface.
   * Large headings (24px+) must maintain at least **3.0:1** contrast ratio.
2. **Keyboard Focus Indicator**:
   * Interactive elements (`button`, `a`, `input`, `select`) must render a visible focus ring on `:focus-visible`:
     `outline: 2px solid var(--color-border-focus); outline-offset: 2px;`
3. **Interactive States**:
   * Smooth hover transitions (150ms–200ms ease-in-out).
   * Disable interactive states (`cursor: not-allowed`, `opacity: 0.5`) when buttons or controls are pending backend execution or validation.
4. **Loading & Feedback States**:
   * Replace static screen loads with pulse skeleton loaders matching card dimensions during document processing.

---

## 5. Summary & Handoff Instructions for Developers

* Import `Google Sans` or `Inter` via `@font-face` or Google Fonts.
* Replace all legacy CSS hex values with the defined CSS variables.
* Remove all instances of serif heading fonts (`font-family: serif` or custom serif packages).
* Apply consistent spacing tokens (`8px` grid) across all component margins and paddings.
* Ensure all interactive components include explicit `:focus-visible` ring styling.

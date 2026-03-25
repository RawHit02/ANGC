# Implementation Plan — Talentica-Inspired Redesign

Rebuild the ANGC Synapse website to match the sophisticated, product-focused aesthetic of [Talentica](https://www.talentica.com/).

## Proposed Changes

### 1. Structure & Layout
#### [MODIFY] [index.html](file:///c:/Users/PC 1/.gemini/antigravity/scratch/angc-synapse/index.html)
- **Header**:
    - Build new navigation: `What We Do`, `How We Do`, `Technologies ▾`, `Our Work`, `Insights ▾`, `About Us ▾`.
    - Add `Talk To Us` button (Primary CTA).
    - Implement 3 unique mega menus based on user screenshots.
- **Hero**:
    - Headline: "Building High-End Infrastructure The AI-Native Way".
    - Background: High-quality minimalistic tech images.
    - Bottom Cards: Interactive cards for "Latest Insights" or "Upcoming Webinars".
- **Talk To Us Section**:
    - Tabbed interface: `Business`, `Careers`, `Others`.
    - Custom forms for each tab with validation.
    - Office Presence: Update address to Sector 37, Udyog Vihar, Gurugram.
- **Footer**:
    - Clean white layout with capabilities list (Software Dev, AI & ML, Blockchain, etc.).
    - "Experience Matters!" branding.

---

### 2. Styling (Vanilla CSS)
#### [MODIFY] [style.css](file:///c:/Users/PC 1/.gemini/antigravity/scratch/angc-synapse/style.css)
- Implement a clean, light-mode palette with teal/green accents.
- Comment out or remove light/dark mode toggle logic.
- Design the mega menus with columns and hover states.
- Style the tabbed contact section with smooth transitions and premium form inputs.

---

### 3. Logic & Interaction
#### [MODIFY] [main.js](file:///c:/Users/PC 1/.gemini/antigravity/scratch/angc-synapse/main.js)
- Implement tab switching logic for the `Talk To Us` section.
- Handle sticky header transitions.
- Implement mobile menu that mirrors the new complex header structure.

---

### 4. Custom Assets
- **Logo**: Generate a minimalist "ANGC Synapse" logo inspired by Talentica.
- **Backgrounds**: Generate 3-4 abstract tech images (coding, cloud, AI nodes).

---

## Verification Plan

### Automated/Manual Verification
- Verify all 3 mega menus open correctly on hover/click.
- Test the `Talk To Us` tab switching and form field visibility.
- Ensure the sticky header behaves smoothly on scroll.
- Mobile audit: Test new navigation on a 375px viewport.

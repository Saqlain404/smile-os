# Feature: Marketing Website

## Overview
Public-facing landing page at `/` with sticky navigation, hero section, feature highlights, pricing, testimonials, and footer.

## Files
- `src/components/marketing/marketing-nav.tsx` — Sticky navigation
- `src/components/marketing/marketing-footer.tsx` — 4-column footer
- `src/app/page.tsx` — Landing page (server component)

## Landing Page Sections

### 1. Hero
- Headline: "The Operating System for Modern Dental Practices"
- Subheadline describing the platform
- CTA buttons (Get Started, Watch Demo)

### 2. Logos
- Trusted by [X] dental practices
- Placeholder logo bar

### 3. Features (6)
- Patient Management
- Smart Scheduling
- Billing & Invoices
- AI Assistant
- Staff Management
- Patient Portal

### 4. How It Works (3 steps)
1. Set up your practice
2. Manage patients & appointments
3. Grow with insights

### 5. Pricing (3 tiers)
- **Starter** — $49/mo — For small practices
- **Professional** — $99/mo — For growing practices (most popular)
- **Enterprise** — $199/mo — For multi-location practices

### 6. Testimonials (3)
- Patient reviews with star ratings
- Before/after treatment stories

### 7. Final CTA
- "Ready to transform your practice?"
- Get Started button

## MarketingNav Features
- Sticky positioning (top of viewport)
- Logo + navigation links
- CTA button
- Mobile hamburger menu (slide-in drawer)
- Smooth scroll to sections

## MarketingFooter Features
- 4-column layout: Company, Features, Support, Legal
- HIPAA Compliant badge
- SOC 2 Type II badge
- Copyright notice
- Social media links

## Known Gaps
- No blog functionality (model exists but not used)
- No SEO optimization (meta tags, structured data)
- No A/B testing
- No analytics tracking (PostHog configured but not active)
- No contact form
- No demo request form

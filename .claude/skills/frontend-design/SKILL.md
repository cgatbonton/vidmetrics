---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that follows the project's design system and avoids generic AI aesthetics.
---

# Frontend Design

This skill guides creation of distinctive, production-grade frontend interfaces that follow the project's established design system and avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Step 0: Load the Design System (MANDATORY)

**Before any design work, check if a design system or brand book exists in the project.** Look for:
- `.claude/brand-book.md` — project brand/design guide
- A design tokens file (CSS custom properties, Tailwind config, theme file)
- An existing component library or UI kit
- `CLAUDE.md` entries about design conventions

If a design system exists, use it as the authoritative reference. If none exists, identify the project's implicit design patterns by reading existing components and styles.

Key design system elements to reference:
- **Colors** — Use semantic tokens and the project's color palette. Never hardcode values that should be tokens.
- **Typography** — Use the project's font stack. Don't introduce new fonts unless asked.
- **Spacing & Layout** — Follow established spacing scales and layout patterns.
- **Components** — Use existing component variants before creating new ones.
- **Animation** — Follow existing motion patterns. Respect `prefers-reduced-motion`.
- **Icons** — Use the project's icon library exclusively.
- **Dark Mode** — Follow the project's dark mode strategy if one exists.

## Design Thinking

Before coding, understand the context:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: What is the project's visual personality? Modern? Minimal? Data-dense? Playful?
- **Constraints**: Technical requirements (framework, CSS approach, component library).
- **Differentiation**: What makes this interface exceptional within the project's design language?

**CRITICAL**: Express creativity within the design system. The constraint of a design system enables better design, not worse. Creative expression comes through composition, motion, spatial design, and thoughtful use of existing tokens — not by breaking the system.

Then implement working code that is:
- Production-grade and functional
- Visually striking and on-brand
- Cohesive with the project's established aesthetic
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on these areas — referencing the project's design system for exact values:

- **Typography**: Use the project's type scale consistently. Establish visual hierarchy through size, weight, and color contrast — not by adding decorative elements.
- **Color & Theme**: Use semantic tokens from the design system. Apply accent colors contextually. Ensure sufficient contrast ratios (WCAG AA minimum).
- **Motion**: Use purposeful animation that communicates state changes and spatial relationships. Every animation must be gated by `prefers-reduced-motion` media query or equivalent. This includes: loading animations, page transitions, hover effects, scroll animations, counters, and decorative motion.
- **Spatial Composition**: Use consistent spacing from the project's scale. Create visual rhythm through alignment and white space. Standard page patterns should be consistent across the project.
- **Depth & Elevation**: Use the project's elevation/shadow system consistently. Don't mix elevation paradigms (e.g., shadows AND borders for the same purpose).

**NEVER** violate these universal design principles:
- No raw hex/rgb colors for semantic tokens — use CSS custom properties or theme tokens
- No fonts outside the project's font stack
- No icon libraries other than the project's chosen one
- No inline styles for layout dimensions — use the project's utility classes or CSS system
- No animations without reduced-motion gates

**IMPORTANT**: Match implementation complexity to the design vision while staying on-brand. Elaborate interfaces use more of the design system's toolkit. Minimal interfaces use restraint but still draw from the same token system. Elegance comes from executing the design vision precisely.

## Pre-Flight Check (MANDATORY — run before outputting code)

Before presenting any component code, scan your output for these violations. If ANY are found, fix them before outputting:

1. **Color scan**: Search for any hardcoded color values (`#`, `rgb(`, `rgba(`, `hsl(`). Each one must be either a data visualization color or a design token reference. If neither, replace with the correct token.

2. **Font scan**: Search for explicit `font-family` declarations. If found, verify they match the project's font stack. Remove any that aren't in the project's design system.

3. **Icon scan**: Search for imports from icon packages other than the project's chosen library. If found, replace with equivalents from the correct library.

4. **Sizing scan**: Search for inline `style` containing pixel values for layout dimensions. If found, replace with the project's utility classes or CSS system.

5. **Motion scan**: Count EVERY animation instance in your code. For EACH one, verify it respects `prefers-reduced-motion`. Common miss: secondary animations (decorative elements, loading indicators, hover effects) get skipped while the primary animation is guarded. If ANY animation instance lacks a gate, add one.

6. **Accessibility scan**: Verify: all interactive elements have focus styles, all images have alt text, color is not the sole indicator of state, form inputs have labels, ARIA attributes are used correctly where needed.

## Final Step: Update Design Documentation (MANDATORY)

After completing the frontend implementation, review your work for any discoveries that should be captured:

**Update the design documentation when you:**
- Introduced a new component pattern (variant, layout, interaction pattern)
- Discovered a token or utility being used in the codebase but not documented
- Established a new spacing convention or responsive behavior
- Hit a gotcha or anti-pattern that future agents should avoid
- Built a new pattern with specific dimensions or behaviors worth reusing

**How to update:**
1. Find the correct documentation file (brand book, design system doc, or nearest CLAUDE.md)
2. Append new entries — don't reorganize
3. Follow the existing format

**Do NOT update for:**
- One-off component-specific styles that won't be reused
- Experimental patterns that haven't been confirmed as conventions

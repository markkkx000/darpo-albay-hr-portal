# 🧠 Agent UI/UX Design Rules

> A comprehensive ruleset for designing user interfaces and experiences.
> Grounded in the Laws of UX (lawsofux.com) and Laws of UI (uilaws.com).

---

## 📋 Table of Contents

1. [General Design Philosophy](#1-general-design-philosophy)
2. [Cognitive Load & Memory](#2-cognitive-load--memory)
3. [Visual Design Laws](#3-visual-design-laws)
4. [Gestalt Principles](#4-gestalt-principles)
5. [Interaction & Behavior](#5-interaction--behavior)
6. [Typography & Readability](#6-typography--readability)
7. [Color & Contrast](#7-color--contrast)
8. [Layout & Spacing](#8-layout--spacing)
9. [Navigation & Information Architecture](#9-navigation--information-architecture)
10. [Feedback & System Response](#10-feedback--system-response)
11. [Accessibility](#11-accessibility)
12. [Performance & Perception](#12-performance--perception)
13. [Code Efficiency & Anti-Bloat](#13-code-efficiency--anti-bloat)
14. [Important Specifications](#14-important-specifications)

---

## 1. General Design Philosophy

### Occam's Razor
- **Rule:** Always choose the simplest solution that works. Remove any element that does not serve a clear purpose.
- **Apply:** If two designs achieve the same goal, always ship the simpler one. Every added element must justify its existence.

### Light & Dark Mode Variants
- **Rule:** Every component or UI update must have light and dark mode variants or be visually acceptable for both modes.
- **Apply:** Test all UI changes in both themes. Use semantic color tokens (e.g., `text-foreground`, `bg-background`) that adapt automatically, or use `.dark` specific variants when custom colors are required. Avoid hardcoding colors that only work in one mode.
- **Strict Requirement:** Every element should adapt depending on the appearance (light/dark/system).

### Aesthetic-Usability Effect
- **Rule:** Users perceive visually pleasing designs as more usable, even when they are functionally identical to less attractive designs.
- **Apply:** Invest in aesthetics — clean layouts, consistent spacing, and refined visuals build user trust and perceived quality.

### Jakob's Law
- **Rule:** Users spend most of their time on *other* products. They expect your interface to work like the ones they already know.
- **Apply:** Follow established UI conventions (e.g., hamburger menus, back buttons, form patterns). Only deviate from convention when there is a strong, justified reason.

### Postel's Law (Robustness Principle)
- **Rule:** Be liberal in what you accept from users, and conservative in what you output.
- **Apply:** Accept flexible user inputs (varied date formats, typos, partial queries). Always return clean, well-structured, predictable output.

### Paradox of the Active User
- **Rule:** Users never read documentation — they start interacting immediately.
- **Apply:** Design for discoverability. UIs must be self-explanatory. Never rely on external docs to explain basic interactions.

---

## 2. Cognitive Load & Memory

### Cognitive Load
- **Rule:** Minimize the mental effort required to understand and use the interface.
- **Apply:**
  - Break complex tasks into smaller, sequential steps.
  - Use progressive disclosure — show only what is needed at each stage.
  - Avoid overwhelming users with too much information at once.

### Miller's Law
- **Rule:** The average person can hold ~7 (±2) items in working memory at one time.
- **Apply:**
  - Group related options together; never display more than 7 choices in a flat list.
  - Use chunking to organize long content into digestible sections.

### Chunking
- **Rule:** Breaking information into grouped, meaningful units aids comprehension and memory.
- **Apply:** Organize form fields, settings, and content into clearly labeled logical groups. Use visual separators (whitespace, dividers) between chunks.

### Working Memory
- **Rule:** Working memory is limited and volatile — users forget things quickly.
- **Apply:**
  - Persist user context across screens (e.g., show what step they are on).
  - Never make users memorize information from one screen to use on another.
  - Use inline validation and real-time feedback so users do not have to backtrack.

### Cognitive Bias
- **Rule:** Users are subject to systematic errors in judgment that affect how they perceive and interact with your interface.
- **Apply:**
  - Avoid dark patterns that exploit biases (e.g., anchoring, scarcity manipulation).
  - Design for rational decision-making: provide clear comparisons, transparent pricing, and neutral default options.

### Selective Attention
- **Rule:** Users focus only on a subset of stimuli — usually those relevant to their current goal.
- **Apply:**
  - Eliminate visual noise and irrelevant elements on task-critical screens.
  - Use visual hierarchy to guide the user's eye directly to what matters most.

---

## 3. Visual Design Laws

### Symmetry
- **Rule:** The human eye naturally perceives symmetrical elements as a single, unified whole.
- **Apply:** Use symmetrical layouts for balanced, professional-looking screens. Asymmetry should be intentional and used to create visual emphasis.

### Rule of Thirds
- **Rule:** Dividing a layout into a 3×3 grid and placing key elements along grid lines or intersections creates more balanced, visually engaging compositions.
- **Apply:** Position primary CTAs, hero images, and focal points along the rule-of-thirds grid rather than dead center.

### Von Restorff Effect (Isolation Effect)
- **Rule:** When multiple similar objects are present, the one that differs from the rest is most likely to be remembered.
- **Apply:**
  - Use visual differentiation (color, size, shape) to highlight the most important CTA on a screen.
  - Avoid making everything stand out — when everything is emphasized, nothing is.

### Law of Similarity
- **Rule:** The eye groups similar elements together into a complete picture, even when they are separated.
- **Apply:** Use consistent styles (same color, shape, size) for elements that belong to the same category or share similar behavior.

### Law of Prägnanz (Law of Good Form)
- **Rule:** Users interpret ambiguous or complex visuals in the simplest possible way.
- **Apply:** Simplify icons, illustrations, and layouts. Use clean, recognizable shapes. Avoid overly abstract or ambiguous visual metaphors.

### Dual-Mode Design Mandate
- **Rule:** Every element introduced to the interface — whether created from scratch or imported — must be explicitly designed for both light and dark mode appearances, ensuring full visual cohesion across system themes. Color values, borders, shadows, icons, and illustrations must never be hardcoded to a single appearance; instead, they must be defined in paired opposites (e.g., near-black on light / near-white on dark for text, elevated surfaces inverting accordingly) and must remain consistent with all other active design rules such as contrast ratios, hierarchy, and spacing. Any change made in one mode must be mirrored and validated in the other before it is considered complete.
- **Apply:** When assigning color to any element, always define both states:
  - **Text:** Use a dark tone (e.g., `#1A1A1A`) on light backgrounds and a light tone (e.g., `#F5F5F5`) on dark backgrounds.
  - **Surfaces:** Use white or light-neutral fills in light mode and deep-neutral or near-black fills in dark mode.
  - **Borders & dividers:** Use low-contrast darks in light mode and low-contrast lights in dark mode.
  - **Shadows:** Use dark semi-transparent drops in light mode; switch to subtle inner glows or lightened edges in dark mode.
  - **Icons & illustrations:** Ensure assets are either theme-adaptive (SVG with dynamic fills) or provided in two explicit variants — never rely on a single static asset to serve both modes.

---

## 4. Gestalt Principles

### Law of Proximity
- **Rule:** Objects near each other are perceived as grouped together.
- **Apply:**
  - Place related elements (labels + inputs, buttons + descriptions) close to each other.
  - Use spacing intentionally — larger gaps signal separation; tighter spacing signals relationship.

### Law of Common Region
- **Rule:** Elements sharing a defined boundary (e.g., a card, a box) are perceived as belonging to the same group.
- **Apply:** Use cards, panels, and containers to visually group related content. Do not mix unrelated content inside the same bounding region.

### Law of Uniform Connectedness
- **Rule:** Elements visually connected by lines or shapes are perceived as more related than unconnected elements.
- **Apply:** Use connector lines in flows, breadcrumbs in navigation, and step indicators in wizards to communicate relationship and sequence.

### Closure
- **Rule:** The human mind fills in missing parts to perceive a complete, familiar shape.
- **Apply:** You can use partial shapes or negative space in icons and illustrations — users will mentally complete them. This can create clean, minimal visual designs.

### Continuity
- **Rule:** Elements arranged along a line or curve are perceived as more related than those that are not.
- **Apply:** Align elements along a consistent axis. Use visual flow (arrows, progressive steps, scrolling direction) to guide users through a sequence.

---

## 5. Interaction & Behavior

### Fitts's Law
- **Rule:** The time to reach a target depends on the distance to it and its size. Larger, closer targets are easier to hit.
- **Apply:**
  - Make primary action buttons large and easy to tap/click.
  - Place frequently used controls close to where the user's attention already is.
  - On mobile, size touch targets to a minimum of 44×44px.
  - Place destructive actions (delete, cancel) away from primary actions to prevent mis-taps.

### Hick's Law
- **Rule:** Decision time increases with the number and complexity of choices.
- **Apply:**
  - Reduce the number of options on any screen. Prefer fewer, clearer choices.
  - Use progressive disclosure to hide advanced options until they are needed.
  - For onboarding flows, guide users through decisions one at a time.

### Choice Overload
- **Rule:** Presenting too many options causes decision paralysis and reduces satisfaction.
- **Apply:**
  - Cap dropdown menus and option lists where possible.
  - Offer smart defaults and recommendations to reduce the burden of choosing.
  - For e-commerce and data-heavy UIs, provide robust filtering and sorting.

### Goal-Gradient Effect
- **Rule:** Users increase their effort and motivation as they get closer to completing a goal.
- **Apply:**
  - Show progress bars, step counts, and completion percentages in multi-step flows.
  - Give users an early head start (e.g., pre-fill progress) to encourage completion.

### Zeigarnik Effect
- **Rule:** People remember incomplete tasks better than completed ones.
- **Apply:**
  - Use "Continue where you left off" patterns to re-engage users with unfinished tasks.
  - Surface incomplete items (empty states, partial profiles, draft content) to motivate completion.

### Peak-End Rule
- **Rule:** Users judge an experience by its most intense moment (peak) and how it ends — not by the average of all moments.
- **Apply:**
  - Design moments of delight at key peaks (successful checkout, task completion, first use).
  - End interactions on a positive note: success screens, confirmation messages, and appreciation copy matter.
  - Minimize painful moments — especially at the end of a flow (e.g., do not end with a confusing error).

### Parkinson's Law
- **Rule:** Work expands to fill the time available for its completion.
- **Apply:**
  - Set clear, reasonable time constraints for tasks where applicable (e.g., countdown timers, deadlines).
  - Do not over-engineer forms or flows — limit steps to what is strictly necessary.

---

## 6. Typography & Readability

### Typography Hierarchy
- **Rule:** A clear hierarchy in text sizes and styles guides users through content and improves comprehension.
- **Apply:**
  - Use at most 3–4 distinct text sizes: heading, subheading, body, caption.
  - Make hierarchy obvious — headings should be significantly larger than body text.
  - Use font weight (bold vs. regular) and color to reinforce hierarchy without adding new sizes.

### Readability Rules
- **Rule:** Text must be easy to read at a glance.
- **Apply:**
  - Body text: minimum 16px on web, 14px on mobile (with adequate line height).
  - Line length: 50–75 characters per line for body text (the optimal reading range).
  - Line height: 1.4–1.6× the font size for body copy.
  - Avoid all-caps for body text; reserve it for labels and short UI elements.
  - Left-align body text for most languages; avoid justified alignment on screen.

---

## 7. Color & Contrast

### Color Theory
- **Rule:** Colors evoke emotions and associations. Color combinations create harmony or discord.
- **Apply:**
  - Define a primary, secondary, and accent color palette — and stick to it.
  - Use color semantically: green = success, red = error/danger, yellow = warning, blue = information.
  - Never rely on color alone to communicate meaning — always pair with icons or text labels for accessibility.

### Contrast
- **Rule:** Elements that contrast with their surroundings attract attention and are more memorable.
- **Apply:**
  - Maintain a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text (WCAG AA standard).
  - Use high-contrast color for primary CTAs to make them unmissable.
  - Ensure interactive elements are visually distinct from non-interactive ones.
  - **Contrast is King:** Hover gradients must ALWAYS transform child texts to dark/black shades to maintain maximum accessibility.

---

## 8. Layout & Spacing

### White Space (Negative Space)
- **Rule:** Proper use of white space enhances readability, focus, and overall visual appeal.
- **Apply:**
  - Do not fear empty space — it gives content room to breathe and improves comprehension.
  - Use consistent spacing scales (e.g., 4px, 8px, 16px, 24px, 32px, 64px) for margin and padding.
  - Increase whitespace around important elements to give them visual weight.

### Consistency
- **Rule:** Consistent design elements across an interface enhance usability and reduce cognitive friction.
- **Apply:**
  - Use a design system or component library and never deviate from it without a documented reason.
  - Button sizes, colors, border radii, shadows, and spacing must be consistent throughout.
  - Interaction patterns (how modals open, how errors appear, how forms validate) must behave identically across all screens.

### Grid Systems
- **Rule:** Layouts built on a defined grid are more organized, predictable, and easier to scan.
- **Apply:**
  - Use a 12-column grid for web layouts; 4-column for mobile.
  - Align all elements to the grid. Avoid arbitrary positioning.
  - Apply the Rule of Thirds for hero sections and key marketing layouts.

---

## 9. Navigation & Information Architecture

### Mental Model
- **Rule:** Users approach your interface with a pre-existing mental model of how they expect it to work.
- **Apply:**
  - Structure navigation and terminology to match how users already think about the domain.
  - Conduct user research to understand existing mental models before designing flows.
  - If you must break a user's mental model, provide clear onboarding to establish a new one.

### Serial Position Effect
- **Rule:** Users best remember the first and last items in a list or sequence.
- **Apply:**
  - Place the most important navigation items first or last.
  - Put the primary CTA at the end of a form or onboarding flow.
  - Avoid burying critical actions in the middle of long lists or menus.

### Pareto Principle (80/20 Rule)
- **Rule:** Roughly 80% of effects come from 20% of causes.
- **Apply:**
  - Identify the 20% of features your users use 80% of the time — and optimize those ruthlessly.
  - Surface the most-used actions prominently; deprioritize or hide rarely-used ones.
  - Focus design and engineering effort on the highest-impact flows first.

---

## 10. Feedback & System Response

### Doherty Threshold
- **Rule:** Productivity peaks when the system responds in under 400ms. Delays above this break user flow.
- **Apply:**
  - Target interaction response times under 100ms for instant feel, under 400ms for acceptable.
  - For operations that take longer, show a progress indicator immediately (within 100ms of action).
  - Use optimistic UI updates where safe — update the UI before the server confirms to feel faster.

### Feedback Principles
- **Rule:** Users must always know the result of their actions.
- **Apply:**
  - Provide immediate visual feedback for every interaction (button press, form submit, toggle).
  - Use loading states, skeleton screens, and progress bars for async operations.
  - Show clear success and error states — never leave the user in an ambiguous state.
  - Inline validation on forms should trigger on blur (not on every keystroke).

### Flow State
- **Rule:** When users are fully immersed and in a state of flow, their productivity and satisfaction are highest.
- **Apply:**
  - Minimize interruptions (modals, popups, notifications) during task-critical flows.
  - Remove unnecessary confirmation dialogs unless the action is destructive and irreversible.
  - Design task flows to be linear and uninterrupted where possible.

---

## 11. Accessibility

### Core Accessibility Rules
- **Rule:** Interfaces must be usable by people with a wide range of abilities.
- **Apply:**
  - All interactive elements must be keyboard-navigable with visible focus indicators.
  - All images must have descriptive `alt` text.
  - Form fields must have visible, associated labels — never use placeholder text as a label substitute.
  - Color must never be the sole indicator of meaning (see Color Theory above).
  - Support screen readers by using semantic HTML and proper ARIA roles where necessary.
  - Minimum touch target size: 44×44px (Fitts's Law applied to accessibility).

### Inclusive Design
- **Rule:** Design for the edges — when you design for users with the most constraints, you improve the experience for everyone.
- **Apply:**
  - Design for low-bandwidth and offline-first where applicable.
  - Avoid motion-heavy animations for users who prefer reduced motion (`prefers-reduced-motion`).
  - Support dynamic font sizes (do not hardcode px for text — use relative units like `rem`).

---

## 12. Performance & Perception

### Perceived Performance
- **Rule:** How fast the interface *feels* is as important as how fast it actually is.
- **Apply:**
  - Use skeleton screens instead of spinners for content loading.
  - Load above-the-fold content first; defer everything else.
  - Add subtle animations and transitions to mask loading latency and make the UI feel alive.
  - Never show a blank screen — always show something immediately.

### Tesler's Law (Law of Conservation of Complexity)
- **Rule:** Every system has an irreducible amount of complexity. It cannot be eliminated — only transferred.
- **Apply:**
  - Absorb complexity into the system so the user does not have to deal with it.
  - Smart defaults, auto-fill, and intelligent suggestions reduce complexity for the user by shifting it to the backend.
  - Do not oversimplify to the point of removing necessary control from power users.

---

## 13. Code Efficiency & Anti-Bloat

### Prevent Code Bloating
- **Rule:** Every line of UI code must justify its existence. Redundant markup, duplicated utility classes, and re-implemented existing components are treated as bugs, not style.
- **Apply:**
  - **Reuse before you write.** Before adding any new component, class, or style block, check the existing component inventory (`FRONTEND_MODIFICATIONS_GUIDE.md §3`) and the design token system (`app.css`). If something already does the job, use it.
  - **Deduplicate Tailwind classes.** Never repeat the same utility class on the same element. Conflicting or overriding classes (e.g., `p-4 p-6` on one element) must be resolved immediately.
  - **Use `cn()` for conditional classes.** Never concatenate class strings manually — it produces duplicates and conflicts that are invisible at a glance but break the rendered output.
  - **CSS tokens over inline values.** Never hardcode a spacing, color, radius, or shadow value that already has a corresponding CSS custom property or Tailwind token. Hardcoded values fork the design system and create drift.
  - **No wrapper divs without purpose.** Every `<div>` must serve a declared layout or grouping role. Pure "just in case" wrappers are removed.
  - **Flatten shallow component trees.** If a component renders a single child with no added logic or styling, it is not a component — inline it.
  - **One source of truth per visual rule.** If a style is defined in `app.css` as a utility class, do not redefine it inline in JSX. Reference the class; do not copy the declaration.
  - **Dead code is removed immediately.** Commented-out JSX blocks, unused imports, and orphaned CSS classes must be deleted — not left "for reference."
  - **Avoid Over-engineering Image Cropping:** When displaying user-uploaded images (like avatars), prefer native CSS (`object-fit: cover` on `aspect-square` containers) over complex frontend canvas-cropping or bounding-box workflows. This keeps the application simple, performant, and adheres to standard modern platform behavior.

---

## 14. Important Specifications

> [!IMPORTANT]
> Whenever this markdown file (`UIUX_RULES.md`) is mentioned, referenced, or when you are prompted to remember these UI/UX design rules, you MUST always follow all rules and guidelines stated under these Important (or Considered) Specifications.

### Rounded Elements
- **Rule:** Use consistent rounding across the interface to maintain a unified, modern aesthetic.
- **Apply:**
  - Standard containers and cards should use `rounded-xl` or `rounded-2xl` for a soft, premium feel.
  - Interactive buttons and pills should be fully rounded (`rounded-full`) or precisely match the container's inner radius.
  - Avoid sharp corners (`rounded-none`) unless explicitly required by a full-bleed layout.

### Light & Dark Mode Synchronization
- **Rule:** Both modes must feel like two sides of the same coin — thematic parallel and cohesive.
- **Apply:**
  - Ensure visual hierarchy and physical depth translate perfectly between light and dark themes.
  - Shadows in light mode must translate to subtle borders or inner glows in dark mode to maintain elevation.
  - Colors should automatically map to their mode-specific semantic tokens without requiring explicit overriding classes whenever possible.
  - **Base Contrast:** Enforce high-contrast readability by using black text and icons in light mode and white text and icons in dark mode as the default standard.

### Interactive Elements & Branding
- **Rule:** Enforce the "Premium UI" brand identity across all interactive components to ensure a cohesive and high-end agency experience.
- **Apply:**
  - **Dropdowns & Selects:** Dropdown menus and select items should utilize the `item-hover-gradient` utility. Hover states must feature the "floating bubble" effect with precisely centered text and indicators.
  - **Navigation & Sidebars:** For continuous navigation lists like sidebars, use a subtle neutral hover (`var(--sidebar-accent)` via `sidebar-neutral-hover`) for inactive items to avoid visual fatigue. Reserve the bright green-yellow gradient exclusively for the active state (often implemented as a fluidly sliding `motion.div` pill).
  - **Form Controls & Triggers:** Do not use the master `<Button>` component for `<SelectTrigger>` or Combobox triggers. Use standard semantic HTML `<button>` or form control styling. Using the master `<Button>` component improperly applies heavy hover gradients (`item-hover-gradient`) and bouncy spring-press physics to standard form inputs, which breaks UI consistency. Form inputs should remain visually neutral.
  - **Buttons:** Primary call-to-action buttons should have the iconic fully rounded shape (`rounded-full`) and the signature green-yellow gradient (`btn-specular`).
  - **CSS over JS for Interaction:** Never over-engineer simple hover states (like sliding backgrounds) using complex JavaScript coordinate tracking or `useRef` maps if native CSS utilities or simple Framer Motion layout animations (`layoutId`) can achieve the same effect natively and performantly.
  - **Interactive Hover Specification:** The default interactive hover gradient is green-yellow (`var(--grad-primary)`) unless explicitly stated otherwise (like in sidebars). All brand-gradient interactive elements must use black-colored icons (`text-black`) when hovered to ensure optimal high-contrast accessibility on the gradient background. For text/label elements:
    - **Element Covered by Gradient Hover:** When the element itself is covered by the green-yellow gradient hover background, all text and icons inside it MUST be black (`text-black`) to contrast with the bright gradient.
    - **Element NOT Covered by Gradient Hover (Offset Hover):** When only a sibling container (e.g., an icon container) gets the gradient hover while the text area remains on the card background, the hovered text must transition to white (`text-white`) in dark mode, and black (`text-black`) in light mode.

---

## ✅ Quick-Reference Checklist

Use this before shipping any UI screen or flow:

- [ ] Does this screen have a single, clear purpose?
- [ ] Is the primary action obvious and easy to reach? (Fitts's Law)
- [ ] Are there fewer than 7 choices presented at once? (Miller's Law + Hick's Law)
- [ ] Is the layout consistent with the rest of the product? (Jakob's Law + Consistency)
- [ ] Are related elements visually grouped? (Law of Proximity + Common Region)
- [ ] Is white space used to reduce visual clutter?
- [ ] Does text meet minimum contrast ratios (4.5:1)?
- [ ] Is every interaction followed by immediate feedback? (Doherty Threshold)
- [ ] Does the most important content appear first and last? (Serial Position Effect)
- [ ] Is the design accessible by keyboard and screen reader?
- [ ] Have we designed a memorable peak and a positive ending? (Peak-End Rule)
- [ ] Is this the simplest design that solves the problem? (Occam's Razor)
- [ ] Are all existing components and tokens reused instead of re-implemented? (Anti-Bloat)
- [ ] Are there any unused imports, dead JSX blocks, or duplicate classes to remove? (Anti-Bloat)

---

*Sources: [Laws of UX](https://lawsofux.com/) by Jon Yablonski · [Laws of UI](https://www.uilaws.com/)*

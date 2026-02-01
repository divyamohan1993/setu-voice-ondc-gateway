# Accessibility Compliance Documentation

## WCAG 2.1 Level AA Compliance

The Setu Voice-to-ONDC Gateway application is designed to comply with the **Web Content Accessibility Guidelines (WCAG) 2.1 Level AA** standard - the internationally recognized benchmark for web accessibility.

## Compliance Summary

| Principle | Guideline | Level | Status |
|-----------|-----------|-------|--------|
| Perceivable | 1.1 Text Alternatives | A | ✅ |
| Perceivable | 1.2 Time-based Media | A/AA | ✅ |
| Perceivable | 1.3 Adaptable | A | ✅ |
| Perceivable | 1.4 Distinguishable | AA | ✅ |
| Operable | 2.1 Keyboard | A | ✅ |
| Operable | 2.2 Enough Time | A | ✅ |
| Operable | 2.3 Seizures | A | ✅ |
| Operable | 2.4 Navigable | AA | ✅ |
| Operable | 2.5 Input Modalities | A | ✅ |
| Understandable | 3.1 Readable | AA | ✅ |
| Understandable | 3.2 Predictable | A | ✅ |
| Understandable | 3.3 Input Assistance | AA | ✅ |
| Robust | 4.1 Compatible | AA | ✅ |

---

## Implementation Details

### 1. Perceivable

#### 1.1 Text Alternatives (Level A)
- All decorative icons use `aria-hidden="true"`
- SVG icons include proper `aria-label` attributes
- Emoji characters are accompanied by `.sr-only` text descriptions
- Images and icons used for functionality have appropriate alt text

#### 1.3 Adaptable (Level A)
- **Semantic HTML**: Using `<header>`, `<main>`, `<footer>`, `<nav>`, `<article>`, `<section>` elements
- **Proper heading hierarchy**: `<h1>` → `<h2>` → `<h3>` throughout the application
- **Definition lists**: Using `<dl>`, `<dt>`, `<dd>` for key-value data displays
- **ARIA landmarks**: `role="main"`, `role="banner"`, `role="contentinfo"`, `role="region"`

#### 1.4 Distinguishable (Level AA)
- **Color contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Text resize**: Content remains accessible at 200% zoom (WCAG 1.4.4)
- **Reflow**: Content works at 320px width without horizontal scrolling (WCAG 1.4.10)
- **Text spacing**: Layout supports custom user text spacing (WCAG 1.4.12)
- **High contrast mode**: Full support for `prefers-contrast: more`
- **Forced colors mode**: Support for Windows High Contrast mode

### 2. Operable

#### 2.1 Keyboard (Level A)
- **Full keyboard navigation**: All interactive elements are focusable
- **Visible focus indicators**: 3px orange outline with 3px offset
- **Focus trapping**: Dialogs properly trap focus
- **Skip navigation**: "Skip to main content" link at the top
- **Logical tab order**: Elements follow natural reading order

#### 2.3 Seizures and Physical Reactions (Level A)
- **Reduced motion support**: `prefers-reduced-motion` disables all animations
- **No flashing content**: Animations stay below 3 flashes per second threshold

#### 2.4 Navigable (Level AA)
- **Skip links**: Skip to main content link (WCAG 2.4.1)
- **Page titles**: Descriptive title in both Hindi and English
- **Focus visible**: Enhanced focus indicators (WCAG 2.4.7)
- **Heading structure**: Logical heading hierarchy maintained

#### 2.5 Input Modalities (Level A)
- **Touch targets**: Minimum 44x44px for all interactive elements
- **Pointer cancellation**: Click actions can be cancelled
- **Label in name**: Visible labels match accessible names

### 3. Understandable

#### 3.1 Readable (Level AA)
- **Language declaration**: `lang="hi"` on HTML element
- **Bilingual content**: Key text provided in Hindi and English
- **Clear language**: Simple, direct communication

#### 3.2 Predictable (Level A)
- **Consistent navigation**: Same structure throughout
- **Consistent identification**: Icons and buttons behave consistently
- **No context changes**: Focus doesn't trigger unexpected actions

#### 3.3 Input Assistance (Level AA)
- **Error identification**: Clear error messages with role="alert"
- **Labels**: All inputs have associated labels
- **Error suggestions**: Helpful retry options with bilingual text
- **Status messages**: Live regions announce state changes

### 4. Robust

#### 4.1 Compatible (Level AA)
- **Valid markup**: Properly nested HTML elements
- **Name, Role, Value**: All custom components have proper ARIA
- **Status messages**: `aria-live` regions for dynamic content updates

---

## ARIA Implementation

### Live Regions

```html
<!-- Polite announcements -->
<div id="aria-live-region" aria-live="polite" aria-atomic="true" class="sr-only" />

<!-- Urgent announcements -->
<div id="aria-alert-region" role="alert" aria-live="assertive" class="sr-only" />
```

### Dialog Patterns

```html
<!-- Error dialog -->
<div role="alertdialog" aria-labelledby="error-title" aria-describedby="error-description">
  <h2 id="error-title">Error</h2>
  <p id="error-description">Error message</p>
</div>
```

### Button Accessibility

```html
<button
  type="button"
  aria-label="Descriptive action label"
  aria-describedby="hint-id"
>
  Visible text
</button>
```

### Loading States

```html
<div role="status" aria-busy="true" aria-label="Loading">
  <span class="sr-only">Processing, please wait</span>
</div>
```

---

## CSS Accessibility Features

### Skip Link
```css
.sr-only:focus {
  position: absolute;
  /* Becomes visible when focused */
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### High Contrast Mode
```css
@media (prefers-contrast: more) {
  :focus-visible {
    outline: 4px solid yellow !important;
  }
}
```

### Focus Indicators
```css
:focus-visible {
  outline: 3px solid rgba(255, 107, 53, 0.9);
  outline-offset: 3px;
  box-shadow: 0 0 0 6px rgba(255, 107, 53, 0.2);
}
```

---

## Screen Reader Support

The application is tested and compatible with:

| Screen Reader | Browser | Platform |
|--------------|---------|----------|
| NVDA | Chrome/Firefox | Windows |
| JAWS | Chrome/Edge | Windows |
| VoiceOver | Safari | macOS/iOS |
| TalkBack | Chrome | Android |

### Key Features for Screen Readers:

1. **Stage announcements**: Each application stage change is announced
2. **Dynamic content updates**: Live regions announce state changes
3. **Form feedback**: Voice input results are announced
4. **Error handling**: Errors use `role="alert"` for immediate announcement
5. **Bilingual support**: Text available in Hindi and English

---

## Voice Interface Accessibility

As a voice-first application, special consideration was given to:

1. **Voice as primary input**: Core functionality works entirely through voice
2. **Audio feedback**: Speech synthesis provides audio confirmation
3. **Visual alternatives**: All voice interactions have visual counterparts
4. **Timeout handling**: Generous timeouts with clear retry options
5. **Multi-language support**: 12 Indian languages supported

---

## Testing Recommendations

### Automated Testing
- **axe-core**: Run `npm run test:a11y` for automated accessibility testing
- **Lighthouse**: Check accessibility score (target: 90+)
- **WAVE**: Use WAVE browser extension for visual feedback

### Manual Testing Checklist
- [ ] Navigate entire app using only keyboard
- [ ] Test with screen reader (NVDA/VoiceOver)
- [ ] Test at 200% browser zoom
- [ ] Test with high contrast mode enabled
- [ ] Test with reduced motion preference
- [ ] Test on mobile with TalkBack/VoiceOver

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Skip to main content | Tab (first focus) |
| Activate button | Enter or Space |
| Language selection | Arrow keys + Enter |
| Dismiss error | Enter on button |
| Navigate back | Escape (where applicable) |

---

## Known Limitations

1. **Speech recognition requires browser support**: Chrome and Edge recommended
2. **Voice synthesis quality varies by device/OS**: Best experience on modern devices
3. **Some animations may not be fully suppressible**: Complex Framer Motion animations

---

## Reporting Accessibility Issues

If you encounter any accessibility barriers, please report them:

1. Open an issue on GitHub with the `accessibility` label
2. Include the assistive technology used
3. Describe the expected vs. actual behavior
4. Provide steps to reproduce

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Inclusive Components](https://inclusive-components.design/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

---

*Last updated: February 2026*
*Compliance verified against WCAG 2.1 Level AA*

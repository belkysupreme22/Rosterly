# inngest.com: design rules

A dark interface on a near-black neutral background where a red accent marks the next step. Type is WhyteV1 set tight at large sizes, corners are fully rounded on controls, and depth comes from soft neutral shadows.

## Principles

### Soft, neutral depth

Lift raised elements with the measured shadow (rgb(28, 28, 28) 0px 0px 0px 2px).

_Why:_ Shadows appear on about 11% of elements; they mark what floats above the page and are never tinted.

### Even, compact hierarchy

Keep type sizes close together, anchored on 40px body text.

_Why:_ The largest measured size is only 1.8× the body size; hierarchy comes from weight and spacing instead.

### A steady rhythm

Space everything on the 4px grid: 1, 4, 8, 12, 16, 20, 24, 28px.

_Why:_ 71% of measured spacing values fall on this grid, which is what makes the layout feel ordered.

### Rounded and approachable

Use pill shapes for buttons and chips, and 6px corners for containers.

_Why:_ Fully rounded shapes make up 32% of measured radii; they soften an otherwise structured page.

## Never

- **Never tint shadows with colour.** Every measured shadow is neutral; a coloured glow would read as a different product.
- **Never introduce a second accent colour.** Only one saturated colour (#f65c4f) carries weight in the measured palette.
- **Never use positive letter-spacing on headings.** Large type is tightened, down to -0.035em on the biggest sizes.
- **Never use spacing off the 4px grid.** 71% of measured spacing sits on it.

## Colour

- Dark theme: near-black neutral background (#0c0a09) with #1c1c1c surfaces.
- Body text #ffffff on the background reads at 19.8:1; secondary text uses #b3b3b3.
- Accent #f65c4f (red) with #ffffff text on top of it.

## Typography

- WhyteV1 for headings, CircularXX for body, CircularXXMono for code.
- Scale: display 72px, h1 64px, h2 53.5px, h3 44px, h4 43px, h5 40px, h6 37.5px.
- Weights in use: 400.
- Headings are tightened (-0.02em at 72px); body text keeps normal tracking.

## Shape and depth

- Radii: 6px (28%), 8px (9%), 9px (5%), 10px (27%), pill (32%).
- Borders: 2px, 1px in #1f1e1d.
- Shadows: rgb(28, 28, 28) 0px 0px 0px 2px | rgb(255, 255, 255) 0px 0px 0px 2px inset.

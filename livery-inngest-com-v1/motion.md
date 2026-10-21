# Motion and Interactions

Considered transitions, with signature motion that carries the personality: line drawing, endless rail, refusal shake.

- Default to 300ms transitions (33% of measured ones).
- Ease with cubic-bezier(0.2, 0.8, 0.2, 1).
- Animate color, background-color, opacity, border-color; avoid animating layout.
- Stagger repeated items: line drawing starts each one 500ms after the last.
- Looping motion is slow and steady (several seconds per cycle), never frantic.
- Turn every loop and decorative animation off under prefers-reduced-motion, as the site does.

## Signature motion

The animations that make this site feel like itself. Recreate the behaviour with your own elements and content; the keyframes are the measured reference.

### Line drawing

SVG lines draw themselves in over 2.4s with cubic-bezier(0.22, 0.61, 0.27, 1), staggered 500ms apart. It runs on its own, on SVG paths.

```css
@keyframes v1ChartDraw { 0% { stroke-dashoffset: var(--len,4000); } 100% { stroke-dashoffset: 0; } }
.v1ChartDraw { animation: v1ChartDraw 2400ms cubic-bezier(0.22, 0.61, 0.27, 1) both; /* + 500ms delay per item */ }
```

### Endless rail

A strip scrolls sideways forever, one pass every 40s, linear. It runs on its own, on blocks.

```css
@keyframes v1-logo-marquee { 0% { transform: translate(0px); } 100% { transform: translate(-50%); } }
.v1-logo-marquee { animation: v1-logo-marquee 40000ms linear infinite; }
```

### Refusal shake

Shakes side to side over 700ms to say no. It runs on its own, on blocks.

```css
@keyframes v1QuoteLineReveal { 0% { transform: scaleX(0) translate(0px); } 50% { transform: scaleX(1) translate(0px); } 100% { transform: scaleX(1) translate(101%); } }
.v1QuoteLineReveal { animation: v1QuoteLineReveal 700ms cubic-bezier(0.7, 0, 0.15, 1) both; }
```

### Pulse

Breathes in opacity or scale every 2s with cubic-bezier(0.4, 0, 0.6, 1). It runs on its own, on blocks.

```css
@keyframes pulse { 50% { opacity: 0.5; } }
.pulse { animation: pulse 2000ms cubic-bezier(0.4, 0, 0.6, 1) infinite; }
```

### Entrance

Arrives with a scale over 7s. It runs on its own, on blocks.

```css
@keyframes v1TrustedProgress { 0% { transform: scaleX(0); } 100% { transform: scaleX(1); } }
.v1TrustedProgress { animation: v1TrustedProgress 7000ms linear both; }
```

## Interactions

- **Hover** changes background colour (30% of hover rules), text colour (27% of hover rules), border (9% of hover rules), position or scale (7% of hover rules), underline (5% of hover rules), opacity (4% of hover rules). Things rarely move on hover; they change colour.

Animations started by people or state:

- `v1LifecycleHeadingIn`: enter, 700ms cubic-bezier(0.22, 0.61, 0.27, 1), starts when its state changes (opened, selected, shown).

## Measurements

- Durations: 300ms (33%), 360ms (23%), 400ms (10%), 500ms (8%), 320ms (7%)
- Easings: `cubic-bezier(0.2, 0.8, 0.2, 1)`, `cubic-bezier(0.7, 0, 0.15, 1)`, `cubic-bezier(0.22, 0.61, 0.27, 1)`, `cubic-bezier(0.4, 0, 0.2, 1)`
- Animated properties: color, background-color, opacity, border-color, transform, background-size, text-decoration-color, fill

The site turns its motion off under `prefers-reduced-motion: reduce`. Do the same: every looping or decorative animation stops, and state changes happen instantly.

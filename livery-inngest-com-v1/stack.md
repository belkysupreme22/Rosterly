# Stack

What the source site appears to be built with, read from its page: script and asset URLs, attributes and class patterns. It is evidence, not certainty. Treat "likely" entries as a guess.

**Never switch your project's framework or add these libraries just to match.** Recreate each effect with what your project already uses; reach for a library only when the user asks.

| | Built with | Evidence | Confidence |
|---|---|---|---|
| Framework | Next.js | assets under /_next/static/ | detected |
| Framework | React | implied by the framework | detected |
| Styling | Tailwind CSS | 583 utility classes | detected |

## 3D and canvas

- The page draws into a canvas that fills the first screen further down the page.
- Its engine isn't identifiable from the page: it may be a 2D canvas, raw WebGL, or a library loaded as a module.
- Keep it light: cap devicePixelRatio at 2, render only while the canvas is on screen, show a still frame under prefers-reduced-motion, and a static image when WebGL isn't available.

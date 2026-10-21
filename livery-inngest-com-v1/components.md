# Components

## Recipes

### Card

Transparent background, #f6f6f6 text, 6px corners, 20px × 20px padding, 16px at weight 400, 1px solid rgba(0, 0, 0, 0) border. Measured 6 on the page.

- States: Hover: border → #ffffff2e, shadow → rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, , transform → matrix3d(1, -8.57258e-13, 1.28027e-06, -1.42253e
- Use when: Grouping related content into a scannable block.

### Ghost button

Transparent background, #ffffff text, square corners, 0px × 6px padding, 12px at weight 600, uppercase. Measured 4 on the page.

- States: Focus: outline → 1px auto rgb(255, 255, 255)
- Use when: Secondary actions that sit beside the primary one.

### Navigation link

Transparent background, #ffffff text, square corners, 0px × 6px padding, 12px at weight 600, uppercase. Measured 3 on the page.

- States: No visible change was measured on hover or focus.
- Use when: Top-level navigation.

### Card variant 2

Transparent background, #ffffff text, 8px corners, 20px × 16px padding, 16px at weight 400, 1px solid rgba(0, 0, 0, 0) border. Measured 3 on the page.

- States: Hover: border → #ffffff2e, shadow → rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, , transform → matrix3d(1, 0, 0, 0, 0, 1, 2.0082e-06, -2.23133e
- Use when: Grouping related content into a scannable block.

### Ghost button

Transparent background, #ffffff text, 6px corners, 0px × 20px padding, 12px at weight 600, shadow rgb(255, 255, 255) 0px 0px 0px 2px inset. Measured 2 on the page.

- States: Hover: background → #f65c4f. Focus: outline → 1px auto rgb(255, 255, 255)
- Use when: Secondary actions that sit beside the primary one.

### Primary button

#f65c4f background, #ffffff text, 6px corners, 0px × 20px padding, 12px at weight 600, uppercase. Measured 2 on the page.

- States: Hover: background → #d94a2b. Focus: outline → 1px auto rgb(255, 255, 255)
- Use when: The single most important action in a view.

### Navigation link 2

Transparent background, #ffffff text, square corners, 0px × 0px padding, 16px at weight 400, uppercase. Measured 1 on the page.

- States: No visible change was measured on hover or focus.
- Use when: Top-level navigation.

## Measured variants

| Kind | Count | Background | Text | Border | Radius | Padding (y/x px) | Height px | Font | States |
|---|---|---|---|---|---|---|---|---|---|
| card | 6 | transparent | #f6f6f6 | 1px solid rgba(0, 0, 0, 0) | 6px | 20/20 | 220 | 16px 400 | hover: {"borderColor":"#ffffff2e","boxShadow":"rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.55) 0px 28px 60px -32px","transform":"matrix3d(1, -8.57258e-13, 1.28027e-06, -1.42253e-09, 0, 1, 6.6959e-07, -7.43989e-10, -1.28027e-06, -6.6959e-07, 1, -0.00111111, 0, -4, -2.67836e-06, 1)"} |
| button | 4 | transparent | #ffffff | none | 0px | 0/6 | 24 | 12px 600 | focus: {"outline":"1px auto rgb(255, 255, 255)"} |
| nav-link | 3 | transparent | #ffffff | none | 0px | 0/6 | 24 | 12px 600 | no change measured |
| card | 3 | transparent | #ffffff | 1px solid rgba(0, 0, 0, 0) | 8px | 20/16 | 146 | 16px 400 | hover: {"borderColor":"#ffffff2e","boxShadow":"rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.55) 0px 28px 60px -32px","transform":"matrix3d(1, 0, 0, 0, 0, 1, 2.0082e-06, -2.23133e-09, 0, -2.0082e-06, 1, -0.00111111, 0, -4, -8.0328e-06, 1)"} |
| button | 2 | transparent | #ffffff | none | 6px | 0/20 | 42 | 12px 600 | hover: {"bg":"#f65c4f","boxShadow":"none"}; focus: {"outline":"1px auto rgb(255, 255, 255)"} |
| button | 2 | #f65c4f | #ffffff | none | 6px | 0/20 | 42 | 12px 600 | hover: {"bg":"#d94a2b"}; focus: {"outline":"1px auto rgb(255, 255, 255)"} |
| nav-link | 1 | transparent | #ffffff | none | 0px | 0/0 | 24 | 16px 400 | no change measured |

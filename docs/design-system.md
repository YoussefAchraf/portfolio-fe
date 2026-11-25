# Portfolio design system

Use semantic colors, spacing, radii, type, glass and glow from src/styles/tokens.css. Cyan handles actions and focus. Violet supports decorative gradients. Use Inter for copy and monospace for technical labels.

Shared portfolio UI lives in src/shared/ui/portfolio. Use Container and Section for layout, Button for actions and Card for glass surfaces. Badge and Tag share a compact treatment. The sticky Navbar accepts locale and theme controls and collapses links into a keyboard-operable menu.

Use the Motion provider supplied by PageTransition around public content. Reveal and Stagger run once on viewport entry. Card tilt and magnetic actions use transform. Effects respect reduced motion. The decorative hero mesh runs only while visible.

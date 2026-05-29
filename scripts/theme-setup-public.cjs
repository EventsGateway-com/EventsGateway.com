const fs = require('fs');
const path = require('path');

const stylesPath = path.join(__dirname, '../src/styles/tokens.css');
let styles = fs.readFileSync(stylesPath, 'utf8');

// Inject light theme variables for public site
const lightThemeVars = `
:root[data-theme="light"] {
  --color-bg: #f8fafc;
  --color-bg-elevated: #ffffff;
  --color-bg-panel: rgba(255, 255, 255, 0.95);
  --color-surface: rgba(0, 0, 0, 0.05);
  --color-surface-strong: rgba(0, 0, 0, 0.09);
  --color-surface-soft: rgba(0, 0, 0, 0.02);
  --color-border: rgba(0, 0, 0, 0.1);
  --color-border-strong: rgba(0, 0, 0, 0.2);
  --color-text: #0f172a;
  --color-muted: #475569;
  --color-subtle: #94a3b8;
  --color-accent: #0284c7;
  --color-accent-2: #7c3aed;
  --color-accent-3: #2563eb;
  --color-success: #059669;
  --color-warning: #d97706;
  --color-danger: #e11d48;
  --shadow-premium: 0 30px 100px rgba(0, 0, 0, 0.1);
  --shadow-glow: 0 0 80px rgba(2, 132, 199, 0.12);
  --shadow-card: 0 24px 70px rgba(0, 0, 0, 0.08);
  --noise-image:
    radial-gradient(circle at 20% 20%, rgba(0, 0, 0, 0.02) 0 1px, transparent 1px 100%),
    radial-gradient(circle at 80% 10%, rgba(0, 0, 0, 0.02) 0 1px, transparent 1px 100%);
}
`;

if (!styles.includes('data-theme="light"')) {
  styles = styles.replace(':root {', lightThemeVars + '\n:root {');
}

fs.writeFileSync(stylesPath, styles);
console.log("Injected light theme into public styles");

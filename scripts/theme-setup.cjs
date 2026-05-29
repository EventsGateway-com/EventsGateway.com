const fs = require('fs');
const path = require('path');

const stylesPath = path.join(__dirname, '../apps/dashboard/src/styles.css');
let styles = fs.readFileSync(stylesPath, 'utf8');

// Inject light theme variables
const lightThemeVars = `
:root[data-theme="light"] {
  color-scheme: light;
  background:
    radial-gradient(circle at top, rgba(14, 165, 233, 0.05), transparent 28%),
    linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  color: #0f172a;
  --eg-bg: #f8fafc;
  --eg-bg-elevated: #ffffff;
  --eg-surface: rgba(0, 0, 0, 0.04);
  --eg-surface-strong: rgba(0, 0, 0, 0.08);
  --eg-border: rgba(0, 0, 0, 0.1);
  --eg-border-strong: rgba(0, 0, 0, 0.2);
  --eg-text: #0f172a;
  --eg-muted: #475569;
  --eg-subtle: #94a3b8;
  --eg-accent: #0ea5e9;
  --eg-accent-2: #8b5cf6;
  --eg-success: #10b981;
  --eg-warning: #f59e0b;
  --eg-danger: #f43f5e;
  --eg-info: #3b82f6;
}
`;

if (!styles.includes('data-theme="light"')) {
  styles = styles.replace(':root {', lightThemeVars + '\n:root {');
}

// Find hardcoded colors in dashboard styles and replace them with CSS vars if possible, or leave them but ensure they work
// E.g. rgba(255, 255, 255, 0.1) can be problematic in light mode if not using vars.
// We'll replace some common hardcoded rgb(255,255,255) with var(--eg-surface) etc.

styles = styles.replace(/background: rgba\(255, 255, 255, 0\.025\);/g, 'background: var(--eg-surface);');
styles = styles.replace(/background: rgba\(255, 255, 255, 0\.04\);/g, 'background: var(--eg-surface-strong);');
styles = styles.replace(/border: 1px solid rgba\(255, 255, 255, 0\.08\);/g, 'border: 1px solid var(--eg-border);');
styles = styles.replace(/border-top: 1px solid rgba\(255, 255, 255, 0\.08\);/g, 'border-top: 1px solid var(--eg-border);');
styles = styles.replace(/border-bottom: 1px solid rgba\(255, 255, 255, 0\.08\);/g, 'border-bottom: 1px solid var(--eg-border);');
styles = styles.replace(/background: rgba\(255, 255, 255, 0\.02\);/g, 'background: var(--eg-surface);');
styles = styles.replace(/background: rgba\(255, 255, 255, 0\.08\);/g, 'background: var(--eg-surface-strong);');
styles = styles.replace(/background: rgba\(7, 11, 20, 0\.96\);/g, 'background: var(--eg-bg-elevated);');
styles = styles.replace(/background: rgba\(5, 8, 16, 0\.88\);/g, 'background: var(--eg-bg-elevated);');

fs.writeFileSync(stylesPath, styles);
console.log("Injected light theme into dashboard styles");

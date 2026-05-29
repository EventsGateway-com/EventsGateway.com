const fs = require('fs');
const path = require('path');

const stylesCssPath = path.join(__dirname, '../apps/dashboard/src/styles.css'); 
let stylesContent = fs.readFileSync(stylesCssPath, 'utf8');

const navLinkIconRegex = /\.eg-nav-link__icon \{[\s\S]*?\}/;
stylesContent = stylesContent.replace(navLinkIconRegex, `.eg-nav-link__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--eg-subtle);
  transition: color 0.18s ease;
}`);

const navLinkIconHoverRegex = /\.eg-nav-link\.is-active \.eg-nav-link__icon,\s*\.eg-nav-link:hover \.eg-nav-link__icon \{[\s\S]*?\}/;
stylesContent = stylesContent.replace(navLinkIconHoverRegex, `.eg-nav-link.is-active .eg-nav-link__icon,
.eg-nav-link:hover .eg-nav-link__icon {
  color: var(--eg-accent);
}
.eg-nav-link__icon svg {
  width: 100%;
  height: 100%;
}`);

fs.writeFileSync(stylesCssPath, stylesContent);
console.log("Updated styles.css issues for SVG size");

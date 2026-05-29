const fs = require('fs');
const path = require('path');

const premiumCardPath = path.join(__dirname, '../src/components/PremiumCard.astro');
let content = fs.readFileSync(premiumCardPath, 'utf8');

// Add cursor: grab to the CSS of .premium-card
const cssRegex = /\.premium-card \{[\s\S]*?\}/;
const match = content.match(cssRegex);
if(match) {
  const newCss = match[0].replace('}', '  cursor: grab;\n}');
  content = content.replace(cssRegex, newCss);
  
  // Also add grabbing state
  const hoverRegex = /\.premium-card:hover \{[\s\S]*?\}/;
  content = content.replace(hoverRegex, `.premium-card:hover {
    transform: translateY(-4px);
    border-color: rgba(125, 211, 252, 0.35);
    box-shadow:
      var(--shadow-card),
      0 0 0 1px rgba(125, 211, 252, 0.1);
  }
  
  .premium-card:active {
    cursor: grabbing;
  }`);
  
  fs.writeFileSync(premiumCardPath, content);
  console.log("Added grab cursor to PremiumCard");
}

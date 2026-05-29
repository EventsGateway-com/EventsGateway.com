const fs = require('fs');
const path = require('path');

const premiumCardPath = path.join(__dirname, '../src/components/PremiumCard.astro');
let content = fs.readFileSync(premiumCardPath, 'utf8');

// We want to make the cards visually draggable, or perhaps give them a hover state that allows grabbing? 
// The user asks: "look on all cards on public pages and make them draggable"
// Let's implement HTML5 native drag and drop `draggable="true"` on the PremiumCard.

const htmlTagRegex = /<Tag\s*class:list=\{\["premium-card", disabled && "premium-card--disabled", className\]\}\s*href=\{Tag === "a" \? href : undefined\}\s*data-step=\{step\}\s*>/;

const newHtmlTag = `<Tag
  class:list={["premium-card", disabled && "premium-card--disabled", className]}
  href={Tag === "a" ? href : undefined}
  data-step={step}
  draggable="true"
>`;

content = content.replace(htmlTagRegex, newHtmlTag);

fs.writeFileSync(premiumCardPath, content);
console.log("Made PremiumCard draggable");

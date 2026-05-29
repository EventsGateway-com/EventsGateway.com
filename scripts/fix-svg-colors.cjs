const fs = require('fs');
const path = require('path');

const logosDir = path.join(__dirname, '../public/integrations/logos');
const files = fs.readdirSync(logosDir);

// Since the user says "sunt cumva pe albastru inchis si nu se vad deloc", 
// this implies the paths inside the SVG might be dark colored or black, which hides on the dark background.
// We should replace dark fills/strokes with white or currentColor, or #d8f3ff
// Let's replace any `fill="#..."` or `stroke="#..."` that isn't white or bright, or just remove them to let them inherit or force white.
// Let's force fill="currentColor" on paths/g elements where applicable, or just hardcode a bright color like `#e2e8f0`.

for (const file of files) {
  if (file.endsWith('.svg')) {
    const filePath = path.join(logosDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Instead of complex logic, we can just replace all fills that look dark.
    // Wait, the icons generated in the previous step were: `<path d="..." />` without fill, which defaults to black.
    // If they have no fill, they default to black. Let's add fill="currentColor" to the SVG tag itself if not present, and ensure it cascades.
    if (!content.includes('fill=')) {
        // If there's no fill at all, we can add it to the svg root
        content = content.replace(/<svg([^>]*)>/, '<svg$1 fill="currentColor">');
    }
    
    // Also, we can just enforce color in the CSS of the PremiumCard logo
    
    fs.writeFileSync(filePath, content);
  }
}

console.log("Updated SVG colors");

const fs = require('fs');
const path = require('path');

const logosDir = path.join(__dirname, '../public/integrations/logos');
const files = fs.readdirSync(logosDir);

for (const file of files) {
  if (file.endsWith('.svg')) {
    const filePath = path.join(logosDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove the background rects. Usually they look like:
    // <rect width="96" height="96" rx="24" fill="#0B1020"/>
    // <rect x="1" y="1" width="94" height="94" rx="23" fill="none" stroke="rgba(255,255,255,0.08)"/>
    content = content.replace(/<rect[^>]*fill="#0B1020"[^>]*\/>/g, '');
    content = content.replace(/<rect[^>]*stroke="rgba\(255,255,255,0\.08\)"[^>]*\/>/g, '');
    
    fs.writeFileSync(filePath, content);
  }
}

console.log("Removed background rects from SVGs, leaving colors intact");

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const logosDir = path.join(__dirname, '../public/integrations/logos');
const files = fs.readdirSync(logosDir);

// Revert files to original state from git
execSync('git checkout 80a36d08573441ccde48138fc05497492ab62476 -- public/integrations/logos');

// Add fill="#fff" or appropriate colors so they show up.
// Actually, the user says "icoanele ... trebuie sa fie color"
// The managed-components SVGs are basically monochrome paths inside a dark box.
// If the user wants color, we can try to map some basic brand colors to them, or just use #fff since they were originally monochrome.
// Let's use brand colors where obvious, otherwise white.

const brandColors = {
  'facebook-pixel': '#1877F2',
  'google-ads': '#4285F4',
  'google-analytics': '#F4B400',
  'google-analytics-4': '#F4B400',
  'tiktok': '#00f2fe',
  'snapchat': '#FFFC00',
  'pinterest': '#E60023',
  'twitter': '#1DA1F2',
  'linkedin-insights': '#0A66C2',
  'reddit': '#FF4500',
  'hubspot': '#FF7A59',
  'segment': '#52BD95',
  'mixpanel': '#7856FF'
};

for (const file of files) {
  if (file.endsWith('.svg')) {
    const slug = file.replace('.svg', '');
    const color = brandColors[slug] || '#ffffff';
    
    const filePath = path.join(logosDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Strip the dark rects
    content = content.replace(/<rect[^>]*fill="#0B1020"[^>]*\/>/g, '');
    content = content.replace(/<rect[^>]*stroke="rgba\(255,255,255,0\.08\)"[^>]*\/>/g, '');
    
    // Add fill to the svg tag
    content = content.replace(/<svg([^>]*)>/, `<svg$1 fill="${color}">`);
    
    fs.writeFileSync(filePath, content);
  }
}

console.log("Applied brand colors to SVGs");

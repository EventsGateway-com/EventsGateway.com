const fs = require('fs');
const path = require('path');

const logosDir = path.join(__dirname, '../public/integrations/logos');
const files = fs.readdirSync(logosDir);

// Wait, the icons have NO fill attributes on their paths.
// In SVG, if a path has no fill attribute, it defaults to black (or inherited).
// Since we don't have any fill in the SVGs themselves, they render as black.
// The user wants them in their original colors! 
// Oh... the original downloaded files probably DID have fill attributes on the paths!
// Let's check git status to see if we messed up the files when running our script previously.


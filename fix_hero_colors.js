const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
let updatedCount = 0;

files.forEach(file => {
    if (file === 'index.html') return; // Skip index.html just in case
    
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it has a local .hero block without explicit color
    if (content.includes('.hero {') && !content.includes('color: var(--text-main);') && content.includes('radial-gradient')) {
        content = content.replace(/\.hero\s*\{/, '.hero {\n            color: var(--text-main);');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed hero text color in ${file}`);
        updatedCount++;
    }
});

console.log(`\nSuccessfully updated ${updatedCount} files.`);

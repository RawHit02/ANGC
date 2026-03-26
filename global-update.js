const fs = require('fs');
const path = require('path');

const basePath = 'c:/Users/PC 1/.gemini/antigravity/scratch/angc-synapse';
const indexPath = path.join(basePath, 'index.html');
const casePath = path.join(basePath, 'case-studies.html');

try {
    // 1. Move Tech Stack Section
    let indexHtml = fs.readFileSync(indexPath, 'utf8');
    const techRegex = /<!-- Tech Stack Section -->[\s\S]*?<\/section>/;
    const match = indexHtml.match(techRegex);
    
    if (match) {
        const techStack = match[0];
        indexHtml = indexHtml.replace(techRegex, '');
        fs.writeFileSync(indexPath, indexHtml);
        
        let caseHtml = fs.readFileSync(casePath, 'utf8');
        // append right before </main>
        caseHtml = caseHtml.replace('</main>', '\n    ' + techStack + '\n    </main>');
        fs.writeFileSync(casePath, caseHtml);
        console.log('Successfully moved Tech Stack Section to Our Work.');
    } else {
        console.log('Tech Stack Section not found in index.html, might have been already moved.');
    }

    // 2. Remove "What's New" link
    const files = fs.readdirSync(basePath).filter(file => file.endsWith('.html'));
    let removeCount = 0;
    
    files.forEach(fileName => {
        const filePath = path.join(basePath, fileName);
        let content = fs.readFileSync(filePath, 'utf8');
        const linkRegex = /<a href="whats-new\.html">.*?<\/a>/g;
        
        if (linkRegex.test(content)) {
            content = content.replace(linkRegex, '');
            fs.writeFileSync(filePath, content);
            removeCount++;
        }
    });
    
    console.log(`Removed What's New link from ${removeCount} files.`);
} catch(err) {
    console.error('Error during script execution:', err);
}

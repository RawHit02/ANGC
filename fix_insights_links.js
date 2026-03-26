const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
let updatedCount = 0;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    if (content.includes('href="#">Blogs</a>')) {
        content = content.replace(/href="#">Blogs<\/a>/g, 'href="blogs.html">Blogs</a>');
        changed = true;
    }
    if (content.includes('href="#">White Papers</a>')) {
        content = content.replace(/href="#">White Papers<\/a>/g, 'href="white-papers.html">White Papers</a>');
        changed = true;
    }
    if (content.includes('href="#">Guides</a>')) {
        content = content.replace(/href="#">Guides<\/a>/g, 'href="guides.html">Guides</a>');
        changed = true;
    }
    if (content.includes('href="#">Webinars</a>')) {
        content = content.replace(/href="#">Webinars<\/a>/g, 'href="webinars.html">Webinars</a>');
        changed = true;
    }

    // Also checking for Recognitions and What's New under About Us just in case as well.
    if (content.includes('href="#">Recognitions</a>')) {
        content = content.replace(/href="#">Recognitions<\/a>/g, 'href="recognitions.html">Recognitions</a>');
        changed = true;
    }
    if (content.includes('href="#">What\'s New</a>')) {
        content = content.replace(/href="#">What's New<\/a>/g, 'href="whats-new.html">What\'s New</a>');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed header links in ${file}`);
        updatedCount++;
    }
});

console.log(`\nSuccessfully updated links in ${updatedCount} files.`);

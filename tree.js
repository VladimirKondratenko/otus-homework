const fs = require('fs/promises');
const path = require('path');

const args = process.argv.slice(2);
const targetDir = args[0] || '.';
const depthArgIndex = args.indexOf('--depth') !== -1 ? args.indexOf('--depth') : args.indexOf('-d');
const maxDepth = depthArgIndex !== -1 ? parseInt(args[depthArgIndex + 1], 10) : Infinity;

async function printTree(dir, level = 0) {
    if (level > maxDepth) return;

    try {
        const items = await fs.readdir(dir, { withFileTypes: true });
        let directories = 0;
        let files = 0;

        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            const prefix = '│   '.repeat(level) + (items.indexOf(item) === items.length - 1 ? '└── ' : '├── ');

            if (item.isDirectory()) {
                directories++;
                console.log(prefix + item.name);
                await printTree(fullPath, level + 1);
            } else {
                files++;
                console.log(prefix + item.name);
            }
        }

        if (level === 0) {
            console.log(`\n${directories} directories, ${files} files`);
        }
    } catch (err) {
        console.error(`Error reading directory ${dir}:`, err.message);
    }
}

(async () => {
    console.log(targetDir);
    await printTree(targetDir);
})();

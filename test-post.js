const { execSync } = require('child_process');
const fs = require('fs');
const token = fs.readFileSync(require('os').homedir() + '/.gemini/antigravity/brain/' + process.cwd().split('/').pop() + '/scratch/token.txt', 'utf8').trim() || "x"; // This won't work correctly. Let me grep the auth store.

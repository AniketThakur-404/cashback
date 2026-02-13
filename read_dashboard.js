const fs = require('fs');
const path = 'e:\\webapp\\src\\pages\\AdminDashboard.jsx';

try {
    const content = fs.readFileSync(path, 'utf8');
    const lines = content.split('\n');
    console.log('--- FIRST 50 LINES ---');
    console.log(lines.slice(0, 50).join('\n'));
    console.log('--- LAST 50 LINES ---');
    console.log(lines.slice(-50).join('\n'));

    // Search for UserAccountManager
    const hasImport = content.includes('UserAccountManager');
    console.log('--- SEARCH RESULT ---');
    console.log(`Has UserAccountManager: ${hasImport}`);

} catch (err) {
    console.error(err);
}

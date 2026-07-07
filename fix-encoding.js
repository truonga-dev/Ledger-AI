/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');

const files = [
  'app/dashboard/transactions/page.tsx',
  'app/dashboard/reports/page.tsx',
  'app/dashboard/profile/page.tsx',
  'app/dashboard/layout.tsx',
  'app/dashboard/page.tsx',
  'app/api/transactions/route.ts'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  
  const content = fs.readFileSync(file, 'utf8');
  
  // Check if there's mojibake (like Ã„â€˜)
  if (content.includes('Ã„') || content.includes('Ãƒ') || content.includes('Ã†')) {
    try {
      // Buffer.from(..., 'latin1') takes the low byte of each char in the string
      const buffer = Buffer.from(content, 'latin1');
      const fixed = buffer.toString('utf8');
      
      // Basic sanity check: if it looks better and has no obvious replacement chars
      if (!fixed.includes('\uFFFD')) {
        fs.writeFileSync(file, fixed, 'utf8');
        console.log(`Fixed ${file}`);
      } else {
        console.log(`Failed to fix ${file} (replacement chars detected)`);
      }
    } catch (e) {
      console.error(`Error fixing ${file}:`, e);
    }
  } else {
    console.log(`${file} seems okay.`);
  }
}

 

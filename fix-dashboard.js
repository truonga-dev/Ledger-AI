/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
let content = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

const replacements = [
  [/ThÃƒÆ’Ã‚Â¡ng/g, 'ThÃ¡ng'],
  [/ChÃƒÆ’Ã‚Â o buÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¢i sÃƒÆ’Ã‚Â¡ng/g, 'ChÃ o buá»•i sÃ¡ng'],
  [/ChÃƒÆ’Ã‚Â o buÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¢i chiÃƒÂ¡Ã‚Â»Ã‚ u/g, 'ChÃ o buá»•i chiá»u'],
  [/ChÃƒÆ’Ã‚Â o buÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¢i tÃƒÂ¡Ã‚Â»Ã¢â‚¬Ëœi/g, 'ChÃ o buá»•i tá»‘i'],
  [/tÃƒÂ¡Ã‚Â»Ã‚Â·/g, 'tá»·'],
  [/triÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡u/g, 'triá»‡u'],
  [/Ãƒâ€žÃ¢â‚¬Ëœ/g, 'Ä‘'],
  [/TÃƒÂ¡Ã‚ÂºÃ‚Â¥t cÃƒÂ¡Ã‚ÂºÃ‚Â£/g, 'Táº¥t cáº£'],
  [/ThÃƒÆ’Ã‚Â¡ng trÃƒâ€ Ã‚Â°ÃƒÂ¡Ã‚Â»Ã¢â‚¬Âºc/g, 'ThÃ¡ng trÆ°á»›c'],
  [/KhÃƒÆ’Ã‚Â¡c/g, 'KhÃ¡c'],
  [/ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ¢â‚¬Â¹/g, 'ðŸ‘‹'],
  [/SÃƒÂ¡Ã‚Â»Ã‚  DÃƒâ€ Ã‚Â¯ TÃƒÂ¡Ã‚Â»Ã¢â‚¬ NG \(TOÃƒÆ’Ã¢â€šÂ¬N THÃƒÂ¡Ã‚Â»Ã…â€œI GIAN\)/g, 'Sá» DÆ¯ Tá»”NG (TOÃ€N THá»œI GIAN)'],
  [/TÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¢ng Thu/g, 'Tá»•ng Thu'],
  [/TÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¢ng Chi/g, 'Tá»•ng Chi'],
  [/LÃƒÂ¡Ã‚Â»Ã‚Â£i nhuÃƒÂ¡Ã‚ÂºÃ‚Â­n thÃƒÆ’Ã‚Â¡ng nÃƒÆ’Ã‚Â y/g, 'Lá»£i nhuáº­n thÃ¡ng nÃ y'],
  [/Thua lÃƒÂ¡Ã‚Â»Ã¢â‚¬â€ thÃƒÆ’Ã‚Â¡ng nÃƒÆ’Ã‚Â y/g, 'Thua lá»— thÃ¡ng nÃ y'],
  [/ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ /g, 'â€”'],
  [/Giao dÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¹ch gÃƒÂ¡Ã‚ÂºÃ‚Â§n Ãƒâ€žÃ¢â‚¬ËœÃƒÆ’Ã‚Â¢y/g, 'Giao dá»‹ch gáº§n Ä‘Ã¢y'],
  [/Xem tÃƒÂ¡Ã‚ÂºÃ‚Â¥t cÃƒÂ¡Ã‚ÂºÃ‚Â£ ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢/g, 'Xem táº¥t cáº£ â†’'],
  [/ÃƒÂ¢Ã¢â‚¬ Ã¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ Ã¢â€šÂ¬/g, 'â”€â”€'],
  [/SÃƒÂ¡Ã‚Â»Ã‚ DÃƒâ€ Ã‚Â¯ TÃƒÂ¡Ã‚Â»Ã¢â‚¬ NG \(TOÃƒÆ’Ã¢â€šÂ¬N THÃƒÂ¡Ã‚Â»Ã…â€œI GIAN\)/g, 'Sá» DÆ¯ Tá»”NG (TOÃ€N THá»œI GIAN)']
];

for (const [regex, replacement] of replacements) {
  content = content.replace(regex, replacement);
}

fs.writeFileSync('app/dashboard/page.tsx', content, 'utf8');
console.log('Fixed app/dashboard/page.tsx');
 

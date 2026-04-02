const fs = require('fs');
const sql = fs.readFileSync('sql/setup_completo_final.sql', 'utf8');

const regex = /INSERT INTO public\.site_settings \(key, data\) VALUES \('[^]+?', '([^]+?)'::jsonb\)/g;
let match;
let i = 0;
while ((match = regex.exec(sql)) !== null) {
  i++;
  try {
    JSON.parse(match[1]);
  } catch (e) {
    console.error(`Syntax error in JSON block ${i}:`, e.message);
    console.error(match[1].substring(0, 50) + '...');
  }
}
console.log('Done checking ' + i + ' JSON blocks.');

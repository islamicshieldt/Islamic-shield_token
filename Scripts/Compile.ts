
‏import * as fs from 'fs';
‏import { execSync } from 'child_process';
‏import { CONFIG } from './config';
‏
‏// تأكد من وجود مجلد للإخراج
‏if (!fs.existsSync('./build')) {
‏  fs.mkdirSync('./build');
‏}
‏
‏async function main() {
‏  console.log('بدء ترجمة عقود Islamic Shield (DR3)...');
‏  
‏  try {
‏    // ترجمة عقد صانع الجيتون
‏    console.log('ترجمة عقد صانع الجيتون...');
‏    execSync('npx func-js contracts/jetton-minter.fc --boc build/jetton-minter.cell');
‏    
‏    // ترجمة عقد محفظة الجيتون
‏    console.log('ترجمة عقد محفظة الجيتون...');
‏    execSync('npx func-js contracts/jetton-wallet.fc --boc build/jetton-wallet.cell');
‏    
‏    console.log('تمت ترجمة العقود بنجاح! الملفات المُخرَجة:');
‏    console.log('- build/jetton-minter.cell');
‏    console.log('- build/jetton-wallet.cell');
‏  } catch (error) {
‏    console.error('حدث خطأ أثناء الترجمة:', error);
‏    process.exit(1);
‏  }
‏}
‏
‏main();
